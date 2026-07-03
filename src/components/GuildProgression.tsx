import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Swords,
  Trophy,
  Check,
  X,
  RefreshCw,
  Plus,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Shield,
} from 'lucide-react';
import { supabase, type Guild, type GuildKill } from '../lib/supabase';
import { raidTargets, expansions } from '../data';

// ── helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Boss list in display order (from data.ts)
const allBosses = raidTargets.map((r) => ({
  id: r.id,
  name: r.name,
  expansion: r.expansion,
  zone: r.zone,
  difficulty: r.difficulty,
}));

const difficultyDot: Record<string, string> = {
  Dungeon: 'bg-frost-ice-400',
  World: 'bg-frost-rime-400',
  Plane: 'bg-frost-gold-400',
  God: 'bg-frost-ember-400',
};

// ── Sub-components ────────────────────────────────────────────────────────────

type KillMap = Map<string, GuildKill>; // key: `${guildId}:${bossName}`

function ProgressionMatrix({
  guilds,
  killMap,
}: {
  guilds: Guild[];
  killMap: KillMap;
}) {
  const [expandedExp, setExpandedExp] = useState<Set<string>>(
    new Set(expansions.filter((e) => e.status !== 'Locked').map((e) => e.id))
  );

  function toggle(id: string) {
    setExpandedExp((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (guilds.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-frost-steel-400">
        <Shield className="h-8 w-8 opacity-25" />
        <p className="font-serif text-xs uppercase tracking-widest">
          No guilds registered yet — be the first!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {expansions.map((exp) => {
        const bosses = allBosses.filter((b) => b.expansion === exp.id);
        if (bosses.length === 0) return null;
        const open = expandedExp.has(exp.id);

        return (
          <div key={exp.id} className="panel overflow-hidden">
            <button
              onClick={() => toggle(exp.id)}
              className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-frost-ice-800/30"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2 w-2 rounded-full ${
                    exp.status === 'Current'
                      ? 'animate-flicker bg-frost-rime-400'
                      : exp.status === 'Unlocked'
                      ? 'bg-frost-ice-400'
                      : 'bg-frost-steel-600'
                  }`}
                />
                <span className="font-display text-base font-bold text-frost-rime-100">
                  {exp.name}
                </span>
                <span className="font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
                  {bosses.length} boss{bosses.length !== 1 ? 'es' : ''}
                </span>
              </div>
              {open ? (
                <ChevronUp className="h-4 w-4 text-frost-steel-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-frost-steel-400" />
              )}
            </button>

            {open && (
              <div className="overflow-x-auto border-t border-frost-ice-700/40">
                <table className="w-full min-w-[480px]">
                  <thead>
                    <tr className="border-b border-frost-ice-700/30 bg-frost-ice-900/40">
                      <th className="px-5 py-2.5 text-left font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
                        Boss
                      </th>
                      {guilds.map((g) => (
                        <th
                          key={g.id}
                          className="px-4 py-2.5 text-center font-serif text-[10px] uppercase tracking-widest text-frost-rime-300"
                          title={g.name}
                        >
                          <span className="block max-w-[80px] truncate">{g.tag ?? g.name}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bosses.map((boss, idx) => (
                      <tr
                        key={boss.id}
                        className={`border-b border-frost-ice-700/20 transition-colors hover:bg-frost-ice-800/20 ${
                          idx % 2 === 0 ? '' : 'bg-frost-ice-900/20'
                        }`}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${difficultyDot[boss.difficulty] ?? 'bg-frost-steel-500'}`}
                              title={boss.difficulty}
                            />
                            <span className="font-sans text-sm text-frost-steel-100">{boss.name}</span>
                          </div>
                        </td>
                        {guilds.map((g) => {
                          const kill = killMap.get(`${g.id}:${boss.name}`);
                          return (
                            <td key={g.id} className="px-4 py-3 text-center">
                              {kill ? (
                                <span
                                  title={`Killed ${formatDate(kill.killed_at)}${kill.notes ? ` — ${kill.notes}` : ''}`}
                                  className="inline-flex items-center justify-center"
                                >
                                  <Check className="h-4 w-4 text-frost-rime-400" />
                                </span>
                              ) : (
                                <X className="mx-auto h-4 w-4 text-frost-steel-700" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

function Leaderboard({
  guilds,
  kills,
}: {
  guilds: Guild[];
  kills: GuildKill[];
}) {
  const ranked = guilds
    .map((g) => ({
      guild: g,
      count: kills.filter((k) => k.guild_id === g.id).length,
      latest: kills
        .filter((k) => k.guild_id === g.id)
        .sort((a, b) => new Date(b.killed_at).getTime() - new Date(a.killed_at).getTime())[0],
    }))
    .sort((a, b) => b.count - a.count || a.guild.name.localeCompare(b.guild.name));

  if (ranked.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-frost-steel-500">
        <p className="font-serif text-xs uppercase tracking-widest">No data yet</p>
      </div>
    );
  }

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <ol className="space-y-2">
      {ranked.map((entry, i) => (
        <li
          key={entry.guild.id}
          className="flex items-center gap-3 rounded border border-frost-ice-700/30 bg-frost-ice-900/40 px-4 py-3 transition-colors hover:border-frost-rime-400/30 hover:bg-frost-ice-800/30"
        >
          <span className="w-6 shrink-0 text-center font-serif text-sm">
            {medals[i] ?? <span className="text-frost-steel-500">{i + 1}</span>}
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-serif font-semibold text-frost-rime-100 truncate">
              {entry.guild.name}
            </div>
            {entry.latest && (
              <div className="font-sans text-xs text-frost-steel-400 truncate">
                Last kill: {entry.latest.boss_name} · {relativeTime(entry.latest.killed_at)}
              </div>
            )}
          </div>
          <div className="shrink-0 text-right">
            <div className="font-display text-2xl font-bold text-frost-rime-200">
              {entry.count}
            </div>
            <div className="font-serif text-[9px] uppercase tracking-widest text-frost-steel-500">
              kills
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

// ── Kill Feed ─────────────────────────────────────────────────────────────────

function KillFeed({
  kills,
  guilds,
}: {
  kills: GuildKill[];
  guilds: Guild[];
}) {
  const guildMap = new Map(guilds.map((g) => [g.id, g]));
  const sorted = [...kills].sort(
    (a, b) => new Date(b.killed_at).getTime() - new Date(a.killed_at).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="font-serif text-xs uppercase tracking-widest text-frost-steel-500">
          No kills recorded yet
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-frost-ice-700/30">
      {sorted.slice(0, 12).map((k) => {
        const guild = guildMap.get(k.guild_id);
        const boss = allBosses.find((b) => b.name === k.boss_name);
        return (
          <li key={k.id} className="flex items-start gap-3 py-3">
            <span
              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${difficultyDot[boss?.difficulty ?? ''] ?? 'bg-frost-steel-500'}`}
            />
            <div className="flex-1 min-w-0">
              <span className="font-sans text-sm text-frost-steel-100">
                <span className="font-semibold text-frost-rime-200">{guild?.name ?? '—'}</span>
                {' killed '}
                <span className="text-frost-gold-300">{k.boss_name}</span>
              </span>
              {k.notes && (
                <p className="mt-0.5 font-sans text-xs italic text-frost-steel-400">{k.notes}</p>
              )}
            </div>
            <time
              dateTime={k.killed_at}
              title={formatDate(k.killed_at)}
              className="shrink-0 font-sans text-[10px] text-frost-steel-500"
            >
              {relativeTime(k.killed_at)}
            </time>
          </li>
        );
      })}
    </ul>
  );
}

// ── Submit Kill / Add Guild forms ─────────────────────────────────────────────

type FormTab = 'kill' | 'guild';

function SubmitPanel({
  guilds,
  onSuccess,
}: {
  guilds: Guild[];
  onSuccess: () => void;
}) {
  const [tab, setTab] = useState<FormTab>('kill');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Kill form
  const [guildId, setGuildId] = useState('');
  const [bossName, setBossName] = useState('');
  const [killedAt, setKilledAt] = useState('');
  const [killNotes, setKillNotes] = useState('');

  // Guild form
  const [guildName, setGuildName] = useState('');
  const [guildTag, setGuildTag] = useState('');

  function showSuccess() {
    setSuccess(true);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setSuccess(false), 4000);
  }

  async function submitKill(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!guildId) { setError('Select a guild.'); return; }
    if (!bossName) { setError('Select a boss.'); return; }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { guild_id: guildId, boss_name: bossName };
      const boss = allBosses.find((b) => b.name === bossName);
      payload.expansion = boss?.expansion ?? 'classic';
      if (killedAt) payload.killed_at = new Date(killedAt).toISOString();
      if (killNotes.trim()) payload.notes = killNotes.trim();

      const { error: err } = await supabase.from('guild_kills').upsert(payload, {
        onConflict: 'guild_id,boss_name',
      });
      if (err) throw err;
      setGuildId(''); setBossName(''); setKilledAt(''); setKillNotes('');
      showSuccess();
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitGuild(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const name = guildName.trim();
    if (!name) { setError('Enter a guild name.'); return; }
    if (name.length > 60) { setError('Name must be 60 characters or fewer.'); return; }
    setSubmitting(true);
    try {
      const { error: err } = await supabase
        .from('guilds')
        .insert({ name, tag: guildTag.trim() || null });
      if (err) {
        if (err.code === '23505') throw new Error('A guild with that name already exists.');
        throw err;
      }
      setGuildName(''); setGuildTag('');
      showSuccess();
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded border border-frost-ice-600/50 bg-frost-ice-900/60 px-4 py-2.5 font-sans text-sm text-frost-steel-100 placeholder-frost-steel-500 outline-none transition-colors focus:border-frost-rime-400/70 focus:ring-1 focus:ring-frost-rime-400/30';
  const labelClass =
    'mb-1.5 block font-serif text-[10px] uppercase tracking-widest text-frost-steel-300';

  return (
    <div className="panel p-6">
      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded border border-frost-ice-700/40 bg-frost-ice-900/40 p-1">
        {(['kill', 'guild'] as FormTab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(null); setSuccess(false); }}
            className={`flex-1 rounded py-2 font-serif text-[10px] uppercase tracking-widest transition-all duration-300 ${
              tab === t
                ? 'bg-frost-ice-700/60 text-frost-rime-200 shadow'
                : 'text-frost-steel-400 hover:text-frost-steel-200'
            }`}
          >
            {t === 'kill' ? 'Log a Kill' : 'Add Guild'}
          </button>
        ))}
      </div>

      {tab === 'kill' ? (
        <form onSubmit={submitKill} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Guild</label>
            <select
              value={guildId}
              onChange={(e) => setGuildId(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Select guild…</option>
              {guilds.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Boss</label>
            <select
              value={bossName}
              onChange={(e) => setBossName(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Select boss…</option>
              {expansions.map((exp) => {
                const bosses = allBosses.filter((b) => b.expansion === exp.id);
                if (bosses.length === 0) return null;
                return (
                  <optgroup key={exp.id} label={exp.abbr}>
                    {bosses.map((b) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Kill Date <span className="normal-case text-frost-steel-500">(optional)</span>
            </label>
            <input
              type="date"
              value={killedAt}
              onChange={(e) => setKilledAt(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Notes <span className="normal-case text-frost-steel-500">(optional)</span>
            </label>
            <input
              type="text"
              value={killNotes}
              onChange={(e) => setKillNotes(e.target.value)}
              maxLength={300}
              placeholder="e.g. Server first, no deaths"
              className={inputClass}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded border border-frost-ember-500/40 bg-frost-ember-600/10 px-3 py-2 text-frost-ember-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="font-sans text-xs">{error}</span>
            </div>
          )}
          {success && (
            <div className="rounded border border-frost-rime-400/30 bg-frost-rime-400/10 px-3 py-2 font-sans text-xs text-frost-rime-200">
              Kill logged — glory to the guild!
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-ice mt-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Swords className="h-4 w-4" />
            )}
            {submitting ? 'Logging…' : 'Log Kill'}
          </button>
        </form>
      ) : (
        <form onSubmit={submitGuild} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Guild Name</label>
            <input
              type="text"
              value={guildName}
              onChange={(e) => setGuildName(e.target.value)}
              required
              maxLength={60}
              placeholder="e.g. Wrath of Velious"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Tag / Abbreviation <span className="normal-case text-frost-steel-500">(optional)</span>
            </label>
            <input
              type="text"
              value={guildTag}
              onChange={(e) => setGuildTag(e.target.value)}
              maxLength={20}
              placeholder="e.g. WoV"
              className={inputClass}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded border border-frost-ember-500/40 bg-frost-ember-600/10 px-3 py-2 text-frost-ember-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="font-sans text-xs">{error}</span>
            </div>
          )}
          {success && (
            <div className="rounded border border-frost-rime-400/30 bg-frost-rime-400/10 px-3 py-2 font-sans text-xs text-frost-rime-200">
              Guild registered — may they find glory!
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-ice mt-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {submitting ? 'Registering…' : 'Register Guild'}
          </button>
        </form>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function GuildProgression() {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [kills, setKills] = useState<GuildKill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<'matrix' | 'leaderboard'>('matrix');

  const killMap = new Map<string, GuildKill>(
    kills.map((k) => [`${k.guild_id}:${k.boss_name}`, k])
  );

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const [{ data: gData, error: gErr }, { data: kData, error: kErr }] = await Promise.all([
        supabase.from('guilds').select('*').order('name'),
        supabase.from('guild_kills').select('*').order('killed_at', { ascending: false }),
      ]);
      if (gErr) throw gErr;
      if (kErr) throw kErr;
      setGuilds(gData ?? []);
      setKills(kData ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const totalBosses = allBosses.length;
  const totalKills = kills.length;
  const clearedGuilds = guilds.filter(
    (g) => kills.filter((k) => k.guild_id === g.id).length === totalBosses
  ).length;

  return (
    <section id="progression" className="relative py-24 px-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-frost-ice-900/40 to-transparent" />
      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mb-4 font-serif text-sm font-medium uppercase tracking-[0.4em] text-frost-rime-300">
            Server Standings
          </p>
          <h2 className="font-display text-4xl font-bold text-frost-rime-50 text-glow-ice sm:text-5xl">
            Guild Progression
          </h2>
          <div className="divider-ornate mx-auto mt-6 max-w-xs">
            <Trophy className="h-4 w-4 text-frost-gold-400" />
            <span className="font-serif text-xs uppercase tracking-[0.3em]">Frostreaver TLP</span>
            <Trophy className="h-4 w-4 text-frost-gold-400" />
          </div>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-frost-steel-100/80">
            Track which guilds have slain which bosses across every unlocked expansion.
            Submit kills, register your guild, and race for server firsts.
          </p>
        </div>

        {/* Summary stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: 'Guilds Registered', value: guilds.length },
            { label: 'Kills Logged', value: totalKills },
            { label: 'Full Clears', value: clearedGuilds },
          ].map((s) => (
            <div key={s.label} className="panel p-5 text-center">
              <div className="font-display text-3xl font-bold text-frost-rime-200 text-glow-ice">
                {loading ? '—' : s.value}
              </div>
              <div className="mt-1 font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* View toggle + refresh */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-1 rounded border border-frost-ice-700/40 bg-frost-ice-900/40 p-1">
            {(['matrix', 'leaderboard'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded px-4 py-2 font-serif text-[10px] uppercase tracking-widest transition-all duration-300 ${
                  view === v
                    ? 'bg-frost-ice-700/60 text-frost-rime-200 shadow'
                    : 'text-frost-steel-400 hover:text-frost-steel-200'
                }`}
              >
                {v === 'matrix' ? 'Progress Matrix' : 'Leaderboard'}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded border border-frost-ice-600/40 px-3 py-2 font-serif text-[10px] uppercase tracking-widest text-frost-steel-300 transition-colors hover:border-frost-rime-400/50 hover:text-frost-rime-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-frost-rime-400/50" />
          </div>
        ) : error ? (
          <div className="flex h-48 items-center justify-center gap-2 text-frost-ember-400">
            <AlertCircle className="h-5 w-5" />
            <span className="font-sans text-sm">{error}</span>
          </div>
        ) : view === 'matrix' ? (
          <ProgressionMatrix guilds={guilds} killMap={killMap} />
        ) : (
          <Leaderboard guilds={guilds} kills={kills} />
        )}

        {/* Bottom row: kill feed + submit form */}
        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="panel p-6 lg:col-span-3">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-frost-rime-400" />
              <h3 className="font-serif text-sm font-medium uppercase tracking-widest text-frost-steel-200">
                Recent Kills
              </h3>
            </div>
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <RefreshCw className="h-5 w-5 animate-spin text-frost-rime-400/40" />
              </div>
            ) : (
              <KillFeed kills={kills} guilds={guilds} />
            )}
          </div>

          <div className="lg:col-span-2">
            <SubmitPanel guilds={guilds} onSuccess={() => fetchAll(true)} />
          </div>
        </div>

        {/* Difficulty legend */}
        <div className="mt-6 flex flex-wrap items-center gap-4 px-1">
          <span className="font-serif text-[10px] uppercase tracking-widest text-frost-steel-500">
            Difficulty:
          </span>
          {Object.entries(difficultyDot).map(([label, cls]) => (
            <span key={label} className="flex items-center gap-1.5 font-sans text-xs text-frost-steel-400">
              <span className={`h-2 w-2 rounded-full ${cls}`} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
