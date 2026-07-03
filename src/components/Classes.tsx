import { useState } from 'react';
import { Shield, Heart, Sword, Sparkles, Music, Users, type LucideIcon } from 'lucide-react';
import { classGuides, type ClassGuide } from '../data';

const archetypeIcon: Record<ClassGuide['archetype'], LucideIcon> = {
  Tank: Shield,
  Healer: Heart,
  'Melee DPS': Sword,
  'Caster DPS': Sparkles,
  Support: Music,
  Hybrid: Users,
};

const archetypeColor: Record<ClassGuide['archetype'], string> = {
  Tank: 'text-frost-ember-400 border-frost-ember-400/50 bg-frost-ember-500/10',
  Healer: 'text-frost-rime-300 border-frost-rime-400/50 bg-frost-rime-500/10',
  'Melee DPS': 'text-frost-gold-300 border-frost-gold-400/50 bg-frost-gold-500/10',
  'Caster DPS': 'text-frost-ice-300 border-frost-ice-400/50 bg-frost-ice-500/10',
  Support: 'text-frost-rime-400 border-frost-rime-400/50 bg-frost-rime-500/10',
  Hybrid: 'text-frost-steel-300 border-frost-steel-400/50 bg-frost-steel-500/10',
};

const difficultyStyles: Record<ClassGuide['difficulty'], string> = {
  Beginner: 'text-frost-ice-300',
  Intermediate: 'text-frost-rime-300',
  Advanced: 'text-frost-ember-400',
};

const filters = ['All', 'Tank', 'Healer', 'Melee DPS', 'Caster DPS', 'Support', 'Hybrid'] as const;

export default function Classes() {
  const [active, setActive] = useState<(typeof filters)[number]>('All');

  const visible =
    active === 'All' ? classGuides : classGuides.filter((c) => c.archetype === active);

  return (
    <section id="classes" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-serif text-sm font-medium uppercase tracking-[0.3em] text-frost-rime-400">
            Player Guides
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-frost-rime-100 text-glow-ice sm:text-5xl">
            Class Guides
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-frost-steel-200/80">
            Community-written primers for every archetype. Stat priorities, role notes, and
            practical tips for playing each class on Frostreaver.
          </p>
        </div>

        {/* Filter pills */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`chip transition-all duration-300 ${
                active === f
                  ? 'border-frost-rime-400 bg-frost-rime-400/20 text-frost-rime-100 shadow-[0_0_16px_-4px_rgba(111,196,232,0.5)]'
                  : 'border-frost-ice-600/40 text-frost-steel-300 hover:border-frost-rime-400/50 hover:text-frost-rime-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c, i) => {
            const Icon = archetypeIcon[c.archetype];
            return (
              <article
                key={c.name}
                className="group panel panel-hover flex flex-col p-6"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className={`grid h-12 w-12 place-items-center rounded-full border ${archetypeColor[c.archetype]}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className={`font-serif text-xs uppercase tracking-widest ${difficultyStyles[c.difficulty]}`}>
                    {c.difficulty}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-xl font-bold text-frost-rime-100">
                  {c.name}
                </h3>
                <p className="mt-1 font-serif text-xs uppercase tracking-widest text-frost-steel-400">
                  {c.role}
                </p>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-frost-steel-200/75">
                  {c.summary}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-frost-ice-700/40 pt-4">
                  <div>
                    <div className="font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">Primary</div>
                    <div className="font-serif text-sm font-semibold text-frost-rime-200">{c.stats.primary}</div>
                  </div>
                  <div>
                    <div className="font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">Secondary</div>
                    <div className="font-serif text-sm font-semibold text-frost-rime-200">{c.stats.secondary}</div>
                  </div>
                </div>

                <ul className="mt-4 space-y-2">
                  {c.tips.map((tip, idx) => (
                    <li key={idx} className="flex gap-2 text-xs leading-relaxed text-frost-steel-200/70">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-frost-rime-400" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
