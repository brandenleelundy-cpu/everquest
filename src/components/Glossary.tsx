import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  BookOpen,
  SendHorizontal,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Tag,
  Plus,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────────

type GlossaryTerm = {
  id: string;
  term: string;
  abbreviation: string | null;
  definition: string;
  category: Category;
  is_seed: boolean;
  created_at: string;
};

type Category =
  | 'Combat'
  | 'Navigation'
  | 'Economy'
  | 'Social'
  | 'Mechanics'
  | 'Raids'
  | 'Classes'
  | 'General';

const CATEGORIES: Category[] = [
  'Combat',
  'Navigation',
  'Economy',
  'Social',
  'Mechanics',
  'Raids',
  'Classes',
  'General',
];

const categoryStyles: Record<Category, string> = {
  Combat:     'border-frost-ember-400/50 text-frost-ember-400 bg-frost-ember-400/8',
  Navigation: 'border-frost-rime-400/50 text-frost-rime-300 bg-frost-rime-400/8',
  Economy:    'border-frost-gold-400/50 text-frost-gold-300 bg-frost-gold-400/8',
  Social:     'border-frost-ice-400/50 text-frost-ice-300 bg-frost-ice-400/8',
  Mechanics:  'border-frost-steel-300/50 text-frost-steel-200 bg-frost-steel-300/8',
  Raids:      'border-red-500/50 text-red-300 bg-red-500/8',
  Classes:    'border-frost-rime-400/50 text-frost-rime-200 bg-frost-rime-400/8',
  General:    'border-frost-steel-500/50 text-frost-steel-300 bg-frost-steel-500/8',
};

// ── Glossary Component ────────────────────────────────────────────────────────

export default function Glossary() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<Category | 'All'>('All');
  const [selected, setSelected] = useState<GlossaryTerm | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchTerms = useCallback(async () => {
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('glossary_terms')
        .select('id, term, abbreviation, definition, category, is_seed, created_at')
        .order('term', { ascending: true });
      if (err) throw err;
      setTerms((data ?? []) as GlossaryTerm[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load glossary.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTerms(); }, [fetchTerms]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return terms.filter((t) => {
      if (activeCat !== 'All' && t.category !== activeCat) return false;
      if (q) {
        return (
          t.term.toLowerCase().includes(q) ||
          (t.abbreviation?.toLowerCase().includes(q) ?? false) ||
          t.definition.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [terms, query, activeCat]);

  // Group by first letter
  const grouped = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>();
    for (const t of filtered) {
      const letter = t.term[0].toUpperCase();
      const bucket = map.get(letter) ?? [];
      bucket.push(t);
      map.set(letter, bucket);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const letters = grouped.map(([l]) => l);

  function scrollToLetter(letter: string) {
    document.getElementById(`glossary-letter-${letter}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  return (
    <section id="glossary" className="relative py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-frost-ice-900/40 to-transparent" />

      <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-serif text-sm font-medium uppercase tracking-[0.3em] text-frost-rime-400">
            Community Resource
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-frost-rime-100 text-glow-ice sm:text-5xl">
            Game Terminology
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-frost-steel-200/80">
            Every acronym, mechanic, and piece of Norrath jargon — explained. Search by name,
            filter by category, or submit a term we're missing.
          </p>
        </div>

        {/* Search + filters */}
        <div className="mt-12 flex flex-col gap-4">
          <div className="relative mx-auto w-full max-w-lg">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-frost-steel-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search terms, abbreviations, or definitions…"
              className="w-full rounded-full border border-frost-ice-600/50 bg-frost-ice-900/80 py-2.5 pl-11 pr-11 text-sm text-frost-rime-100 placeholder-frost-steel-400 outline-none transition-all duration-300 focus:border-frost-rime-400/70 focus:shadow-[0_0_20px_-4px_rgba(111,196,232,0.4)]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-frost-steel-400 hover:text-frost-rime-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {(['All', ...CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`chip transition-all duration-300 ${
                  activeCat === cat
                    ? cat === 'All'
                      ? 'border-frost-rime-400 bg-frost-rime-400/20 text-frost-rime-100 shadow-[0_0_16px_-4px_rgba(111,196,232,0.5)]'
                      : `${categoryStyles[cat as Category]} opacity-100 shadow-[0_0_12px_-4px_rgba(111,196,232,0.3)]`
                    : 'border-frost-ice-600/40 text-frost-steel-300 hover:border-frost-rime-400/50 hover:text-frost-rime-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="font-serif text-xs text-frost-steel-400">
            {loading ? 'Loading…' : `${filtered.length} term${filtered.length !== 1 ? 's' : ''} found`}
          </p>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 rounded border border-frost-rime-400/40 px-3 py-1.5 font-serif text-[10px] uppercase tracking-widest text-frost-rime-300 transition-colors hover:border-frost-rime-400/70 hover:bg-frost-rime-400/10"
          >
            {showForm ? <ChevronUp className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showForm ? 'Close' : 'Submit a Term'}
          </button>
        </div>

        {/* Submit form */}
        {showForm && (
          <div className="mt-4 animate-fade-up">
            <SubmitForm
              onSuccess={() => {
                setShowForm(false);
                fetchTerms();
              }}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-8 flex items-center gap-2 rounded border border-frost-ember-500/40 bg-frost-ember-600/10 px-4 py-3 text-frost-ember-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-sans text-sm">{error}</span>
          </div>
        )}

        {/* A-Z jump nav */}
        {!loading && filtered.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-1.5">
            {letters.map((l) => (
              <button
                key={l}
                onClick={() => scrollToLetter(l)}
                className="grid h-8 w-8 place-items-center rounded border border-frost-ice-600/40 font-serif text-xs font-semibold uppercase text-frost-steel-300 transition-colors hover:border-frost-rime-400/60 hover:text-frost-rime-200"
              >
                {l}
              </button>
            ))}
          </div>
        )}

        {/* Terms list */}
        {loading ? (
          <div className="mt-16 flex justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-frost-rime-400/50" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-3 text-frost-steel-400">
            <BookOpen className="h-10 w-10 opacity-25" />
            <p className="font-serif text-sm uppercase tracking-widest">No terms match your search</p>
          </div>
        ) : (
          <div className="mt-6 space-y-10">
            {grouped.map(([letter, group]) => (
              <div key={letter} id={`glossary-letter-${letter}`} className="scroll-mt-24">
                <div className="divider-ornate mb-6">
                  <span className="font-display text-2xl font-bold text-frost-rime-300 text-glow-ice">
                    {letter}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.map((t) => (
                    <TermCard key={t.id} term={t} onClick={() => setSelected(t)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <TermDrawer term={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

// ── Term Card ─────────────────────────────────────────────────────────────────

function TermCard({ term, onClick }: { term: GlossaryTerm; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group panel panel-hover flex flex-col gap-2 p-5 text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-display text-base font-bold text-frost-rime-100 group-hover:text-frost-rime-50">
              {term.term}
            </span>
            {term.abbreviation && (
              <span className="font-serif text-[11px] uppercase tracking-widest text-frost-steel-400">
                ({term.abbreviation})
              </span>
            )}
          </div>
        </div>
        <span className={`chip shrink-0 ${categoryStyles[term.category]}`}>
          {term.category}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-frost-steel-200/80 line-clamp-2">
        {term.definition}
      </p>
    </button>
  );
}

// ── Term Drawer ───────────────────────────────────────────────────────────────

function TermDrawer({ term, onClose }: { term: GlossaryTerm; onClose: () => void }) {
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
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-frost-rime-400" />
          <span className={`chip ${categoryStyles[term.category]}`}>{term.category}</span>
        </div>

        <h3 className="mt-4 font-display text-3xl font-bold text-frost-rime-50 text-glow-ice">
          {term.term}
        </h3>

        {term.abbreviation && (
          <p className="mt-1 font-serif text-sm uppercase tracking-widest text-frost-steel-400">
            Abbr: <span className="text-frost-rime-300">{term.abbreviation}</span>
          </p>
        )}

        <div className="mt-6 rounded border border-frost-ice-700/40 bg-frost-ice-800/30 p-5">
          <h4 className="mb-2 font-serif text-[10px] uppercase tracking-widest text-frost-rime-400">
            Definition
          </h4>
          <p className="text-sm leading-relaxed text-frost-steel-100">
            {term.definition}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between text-xs text-frost-steel-500">
          <span className="font-serif uppercase tracking-widest">
            {term.is_seed ? 'Wiki Staff Entry' : 'Community Submission'}
          </span>
          <time dateTime={term.created_at}>
            {new Date(term.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
        </div>
      </div>
    </div>
  );
}

// ── Submit Form ───────────────────────────────────────────────────────────────

function SubmitForm({ onSuccess }: { onSuccess: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const termRef = useRef<HTMLInputElement>(null);
  const abbrRef = useRef<HTMLInputElement>(null);
  const defRef = useRef<HTMLTextAreaElement>(null);
  const [cat, setCat] = useState<Category>('General');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const term = termRef.current?.value.trim() ?? '';
    const abbr = abbrRef.current?.value.trim() || null;
    const def = defRef.current?.value.trim() ?? '';

    if (!term) { setError('Term name is required.'); return; }
    if (term.length > 80) { setError('Term must be 80 characters or fewer.'); return; }
    if (!def || def.length < 5) { setError('Definition must be at least 5 characters.'); return; }
    if (def.length > 1000) { setError('Definition must be 1000 characters or fewer.'); return; }
    if (abbr && abbr.length > 20) { setError('Abbreviation must be 20 characters or fewer.'); return; }

    setSubmitting(true);
    try {
      const { error: err } = await supabase
        .from('glossary_terms')
        .insert({ term, abbreviation: abbr, definition: def, category: cat });
      if (err) {
        if (err.code === '23505') throw new Error(`"${term}" is already in the glossary.`);
        throw err;
      }
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="panel p-6">
      <h3 className="mb-5 flex items-center gap-2 font-serif text-sm font-medium uppercase tracking-widest text-frost-rime-200">
        <BookOpen className="h-4 w-4" />
        Submit a New Term
      </h3>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        {/* Term */}
        <div>
          <label className="mb-1.5 block font-serif text-[10px] uppercase tracking-widest text-frost-steel-300">
            Term <span className="text-frost-ember-400">*</span>
          </label>
          <input
            ref={termRef}
            type="text"
            maxLength={80}
            placeholder="e.g. Complete Heal"
            required
            className="w-full rounded border border-frost-ice-600/50 bg-frost-ice-900/60 px-4 py-2.5 font-sans text-sm text-frost-steel-100 placeholder-frost-steel-500 outline-none transition-colors focus:border-frost-rime-400/70 focus:ring-1 focus:ring-frost-rime-400/30"
          />
        </div>

        {/* Abbreviation */}
        <div>
          <label className="mb-1.5 block font-serif text-[10px] uppercase tracking-widest text-frost-steel-300">
            Abbreviation <span className="text-frost-steel-500 normal-case">(optional)</span>
          </label>
          <input
            ref={abbrRef}
            type="text"
            maxLength={20}
            placeholder="e.g. CH"
            className="w-full rounded border border-frost-ice-600/50 bg-frost-ice-900/60 px-4 py-2.5 font-sans text-sm text-frost-steel-100 placeholder-frost-steel-500 outline-none transition-colors focus:border-frost-rime-400/70 focus:ring-1 focus:ring-frost-rime-400/30"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-1.5 block font-serif text-[10px] uppercase tracking-widest text-frost-steel-300">
            Category <span className="text-frost-ember-400">*</span>
          </label>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value as Category)}
            className="w-full rounded border border-frost-ice-600/50 bg-frost-ice-900/80 px-4 py-2.5 font-sans text-sm text-frost-steel-100 outline-none transition-colors focus:border-frost-rime-400/70 focus:ring-1 focus:ring-frost-rime-400/30"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Spacer so definition spans full width on desktop */}
        <div className="hidden sm:block" />

        {/* Definition */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 flex items-center justify-between font-serif text-[10px] uppercase tracking-widest text-frost-steel-300">
            <span>Definition <span className="text-frost-ember-400">*</span></span>
            <span className="normal-case text-frost-steel-500">max 1000 chars</span>
          </label>
          <textarea
            ref={defRef}
            rows={3}
            maxLength={1000}
            placeholder="Plain-English explanation of the term…"
            required
            className="w-full resize-none rounded border border-frost-ice-600/50 bg-frost-ice-900/60 px-4 py-2.5 font-sans text-sm text-frost-steel-100 placeholder-frost-steel-500 outline-none transition-colors focus:border-frost-rime-400/70 focus:ring-1 focus:ring-frost-rime-400/30"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="sm:col-span-2 flex items-start gap-2 rounded border border-frost-ember-500/40 bg-frost-ember-600/10 px-3 py-2 text-frost-ember-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="font-sans text-xs">{error}</span>
          </div>
        )}

        {/* Submit */}
        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="btn-ice disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
            {submitting ? 'Submitting…' : 'Add to Glossary'}
          </button>
        </div>
      </form>
    </div>
  );
}
