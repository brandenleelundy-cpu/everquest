import { ChevronDown, Snowflake, BookOpen, Swords } from 'lucide-react';
import { stats, expansions } from '../data';

export default function Hero() {
  return (
    <section id="top" className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 animate-slow-zoom bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=1920')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-frost-ice-900/80 via-frost-ice-900/60 to-frost-ice-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-frost-ice-900/80 via-transparent to-frost-ice-900/30" />
      </div>

      {/* Snowfall */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="absolute block h-1 w-1 rounded-full bg-frost-rime-200/80 animate-snow-fall"
            style={{
              left: `${(i * 41) % 100}%`,
              animationDelay: `${(i % 8) * 0.8}s`,
              animationDuration: `${8 + (i % 6)}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 pt-24 text-center">
        <p className="mb-6 animate-fade-in font-serif text-sm font-medium uppercase tracking-[0.4em] text-frost-rime-300">
          Time-Locked Progression Server
        </p>
        <h1 className="animate-fade-up font-display text-5xl font-bold leading-tight text-frost-rime-50 text-glow-ice sm:text-7xl lg:text-8xl">
          Frostreaver
        </h1>
        <div className="divider-ornate my-8 w-full max-w-md animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Snowflake className="h-4 w-4" />
          <span className="font-serif text-xs uppercase tracking-[0.3em]">Community Wiki</span>
          <Snowflake className="h-4 w-4" />
        </div>
        <p
          className="max-w-2xl animate-fade-up text-lg leading-relaxed text-frost-steel-100/90 sm:text-xl"
          style={{ animationDelay: '0.4s' }}
        >
          The community knowledge base for the Frostreaver progression server. Zones, items,
          quests, raid targets, and class guides — everything an adventurer needs to conquer
          Norrath, one expansion at a time.
        </p>

        <div
          className="mt-10 flex animate-fade-up flex-col gap-4 sm:flex-row"
          style={{ animationDelay: '0.6s' }}
        >
          <a href="#zones" className="btn-ice">
            <BookOpen className="h-4 w-4" />
            Explore the Wiki
          </a>
          <a href="#raids" className="btn-ghost">
            <Swords className="h-4 w-4" />
            Raid Targets
          </a>
        </div>

        {/* Expansion progress bar */}
        <div
          className="mt-16 w-full max-w-3xl animate-fade-in"
          style={{ animationDelay: '0.8s' }}
        >
          <div className="mb-3 flex items-center justify-between font-serif text-xs uppercase tracking-widest text-frost-steel-300">
            <span>Progression Timeline</span>
            <span className="text-frost-rime-300">{expansions.filter((e) => e.status !== 'Locked').length} / {expansions.length} unlocked</span>
          </div>
          <div className="flex gap-1.5">
            {expansions.map((e) => (
              <div
                key={e.id}
                className={`group relative h-2 flex-1 rounded-full transition-all duration-500 ${
                  e.status === 'Locked'
                    ? 'bg-frost-steel-700/60'
                    : e.status === 'Current'
                    ? 'bg-gradient-to-r from-frost-rime-400 to-frost-ice-400 shadow-[0_0_12px_-2px_rgba(111,196,232,0.6)]'
                    : 'bg-frost-ice-500'
                }`}
                title={`${e.abbr} — ${e.status}`}
              >
                <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-frost-ice-600/50 bg-frost-ice-900/95 px-2 py-1 font-serif text-[10px] uppercase tracking-wider text-frost-rime-200 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {e.abbr}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div
          className="mt-14 grid w-full max-w-3xl animate-fade-in grid-cols-2 gap-6 sm:grid-cols-4"
          style={{ animationDelay: '1s' }}
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-bold text-frost-rime-200 text-glow-ice sm:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 font-serif text-xs uppercase tracking-widest text-frost-steel-300">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <a
        href="#zones"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-frost-rime-400/70 transition-colors hover:text-frost-rime-200"
        aria-label="Scroll down"
      >
        <ChevronDown className="h-8 w-8 animate-bounce" />
      </a>
    </section>
  );
}
