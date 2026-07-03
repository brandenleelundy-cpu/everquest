import { useMemo, useState } from 'react';
import { Search, X, Gem, Package } from 'lucide-react';
import { items, expansions, type Item } from '../data';
import ItemImages from './ItemImages';

const rarityStyles: Record<Item['rarity'], string> = {
  Common: 'text-frost-steel-300 border-frost-steel-500/40',
  Uncommon: 'text-frost-ice-300 border-frost-ice-400/50',
  Rare: 'text-frost-rime-300 border-frost-rime-400/60',
  Epic: 'text-frost-gold-300 border-frost-gold-400/60',
  Legendary: 'text-frost-ember-400 border-frost-ember-400/60',
};

const rarityDot: Record<Item['rarity'], string> = {
  Common: 'bg-frost-steel-400',
  Uncommon: 'bg-frost-ice-400',
  Rare: 'bg-frost-rime-400',
  Epic: 'bg-frost-gold-400',
  Legendary: 'bg-frost-ember-400',
};

const slotFilters = ['All', 'Waist', 'Feet', 'Chest', 'Finger', 'Primary', 'Inventory', 'Shoulders'] as const;

export default function Items() {
  const [query, setQuery] = useState('');
  const [slot, setSlot] = useState<(typeof slotFilters)[number]>('All');
  const [exp, setExp] = useState('All');
  const [selected, setSelected] = useState<Item | null>(null);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (slot !== 'All' && it.slot !== slot) return false;
      if (exp !== 'All' && it.expansion !== exp) return false;
      if (query && !it.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [query, slot, exp]);

  return (
    <section id="items" className="relative py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-frost-ice-900/50 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-serif text-sm font-medium uppercase tracking-[0.3em] text-frost-rime-400">
            Loot Catalogue
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-frost-rime-100 text-glow-ice sm:text-5xl">
            Item Database
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-frost-steel-200/80">
            Notable drops and quest rewards across the Frostreaver progression. Filter by slot or
            expansion, or search by name.
          </p>
        </div>

        {/* Search */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-frost-steel-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full rounded-full border border-frost-ice-600/50 bg-frost-ice-900/80 py-2.5 pl-11 pr-4 text-sm text-frost-rime-100 placeholder-frost-steel-400 outline-none transition-all duration-300 focus:border-frost-rime-400/70 focus:shadow-[0_0_20px_-4px_rgba(111,196,232,0.4)]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {slotFilters.map((f) => (
              <button
                key={f}
                onClick={() => setSlot(f)}
                className={`chip transition-all duration-300 ${
                  slot === f
                    ? 'border-frost-rime-400 bg-frost-rime-400/20 text-frost-rime-100'
                    : 'border-frost-ice-600/40 text-frost-steel-300 hover:border-frost-rime-400/50 hover:text-frost-rime-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {['All', ...expansions.map((e) => e.id)].map((f) => {
              const expObj = expansions.find((e) => e.id === f);
              return (
                <button
                  key={f}
                  onClick={() => setExp(f)}
                  className={`chip transition-all duration-300 ${
                    exp === f
                      ? 'border-frost-ice-400 bg-frost-ice-400/20 text-frost-ice-100'
                      : 'border-frost-steel-600/40 text-frost-steel-400 hover:border-frost-ice-400/50 hover:text-frost-ice-200'
                  }`}
                >
                  {f === 'All' ? 'All Expansions' : expObj?.abbr ?? f}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="mt-10 overflow-hidden rounded-lg border border-frost-ice-700/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-frost-ice-700/50 bg-frost-ice-800/60">
                  <th className="px-5 py-3 font-serif text-xs font-semibold uppercase tracking-widest text-frost-rime-300">Item</th>
                  <th className="hidden px-5 py-3 font-serif text-xs font-semibold uppercase tracking-widest text-frost-rime-300 sm:table-cell">Slot</th>
                  <th className="hidden px-5 py-3 font-serif text-xs font-semibold uppercase tracking-widest text-frost-rime-300 md:table-cell">Rarity</th>
                  <th className="hidden px-5 py-3 font-serif text-xs font-semibold uppercase tracking-widest text-frost-rime-300 lg:table-cell">Source</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => {
                  const expObj = expansions.find((e) => e.id === it.expansion);
                  return (
                    <tr
                      key={it.id}
                      onClick={() => setSelected(it)}
                      className="cursor-pointer border-b border-frost-ice-800/50 transition-colors duration-200 last:border-0 hover:bg-frost-ice-800/40"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${rarityDot[it.rarity]}`} />
                          <span className="font-serif text-sm font-medium text-frost-rime-100">
                            {it.name}
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-5 py-3.5 text-sm text-frost-steel-200 sm:table-cell">{it.slot}</td>
                      <td className="hidden px-5 py-3.5 md:table-cell">
                        <span className={`chip ${rarityStyles[it.rarity]}`}>{it.rarity}</span>
                      </td>
                      <td className="hidden px-5 py-3.5 text-xs text-frost-steel-300 lg:table-cell">{it.source}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
                          {expObj?.abbr}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filtered.length === 0 && (
          <p className="mt-8 text-center font-serif text-frost-steel-400">
            No items match your filters.
          </p>
        )}
      </div>

      {selected && <ItemDrawer item={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

function ItemDrawer({ item, onClose }: { item: Item; onClose: () => void }) {
  const expObj = expansions.find((e) => e.id === item.expansion);
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
          <Gem className="h-4 w-4 text-frost-rime-400" />
          <span className="font-serif text-xs uppercase tracking-[0.3em] text-frost-rime-400">
            {expObj?.name}
          </span>
        </div>
        <h3 className="mt-2 font-display text-2xl font-bold text-frost-rime-50 text-glow-ice">
          {item.name}
        </h3>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`chip ${rarityStyles[item.rarity]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${rarityDot[item.rarity]}`} />
            {item.rarity}
          </span>
          <span className="chip border-frost-ice-500/50 text-frost-ice-300 bg-frost-ice-500/10">
            <Package className="h-3 w-3" />
            {item.slot}
          </span>
        </div>

        <div className="mt-6">
          <h4 className="font-serif text-xs font-semibold uppercase tracking-widest text-frost-rime-400">
            Stats
          </h4>
          <dl className="mt-3 space-y-2">
            {item.stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between rounded border border-frost-ice-700/40 bg-frost-ice-800/40 px-4 py-2.5"
              >
                <dt className="font-serif text-sm text-frost-steel-200">{s.label}</dt>
                <dd className="font-serif text-sm font-semibold text-frost-rime-200">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-6">
          <h4 className="font-serif text-xs font-semibold uppercase tracking-widest text-frost-rime-400">
            Classes
          </h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {item.classes.map((c) => (
              <span
                key={c}
                className="rounded border border-frost-ice-700/50 bg-frost-ice-800/50 px-3 py-1 text-xs text-frost-steel-100"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded border border-frost-gold-600/30 bg-frost-gold-500/5 p-4">
          <h4 className="font-serif text-xs font-semibold uppercase tracking-widest text-frost-gold-300">
            Source
          </h4>
          <p className="mt-1.5 text-sm text-frost-steel-100">{item.source}</p>
        </div>

        <ItemImages itemName={item.name} />
      </div>
    </div>
  );
}
