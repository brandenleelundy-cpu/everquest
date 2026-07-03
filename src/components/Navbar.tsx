import { useEffect, useState } from 'react';
import { Menu, X, Snowflake, Search, Sun, Moon } from 'lucide-react';
import { expansions } from '../data';

const links = [
  { label: 'Zones',       href: '#zones' },
  { label: 'Items',       href: '#items' },
  { label: 'Quests',      href: '#quests' },
  { label: 'Raids',       href: '#raids' },
  { label: 'Classes',     href: '#classes' },
  { label: 'Progression', href: '#progression' },
  { label: 'Hunter',      href: '#hunter' },
  { label: 'Auctions',    href: '#auctions' },
  { label: 'Krono',       href: '#krono' },
  { label: 'Glossary',    href: '#glossary' },
  { label: 'Support',     href: '#support' },
];

function useTheme() {
  const [isLight, setIsLight] = useState(
    () => document.documentElement.classList.contains('light')
  );

  function toggle() {
    const next = !isLight;
    document.documentElement.classList.toggle('light', next);
    try { localStorage.setItem('eq-theme', next ? 'light' : 'dark'); } catch {}
    setIsLight(next);
  }

  return { isLight, toggle };
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const { isLight, toggle }     = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const current = expansions.find((e) => e.status === 'Current');

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-frost-ice-900/95 backdrop-blur-md border-b border-frost-ice-700/50 shadow-lg shadow-black/30'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-3 group">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-frost-rime-400/60 bg-frost-ice-900/80 text-frost-rime-300 transition-all duration-300 group-hover:border-frost-rime-300 group-hover:text-frost-rime-200 group-hover:shadow-[0_0_20px_-2px_rgba(0,180,188,0.55)]">
            <Snowflake className="h-5 w-5" />
          </span>
          <div className="leading-none">
            <div className="font-display text-lg font-bold tracking-wide text-frost-rime-100 text-glow-ice">
              Frostreaver
            </div>
            <div className="font-serif text-[10px] uppercase tracking-[0.25em] text-frost-steel-300">
              TLP Wiki
            </div>
          </div>
        </a>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="relative font-serif text-sm font-medium uppercase tracking-widest text-frost-steel-100 transition-colors duration-300 hover:text-frost-rime-200 after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-frost-rime-400 after:transition-all after:duration-300 hover:after:w-full"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {current && (
            <span className="chip border-frost-rime-400/50 bg-frost-ice-800/60 text-frost-rime-200">
              <span className="h-1.5 w-1.5 rounded-full bg-frost-rime-400 animate-flicker" />
              {current.abbr} unlocked
            </span>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
            className="grid h-9 w-9 place-items-center rounded border border-frost-ice-600/50 text-frost-steel-300 transition-all duration-300 hover:border-frost-rime-400/60 hover:text-frost-rime-200 hover:shadow-[0_0_12px_-2px_rgba(0,180,188,0.35)]"
          >
            {isLight
              ? <Moon className="h-4 w-4" />
              : <Sun  className="h-4 w-4" />
            }
          </button>

          <a href="#zones" className="btn-ice">
            <Search className="h-4 w-4" />
            Browse
          </a>
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggle}
            aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
            className="grid h-9 w-9 place-items-center rounded border border-frost-ice-600/50 text-frost-steel-300 transition-colors hover:border-frost-rime-400/50 hover:text-frost-rime-200"
          >
            {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded border border-frost-ice-600/50 text-frost-rime-200"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-frost-ice-700/30 bg-frost-ice-900/98 backdrop-blur-md transition-all duration-500 lg:hidden ${
          open ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <ul className="flex flex-col gap-1 px-6 py-4">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-3 font-serif text-sm font-medium uppercase tracking-widest text-frost-steel-100 transition-colors hover:text-frost-rime-200"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
