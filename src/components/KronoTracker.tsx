import { useEffect, useRef, useState, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  SendHorizontal,
  Coins,
  Clock,
  BarChart3,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { supabase, type KronoPrice } from '../lib/supabase';

// ── helpers ──────────────────────────────────────────────────────────────────

function formatPP(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M pp`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k pp`;
  return `${n.toLocaleString()} pp`;
}

function relativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// ── SparkLine SVG ─────────────────────────────────────────────────────────────

interface SparkLineProps {
  data: KronoPrice[];
}

function SparkLine({ data }: SparkLineProps) {
  if (data.length < 2) return null;

  const W = 800;
  const H = 160;
  const PAD = { top: 20, right: 24, bottom: 36, left: 56 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  // newest-first → reverse for left-to-right
  const pts = [...data].reverse();

  const prices = pts.map((d) => d.price_pp);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;

  const xOf = (i: number) => PAD.left + (i / (pts.length - 1)) * innerW;
  const yOf = (p: number) => PAD.top + innerH - ((p - minP) / range) * innerH;

  const pathD = pts
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)},${yOf(d.price_pp).toFixed(1)}`)
    .join(' ');

  const areaD =
    pathD +
    ` L${xOf(pts.length - 1).toFixed(1)},${(PAD.top + innerH).toFixed(1)}` +
    ` L${xOf(0).toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`;

  // Y-axis ticks (3 levels)
  const yTicks = [minP, minP + range / 2, maxP];

  // X-axis labels — show at most 6 evenly spaced
  const xStep = Math.max(1, Math.floor((pts.length - 1) / 5));
  const xLabels = pts.filter((_, i) => i % xStep === 0 || i === pts.length - 1);

  const trend = prices[prices.length - 1] - prices[0];
  const strokeColor = trend >= 0 ? '#6fc4e8' : '#e07a4c';
  const gradStop1 = trend >= 0 ? 'rgba(111,196,232,0.28)' : 'rgba(224,122,76,0.22)';
  const gradStop2 = 'rgba(20,40,55,0)';

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      aria-label="Krono price chart"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradStop1} />
          <stop offset="100%" stopColor={gradStop2} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((tick) => (
        <line
          key={tick}
          x1={PAD.left}
          y1={yOf(tick)}
          x2={PAD.left + innerW}
          y2={yOf(tick)}
          stroke="rgba(111,196,232,0.08)"
          strokeWidth="1"
        />
      ))}

      {/* Area fill */}
      <path d={areaD} fill="url(#chartArea)" />

      {/* Price line */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Dots for each data point */}
      {pts.map((d, i) => (
        <circle
          key={d.id}
          cx={xOf(i)}
          cy={yOf(d.price_pp)}
          r="3"
          fill={strokeColor}
          opacity="0.7"
        />
      ))}

      {/* Y-axis labels */}
      {yTicks.map((tick) => (
        <text
          key={tick}
          x={PAD.left - 8}
          y={yOf(tick) + 4}
          textAnchor="end"
          fill="rgba(168,188,205,0.7)"
          fontSize="11"
          fontFamily="Cinzel, serif"
        >
          {formatPP(tick)}
        </text>
      ))}

      {/* X-axis labels */}
      {xLabels.map((d, idx) => {
        const origIdx = pts.indexOf(d);
        return (
          <text
            key={`xl-${idx}`}
            x={xOf(origIdx)}
            y={PAD.top + innerH + 18}
            textAnchor="middle"
            fill="rgba(168,188,205,0.55)"
            fontSize="10"
            fontFamily="Inter, sans-serif"
          >
            {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </text>
        );
      })}
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const PAGE_SIZE = 30;
const HISTORY_DISPLAY = 8;

export default function KronoTracker() {
  const [prices, setPrices] = useState<KronoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const priceRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLInputElement>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPrices = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('krono_prices')
        .select('id, price_pp, note, created_at')
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);
      if (err) throw err;
      setPrices(data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load prices.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    };
  }, [fetchPrices]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    const raw = priceRef.current?.value.trim() ?? '';
    const noteVal = noteRef.current?.value.trim() || null;
    const parsed = parseInt(raw, 10);

    if (!raw || isNaN(parsed) || parsed <= 0) {
      setSubmitError('Enter a valid platinum price greater than 0.');
      return;
    }
    if (parsed >= 10_000_000) {
      setSubmitError('Price must be under 10,000,000 pp.');
      return;
    }
    if (noteVal && noteVal.length > 200) {
      setSubmitError('Note must be 200 characters or fewer.');
      return;
    }

    setSubmitting(true);
    try {
      const { error: err } = await supabase
        .from('krono_prices')
        .insert({ price_pp: parsed, note: noteVal });
      if (err) throw err;

      if (priceRef.current) priceRef.current.value = '';
      if (noteRef.current) noteRef.current.value = '';
      setSubmitSuccess(true);
      successTimer.current = setTimeout(() => setSubmitSuccess(false), 4000);
      await fetchPrices(true);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── derived stats ──
  const latest = prices[0] ?? null;
  const prev = prices[1] ?? null;
  const allPP = prices.map((p) => p.price_pp);
  const avgPP = allPP.length ? Math.round(allPP.reduce((a, b) => a + b, 0) / allPP.length) : null;
  const minPP = allPP.length ? Math.min(...allPP) : null;
  const maxPP = allPP.length ? Math.max(...allPP) : null;

  const delta = latest && prev ? latest.price_pp - prev.price_pp : null;
  const deltaPct = delta !== null && prev ? ((delta / prev.price_pp) * 100).toFixed(1) : null;

  const TrendIcon =
    delta === null ? Minus : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendColor =
    delta === null || delta === 0
      ? 'text-frost-steel-300'
      : delta > 0
      ? 'text-frost-rime-300'
      : 'text-frost-ember-400';

  const displayedHistory = showAll ? prices : prices.slice(0, HISTORY_DISPLAY);

  return (
    <section id="krono" className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mb-4 font-serif text-sm font-medium uppercase tracking-[0.4em] text-frost-rime-300">
            Community Tracker
          </p>
          <h2 className="font-display text-4xl font-bold text-frost-rime-50 text-glow-ice sm:text-5xl">
            Krono Price Watch
          </h2>
          <div className="divider-ornate mx-auto mt-6 max-w-xs">
            <Coins className="h-4 w-4" />
            <span className="font-serif text-xs uppercase tracking-[0.3em]">Frostreaver TLP</span>
            <Coins className="h-4 w-4" />
          </div>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-frost-steel-100/80">
            Track the current Krono-to-platinum exchange rate on Frostreaver. Submit a price
            you observed in the Bazaar or /auction to help the community stay informed.
          </p>
        </div>

        {/* Stats row */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              label: 'Latest Price',
              value: latest ? formatPP(latest.price_pp) : '—',
              sub: latest ? relativeTime(latest.created_at) : 'no data',
              icon: <Coins className="h-5 w-5" />,
              accent: true,
            },
            {
              label: 'Trend',
              value:
                delta === null
                  ? '—'
                  : `${delta > 0 ? '+' : ''}${formatPP(Math.abs(delta))}`,
              sub: deltaPct ? `${delta! > 0 ? '+' : ''}${deltaPct}% vs previous` : 'vs previous',
              icon: <TrendIcon className="h-5 w-5" />,
              colorClass: trendColor,
            },
            {
              label: `Avg (${allPP.length} reports)`,
              value: avgPP !== null ? formatPP(avgPP) : '—',
              sub: 'last 30 entries',
              icon: <BarChart3 className="h-5 w-5" />,
            },
            {
              label: 'Range',
              value:
                minPP !== null && maxPP !== null
                  ? `${formatPP(minPP)} – ${formatPP(maxPP)}`
                  : '—',
              sub: 'low / high',
              icon: <TrendingUp className="h-5 w-5" />,
            },
          ].map((stat) => (
            <div key={stat.label} className="panel p-5">
              <div
                className={`mb-1 flex items-center gap-2 ${stat.colorClass ?? (stat.accent ? 'text-frost-rime-300' : 'text-frost-steel-300')}`}
              >
                {stat.icon}
                <span className="font-serif text-[10px] uppercase tracking-widest">
                  {stat.label}
                </span>
              </div>
              <div
                className={`mt-2 font-serif text-xl font-bold leading-tight sm:text-2xl ${
                  stat.colorClass ?? (stat.accent ? 'text-frost-rime-100 text-glow-ice' : 'text-frost-steel-100')
                }`}
              >
                {stat.value}
              </div>
              <div className="mt-1 font-sans text-xs text-frost-steel-400">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="panel mb-8 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-sm font-medium uppercase tracking-widest text-frost-steel-200">
              Price History
            </h3>
            <button
              onClick={() => fetchPrices(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded border border-frost-ice-600/40 px-3 py-1.5 font-serif text-[10px] uppercase tracking-widest text-frost-steel-300 transition-colors hover:border-frost-rime-400/50 hover:text-frost-rime-200 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-frost-rime-400/60" />
            </div>
          ) : error ? (
            <div className="flex h-40 items-center justify-center gap-2 text-frost-ember-400">
              <AlertCircle className="h-5 w-5" />
              <span className="font-sans text-sm">{error}</span>
            </div>
          ) : prices.length < 2 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-frost-steel-400">
              <BarChart3 className="h-8 w-8 opacity-30" />
              <p className="font-serif text-xs uppercase tracking-widest">
                Submit at least 2 prices to see the chart
              </p>
            </div>
          ) : (
            <SparkLine data={prices} />
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Submit form */}
          <div className="panel p-6 lg:col-span-2">
            <h3 className="mb-5 font-serif text-sm font-medium uppercase tracking-widest text-frost-steel-200">
              Report a Price
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="krono-price"
                  className="mb-1.5 block font-serif text-[10px] uppercase tracking-widest text-frost-steel-300"
                >
                  Price (Platinum)
                </label>
                <input
                  id="krono-price"
                  ref={priceRef}
                  type="number"
                  min="1"
                  max="9999999"
                  placeholder="e.g. 750000"
                  required
                  className="w-full rounded border border-frost-ice-600/50 bg-frost-ice-900/60 px-4 py-2.5 font-sans text-sm text-frost-steel-100 placeholder-frost-steel-500 outline-none transition-colors focus:border-frost-rime-400/70 focus:ring-1 focus:ring-frost-rime-400/30"
                />
              </div>
              <div>
                <label
                  htmlFor="krono-note"
                  className="mb-1.5 block font-serif text-[10px] uppercase tracking-widest text-frost-steel-300"
                >
                  Note <span className="normal-case text-frost-steel-500">(optional)</span>
                </label>
                <input
                  id="krono-note"
                  ref={noteRef}
                  type="text"
                  maxLength={200}
                  placeholder="e.g. Bazaar check, server reset week"
                  className="w-full rounded border border-frost-ice-600/50 bg-frost-ice-900/60 px-4 py-2.5 font-sans text-sm text-frost-steel-100 placeholder-frost-steel-500 outline-none transition-colors focus:border-frost-rime-400/70 focus:ring-1 focus:ring-frost-rime-400/30"
                />
              </div>

              {submitError && (
                <div className="flex items-start gap-2 rounded border border-frost-ember-500/40 bg-frost-ember-600/10 px-3 py-2 text-frost-ember-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="font-sans text-xs">{submitError}</span>
                </div>
              )}
              {submitSuccess && (
                <div className="rounded border border-frost-rime-400/30 bg-frost-rime-400/10 px-3 py-2 font-sans text-xs text-frost-rime-200">
                  Price submitted — thank you, adventurer!
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
                  <SendHorizontal className="h-4 w-4" />
                )}
                {submitting ? 'Submitting…' : 'Submit Price'}
              </button>
            </form>
          </div>

          {/* Recent history */}
          <div className="panel p-6 lg:col-span-3">
            <h3 className="mb-5 font-serif text-sm font-medium uppercase tracking-widest text-frost-steel-200">
              Recent Reports
            </h3>

            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <RefreshCw className="h-5 w-5 animate-spin text-frost-rime-400/50" />
              </div>
            ) : prices.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-2 text-frost-steel-400">
                <Clock className="h-8 w-8 opacity-30" />
                <p className="font-serif text-xs uppercase tracking-widest">
                  No prices reported yet
                </p>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-frost-ice-700/40">
                  {displayedHistory.map((p, i) => {
                    const next = prices[i + 1];
                    const diff = next ? p.price_pp - next.price_pp : null;
                    return (
                      <li key={p.id} className="flex items-start gap-3 py-3">
                        <span
                          className={`mt-0.5 shrink-0 font-sans text-[10px] font-medium tabular-nums ${
                            i === 0
                              ? 'text-frost-rime-300'
                              : 'text-frost-steel-500'
                          }`}
                        >
                          #{i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span
                              className={`font-serif font-bold ${
                                i === 0
                                  ? 'text-frost-rime-100 text-glow-ice'
                                  : 'text-frost-steel-100'
                              }`}
                            >
                              {formatPP(p.price_pp)}
                            </span>
                            {diff !== null && (
                              <span
                                className={`font-sans text-xs ${
                                  diff > 0
                                    ? 'text-frost-rime-400'
                                    : diff < 0
                                    ? 'text-frost-ember-400'
                                    : 'text-frost-steel-500'
                                }`}
                              >
                                {diff > 0 ? '+' : ''}
                                {formatPP(Math.abs(diff))}
                              </span>
                            )}
                          </div>
                          {p.note && (
                            <p className="mt-0.5 truncate font-sans text-xs text-frost-steel-400 italic">
                              {p.note}
                            </p>
                          )}
                        </div>
                        <time
                          dateTime={p.created_at}
                          title={formatDate(p.created_at)}
                          className="shrink-0 font-sans text-[10px] text-frost-steel-500"
                        >
                          {relativeTime(p.created_at)}
                        </time>
                      </li>
                    );
                  })}
                </ul>

                {prices.length > HISTORY_DISPLAY && (
                  <button
                    onClick={() => setShowAll((v) => !v)}
                    className="mt-4 flex w-full items-center justify-center gap-1.5 rounded border border-frost-ice-600/40 py-2 font-serif text-[10px] uppercase tracking-widest text-frost-steel-400 transition-colors hover:border-frost-rime-400/40 hover:text-frost-rime-300"
                  >
                    {showAll ? (
                      <>
                        <ChevronUp className="h-3.5 w-3.5" /> Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" /> Show All {prices.length} Reports
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
