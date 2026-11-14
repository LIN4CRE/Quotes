import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  ADVICE_LIMIT,
  createEmptyLibrary,
  createId,
  HISTORY_LIMIT,
  MAX_COLLECTIONS,
  MAX_COLLECTION_DESCRIPTION,
  MAX_NOTE_LENGTH,
  mergeLibraries,
  normaliseLibrary,
  validateCollectionName,
} from '@/lib/library';
import { isStorageAvailable, readJson, removeItem, STORAGE_KEYS, writeJson } from '@/lib/storage';
import type { AdviceEntry, Collection, LibraryData } from '@/types';

type CollectionMutationResult = 'added' | 'duplicate' | 'missing';

interface LibraryContextValue {
  library: LibraryData;
  favouriteIds: ReadonlySet<string>;
  isFavourite: (quoteId: string) => boolean;
  toggleFavourite: (quoteId: string) => boolean;
  setNote: (quoteId: string, note: string) => void;
  createCollection: (
    name: string,
    description?: string,
    initialQuoteIds?: string[],
  ) => Collection | null;
  updateCollection: (id: string, patch: { name?: string; description?: string }) => void;
  deleteCollection: (id: string) => void;
  addToCollection: (collectionId: string, quoteId: string) => CollectionMutationResult;
  removeFromCollection: (collectionId: string, quoteId: string) => void;
  removeFavourite: (quoteId: string) => void;
  recordView: (quoteId: string) => void;
  clearHistory: () => void;
  addAdvice: (text: string) => 'added' | 'duplicate';
  removeAdvice: (id: string) => void;
  clearAdvice: () => void;
  mergeImportedLibrary: (incoming: LibraryData) => void;
  clearLibrary: () => void;
  storageAvailable: boolean;
  persistFailed: boolean;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

function normaliseAdviceText(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

interface LegacyEntry {
  text: string;
  savedAt: string;
}

function readLegacyAdvice(): LegacyEntry[] {
  const raw = readJson(STORAGE_KEYS.legacyAdvice);
  if (!Array.isArray(raw)) return [];

  const entries: LegacyEntry[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue;
    const record = item as Record<string, unknown>;
    if (typeof record.text !== 'string' || typeof record.savedAt !== 'string') continue;
    const text = record.text.trim();
    if (!text) continue;
    const savedAt = new Date(record.savedAt);
    if (Number.isNaN(savedAt.getTime())) continue;
    entries.push({ text: text.slice(0, 500), savedAt: savedAt.toISOString() });
  }
  return entries;
}

/** Loads the library, migrating entries saved by the original g.html page. */
export function loadInitialLibrary(): { library: LibraryData; migrated: number } {
  const stored = normaliseLibrary(readJson(STORAGE_KEYS.library)).library;
  const legacy = readLegacyAdvice();

  if (legacy.length === 0) return { library: stored, migrated: 0 };

  const seen = new Set(stored.advice.map((entry) => normaliseAdviceText(entry.text)));
  const migratedAdvice: AdviceEntry[] = [];

  for (const entry of legacy) {
    const key = normaliseAdviceText(entry.text);
    if (seen.has(key)) continue;
    seen.add(key);
    migratedAdvice.push({
      id: createId('advice'),
      text: entry.text,
      savedAt: entry.savedAt,
      source: 'advice-slip',
    });
  }

  return {
    library: {
      ...stored,
      advice: [...stored.advice, ...migratedAdvice]
        .sort((left, right) => left.savedAt.localeCompare(right.savedAt))
        .slice(-ADVICE_LIMIT),
    },
    migrated: migratedAdvice.length,
  };
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadInitialLibrary);
  const [library, setLibrary] = useState<LibraryData>(initial.library);
  const [storageAvailable] = useState(isStorageAvailable);
  const [persistFailed, setPersistFailed] = useState(false);
  const legacyRemoved = useRef(initial.migrated === 0);

  // Persist every change. The library is small (a few hundred ids at most).
  useEffect(() => {
    if (!storageAvailable) return;
    const saved = writeJson(STORAGE_KEYS.library, library);

    if (!saved) {
      queueMicrotask(() => setPersistFailed(true));
      return;
    }

    queueMicrotask(() => setPersistFailed(false));

    if (!legacyRemoved.current) {
      removeItem(STORAGE_KEYS.legacyAdvice);
      legacyRemoved.current = true;
    }
  }, [library, storageAvailable]);

  // Keep tabs in sync without inventing a server.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEYS.library || !event.newValue) return;
      try {
        const parsed: unknown = JSON.parse(event.newValue);
        setLibrary(normaliseLibrary(parsed).library);
      } catch {
        // Ignore malformed updates from other tabs.
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const favouriteIds = useMemo(
    () => new Set(library.favourites.map((favourite) => favourite.quoteId)),
    [library.favourites],
  );

  const isFavourite = useCallback((quoteId: string) => favouriteIds.has(quoteId), [favouriteIds]);

  const toggleFavourite = useCallback(
    (quoteId: string) => {
      const exists = favouriteIds.has(quoteId);

      setLibrary((current) => ({
        ...current,
        favourites: exists
          ? current.favourites.filter((favourite) => favourite.quoteId !== quoteId)
          : [{ quoteId, savedAt: new Date().toISOString() }, ...current.favourites],
      }));

      return !exists;
    },
    [favouriteIds],
  );

  const removeFavourite = useCallback((quoteId: string) => {
    setLibrary((current) => ({
      ...current,
      favourites: current.favourites.filter((favourite) => favourite.quoteId !== quoteId),
    }));
  }, []);

  const setNote = useCallback((quoteId: string, note: string) => {
    const trimmed = note.trim().slice(0, MAX_NOTE_LENGTH);
    setLibrary((current) => ({
      ...current,
      favourites: current.favourites.map((favourite) => {
        if (favourite.quoteId !== quoteId) return favourite;
        if (!trimmed) {
          const { note: _removed, ...rest } = favourite;
          return rest;
        }
        return { ...favourite, note: trimmed };
      }),
    }));
  }, []);

  const createCollection = useCallback(
    (name: string, description = '', initialQuoteIds: string[] = []) => {
      if (library.collections.length >= MAX_COLLECTIONS) return null;
      if (validateCollectionName(name, library.collections)) return null;

      const now = new Date().toISOString();
      const collection: Collection = {
        id: createId('col'),
        name: name.trim(),
        description: description.trim().slice(0, MAX_COLLECTION_DESCRIPTION),
        createdAt: now,
        updatedAt: now,
        quoteIds: [...new Set(initialQuoteIds)],
      };

      setLibrary((current) => ({ ...current, collections: [collection, ...current.collections] }));

      return collection;
    },
    [library.collections],
  );

  const updateCollection = useCallback(
    (id: string, patch: { name?: string; description?: string }) => {
      setLibrary((current) => ({
        ...current,
        collections: current.collections.map((collection) => {
          if (collection.id !== id) return collection;
          const nextName =
            patch.name !== undefined && !validateCollectionName(patch.name, current.collections, id)
              ? patch.name.trim()
              : collection.name;

          return {
            ...collection,
            name: nextName,
            description:
              patch.description !== undefined
                ? patch.description.trim().slice(0, MAX_COLLECTION_DESCRIPTION)
                : collection.description,
            updatedAt: new Date().toISOString(),
          };
        }),
      }));
    },
    [],
  );

  const deleteCollection = useCallback((id: string) => {
    setLibrary((current) => ({
      ...current,
      collections: current.collections.filter((collection) => collection.id !== id),
    }));
  }, []);

  const addToCollection = useCallback(
    (collectionId: string, quoteId: string): CollectionMutationResult => {
      const target = library.collections.find((collection) => collection.id === collectionId);
      if (!target) return 'missing';
      if (target.quoteIds.includes(quoteId)) return 'duplicate';

      setLibrary((current) => ({
        ...current,
        collections: current.collections.map((collection) =>
          collection.id === collectionId
            ? {
                ...collection,
                quoteIds: [...collection.quoteIds, quoteId],
                updatedAt: new Date().toISOString(),
              }
            : collection,
        ),
      }));

      return 'added';
    },
    [library.collections],
  );

  const removeFromCollection = useCallback((collectionId: string, quoteId: string) => {
    setLibrary((current) => ({
      ...current,
      collections: current.collections.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              quoteIds: collection.quoteIds.filter((id) => id !== quoteId),
              updatedAt: new Date().toISOString(),
            }
          : collection,
      ),
    }));
  }, []);

  const recordView = useCallback((quoteId: string) => {
    setLibrary((current) => {
      const entry = { quoteId, viewedAt: new Date().toISOString() };
      const history = [entry, ...current.history.filter((item) => item.quoteId !== quoteId)].slice(
        0,
        HISTORY_LIMIT,
      );
      return { ...current, history };
    });
  }, []);

  const clearHistory = useCallback(() => {
    setLibrary((current) => ({ ...current, history: [] }));
  }, []);

  const addAdvice = useCallback(
    (text: string): 'added' | 'duplicate' => {
      const clean = text.trim().slice(0, 500);
      if (!clean) return 'duplicate';
      const key = normaliseAdviceText(clean);
      if (library.advice.some((entry) => normaliseAdviceText(entry.text) === key)) {
        return 'duplicate';
      }

      const entry: AdviceEntry = {
        id: createId('advice'),
        text: clean,
        savedAt: new Date().toISOString(),
        source: 'advice-slip',
      };

      setLibrary((current) => ({
        ...current,
        advice: [...current.advice, entry].slice(-ADVICE_LIMIT),
      }));

      return 'added';
    },
    [library.advice],
  );

  const removeAdvice = useCallback((id: string) => {
    setLibrary((current) => ({
      ...current,
      advice: current.advice.filter((entry) => entry.id !== id),
    }));
  }, []);

  const clearAdvice = useCallback(() => {
    setLibrary((current) => ({ ...current, advice: [] }));
  }, []);

  const mergeImportedLibrary = useCallback((incoming: LibraryData) => {
    setLibrary((current) => mergeLibraries(current, incoming));
  }, []);

  const clearLibrary = useCallback(() => {
    const empty = createEmptyLibrary();
    setLibrary(empty);
    // Keep a recoverable empty record rather than removing the key silently.
    writeJson(STORAGE_KEYS.library, empty);
  }, []);

  const value = useMemo<LibraryContextValue>(
    () => ({
      library,
      favouriteIds,
      isFavourite,
      toggleFavourite,
      setNote,
      createCollection,
      updateCollection,
      deleteCollection,
      addToCollection,
      removeFromCollection,
      removeFavourite,
      recordView,
      clearHistory,
      addAdvice,
      removeAdvice,
      clearAdvice,
      mergeImportedLibrary,
      clearLibrary,
      storageAvailable,
      persistFailed,
    }),
    [
      library,
      favouriteIds,
      isFavourite,
      toggleFavourite,
      setNote,
      createCollection,
      updateCollection,
      deleteCollection,
      addToCollection,
      removeFromCollection,
      removeFavourite,
      recordView,
      clearHistory,
      addAdvice,
      removeAdvice,
      clearAdvice,
      mergeImportedLibrary,
      clearLibrary,
      storageAvailable,
      persistFailed,
    ],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used inside LibraryProvider');
  return context;
}
