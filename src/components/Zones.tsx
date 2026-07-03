import { useMemo, useState } from 'react';
import { MapPin, X, Search, Mountain, Skull, Shield, Castle, Snowflake } from 'lucide-react';
import { zones, expansions, type Zone } from '../data';

const dangerStyles: Record<Zone['danger'], string> = {
  Safe: 'border-frost-ice-400/50 text-frost-ice-300 bg-frost-ice-500/10',
  Low: 'border-frost-rime-400/50 text-frost-rime-300 bg-frost-rime-500/10',
  Moderate: 'border-frost-gold-400/50 text-frost-gold-300 bg-frost-gold-500/10',
  High: 'border-frost-ember-400/50 text-frost-ember-400 bg-frost-ember-500/10',
  Deadly: 'border-red-500/60 text-red-300 bg-red-500/10',
};

const typeIcon: Record<Zone['type'], typeof Mountain> = {
  Outdoor: Mountain,
  Dungeon: Skull,
  City: Castle,
  Raid: Shield,
};

const expFilters = ['All', ...expansions.map((e) => e.id)];
const typeFilters = ['All', 'Outdoor', 'Dungeon', 'City', 'Raid'] as const;

export default function Zones() {
  const [exp, setExp] = useState('All');
  const [type, setType] = useState<(typeof typeFilters)[number]>('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Zone | null>(null);

  const filtered = useMemo(() => {
    return zones.filter((z) => {
      if (exp !== 'All' && z.expansion !== exp) return false;
      if (type !== 'All' && z.type !== type) return false;
      if (query && !z.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [exp, type, query]);

  return (
    <section id="zones" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-serif text-sm font-medium uppercase tracking-[0.3em] text-frost-rime-400">
            Zone Compendium
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-frost-rime-100 text-glow-ice sm:text-5xl">
            Zones of Norrath
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-frost-steel-200/80">
            Every documented zone on Frostreaver, filterable by expansion and type. Click any
            card for notable mobs, connections, and danger assessment.
          </p>
        </div>

        {/* Search + filters */}
        <div className="mt-12 flex flex-col gap-4">
          <div className="relative mx-auto w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-frost-steel-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search zones..."
              className="w-full rounded-full border border-frost-ice-600/50 bg-frost-ice-900/80 py-2.5 pl-11 pr-4 text-sm text-frost-rime-100 placeholder-frost-steel-400 outline-none transition-all duration-300 focus:border-frost-rime-400/70 focus:shadow-[0_0_20px_-4px_rgba(111,196,232,0.4)]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {expFilters.map((f) => {
              const expObj = expansions.find((e) => e.id === f);
              return (
                <button
                  key={f}
                  onClick={() => setExp(f)}
                  className={`chip transition-all duration-300 ${
                    exp === f
                      ? 'border-frost-rime-400 bg-frost-rime-400/20 text-frost-rime-100 shadow-[0_0_16px_-4px_rgba(111,196,232,0.5)]'
                      : 'border-frost-ice-600/40 text-frost-steel-300 hover:border-frost-rime-400/50 hover:text-frost-rime-200'
                  }`}
                >
                  {f === 'All' ? 'All Expansions' : expObj?.abbr ?? f}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {typeFilters.map((f) => (
              <button
                key={f}
                onClick={() => setType(f)}
                className={`chip transition-all duration-300 ${
                  type === f
                    ? 'border-frost-ice-400 bg-frost-ice-400/20 text-frost-ice-100'
                    : 'border-frost-steel-600/40 text-frost-steel-400 hover:border-frost-ice-400/50 hover:text-frost-ice-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((z, i) => {
            const Icon = typeIcon[z.type] ?? Mountain;
            const expObj = expansions.find((e) => e.id === z.expansion);
            return (
              <button
                key={z.id}
                onClick={() => setSelected(z)}
                className="group panel panel-hover flex flex-col p-5 text-left"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-frost-ice-600/50 bg-frost-ice-800/60 text-frost-rime-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-frost-rime-100 group-hover:text-frost-rime-50">
                        {z.name}
                      </h3>
                      <div className="flex items-center gap-1.5 font-serif text-[11px] uppercase tracking-widest text-frost-steel-400">
                        <MapPin className="h-3 w-3" />
                        {z.region}
                      </div>
                    </div>
                  </div>
                  <span className={`chip ${dangerStyles[z.danger]}`}>{z.danger}</span>
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-frost-steel-200/75 line-clamp-3">
                  {z.description}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-frost-ice-700/40 pt-3">
                  <span className="font-serif text-xs uppercase tracking-widest text-frost-steel-400">
                    Lv {z.levelRange}
                  </span>
                  <span className="font-serif text-xs uppercase tracking-widest text-frost-rime-300">
                    {expObj?.abbr}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="mt-12 text-center font-serif text-frost-steel-400">
            No zones match your filters.
          </p>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <ZoneModal zone={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}

function ZoneModal({ zone, onClose }: { zone: Zone; onClose: () => void }) {
  const expObj = expansions.find((e) => e.id === zone.expansion);
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-frost-ice-900/80 backdrop-blur-sm" />
      <div
        className="panel relative z-10 w-full max-w-lg p-7 animate-fade-up"
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
          <Snowflake className="h-4 w-4 text-frost-rime-400" />
          <span className="font-serif text-xs uppercase tracking-[0.3em] text-frost-rime-400">
            {expObj?.name}
          </span>
        </div>
        <h3 className="mt-2 font-display text-3xl font-bold text-frost-rime-50 text-glow-ice">
          {zone.name}
        </h3>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`chip ${dangerStyles[zone.danger]}`}>{zone.danger}</span>
          <span className="chip border-frost-ice-500/50 text-frost-ice-300 bg-frost-ice-500/10">
            {zone.type}
          </span>
          <span className="chip border-frost-steel-500/50 text-frost-steel-300 bg-frost-steel-500/10">
            Lv {zone.levelRange}
          </span>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-frost-steel-100/85">
          {zone.description}
        </p>

        <div className="mt-6">
          <h4 className="font-serif text-xs font-semibold uppercase tracking-widest text-frost-rime-400">
            Notable Mobs
          </h4>
          <ul className="mt-2 flex flex-wrap gap-2">
            {zone.notableMobs.map((m) => (
              <li
                key={m}
                className="rounded border border-frost-ice-700/50 bg-frost-ice-800/50 px-3 py-1.5 text-xs text-frost-steel-100"
              >
                {m}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <h4 className="font-serif text-xs font-semibold uppercase tracking-widest text-frost-rime-400">
            Connects To
          </h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {zone.connections.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 rounded border border-frost-ice-700/50 bg-frost-ice-800/50 px-3 py-1.5 text-xs text-frost-steel-100"
              >
                <MapPin className="h-3 w-3 text-frost-rime-400" />
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
