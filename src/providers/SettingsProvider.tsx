import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { readJson, writeJson, STORAGE_KEYS } from '@/lib/storage';
import type { FontScale, MotionPreference, Settings, ThemePreference } from '@/types';

export const defaultSettings: Settings = {
  theme: 'dark',
  fontScale: 'md',
  motion: 'system',
  showDisputed: true,
};

function isTheme(value: unknown): value is ThemePreference {
  return value === 'dark' || value === 'light' || value === 'system';
}

function isFontScale(value: unknown): value is FontScale {
  return value === 'sm' || value === 'md' || value === 'lg';
}

function isMotion(value: unknown): value is MotionPreference {
  return value === 'system' || value === 'reduced';
}

export function normaliseSettings(raw: unknown): Settings {
  if (typeof raw !== 'object' || raw === null) return defaultSettings;
  const record = raw as Record<string, unknown>;

  return {
    theme: isTheme(record.theme) ? record.theme : defaultSettings.theme,
    fontScale: isFontScale(record.fontScale) ? record.fontScale : defaultSettings.fontScale,
    motion: isMotion(record.motion) ? record.motion : defaultSettings.motion,
    showDisputed:
      typeof record.showDisputed === 'boolean' ? record.showDisputed : defaultSettings.showDisputed,
  };
}

export function loadSettings(): Settings {
  return normaliseSettings(readJson(STORAGE_KEYS.settings));
}

export function resolveTheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference === 'light' || preference === 'dark') return preference;

  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  return 'dark';
}

/** Applies settings to <html> so CSS can theme instantly. Safe before render. */
export function applyPreferences(settings: Settings): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.theme = resolveTheme(settings.theme);
  root.dataset.font = settings.fontScale;
  root.dataset.motion = settings.motion;
  root.style.colorScheme = root.dataset.theme;
}

interface SettingsContextValue {
  settings: Settings;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemePreference) => void;
  setFontScale: (scale: FontScale) => void;
  setMotion: (motion: MotionPreference) => void;
  setShowDisputed: (show: boolean) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark'
      : 'dark',
  );

  const resolvedTheme = settings.theme === 'system' ? systemTheme : settings.theme;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const listener = (event: MediaQueryListEvent) =>
      setSystemTheme(event.matches ? 'light' : 'dark');
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    applyPreferences({ ...settings, theme: resolvedTheme });
    writeJson(STORAGE_KEYS.settings, settings);
  }, [settings, resolvedTheme]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.settings) {
        setSettings(normaliseSettings(readJson(STORAGE_KEYS.settings)));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      resolvedTheme,
      setTheme: (theme) => update({ theme }),
      setFontScale: (fontScale) => update({ fontScale }),
      setMotion: (motion) => update({ motion }),
      setShowDisputed: (showDisputed) => update({ showDisputed }),
      resetSettings: () => setSettings(defaultSettings),
    }),
    [settings, resolvedTheme, update],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used inside SettingsProvider');
  return context;
}
