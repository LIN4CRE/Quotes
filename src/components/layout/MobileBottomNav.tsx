import { Compass, Heart, MoreHorizontal, Search, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { Modal } from '@/components/ui/Modal';
import { primaryNav } from '@/components/layout/navItems';
import { useLibrary } from '@/providers/LibraryProvider';
import { cn } from '@/lib/cn';

const bottomItems = [
  { to: '/', label: 'Discover', icon: Sparkles, end: true },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/favourites', label: 'Saved', icon: Heart },
];

export function MobileBottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { library } = useLibrary();
  const moreItems = primaryNav.filter(
    (item) => !bottomItems.some((bottom) => bottom.to === item.to),
  );

  return (
    <>
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/90 backdrop-blur-xl md:hidden"
      >
        <ul className="safe-bottom grid grid-cols-5 px-2 pt-1.5">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end ?? false}
                  className={({ isActive }) =>
                    cn(
                      'relative flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors',
                      isActive ? 'text-accent' : 'text-subtle hover:text-muted',
                    )
                  }
                >
                  <span className="relative">
                    <Icon className="size-5" aria-hidden />
                    {item.to === '/favourites' && library.favourites.length > 0 ? (
                      <span className="absolute -top-1 -right-2 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-ink tabular-nums">
                        {library.favourites.length > 99 ? '99+' : library.favourites.length}
                      </span>
                    ) : null}
                  </span>
                  {item.label}
                </NavLink>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              className="flex w-full flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium text-subtle transition-colors hover:text-muted"
            >
              <MoreHorizontal className="size-5" aria-hidden />
              More
            </button>
          </li>
        </ul>
      </nav>

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="More" size="sm">
        <ul className="space-y-1">
          {moreItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-surface-2"
                >
                  <Icon className="size-[18px] text-accent" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">{item.label}</span>
                    <span className="block text-[11px] text-subtle">{item.description}</span>
                  </span>
                </NavLink>
              </li>
            );
          })}
          <li>
            <NavLink
              to="/settings"
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-surface-2"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-ink">Settings</span>
                <span className="block text-[11px] text-subtle">
                  Theme, data, install and about
                </span>
              </span>
            </NavLink>
          </li>
        </ul>
      </Modal>
    </>
  );
}
