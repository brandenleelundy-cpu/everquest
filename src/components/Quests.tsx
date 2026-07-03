import { useState } from 'react';
import { ChevronDown, Scroll, Award, User, ListChecks } from 'lucide-react';
import { quests, expansions, type Quest } from '../data';

const typeIcon: Record<Quest['type'], typeof Scroll> = {
  Epic: Award,
  Heritage: Scroll,
  Faction: User,
  Tradeskill: ListChecks,
  Flagging: Scroll,
};

const difficultyStyles: Record<Quest['difficulty'], string> = {
  Easy: 'border-frost-ice-400/50 text-frost-ice-300 bg-frost-ice-500/10',
  Moderate: 'border-frost-rime-400/50 text-frost-rime-300 bg-frost-rime-500/10',
  Hard: 'border-frost-gold-400/50 text-frost-gold-300 bg-frost-gold-500/10',
  Epic: 'border-frost-ember-400/50 text-frost-ember-400 bg-frost-ember-500/10',
};

export default function Quests() {
  const [openId, setOpenId] = useState<string | null>(quests[0]?.id ?? null);

  return (
    <section id="quests" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-serif text-sm font-medium uppercase tracking-[0.3em] text-frost-rime-400">
            Walkthroughs
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-frost-rime-100 text-glow-ice sm:text-5xl">
            Quest Guides
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-frost-steel-200/80">
            Step-by-step guides for the most sought-after quests on Frostreaver — from the
            iconic epics to the Coldain heritage line.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {quests.map((q) => {
            const isOpen = openId === q.id;
            const Icon = typeIcon[q.type];
            const expObj = expansions.find((e) => e.id === q.expansion);
            return (
              <div
                key={q.id}
                className={`panel transition-all duration-500 ${
                  isOpen ? 'border-frost-rime-400/50 shadow-[0_0_30px_-10px_rgba(111,196,232,0.3)]' : ''
                }`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : q.id)}
                  className="flex w-full items-center gap-4 p-5 text-left"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-frost-ice-600/50 bg-frost-ice-800/60 text-frost-rime-300">
                    <Icon className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-frost-rime-100">
                        {q.name}
                      </h3>
                      <span className={`chip ${difficultyStyles[q.difficulty]}`}>{q.difficulty}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-serif text-[11px] uppercase tracking-widest text-frost-steel-400">
                      <span>{q.type}</span>
                      <span>Lv {q.minLevel}+</span>
                      <span>{expObj?.abbr}</span>
                      <span className="text-frost-rime-300">{q.classes.join(', ')}</span>
                    </div>
                  </div>

                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-frost-steel-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Expandable body */}
                <div
                  className={`grid transition-all duration-500 ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-frost-ice-700/40 p-5">
                      <div className="mb-4 rounded border border-frost-gold-600/30 bg-frost-gold-500/5 p-4">
                        <h4 className="font-serif text-xs font-semibold uppercase tracking-widest text-frost-gold-300">
                          Reward
                        </h4>
                        <p className="mt-1.5 text-sm text-frost-steel-100">{q.reward}</p>
                      </div>

                      <h4 className="font-serif text-xs font-semibold uppercase tracking-widest text-frost-rime-400">
                        Steps
                      </h4>
                      <ol className="mt-3 space-y-3">
                        {q.steps.map((step, idx) => (
                          <li key={idx} className="flex gap-3">
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-frost-ice-600/50 bg-frost-ice-800/60 font-serif text-xs font-bold text-frost-rime-300">
                              {idx + 1}
                            </span>
                            <p className="pt-1 text-sm leading-relaxed text-frost-steel-100/85">
                              {step}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
