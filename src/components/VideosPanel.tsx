import { useCallback, useEffect, useState } from 'react';
import {
  Play,
  Plus,
  X,
  Send,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Film,
  User,
  MessageSquare,
} from 'lucide-react';
import { supabase, type RaidVideo } from '../lib/supabase';

// ── YouTube helpers ───────────────────────────────────────────────────────────

function parseYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|live\/|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

function classifyUrl(url: string): { type: 'youtube' | 'other'; videoId: string | null } {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be' || u.hostname.endsWith('youtube.com')) {
      return { type: 'youtube', videoId: parseYouTubeId(url) };
    }
  } catch {
    // fall through
  }
  return { type: 'other', videoId: null };
}

function isAcceptedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return false;
    const host = u.hostname.replace(/^www\./, '');
    return (
      host === 'youtube.com' ||
      host === 'youtu.be' ||
      host === 'twitch.tv' ||
      host.endsWith('.twitch.tv')
    );
  } catch {
    return false;
  }
}

function ytThumb(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Video Card ────────────────────────────────────────────────────────────────

function VideoCard({ video }: { video: RaidVideo }) {
  const [playing, setPlaying] = useState(false);
  const isYT = video.video_type === 'youtube' && !!video.video_id;

  return (
    <div className="overflow-hidden rounded border border-frost-ice-700/40 bg-frost-ice-800/30">
      {/* Thumbnail / player */}
      <div className="relative aspect-video w-full overflow-hidden bg-frost-ice-900">
        {playing && isYT ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.video_id}?autoplay=1&rel=0`}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : isYT ? (
          <button
            onClick={() => setPlaying(true)}
            className="group relative flex h-full w-full items-center justify-center"
            aria-label={`Play ${video.title}`}
          >
            <img
              src={ytThumb(video.video_id!)}
              alt={video.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-frost-ice-900/40 transition-colors group-hover:bg-frost-ice-900/20" />
            <span className="relative grid h-14 w-14 place-items-center rounded-full border-2 border-white/80 bg-white/10 backdrop-blur-sm transition-all duration-200 group-hover:scale-110 group-hover:border-white group-hover:bg-white/20">
              <Play className="h-6 w-6 translate-x-0.5 fill-white text-white" />
            </span>
          </button>
        ) : (
          /* Non-YouTube: external link tile */
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-full flex-col items-center justify-center gap-3 transition-colors hover:bg-frost-ice-800/50"
          >
            <Film className="h-10 w-10 text-frost-steel-500 transition-colors group-hover:text-frost-rime-400" />
            <span className="flex items-center gap-1.5 font-serif text-xs uppercase tracking-widest text-frost-steel-400 group-hover:text-frost-rime-300">
              <ExternalLink className="h-3.5 w-3.5" />
              Watch on Twitch
            </span>
          </a>
        )}
      </div>

      {/* Meta */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="font-serif text-sm font-semibold leading-snug text-frost-steel-100">
            {video.title}
          </p>
          {!playing && (
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-frost-steel-500 transition-colors hover:text-frost-rime-300"
              aria-label="Open in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        {video.notes && (
          <p className="mt-1 font-sans text-xs leading-relaxed text-frost-steel-400">
            {video.notes}
          </p>
        )}
        <div className="mt-2 flex items-center gap-3 font-sans text-[10px] text-frost-steel-600">
          {video.submitter_name && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {video.submitter_name}
            </span>
          )}
          <span>{relativeTime(video.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Submit form ───────────────────────────────────────────────────────────────

function SubmitVideoForm({
  bossName,
  onSubmitted,
  onCancel,
}: {
  bossName: string;
  onSubmitted: () => void;
  onCancel: () => void;
}) {
  const [url, setUrl]           = useState('');
  const [title, setTitle]       = useState('');
  const [submitter, setSubmitter] = useState('');
  const [notes, setNotes]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const urlValid = url.trim() !== '' && isAcceptedUrl(url.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError('Enter a video title.'); return; }
    if (!urlValid)      { setError('Only YouTube and Twitch HTTPS URLs are accepted.'); return; }
    const { type, videoId } = classifyUrl(url.trim());
    setSubmitting(true);
    try {
      const { error: err } = await supabase.from('raid_videos').insert({
        boss_name:      bossName,
        title:          title.trim(),
        url:            url.trim(),
        video_type:     type,
        video_id:       videoId,
        submitter_name: submitter.trim() || null,
        notes:          notes.trim() || null,
      });
      if (err) throw err;
      onSubmitted();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputBase =
    'w-full rounded border border-frost-ice-600/50 bg-frost-ice-900/60 px-3 py-2 font-sans text-sm text-frost-steel-100 placeholder-frost-steel-500 outline-none transition-colors focus:border-frost-rime-400/70 focus:ring-1 focus:ring-frost-rime-400/30';
  const labelBase = 'mb-1.5 block font-serif text-[10px] uppercase tracking-widest text-frost-steel-400';

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded border border-frost-ice-600/40 bg-frost-ice-900/40 p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-serif text-xs uppercase tracking-widest text-frost-rime-400">
          <Film className="h-4 w-4" />
          Submit Video
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="grid h-7 w-7 place-items-center rounded-full border border-frost-ice-600/40 text-frost-steel-400 hover:text-frost-steel-200"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div>
        <label className={labelBase}>
          Video URL
          <span className="ml-2 normal-case text-frost-steel-600">(YouTube or Twitch)</span>
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          maxLength={500}
          className={`${inputBase} ${
            url.trim() && !urlValid
              ? 'border-frost-ember-500/60 focus:border-frost-ember-400/70'
              : ''
          }`}
        />
        {url.trim() && !urlValid && (
          <p className="mt-1 font-sans text-[11px] text-frost-ember-400">
            Only YouTube (youtube.com / youtu.be) and Twitch HTTPS links accepted.
          </p>
        )}
      </div>

      <div>
        <label className={labelBase}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="e.g. Vulak'Aerr Kill Video — Frostreaver Guild Night"
          className={inputBase}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelBase}>Your Name <span className="normal-case text-frost-steel-600">(optional)</span></label>
          <input
            type="text"
            value={submitter}
            onChange={(e) => setSubmitter(e.target.value)}
            maxLength={40}
            placeholder="Character name"
            className={inputBase}
          />
        </div>
        <div>
          <label className={labelBase}>Notes <span className="normal-case text-frost-steel-600">(optional)</span></label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={200}
            placeholder="e.g. Full clear with 36 players"
            className={inputBase}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded border border-frost-ember-500/40 bg-frost-ember-600/10 px-3 py-2 text-frost-ember-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="font-sans text-xs">{error}</span>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="btn-ice flex-1 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {submitting ? 'Submitting…' : 'Submit Video'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost px-4">Cancel</button>
      </div>
    </form>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function VideosPanel({ bossName }: { bossName: string }) {
  const [videos, setVideos]     = useState<RaidVideo[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('raid_videos')
        .select('*')
        .eq('boss_name', bossName)
        .order('created_at', { ascending: false })
        .limit(20);
      if (err) throw err;
      setVideos(data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load videos.');
    } finally {
      setLoading(false);
    }
  }, [bossName]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  return (
    <div>
      {/* Header row */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-frost-rime-400">
          <Film className="h-4 w-4" />
          <span className="font-serif text-[11px] uppercase tracking-widest">
            {loading ? '' : `${videos.length} Video${videos.length !== 1 ? 's' : ''}`}
          </span>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded border border-frost-ice-600/40 px-3 py-1.5 font-serif text-[10px] uppercase tracking-widest text-frost-steel-300 transition-colors hover:border-frost-rime-400/50 hover:text-frost-rime-200"
          >
            <Plus className="h-3.5 w-3.5" />
            Submit Video
          </button>
        )}
      </div>

      {showForm && (
        <SubmitVideoForm
          bossName={bossName}
          onSubmitted={() => { setShowForm(false); fetchVideos(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <RefreshCw className="h-5 w-5 animate-spin text-frost-rime-400/50" />
        </div>
      ) : error ? (
        <div className="flex h-24 items-center justify-center gap-2 text-frost-ember-400">
          <AlertCircle className="h-4 w-4" />
          <span className="font-sans text-xs">{error}</span>
        </div>
      ) : videos.length === 0 ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex w-full cursor-pointer flex-col items-center gap-3 rounded border border-dashed border-frost-ice-600/40 py-10 transition-colors hover:border-frost-ice-500/60 hover:bg-frost-ice-800/20"
        >
          <Film className="h-9 w-9 text-frost-steel-600" />
          <div className="text-center">
            <p className="font-serif text-xs uppercase tracking-widest text-frost-steel-500">
              No videos yet
            </p>
            <p className="mt-1 font-sans text-[11px] text-frost-steel-600">
              Be the first to submit a kill video or strategy guide
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded border border-frost-ice-600/40 px-3 py-1.5 font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
            <Plus className="h-3 w-3" />
            Submit Video
          </span>
        </button>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}

      {!loading && !error && videos.length > 0 && (
        <p className="mt-4 flex items-center gap-1.5 text-right font-serif text-[9px] uppercase tracking-widest text-frost-steel-600">
          <MessageSquare className="h-3 w-3" />
          Community submitted · use the Frostreaver Discord to report inappropriate content
        </p>
      )}
    </div>
  );
}
