import { useCallback, useEffect, useState } from 'react';
import {
  Trophy,
  Star,
  Sword,
  Search,
  X,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckSquare,
  Square,
  Send,
  MapPin,
  Users,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { supabase, type HunterAchievement, type HunterKillReport } from '../lib/supabase';
import { expansions } from '../data';

// ── Constants ─────────────────────────────────────────────────────────────────

const EXPANSION_ORDER = ['classic', 'kunark', 'velious', 'luclin', 'pop'];

const difficultyStyles: Record<HunterAchievement['difficulty'], string> = {
  Easy:     'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Moderate: 'bg-frost-rime-500/15 text-frost-rime-300 border-frost-rime-500/30',
  Hard:     'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Extreme:  'bg-frost-ember-500/15 text-frost-ember-300 border-frost-ember-500/30',
};

const difficultyIcon: Record<HunterAchievement['difficulty'], React.ReactNode> = {
  Easy:     <Star className="h-3 w-3" />,
  Moderate: <Sword className="h-3 w-3" />,
  Hard:     <Zap className="h-3 w-3" />,
  Extreme:  <AlertTriangle className="h-3 w-3" />,
};

function storageKey(achievementId: string, mob: string) {
  return `hunter:${achievementId}:${mob}`;
}

function getKilled(achievementId: string, mob: string): boolean {
  return localStorage.getItem(storageKey(achievementId, mob)) === '1';
}

function toggleKilled(achievementId: string, mob: string): boolean {
  const key = storageKey(achievementId, mob);
  const next = !getKilled(achievementId, mob);
  if (next) localStorage.setItem(key, '1');
  else localStorage.removeItem(key);
  return next;
}

function getProgress(achievement: HunterAchievement): number {
  return achievement.mob_names.filter((m) => getKilled(achievement.id, m)).length;
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

// ── Kill Report Form ──────────────────────────────────────────────────────────

function KillReportForm({
  achievement,
  preselectedMob,
  onReported,
  onClose,
}: {
  achievement: HunterAchievement;
  preselectedMob: string | null;
  onReported: () => void;
  onClose: () => void;
}) {
  const [mob, setMob]             = useState(preselectedMob ?? achievement.mob_names[0]);
  const [reporter, setReporter]   = useState('');
  const [notes, setNotes]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: err } = await supabase.from('hunter_kill_reports').insert({
        achievement_id: achievement.id,
        mob_name: mob,
        reporter_name: reporter.trim() || null,
        spawn_notes: notes.trim() || null,
      });
      if (err) throw err;
      onReported();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Report failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputBase =
    'w-full rounded border border-frost-ice-600/50 bg-frost-ice-900/60 px-3 py-2 font-sans text-sm text-frost-steel-100 placeholder-frost-steel-500 outline-none transition-colors focus:border-frost-rime-400/70 focus:ring-1 focus:ring-frost-rime-400/30';

  return (
    <div className="mt-4 rounded border border-frost-ice-600/40 bg-frost-ice-800/30 p-4 space-y-3">
      <p className="font-serif text-[10px] uppercase tracking-widest text-frost-rime-400">
        Report Kill Confirmation
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
            Named Mob
          </label>
          <select
            value={mob}
            onChange={(e) => setMob(e.target.value)}
            className={inputBase}
          >
            {achievement.mob_names.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <input
          value={reporter}
          onChange={(e) => setReporter(e.target.value)}
          maxLength={40}
          placeholder="Your character name (optional)"
          className={inputBase}
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={200}
          rows={2}
          placeholder="Spawn location or notes (optional)…"
          className={`${inputBase} resize-none`}
        />
        {error && (
          <div className="flex items-start gap-2 rounded border border-frost-ember-500/40 bg-frost-ember-600/10 px-3 py-2 text-frost-ember-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="font-sans text-xs">{error}</span>
          </div>
        )}
        <div className="flex gap-2">
          <button type="submit" disabled={submitting} className="btn-ice flex-1 disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? 'Submitting…' : 'Submit Report'}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost px-4">
            <X className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Achievement Drawer ────────────────────────────────────────────────────────

function AchievementDrawer({
  achievement,
  onClose,
}: {
  achievement: HunterAchievement;
  onClose: () => void;
}) {
  const [killed, setKilled]       = useState<Record<string, boolean>>(() =>
    Object.fromEntries(achievement.mob_names.map((m) => [m, getKilled(achievement.id, m)]))
  );
  const [reports, setReports]     = useState<HunterKillReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [showReport, setShowReport] = useState<string | null>(null);

  const killedCount = Object.values(killed).filter(Boolean).length;
  const total       = achievement.mob_names.length;
  const pct         = total > 0 ? Math.round((killedCount / total) * 100) : 0;
  const complete    = killedCount === total;

  const fetchReports = useCallback(async () => {
    setLoadingReports(true);
    const { data } = await supabase
      .from('hunter_kill_reports')
      .select('*')
      .eq('achievement_id', achievement.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setReports(data ?? []);
    setLoadingReports(false);
  }, [achievement.id]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  function handleToggle(mob: string) {
    const next = toggleKilled(achievement.id, mob);
    setKilled((prev) => ({ ...prev, [mob]: next }));
  }

  const expObj = expansions.find((e) => e.id === achievement.expansion);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-frost-ice-900/80 backdrop-blur-sm" />
      <div
        className="panel relative z-10 h-full w-full max-w-md overflow-y-auto p-7 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-frost-ice-600/50 text-frost-steel-300 transition-colors hover:border-frost-rime-400/60 hover:text-frost-rime-200"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-frost-gold-400" />
          <span className="font-serif text-xs uppercase tracking-[0.3em] text-frost-rime-400">
            {expObj?.name ?? achievement.expansion}
          </span>
        </div>
        <h3 className="mt-2 font-display text-2xl font-bold text-frost-rime-50 text-glow-ice">
          {achievement.zone_name}
        </h3>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className={`chip border ${difficultyStyles[achievement.difficulty]}`}>
            {difficultyIcon[achievement.difficulty]}
            {achievement.difficulty}
          </span>
          <span className="chip border border-frost-gold-500/30 bg-frost-gold-500/10 text-frost-gold-300">
            <Zap className="h-3 w-3" />
            {achievement.reward_aa} AA
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
              Your Progress
            </span>
            <span className={`font-serif text-xs font-semibold ${complete ? 'text-emerald-300' : 'text-frost-steel-200'}`}>
              {killedCount}/{total} · {pct}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-frost-ice-700/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                complete
                  ? 'bg-emerald-500'
                  : pct > 50
                  ? 'bg-frost-rime-400'
                  : 'bg-frost-rime-600'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {complete && (
            <p className="mt-1.5 font-serif text-[11px] text-emerald-300">
              Achievement complete — claim "{achievement.reward_title}"!
            </p>
          )}
        </div>

        {/* Mob checklist */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-serif text-xs font-semibold uppercase tracking-widest text-frost-rime-400">
              Named Mobs ({total})
            </h4>
            <button
              onClick={() => setShowReport(showReport ? null : achievement.mob_names[0])}
              className="flex items-center gap-1.5 rounded border border-frost-ice-600/50 px-2.5 py-1 font-serif text-[10px] uppercase tracking-widest text-frost-steel-300 transition-colors hover:border-frost-rime-400/50 hover:text-frost-rime-200"
            >
              <MapPin className="h-3 w-3" />
              Report Kill
            </button>
          </div>

          {showReport !== null && (
            <KillReportForm
              achievement={achievement}
              preselectedMob={showReport}
              onReported={fetchReports}
              onClose={() => setShowReport(null)}
            />
          )}

          <ul className="space-y-1.5">
            {achievement.mob_names.map((mob) => {
              const mobReports = reports.filter((r) => r.mob_name === mob);
              return (
                <li key={mob} className="rounded border border-frost-ice-700/30 bg-frost-ice-800/30">
                  <button
                    onClick={() => handleToggle(mob)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-frost-ice-700/20"
                  >
                    {killed[mob] ? (
                      <CheckSquare className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <Square className="h-4 w-4 shrink-0 text-frost-steel-500" />
                    )}
                    <span className={`flex-1 font-serif text-sm transition-colors ${killed[mob] ? 'text-frost-steel-400 line-through' : 'text-frost-steel-100'}`}>
                      {mob}
                    </span>
                    {mobReports.length > 0 && (
                      <span className="flex items-center gap-1 font-sans text-[10px] text-frost-rime-400">
                        <Users className="h-3 w-3" />
                        {mobReports.length}
                      </span>
                    )}
                  </button>
                  {mobReports.length > 0 && (
                    <div className="border-t border-frost-ice-700/30 px-3 py-2 space-y-1.5">
                      {mobReports.slice(0, 3).map((r) => (
                        <div key={r.id} className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-frost-steel-600" />
                          <div className="min-w-0 flex-1">
                            {r.spawn_notes && (
                              <p className="font-sans text-xs text-frost-steel-300 leading-relaxed">
                                {r.spawn_notes}
                              </p>
                            )}
                            <p className="mt-0.5 font-sans text-[10px] text-frost-steel-600">
                              {r.reporter_name ?? 'Anonymous'} · {relativeTime(r.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Reward */}
        <div className="mt-6 rounded border border-frost-gold-600/30 bg-frost-gold-500/5 p-4">
          <h4 className="font-serif text-xs font-semibold uppercase tracking-widest text-frost-gold-300">
            Completion Reward
          </h4>
          <p className="mt-1.5 font-serif text-sm font-semibold text-frost-steel-100">
            "{achievement.reward_title}"
          </p>
          <p className="mt-0.5 font-serif text-sm text-frost-gold-400">
            +{achievement.reward_aa} AA Experience
          </p>
          {achievement.reward_notes && (
            <p className="mt-2 font-sans text-xs leading-relaxed text-frost-steel-300">
              {achievement.reward_notes}
            </p>
          )}
        </div>

        {loadingReports && (
          <p className="mt-4 flex items-center gap-2 font-sans text-xs text-frost-steel-600">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            Loading community reports…
          </p>
        )}
      </div>
    </div>
  );
}

// ── Achievement Card ──────────────────────────────────────────────────────────

function AchievementCard({
  achievement,
  onClick,
}: {
  achievement: HunterAchievement;
  onClick: () => void;
}) {
  const [progress, setProgress] = useState(() => getProgress(achievement));

  function handleClick() {
    setProgress(getProgress(achievement));
    onClick();
  }

  const total    = achievement.mob_names.length;
  const pct      = total > 0 ? Math.round((progress / total) * 100) : 0;
  const complete = progress === total;

  return (
    <button
      onClick={handleClick}
      className={`group flex w-full flex-col rounded border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        complete
          ? 'border-emerald-500/40 bg-frost-ice-800/50 hover:border-emerald-400/60'
          : 'border-frost-ice-700/40 bg-frost-ice-800/30 hover:border-frost-rime-400/40 hover:bg-frost-ice-800/50'
      }`}
    >
      <div className="flex flex-1 flex-col p-4">
        {/* Zone name + expand arrow */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-sm font-semibold text-frost-steel-50 leading-snug">
            {achievement.zone_name}
          </h3>
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-frost-steel-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-frost-rime-300" />
        </div>

        {/* Badges */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className={`chip border text-[10px] ${difficultyStyles[achievement.difficulty]}`}>
            {difficultyIcon[achievement.difficulty]}
            {achievement.difficulty}
          </span>
          <span className="chip border border-frost-gold-500/30 bg-frost-gold-500/8 text-frost-gold-300 text-[10px]">
            <Zap className="h-2.5 w-2.5" />
            {achievement.reward_aa} AA
          </span>
        </div>

        {/* Mob count */}
        <p className="mt-2.5 font-sans text-[11px] text-frost-steel-400">
          {total} named mob{total !== 1 ? 's' : ''} required
        </p>
      </div>

      {/* Progress bar footer */}
      <div className="border-t border-frost-ice-700/30 px-4 py-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-sans text-[10px] text-frost-steel-500">
            {complete ? 'Complete!' : `${progress}/${total} killed`}
          </span>
          <span className={`font-serif text-[10px] font-semibold ${complete ? 'text-emerald-300' : 'text-frost-steel-300'}`}>
            {pct}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-frost-ice-700/60">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              complete ? 'bg-emerald-500' : 'bg-frost-rime-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </button>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────

export default function HunterBonuses() {
  const [achievements, setAchievements] = useState<HunterAchievement[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [expFilter, setExpFilter]       = useState<string>('All');
  const [diffFilter, setDiffFilter]     = useState<string>('All');
  const [search, setSearch]             = useState('');
  const [selected, setSelected]         = useState<HunterAchievement | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data, error: err } = await supabase
          .from('hunter_achievements')
          .select('*')
          .order('expansion')
          .order('zone_name');
        if (err) throw err;
        setAchievements(data ?? []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load hunter data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const presentExpansions = EXPANSION_ORDER.filter((id) =>
    achievements.some((a) => a.expansion === id)
  );

  const visible = achievements.filter((a) => {
    if (expFilter !== 'All' && a.expansion !== expFilter) return false;
    if (diffFilter !== 'All' && a.difficulty !== diffFilter) return false;
    if (search.trim() && !a.zone_name.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  const grouped = presentExpansions
    .filter((id) => expFilter === 'All' || id === expFilter)
    .map((id) => ({
      id,
      exp: expansions.find((e) => e.id === id),
      achievements: visible.filter((a) => a.expansion === id),
    }))
    .filter((g) => g.achievements.length > 0);

  const totalAA = achievements.reduce((s, a) => s + a.reward_aa, 0);

  return (
    <section id="hunter" className="relative py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-1/4 top-20 h-80 w-80 rounded-full bg-frost-gold-600/5 blur-3xl" />
        <div className="absolute left-1/3 bottom-24 h-96 w-96 rounded-full bg-frost-rime-600/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-serif text-sm font-medium uppercase tracking-[0.3em] text-frost-rime-400">
            Frostreaver Server
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-frost-rime-100 text-glow-ice sm:text-5xl">
            Resource Hunter Bonuses
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-frost-steel-200/80">
            Kill every named mob in a zone to earn titles, AA experience, and
            Frostreaver-exclusive rewards. Track your personal progress and browse
            community-sourced spawn notes.
          </p>
          {!loading && (
            <div className="mt-6 flex justify-center gap-6">
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-frost-gold-300">
                  {achievements.length}
                </p>
                <p className="font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
                  Zones
                </p>
              </div>
              <div className="h-full w-px bg-frost-ice-700/50" />
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-frost-gold-300">
                  {achievements.reduce((s, a) => s + a.mob_names.length, 0)}
                </p>
                <p className="font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
                  Named Mobs
                </p>
              </div>
              <div className="h-full w-px bg-frost-ice-700/50" />
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-frost-gold-300">
                  {totalAA.toLocaleString()}
                </p>
                <p className="font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
                  Total AA
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Expansion filter */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setExpFilter('All')}
              className={`chip transition-all duration-200 ${
                expFilter === 'All'
                  ? 'border-frost-rime-400 bg-frost-rime-400/20 text-frost-rime-100'
                  : 'border-frost-ice-600/40 text-frost-steel-300 hover:border-frost-rime-400/50'
              }`}
            >
              All
            </button>
            {presentExpansions.map((id) => {
              const exp = expansions.find((e) => e.id === id);
              return (
                <button
                  key={id}
                  onClick={() => setExpFilter(id)}
                  className={`chip transition-all duration-200 ${
                    expFilter === id
                      ? 'border-frost-ice-400 bg-frost-ice-400/20 text-frost-ice-100'
                      : 'border-frost-steel-600/40 text-frost-steel-400 hover:border-frost-ice-400/50'
                  }`}
                >
                  {exp?.abbr ?? id}
                </button>
              );
            })}
          </div>

          {/* Difficulty filter */}
          <div className="flex gap-1.5 sm:ml-2">
            {(['All', 'Easy', 'Moderate', 'Hard', 'Extreme'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={`chip text-[10px] transition-all duration-200 ${
                  diffFilter === d
                    ? d === 'All'
                      ? 'border-frost-steel-400 bg-frost-steel-400/20 text-frost-steel-100'
                      : `border ${difficultyStyles[d as HunterAchievement['difficulty']]}`
                    : 'border-frost-ice-700/40 text-frost-steel-500 hover:border-frost-ice-600/60 hover:text-frost-steel-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative sm:ml-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-frost-steel-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search zones…"
              className="w-full rounded-full border border-frost-ice-600/50 bg-frost-ice-900/80 py-2 pl-9 pr-4 text-sm text-frost-rime-100 placeholder-frost-steel-400 outline-none transition-all duration-300 focus:border-frost-rime-400/70 focus:shadow-[0_0_20px_-4px_rgba(111,196,232,0.4)]"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="mt-16 flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-frost-rime-400/50" />
          </div>
        ) : error ? (
          <div className="mt-16 flex items-center justify-center gap-2 text-frost-ember-400">
            <AlertCircle className="h-5 w-5" />
            <span className="font-sans text-sm">{error}</span>
          </div>
        ) : grouped.length === 0 ? (
          <p className="mt-16 text-center font-serif text-frost-steel-400">
            No hunter achievements match your filters.
          </p>
        ) : (
          <div className="mt-10 space-y-12">
            {grouped.map(({ id, exp, achievements: ach }) => (
              <div key={id}>
                <div className="mb-5 flex items-center gap-4">
                  <h3 className="font-serif text-lg font-semibold text-frost-rime-200">
                    {exp?.name ?? id}
                  </h3>
                  <div className="flex-1 h-px bg-frost-ice-700/40" />
                  <span className="font-sans text-xs text-frost-steel-500">
                    {ach.reduce((s, a) => s + a.reward_aa, 0)} AA available
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {ach.map((a) => (
                    <AchievementCard key={a.id} achievement={a} onClick={() => setSelected(a)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <AchievementDrawer achievement={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
