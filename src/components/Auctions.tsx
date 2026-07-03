import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  AlertCircle,
  Plus,
  X,
  Send,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { supabase, type AuctionListing } from '../lib/supabase';

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function timeLeft(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'expired';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

function formatPrice(pp: number | null): string {
  if (pp == null) return 'PST';
  if (pp >= 1_000_000) return `${(pp / 1_000_000).toFixed(1)}M pp`;
  if (pp >= 1_000) return `${(pp / 1_000).toFixed(pp % 1_000 === 0 ? 0 : 1)}k pp`;
  return `${pp} pp`;
}

const DURATIONS = [
  { label: '6h',  hours: 6  },
  { label: '12h', hours: 12 },
  { label: '24h', hours: 24 },
  { label: '48h', hours: 48 },
];

// ── Post form ─────────────────────────────────────────────────────────────────

function PostForm({ onPosted, onClose }: { onPosted: () => void; onClose: () => void }) {
  const [type, setType]           = useState<'WTS' | 'WTB'>('WTS');
  const [itemName, setItemName]   = useState('');
  const [sellerName, setSellerName] = useState('');
  const [price, setPrice]         = useState('');
  const [note, setNote]           = useState('');
  const [hours, setHours]         = useState(24);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const priceVal = price.trim() ? parseInt(price.replace(/[^0-9]/g, ''), 10) : null;
    if (price.trim() && (!priceVal || priceVal <= 0)) {
      setError('Price must be a positive number or leave blank for PST.');
      return;
    }
    setSubmitting(true);
    try {
      const expires = new Date(Date.now() + hours * 3_600_000).toISOString();
      const { error: err } = await supabase.from('auction_listings').insert({
        type,
        item_name: itemName.trim(),
        price_pp: priceVal,
        seller_name: sellerName.trim(),
        note: note.trim() || null,
        expires_at: expires,
      });
      if (err) throw err;
      onPosted();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Post failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded border border-frost-ice-600/50 bg-frost-ice-900/60 px-3 py-2 font-sans text-sm text-frost-steel-100 placeholder-frost-steel-500 outline-none transition-colors focus:border-frost-rime-400/70 focus:ring-1 focus:ring-frost-rime-400/30';

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 pt-12 animate-fade-in">
      <div className="absolute inset-0 bg-frost-ice-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="panel relative z-10 w-full max-w-md animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-frost-ice-700/40 p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-frost-ice-600/50 text-frost-steel-300 transition-colors hover:border-frost-rime-400/60 hover:text-frost-rime-200"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
            Commonlands
          </p>
          <h3 className="mt-1 font-serif text-lg text-frost-steel-50">Post Auction</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* WTS / WTB toggle */}
          <div>
            <p className="mb-2 font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
              Listing Type
            </p>
            <div className="flex rounded border border-frost-ice-600/50 overflow-hidden">
              {(['WTS', 'WTB'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 font-serif text-xs uppercase tracking-widest transition-colors ${
                    type === t
                      ? t === 'WTS'
                        ? 'bg-frost-ember-500/20 text-frost-ember-200 border-r border-frost-ice-600/50'
                        : 'bg-frost-rime-500/20 text-frost-rime-200'
                      : 'bg-transparent text-frost-steel-400 hover:text-frost-steel-200 border-r border-frost-ice-600/50 last:border-r-0'
                  }`}
                >
                  {t === 'WTS' ? 'WTS — Want to Sell' : 'WTB — Want to Buy'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
              Item Name <span className="text-frost-ember-400">*</span>
            </label>
            <input
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              maxLength={80}
              placeholder="e.g. Fungi Tunic, Ykesha's Sword"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
              Character Name <span className="text-frost-ember-400">*</span>
            </label>
            <input
              required
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              maxLength={40}
              placeholder="Your in-game name"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
              Price (pp){' '}
              <span className="normal-case text-frost-steel-500">— leave blank for PST</span>
            </label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 50000"
              inputMode="numeric"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
              Note <span className="normal-case text-frost-steel-500">(optional)</span>
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              placeholder="Class, stats, condition…"
              className={inputClass}
            />
          </div>

          <div>
            <p className="mb-2 font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
              Listing Duration
            </p>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.hours}
                  type="button"
                  onClick={() => setHours(d.hours)}
                  className={`flex-1 rounded border py-2 font-serif text-xs transition-colors ${
                    hours === d.hours
                      ? 'border-frost-rime-400/60 bg-frost-rime-500/15 text-frost-rime-200'
                      : 'border-frost-ice-600/50 text-frost-steel-400 hover:border-frost-ice-500/70 hover:text-frost-steel-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded border border-frost-ember-500/40 bg-frost-ember-600/10 px-3 py-2 text-frost-ember-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="font-sans text-xs">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !itemName.trim() || !sellerName.trim()}
            className="btn-ice w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? 'Posting…' : 'Post Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Listing row ───────────────────────────────────────────────────────────────

function ListingRow({ listing }: { listing: AuctionListing }) {
  const isWts = listing.type === 'WTS';
  return (
    <li className="group flex flex-col gap-1.5 rounded border border-frost-ice-700/30 bg-frost-ice-800/30 px-4 py-3 transition-colors hover:border-frost-ice-600/50 hover:bg-frost-ice-800/50 sm:flex-row sm:items-start sm:gap-4">
      {/* Type badge */}
      <span
        className={`self-start rounded px-2 py-0.5 font-serif text-[10px] font-semibold uppercase tracking-widest ${
          isWts
            ? 'bg-frost-ember-500/15 text-frost-ember-300 border border-frost-ember-500/30'
            : 'bg-frost-rime-500/15 text-frost-rime-300 border border-frost-rime-500/30'
        }`}
      >
        {listing.type}
      </span>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span className="font-serif text-sm font-semibold text-frost-steel-50">
            {listing.item_name}
          </span>
          <span
            className={`font-serif text-sm font-semibold ${
              listing.price_pp ? 'text-frost-gold-300' : 'text-frost-steel-400'
            }`}
          >
            {formatPrice(listing.price_pp)}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <span className="font-sans text-xs text-frost-steel-300">
            /tell{' '}
            <span className="font-semibold text-frost-rime-300">{listing.seller_name}</span>
          </span>
          {listing.note && (
            <span className="font-sans text-xs text-frost-steel-400 italic">{listing.note}</span>
          )}
        </div>
      </div>

      {/* Time info */}
      <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
        <span className="font-sans text-[10px] text-frost-steel-500">
          {relativeTime(listing.created_at)}
        </span>
        <span className="flex items-center gap-1 font-sans text-[10px] text-frost-steel-600">
          <Clock className="h-2.5 w-2.5" />
          {timeLeft(listing.expires_at)}
        </span>
      </div>
    </li>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────

type Filter = 'All' | 'WTS' | 'WTB';

export default function Auctions() {
  const [listings, setListings]   = useState<AuctionListing[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [filter, setFilter]       = useState<Filter>('All');
  const [search, setSearch]       = useState('');
  const [posting, setPosting]     = useState(false);
  const refreshRef                = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchListings = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from('auction_listings')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(100);
      if (err) throw err;
      setListings(data ?? []);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load auctions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
    refreshRef.current = setInterval(fetchListings, 60_000);
    return () => { if (refreshRef.current) clearInterval(refreshRef.current); };
  }, [fetchListings]);

  const visible = listings.filter((l) => {
    if (filter !== 'All' && l.type !== filter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        l.item_name.toLowerCase().includes(q) ||
        l.seller_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const wtsCount = listings.filter((l) => l.type === 'WTS').length;
  const wtbCount = listings.filter((l) => l.type === 'WTB').length;

  return (
    <section id="auctions" className="relative py-24">
      {/* Background texture */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-frost-ember-600/5 blur-3xl" />
        <div className="absolute right-1/3 bottom-20 h-96 w-96 rounded-full bg-frost-rime-600/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
              East Commonlands
            </p>
            <h2 className="mt-1 font-serif text-3xl text-frost-steel-50">
              Commonlands Auctions
            </h2>
            <p className="mt-2 font-sans text-sm text-frost-steel-300">
              Live community trading board. Listings expire automatically.
            </p>
          </div>
          <button
            onClick={() => setPosting(true)}
            className="btn-ice shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Post Listing
          </button>
        </div>

        {/* Filters + search */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Type toggle */}
          <div className="flex rounded border border-frost-ice-600/50 overflow-hidden shrink-0">
            {(['All', 'WTS', 'WTB'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 font-serif text-xs uppercase tracking-widest transition-colors border-r border-frost-ice-600/50 last:border-r-0 ${
                  filter === f
                    ? f === 'WTS'
                      ? 'bg-frost-ember-500/20 text-frost-ember-200'
                      : f === 'WTB'
                      ? 'bg-frost-rime-500/20 text-frost-rime-200'
                      : 'bg-frost-ice-700/60 text-frost-steel-100'
                    : 'bg-transparent text-frost-steel-400 hover:text-frost-steel-200'
                }`}
              >
                {f}
                {f === 'WTS' && wtsCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-frost-ember-500/20 px-1.5 py-0.5 text-[9px] text-frost-ember-300">
                    {wtsCount}
                  </span>
                )}
                {f === 'WTB' && wtbCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-frost-rime-500/20 px-1.5 py-0.5 text-[9px] text-frost-rime-300">
                    {wtbCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-frost-steel-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items or character names…"
              className="w-full rounded border border-frost-ice-600/50 bg-frost-ice-900/60 py-2 pl-9 pr-4 font-sans text-sm text-frost-steel-100 placeholder-frost-steel-500 outline-none transition-colors focus:border-frost-rime-400/70 focus:ring-1 focus:ring-frost-rime-400/30"
            />
          </div>

          <button
            onClick={fetchListings}
            title="Refresh listings"
            className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded border border-frost-ice-600/50 text-frost-steel-400 transition-colors hover:border-frost-ice-500/70 hover:text-frost-steel-200"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Listing feed */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-frost-rime-400/50" />
          </div>
        ) : error ? (
          <div className="flex h-32 items-center justify-center gap-2 text-frost-ember-400">
            <AlertCircle className="h-5 w-5" />
            <span className="font-sans text-sm">{error}</span>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 rounded border border-frost-ice-700/30 bg-frost-ice-800/20">
            <ShoppingBag className="h-8 w-8 text-frost-steel-600" />
            <p className="font-serif text-xs uppercase tracking-widest text-frost-steel-500">
              {search || filter !== 'All'
                ? 'No listings match your filter'
                : 'No active listings — be the first to post'}
            </p>
            {!search && filter === 'All' && (
              <button onClick={() => setPosting(true)} className="btn-ghost text-xs">
                <Plus className="h-3.5 w-3.5" />
                Post a listing
              </button>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {visible.map((l) => (
              <ListingRow key={l.id} listing={l} />
            ))}
          </ul>
        )}

        {/* Footer note */}
        {!loading && visible.length > 0 && (
          <p className="mt-5 flex items-center gap-2 font-sans text-[11px] text-frost-steel-600">
            <MessageSquare className="h-3.5 w-3.5" />
            {visible.length} active listing{visible.length !== 1 ? 's' : ''} ·
            refreshes every minute
          </p>
        )}
      </div>

      {posting && (
        <PostForm onPosted={fetchListings} onClose={() => setPosting(false)} />
      )}
    </section>
  );
}
