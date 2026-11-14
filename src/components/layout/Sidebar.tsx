import { Command, Heart, Monitor, Moon, Search, Sun } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { Logo } from '@/components/ui/Logo';
import { primaryNav, secondaryNav } from '@/components/layout/navItems';
import { useLibrary } from '@/providers/LibraryProvider';
import { useSettings } from '@/providers/SettingsProvider';
import { cn } from '@/lib/cn';
import type { ThemePreference } from '@/types';

const nextTheme: Record<ThemePreference, ThemePreference> = {
  dark: 'light',
  light: 'system',
  system: 'dark',
};

const themeMeta: Record<ThemePreference, { label: string; icon: typeof Sun }> = {
  dark: { label: 'Dark', icon: Moon },
  light: { label: 'Light', icon: Sun },
  system: { label: 'System', icon: Monitor },
};

export function Sidebar({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { library } = useLibrary();
  const { settings, setTheme } = useSettings();
  const ThemeIcon = themeMeta[settings.theme].icon;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] flex-col border-r border-line bg-surface/45 backdrop-blur-xl md:flex">
      <div className="px-5 pt-6 pb-4">
        <Logo />
        <button
          type="button"
          onClick={onOpenSearch}
          className="mt-6 flex w-full items-center gap-2.5 rounded-xl border border-line bg-surface-2/70 px-3 py-2.5 text-left text-[13px] text-subtle transition hover:border-line-strong hover:text-muted"
        >
          <Search className="size-4 shrink-0" aria-hidden />
          <span className="flex-1">Jump to…</span>
          <kbd className="flex items-center gap-0.5 rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] font-medium text-subtle">
            <Command className="size-2.5" aria-hidden />K
          </kbd>
        </button>
      </div>

      <nav aria-label="Main navigation" className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <p className="label-caps px-3 pt-2 pb-2">Library</p>
        <ul className="space-y-0.5">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isFavourites = item.to === '/favourites';
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end ?? false}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors',
                      isActive
                        ? 'bg-surface-2 text-ink'
                        : 'text-muted hover:bg-surface-2/60 hover:text-ink',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          'absolute top-1/2 left-0 h-5 w-[2.5px] -translate-y-1/2 rounded-r-full bg-accent transition-opacity',
                          isActive ? 'opacity-100' : 'opacity-0',
                        )}
                        aria-hidden
                      />
                      <Icon
                        className={cn(
                          'size-[17px] shrink-0',
                          isActive ? 'text-accent' : 'text-subtle group-hover:text-muted',
                        )}
                        aria-hidden
                      />
                      <span className="flex-1">{item.label}</span>
                      {isFavourites && library.favourites.length > 0 ? (
                        <span className="flex items-center gap-1 rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-semibold text-muted tabular-nums">
                          <Heart className="size-2.5 fill-current text-accent" aria-hidden />
                          {library.favourites.length}
                        </span>
                      ) : null}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <p className="label-caps px-3 pt-6 pb-2">App</p>
        <ul className="space-y-0.5">
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors',
                      isActive
                        ? 'bg-surface-2 text-ink'
                        : 'text-muted hover:bg-surface-2/60 hover:text-ink',
                    )
                  }
                >
                  <Icon className="size-[17px] shrink-0 text-subtle" aria-hidden />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-line px-4 py-4">
        <button
          type="button"
          onClick={() => setTheme(nextTheme[settings.theme])}
          className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-[13px] text-muted transition hover:bg-surface-2 hover:text-ink"
        >
          <ThemeIcon className="size-4 text-subtle" aria-hidden />
          <span className="flex-1 text-left">Theme: {themeMeta[settings.theme].label}</span>
          <span className="text-[10px] text-subtle">Change</span>
        </button>
        <p className="mt-2 px-2 text-[10.5px] leading-relaxed text-subtle">
          Your library is stored in this browser. It does not sync between devices.
        </p>
      </div>
    </aside>
  );
}
