import { Snowflake, Github, MessageCircle, BookOpen, Heart } from 'lucide-react';
import { expansions } from '../data';

const navColumns = [
  {
    title: 'Wiki',
    links: [
      { label: 'Zones', href: '#zones' },
      { label: 'Items', href: '#items' },
      { label: 'Quests', href: '#quests' },
      { label: 'Raid Targets', href: '#raids' },
      { label: 'Class Guides', href: '#classes' },
      { label: 'Glossary', href: '#glossary' },
    ],
  },
  {
    title: 'Progression',
    links: expansions.map((e) => ({ label: e.name, href: '#zones' })),
  },
  {
    title: 'Community',
    links: [
      { label: 'Discord', href: '#top' },
      { label: 'Forums', href: '#top' },
      { label: 'Editor Guide', href: '#top' },
      { label: 'Krono Tracker', href: '#krono' },
      { label: 'Support on Patreon', href: '#support' },
      { label: 'Changelog', href: '#top' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-frost-ice-700/40 bg-frost-ice-900/80">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-frost-rime-400/60 bg-frost-ice-900/80 text-frost-rime-300">
                <Snowflake className="h-5 w-5" />
              </span>
              <div>
                <div className="font-display text-lg font-bold text-frost-rime-100">Frostreaver</div>
                <div className="font-serif text-[10px] uppercase tracking-[0.25em] text-frost-steel-400">
                  TLP Wiki
                </div>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-frost-steel-300">
              A community-maintained knowledge base for the Frostreaver Time-Locked Progression
              server. Not affiliated with Daybreak Game Company or Darkpaw Games.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="#support"
                className="grid h-10 w-10 place-items-center rounded-full border border-frost-ice-600/50 text-frost-steel-300 transition-all duration-300 hover:border-frost-ember-400/60 hover:text-frost-ember-300"
                aria-label="Support on Patreon"
              >
                <Heart className="h-4 w-4" />
              </a>
              <a
                href="#top"
                className="grid h-10 w-10 place-items-center rounded-full border border-frost-ice-600/50 text-frost-steel-300 transition-all duration-300 hover:border-frost-rime-400/60 hover:text-frost-rime-200"
                aria-label="Discord"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="#top"
                className="grid h-10 w-10 place-items-center rounded-full border border-frost-ice-600/50 text-frost-steel-300 transition-all duration-300 hover:border-frost-rime-400/60 hover:text-frost-rime-200"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="#top"
                className="grid h-10 w-10 place-items-center rounded-full border border-frost-ice-600/50 text-frost-steel-300 transition-all duration-300 hover:border-frost-rime-400/60 hover:text-frost-rime-200"
                aria-label="Editor Guide"
              >
                <BookOpen className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {navColumns.map((col) => (
            <div key={col.title}>
              <h4 className="font-serif text-xs font-semibold uppercase tracking-widest text-frost-rime-300">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-frost-steel-300 transition-colors duration-300 hover:text-frost-rime-200"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider-ornate my-10" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-serif text-xs text-frost-steel-400">
            © {new Date().getFullYear()} Frostreaver Wiki · Community project
          </p>
          <p className="font-serif text-xs text-frost-steel-400">
            EverQuest is a trademark of Daybreak Game Company. This is a fan-made resource.
          </p>
        </div>
      </div>
    </footer>
  );
}
