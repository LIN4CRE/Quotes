import { useCallback, useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

import { Seo } from '@/components/Seo';
import { CommandPalette } from '@/components/search/CommandPalette';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { MobileTopBar } from '@/components/layout/MobileTopBar';
import { OfflineBanner, PwaUpdateBanner, StorageBanner } from '@/components/layout/StatusBanners';
import { ShortcutsDialog } from '@/components/layout/ShortcutsDialog';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { Sidebar } from '@/components/layout/Sidebar';
import { GitHubIcon } from '@/components/ui/GitHubIcon';
import { SupportButton } from '@/components/ui/SupportButton';
import { quotes } from '@/data/quotes';
import { pickRandom } from '@/lib/random';
import { useSettings } from '@/providers/SettingsProvider';
import { useToast } from '@/providers/ToastProvider';
import type { ThemePreference } from '@/types';

const nextTheme: Record<ThemePreference, ThemePreference> = {
  dark: 'light',
  light: 'system',
  system: 'dark',
};

export function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const navigate = useNavigate();
  const { settings, setTheme } = useSettings();
  const { addToast } = useToast();

  const cycleTheme = useCallback(() => {
    const next = nextTheme[settings.theme];
    setTheme(next);
    addToast({
      title: `Theme: ${next === 'system' ? 'follow device' : next}`,
      variant: 'info',
    });
  }, [settings.theme, setTheme, addToast]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.closest('input, textarea, select, [contenteditable="true"]') !== null ||
          target.isContentEditable);

      const modifier = event.metaKey || event.ctrlKey;

      if (modifier && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }

      if (isTyping || modifier || event.altKey) return;

      if (event.key === '/') {
        event.preventDefault();
        setPaletteOpen(true);
      } else if (event.key === '?') {
        event.preventDefault();
        setShortcutsOpen(true);
      } else if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        const quote = pickRandom(quotes);
        if (quote) navigate(`/quote/${quote.id}`);
      } else if (event.key.toLowerCase() === 't') {
        event.preventDefault();
        cycleTheme();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate, cycleTheme]);

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100]"
      >
        Skip to content
      </a>

      <Sidebar onOpenSearch={() => setPaletteOpen(true)} />
      <ScrollToTop />

      <div className="md:pl-[268px]">
        <MobileTopBar />
        <OfflineBanner />
        <StorageBanner />
        <PwaUpdateBanner />

        <main
          id="main"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl px-4 pt-6 pb-28 outline-none sm:px-6 sm:pt-8 md:pb-16 lg:px-10"
        >
          <Outlet />
          <Seo />

          <footer className="mt-16 border-t border-line pt-6 pb-2 text-[11px] text-subtle">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <p>
                <span className="font-semibold tracking-[0.2em] text-muted uppercase">LIN4CRE</span>{' '}
                <span className="font-serif tracking-[0.2em]">Quotes</span> — quotes are attributed,
                never invented.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link to="/about" className="transition hover:text-ink">
                  Sources and attribution
                </Link>
                <Link to="/settings" className="transition hover:text-ink">
                  Settings
                </Link>
                <SupportButton variant="compact" className="min-h-8 px-2.5 text-[10.5px]" />
                <a
                  href="https://github.com/LIN4CRE/Quotes"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 transition hover:text-ink"
                >
                  <GitHubIcon className="size-3.5" />
                  GitHub
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>

      <MobileBottomNav />
      {paletteOpen ? <CommandPalette open onOpenChange={setPaletteOpen} /> : null}
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
