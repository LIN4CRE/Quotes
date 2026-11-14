/**
 * Small, defensive wrapper around localStorage.
 *
 * Every read validates JSON and falls back rather than throwing; every write
 * reports success so the UI can warn when storage is unavailable (private
 * browsing, quota exceeded, storage disabled).
 */

export const STORAGE_KEYS = {
  library: 'lin4cre.quotes.library.v3',
  /** Read-only fallback while upgrading a v2 library. Never written again. */
  legacyLibraryV2: 'lin4cre.quotes.library.v2',
  settings: 'lin4cre.quotes.settings.v1',
  legacyAdvice: 'growing-page-entries-v1',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    const storage = window.localStorage;
    // Probe: some browsers expose localStorage but throw on write.
    const probe = '__lin4cre_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

let cachedStorage: Storage | null | undefined;

function storage(): Storage | null {
  if (cachedStorage === undefined) {
    cachedStorage = getStorage();
  }
  return cachedStorage;
}

/** Whether local storage can be used at all. */
export function isStorageAvailable(): boolean {
  return storage() !== null;
}

export function readRaw(key: string): string | null {
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function readJson(key: string): unknown {
  const raw = readRaw(key);
  if (raw === null) return null;

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    storage()?.setItem(key, JSON.stringify(value));
    return storage() !== null;
  } catch {
    return false;
  }
}

export function writeRaw(key: string, value: string): boolean {
  try {
    storage()?.setItem(key, value);
    return storage() !== null;
  } catch {
    return false;
  }
}

export function removeItem(key: string): void {
  try {
    storage()?.removeItem(key);
  } catch {
    // Ignore: nothing useful can be done if removal fails.
  }
}

/** Marks the storage probe stale, mainly for tests. */
export function resetStorageCache(): void {
  cachedStorage = undefined;
}
