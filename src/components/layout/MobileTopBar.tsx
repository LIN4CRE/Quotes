import { Monitor, Moon, Settings, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Logo } from '@/components/ui/Logo';
import { useSettings } from '@/providers/SettingsProvider';
import type { ThemePreference } from '@/types';

const nextTheme: Record<ThemePreference, ThemePreference> = {
  dark: 'light',
  light: 'system',
  system: 'dark',
};

export function MobileTopBar() {
  const { settings, setTheme } = useSettings();
  const ThemeIcon = settings.theme === 'light' ? Sun : settings.theme === 'system' ? Monitor : Moon;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-xl md:hidden">
      <div className="safe-top" />
      <div className="flex h-16 items-center justify-between px-4">
        <Logo />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTheme(nextTheme[settings.theme])}
            aria-label={`Switch theme, currently ${settings.theme}`}
            title={`Theme: ${settings.theme}. Tap to change.`}
            className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <ThemeIcon className="size-[18px]" aria-hidden />
          </button>
          <Link
            to="/settings"
            aria-label="Settings"
            className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <Settings className="size-[18px]" aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}
