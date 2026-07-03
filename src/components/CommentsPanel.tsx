import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MessageSquare,
  RefreshCw,
  AlertCircle,
  Send,
  User,
} from 'lucide-react';
import { supabase, type Comment } from '../lib/supabase';

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Comment bubble ────────────────────────────────────────────────────────────

function CommentBubble({ comment }: { comment: Comment }) {
  const name = comment.author_name?.trim() || 'Anonymous';
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <li className="flex gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-frost-ice-600/50 bg-frost-ice-800/60 font-serif text-xs font-semibold text-frost-rime-200">
        {initials || <User className="h-3.5 w-3.5 text-frost-steel-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-sans text-sm font-semibold text-frost-steel-100">{name}</span>
          <time
            dateTime={comment.created_at}
            title={formatDate(comment.created_at)}
            className="font-sans text-[10px] text-frost-steel-500"
          >
            {relativeTime(comment.created_at)}
          </time>
        </div>
        <p className="mt-1 whitespace-pre-wrap font-sans text-sm leading-relaxed text-frost-steel-200/90">
          {comment.body}
        </p>
      </div>
    </li>
  );
}

// ── Post form ─────────────────────────────────────────────────────────────────

function PostForm({
  contentType,
  contentId,
  onPosted,
}: {
  contentType: Comment['content_type'];
  contentId: string;
  onPosted: () => void;
}) {
  const [authorName, setAuthorName] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = body.trim();
    if (trimmed.length < 10) {
      setError('Comment must be at least 10 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const { error: err } = await supabase.from('comments').insert({
        content_type: contentType,
        content_id: contentId,
        author_name: authorName.trim() || null,
        body: trimmed,
      });
      if (err) throw err;
      setBody('');
      setSuccess(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setSuccess(false), 3500);
      onPosted();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Post failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const remaining = 2000 - body.length;
  const inputBase =
    'w-full rounded border border-frost-ice-600/50 bg-frost-ice-900/60 px-3 py-2 font-sans text-sm text-frost-steel-100 placeholder-frost-steel-500 outline-none transition-colors focus:border-frost-rime-400/70 focus:ring-1 focus:ring-frost-rime-400/30';

  return (
    <form onSubmit={handleSubmit} className="mt-6 border-t border-frost-ice-700/40 pt-5">
      <p className="mb-3 font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
        Leave a Comment
      </p>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          maxLength={40}
          placeholder="Your name (optional)"
          className={inputBase}
        />
        <div className="relative">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Share a tip, correction, or observation…"
            required
            className={`${inputBase} resize-none`}
          />
          <span
            className={`absolute bottom-2 right-2.5 font-sans text-[10px] transition-colors ${
              remaining < 100 ? 'text-frost-ember-400' : 'text-frost-steel-600'
            }`}
          >
            {remaining}
          </span>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded border border-frost-ember-500/40 bg-frost-ember-600/10 px-3 py-2 text-frost-ember-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="font-sans text-xs">{error}</span>
          </div>
        )}
        {success && (
          <div className="rounded border border-frost-rime-400/30 bg-frost-rime-400/10 px-3 py-2 font-sans text-xs text-frost-rime-200">
            Comment posted!
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || body.trim().length < 10}
          className="btn-ice self-end disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {submitting ? 'Posting…' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────

export default function CommentsPanel({
  contentType,
  contentId,
}: {
  contentType: Comment['content_type'];
  contentId: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('comments')
        .select('*')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (err) throw err;
      setComments(data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load comments.');
    } finally {
      setLoading(false);
    }
  }, [contentType, contentId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  return (
    <div>
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <RefreshCw className="h-5 w-5 animate-spin text-frost-rime-400/50" />
        </div>
      ) : error ? (
        <div className="flex h-24 items-center justify-center gap-2 text-frost-ember-400">
          <AlertCircle className="h-4 w-4" />
          <span className="font-sans text-xs">{error}</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="flex h-24 flex-col items-center justify-center gap-2">
          <MessageSquare className="h-6 w-6 text-frost-steel-600" />
          <p className="font-serif text-xs uppercase tracking-widest text-frost-steel-500">
            No comments yet — be the first
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
            {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </p>
          <ul className="space-y-5">
            {comments.map((c) => (
              <CommentBubble key={c.id} comment={c} />
            ))}
          </ul>
        </>
      )}

      <PostForm
        contentType={contentType}
        contentId={contentId}
        onPosted={fetchComments}
      />
    </div>
  );
}
