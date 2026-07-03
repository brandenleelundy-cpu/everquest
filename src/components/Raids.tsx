import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Swords,
  Clock,
  Heart,
  MapPin,
  X,
  Skull,
  Package,
  Filter,
  RefreshCw,
  AlertCircle,
  Plus,
  Sparkles,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';
import { raidTargets, expansions, type RaidTarget } from '../data';
import { supabase, type RaidLoot } from '../lib/supabase';
import CommentsPanel from './CommentsPanel';
import StrategyPanel from './StrategyPanel';
import VideosPanel from './VideosPanel';

// ── style maps ────────────────────────────────────────────────────────────────

const difficultyStyles: Record<RaidTarget['difficulty'], string> = {
  Dungeon: 'border-frost-ice-400/50 text-frost-ice-300 bg-frost-ice-500/10',
  World: 'border-frost-rime-400/50 text-frost-rime-300 bg-frost-rime-500/10',
  Plane: 'border-frost-gold-400/50 text-frost-gold-300 bg-frost-gold-500/10',
  God: 'border-frost-ember-400/60 text-frost-ember-400 bg-frost-ember-500/10',
};

const rarityStyles: Record<RaidLoot['rarity'], string> = {
  Common:    'border-frost-steel-600/40 text-frost-steel-300 bg-frost-steel-700/10',
  Uncommon:  'border-frost-ice-500/50 text-frost-ice-300 bg-frost-ice-600/10',
  Rare:      'border-frost-rime-400/50 text-frost-rime-300 bg-frost-rime-500/10',
  Epic:      'border-frost-gold-400/60 text-frost-gold-300 bg-frost-gold-500/10',
  Legendary: 'border-frost-ember-400/60 text-frost-ember-300 bg-frost-ember-500/10',
};

const rarityGlow: Record<RaidLoot['rarity'], string> = {
  Common:    '',
  Uncommon:  '',
  Rare:      '',
  Epic:      'shadow-[0_0_12px_-2px_rgba(212,175,55,0.35)]',
  Legendary: 'shadow-[0_0_18px_-2px_rgba(224,122,76,0.4)]',
};

const ALL_SLOTS = [
  'Primary','Secondary','Chest','Head','Legs','Arms','Feet',
  'Back','Neck','Wrist','Finger','Waist','Shoulders','Inventory',
];

// ── Loot Panel (inside modal) ─────────────────────────────────────────────────

function LootPanel({ bossName }: { bossName: string }) {
  const [loot, setLoot] = useState<RaidLoot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slotFilter, setSlotFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchLoot = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('raid_loot')
        .select('*')
        .eq('boss_name', bossName)
        .order('rarity', { ascending: false })
        .order('item_name');
      if (err) throw err;
      setLoot(data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load loot.');
    } finally {
      setLoading(false);
    }
  }, [bossName]);

  useEffect(() => { fetchLoot(); }, [fetchLoot]);

  const allClasses = [...new Set(loot.flatMap((l) => l.classes))].sort();
  const filtered = loot.filter((l) => {
    if (slotFilter && l.slot !== slotFilter) return false;
    if (classFilter && !l.classes.includes(classFilter) && !l.classes.includes('All')) return false;
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative">
          <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-frost-steel-400" />
          <select
            value={slotFilter}
            onChange={(e) => setSlotFilter(e.target.value)}
            className="appearance-none rounded border border-frost-ice-600/50 bg-frost-ice-900/60 pl-8 pr-7 py-1.5 font-sans text-xs text-frost-steel-200 outline-none focus:border-frost-rime-400/60"
          >
            <option value="">All Slots</option>
            {ALL_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-frost-steel-500" />
        </div>
        <div className="relative">
          <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-frost-steel-400" />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="appearance-none rounded border border-frost-ice-600/50 bg-frost-ice-900/60 pl-8 pr-7 py-1.5 font-sans text-xs text-frost-steel-200 outline-none focus:border-frost-rime-400/60"
          >
            <option value="">All Classes</option>
            {allClasses.filter((c) => c !== 'All').map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-frost-steel-500" />
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="ml-auto flex items-center gap-1.5 rounded border border-frost-ice-600/40 px-3 py-1.5 font-serif text-[10px] uppercase tracking-widest text-frost-steel-300 transition-colors hover:border-frost-rime-400/50 hover:text-frost-rime-200"
        >
          <Plus className="h-3.5 w-3.5" />
          Submit Drop
        </button>
      </div>

      {showForm && (
        <SubmitLootForm
          bossName={bossName}
          onSuccess={() => { setShowForm(false); fetchLoot(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <RefreshCw className="h-5 w-5 animate-spin text-frost-rime-400/50" />
        </div>
      ) : error ? (
        <div className="flex h-24 items-center justify-center gap-2 text-frost-ember-400">
          <AlertCircle className="h-4 w-4" />
          <span className="font-sans text-xs">{error}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-24 items-center justify-center">
          <p className="font-serif text-xs uppercase tracking-widest text-frost-steel-500">
            No items match the current filter
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((item) => <LootRow key={item.id} item={item} />)}
        </ul>
      )}

      {!loading && !error && (
        <p className="mt-3 text-right font-serif text-[10px] uppercase tracking-widest text-frost-steel-500">
          {filtered.length} of {loot.length} item{loot.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

function LootRow({ item }: { item: RaidLoot }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <li className={`rounded border bg-frost-ice-900/40 transition-all duration-200 ${rarityStyles[item.rarity]} ${rarityGlow[item.rarity]}`}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <Package className="h-4 w-4 shrink-0 text-frost-steel-400" />
        <div className="min-w-0 flex-1">
          <span className="block truncate font-sans text-sm font-semibold text-frost-steel-100">
            {item.item_name}
          </span>
          <span className="font-sans text-xs text-frost-steel-400">
            {item.slot} · {item.classes.join(', ')}
          </span>
        </div>
        <span className={`chip shrink-0 ${rarityStyles[item.rarity]}`}>{item.rarity}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-frost-steel-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-frost-ice-700/30 px-4 pb-4 pt-3">
          {item.stats.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {item.stats.map((s, i) => (
                <span
                  key={i}
                  className="rounded border border-frost-ice-600/40 bg-frost-ice-800/60 px-2.5 py-1 font-sans text-xs text-frost-steel-200"
                >
                  <span className="text-frost-steel-400">{s.label}:</span>{' '}
                  <span className="font-medium text-frost-rime-200">{s.value}</span>
                </span>
              ))}
            </div>
          )}
          {item.drop_notes && (
            <p className="font-sans text-xs italic text-frost-steel-400">{item.drop_notes}</p>
          )}
        </div>
      )}
    </li>
  );
}

// ── Submit Loot Form ──────────────────────────────────────────────────────────

const RARITIES: RaidLoot['rarity'][] = ['Common','Uncommon','Rare','Epic','Legendary'];
const CLASS_LIST = ['All','WAR','PAL','RNG','SHD','MNK','BRD','ROG','SHM','DRU','CLR','ENC','MAG','WIZ','NEC','BST'];

function SubmitLootForm({
  bossName,
  onSuccess,
  onCancel,
}: {
  bossName: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [itemName, setItemName] = useState('');
  const [slot, setSlot] = useState('');
  const [rarity, setRarity] = useState<RaidLoot['rarity']>('Rare');
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['All']);
  const [statRows, setStatRows] = useState([{ label: '', value: '' }]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function toggleClass(cls: string) {
    if (cls === 'All') { setSelectedClasses(['All']); return; }
    setSelectedClasses((prev) => {
      const without = prev.filter((c) => c !== 'All');
      return without.includes(cls) ? without.filter((c) => c !== cls) : [...without, cls];
    });
  }

  function updateStat(idx: number, field: 'label' | 'value', val: string) {
    setStatRows((rows) => rows.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!itemName.trim()) { setError('Enter an item name.'); return; }
    if (!slot) { setError('Select an equipment slot.'); return; }
    if (selectedClasses.length === 0) { setError('Select at least one class.'); return; }
    const validStats = statRows.filter((s) => s.label.trim() && s.value.trim());
    setSubmitting(true);
    try {
      const boss = raidTargets.find((r) => r.name === bossName);
      const { error: err } = await supabase.from('raid_loot').insert({
        boss_name: bossName,
        expansion: boss?.expansion ?? 'classic',
        item_name: itemName.trim(),
        slot,
        rarity,
        classes: selectedClasses.length === 0 ? ['All'] : selectedClasses,
        stats: validStats,
        drop_notes: notes.trim() || null,
      });
      if (err) throw err;
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded border border-frost-ice-600/50 bg-frost-ice-900/60 px-3 py-2 font-sans text-sm text-frost-steel-100 placeholder-frost-steel-500 outline-none transition-colors focus:border-frost-rime-400/70 focus:ring-1 focus:ring-frost-rime-400/30';
  const labelClass =
    'mb-1.5 block font-serif text-[10px] uppercase tracking-widest text-frost-steel-300';

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded border border-frost-ice-600/40 bg-frost-ice-900/50 p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-frost-gold-300">
          <Sparkles className="h-4 w-4" />
          <span className="font-serif text-xs uppercase tracking-widest">Submit Drop</span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="grid h-7 w-7 place-items-center rounded-full border border-frost-ice-600/40 text-frost-steel-400 hover:text-frost-steel-200"
          aria-label="Cancel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Item Name</label>
          <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)}
            maxLength={80} placeholder="e.g. Cloak of Flames" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Slot</label>
          <div className="relative">
            <select value={slot} onChange={(e) => setSlot(e.target.value)} required
              className={`${inputClass} appearance-none pr-8`}>
              <option value="">Select slot…</option>
              {ALL_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-frost-steel-400" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Rarity</label>
          <div className="relative">
            <select value={rarity} onChange={(e) => setRarity(e.target.value as RaidLoot['rarity'])}
              className={`${inputClass} appearance-none pr-8`}>
              {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-frost-steel-400" />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className={labelClass}>Classes</label>
        <div className="flex flex-wrap gap-1.5">
          {CLASS_LIST.map((cls) => {
            const active = selectedClasses.includes(cls);
            return (
              <button key={cls} type="button" onClick={() => toggleClass(cls)}
                className={`rounded border px-2.5 py-1 font-serif text-[10px] uppercase tracking-wider transition-colors ${
                  active
                    ? 'border-frost-rime-400/60 bg-frost-rime-400/15 text-frost-rime-200'
                    : 'border-frost-ice-600/40 text-frost-steel-400 hover:border-frost-ice-500/60 hover:text-frost-steel-200'
                }`}
              >{cls}</button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <label className={`${labelClass} mb-0`}>Stats</label>
          <button type="button" onClick={() => setStatRows((r) => [...r, { label: '', value: '' }])}
            className="flex items-center gap-1 font-serif text-[10px] uppercase tracking-widest text-frost-steel-400 hover:text-frost-rime-300">
            <Plus className="h-3 w-3" /> Add Stat
          </button>
        </div>
        <div className="space-y-2">
          {statRows.map((row, idx) => (
            <div key={idx} className="flex gap-2">
              <input type="text" value={row.label} onChange={(e) => updateStat(idx, 'label', e.target.value)}
                placeholder="Label (e.g. AC)" className={`${inputClass} flex-1`} />
              <input type="text" value={row.value} onChange={(e) => updateStat(idx, 'value', e.target.value)}
                placeholder="Value (e.g. +10)" className={`${inputClass} flex-1`} />
              {statRows.length > 1 && (
                <button type="button" onClick={() => setStatRows((r) => r.filter((_, i) => i !== idx))}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded border border-frost-ice-600/40 text-frost-steel-500 hover:text-frost-ember-400"
                  aria-label="Remove stat">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className={labelClass}>
          Notes <span className="normal-case text-frost-steel-500">(optional)</span>
        </label>
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
          maxLength={300} placeholder="e.g. Server first drop, confirmed 12% drop rate"
          className={inputClass} />
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded border border-frost-ember-500/40 bg-frost-ember-600/10 px-3 py-2 text-frost-ember-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="font-sans text-xs">{error}</span>
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <button type="submit" disabled={submitting}
          className="btn-ice flex-1 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {submitting ? 'Submitting…' : 'Submit Item'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost px-5">Cancel</button>
      </div>
    </form>
  );
}

// ── Raid Modal ────────────────────────────────────────────────────────────────

type ModalTab = 'details' | 'loot' | 'videos' | 'comments';

function RaidModal({ target, onClose }: { target: RaidTarget; onClose: () => void }) {
  const [tab, setTab] = useState<ModalTab>('details');
  const expObj = expansions.find((e) => e.id === target.expansion);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 pt-12 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-frost-ice-900/80 backdrop-blur-sm" />
      <div
        className="panel relative z-10 w-full max-w-xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-frost-ice-700/40 p-7 pb-5">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-frost-ice-600/50 text-frost-steel-300 transition-colors hover:border-frost-rime-400/60 hover:text-frost-rime-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <Swords className="h-4 w-4 text-frost-ember-400" />
            <span className="font-serif text-xs uppercase tracking-[0.3em] text-frost-ember-400">
              {expObj?.name}
            </span>
          </div>
          <h3 className="mt-2 font-display text-3xl font-bold text-frost-rime-50 text-glow-ice">
            {target.name}
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBox icon={Heart} label="HP" value={target.hp} accent="text-frost-ember-400" />
            <StatBox icon={Skull} label="Level" value={String(target.level)} accent="text-frost-rime-300" />
            <StatBox icon={Clock} label="Respawn" value={target.respawn} accent="text-frost-ice-300" />
            <StatBox icon={MapPin} label="Tier" value={target.difficulty} accent="text-frost-gold-300" />
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-frost-steel-200">
            <MapPin className="h-4 w-4 text-frost-ice-400" />
            {target.zone}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-frost-ice-700/40">
          {(['details', 'loot', 'videos', 'comments'] as ModalTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 font-serif text-[11px] uppercase tracking-widest transition-colors ${
                tab === t
                  ? 'border-b-2 border-frost-rime-400 text-frost-rime-200'
                  : 'text-frost-steel-400 hover:text-frost-steel-200'
              }`}
            >
              {t === 'details' ? 'Strategy' : t === 'loot' ? 'Loot' : t === 'videos' ? (
                <span className="flex items-center justify-center gap-1">
                  Videos
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Chat
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-7">
          {tab === 'details' ? (
            <StrategyPanel bossName={target.name} />
          ) : tab === 'loot' ? (
            <LootPanel bossName={target.name} />
          ) : tab === 'videos' ? (
            <VideosPanel bossName={target.name} />
          ) : (
            <CommentsPanel contentType="raid" contentId={target.name} />
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Heart;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded border border-frost-ice-700/40 bg-frost-ice-800/40 p-3 text-center">
      <Icon className={`mx-auto h-4 w-4 ${accent}`} />
      <div className="mt-1.5 font-serif text-sm font-semibold text-frost-rime-100">{value}</div>
      <div className="font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">{label}</div>
    </div>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────

export default function Raids() {
  const [selected, setSelected] = useState<RaidTarget | null>(null);

  return (
    <section id="raids" className="relative py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-frost-ice-900/50 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-serif text-sm font-medium uppercase tracking-[0.3em] text-frost-rime-400">
            Endgame Targets
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-frost-rime-100 text-glow-ice sm:text-5xl">
            Raid Targets
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-frost-steel-200/80">
            Bosses, respawn timers, strategy, and a live community loot database — tap any target
            to view the full loot table and submit new drops.
          </p>
        </div>

        <div className="mt-14 space-y-8">
          {expansions.map((exp) => {
            const targets = raidTargets.filter((t) => t.expansion === exp.id);
            if (targets.length === 0) return null;
            return (
              <div key={exp.id}>
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      exp.status === 'Current'
                        ? 'animate-flicker bg-frost-rime-400'
                        : 'bg-frost-ice-500'
                    }`}
                  />
                  <h3 className="font-display text-xl font-bold text-frost-rime-200">{exp.name}</h3>
                  <span className="font-serif text-xs uppercase tracking-widest text-frost-steel-400">
                    Lv Cap {exp.levelCap}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {targets.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelected(t)}
                      className="group panel panel-hover p-5 text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-full border border-frost-ember-500/40 bg-frost-ember-500/10 text-frost-ember-400">
                            <Skull className="h-5 w-5" />
                          </span>
                          <h4 className="font-display text-base font-bold text-frost-rime-100 group-hover:text-frost-rime-50">
                            {t.name}
                          </h4>
                        </div>
                        <span className={`chip ${difficultyStyles[t.difficulty]}`}>{t.difficulty}</span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-frost-steel-300">
                          <Heart className="h-3.5 w-3.5 text-frost-ember-400" /> {t.hp} HP
                        </div>
                        <div className="flex items-center gap-1.5 text-frost-steel-300">
                          <Clock className="h-3.5 w-3.5 text-frost-rime-400" /> {t.respawn}
                        </div>
                        <div className="col-span-2 flex items-center gap-1.5 text-frost-steel-300">
                          <MapPin className="h-3.5 w-3.5 text-frost-ice-400" /> {t.zone}
                        </div>
                      </div>
                      <div className="mt-4 border-t border-frost-ice-700/40 pt-3">
                        <div className="flex flex-wrap gap-1.5">
                          {t.loot.slice(0, 3).map((l) => (
                            <span
                              key={l}
                              className="rounded border border-frost-gold-600/30 bg-frost-gold-500/5 px-2 py-0.5 text-[10px] text-frost-gold-300"
                            >
                              {l}
                            </span>
                          ))}
                        </div>
                        <div className="mt-2 flex items-center gap-1 font-serif text-[9px] uppercase tracking-widest text-frost-rime-400/60 transition-colors group-hover:text-frost-rime-400/90">
                          <Package className="h-3 w-3" />
                          View full loot table
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected && <RaidModal target={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
