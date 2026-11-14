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
  MAX_REFLECTION_AUTHOR,
  MAX_REFLECTIONS,
  MAX_REFLECTION_TEXT,
  MAX_REFLECTION_TITLE,
  mergeLibraries,
  normaliseLibrary,
  validateCollectionName,
} from '@/lib/library';
import { isStorageAvailable, readJson, removeItem, STORAGE_KEYS, writeJson } from '@/lib/storage';
import type { AdviceEntry, Collection, LibraryData, Reflection } from '@/types';

type CollectionMutationResult = 'added' | 'duplicate' | 'missing';

export interface ReflectionInput {
  title?: string;
  text: string;
  author?: string;
  favourite?: boolean;
}

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
    initialReflectionIds?: string[],
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
  createReflection: (input: ReflectionInput) => Reflection | null;
  updateReflection: (id: string, patch: Partial<ReflectionInput>) => void;
  deleteReflection: (id: string) => void;
  toggleReflectionFavourite: (id: string) => boolean;
  addReflectionToCollection: (
    collectionId: string,
    reflectionId: string,
  ) => CollectionMutationResult;
  removeReflectionFromCollection: (collectionId: string, reflectionId: string) => void;
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

/** Loads the library, migrating v2 libraries and entries saved by the original g.html page. */
export function loadInitialLibrary(): {
  library: LibraryData;
  migrated: number;
  migratedFromV2: boolean;
} {
  const current = readJson(STORAGE_KEYS.library);
  const fallbackV2 = current === null ? readJson(STORAGE_KEYS.legacyLibraryV2) : null;
  const stored = normaliseLibrary(current ?? fallbackV2).library;
  const migratedFromV2 = current === null && fallbackV2 !== null;
  const legacy = readLegacyAdvice();

  if (legacy.length === 0) return { library: stored, migrated: 0, migratedFromV2 };

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
    migratedFromV2,
  };
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadInitialLibrary);
  const [library, setLibrary] = useState<LibraryData>(initial.library);
  const [storageAvailable] = useState(isStorageAvailable);
  const [persistFailed, setPersistFailed] = useState(false);
  const legacyRemoved = useRef(initial.migrated === 0);
  const v2Removed = useRef(!initial.migratedFromV2);

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

    if (!v2Removed.current) {
      removeItem(STORAGE_KEYS.legacyLibraryV2);
      v2Removed.current = true;
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
    (
      name: string,
      description = '',
      initialQuoteIds: string[] = [],
      initialReflectionIds: string[] = [],
    ) => {
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
        reflectionIds: [...new Set(initialReflectionIds)],
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

  const createReflection = useCallback(
    (input: ReflectionInput): Reflection | null => {
      const text = input.text.trim().slice(0, MAX_REFLECTION_TEXT);
      if (!text) return null;
      if (library.reflections.length >= MAX_REFLECTIONS) return null;

      const now = new Date().toISOString();
      const title = input.title?.trim().slice(0, MAX_REFLECTION_TITLE);
      const author = input.author?.trim().slice(0, MAX_REFLECTION_AUTHOR);
      const reflection: Reflection = {
        id: createId('reflection'),
        text,
        favourite: input.favourite === true,
        createdAt: now,
        updatedAt: now,
        ...(title ? { title } : {}),
        ...(author ? { author } : {}),
      };

      setLibrary((current) => ({
        ...current,
        reflections: [reflection, ...current.reflections],
      }));

      return reflection;
    },
    [library.reflections.length],
  );

  const updateReflection = useCallback((id: string, patch: Partial<ReflectionInput>) => {
    const text = patch.text?.trim().slice(0, MAX_REFLECTION_TEXT);
    if (patch.text !== undefined && !text) return;

    setLibrary((current) => ({
      ...current,
      reflections: current.reflections.map((reflection) => {
        if (reflection.id !== id) return reflection;
        const next: Reflection = { ...reflection, updatedAt: new Date().toISOString() };

        if (text !== undefined) next.text = text;
        if (patch.title !== undefined) {
          const title = patch.title.trim().slice(0, MAX_REFLECTION_TITLE);
          if (title) next.title = title;
          else delete next.title;
        }
        if (patch.author !== undefined) {
          const author = patch.author.trim().slice(0, MAX_REFLECTION_AUTHOR);
          if (author) next.author = author;
          else delete next.author;
        }
        if (patch.favourite !== undefined) next.favourite = patch.favourite;

        return next;
      }),
    }));
  }, []);

  const deleteReflection = useCallback((id: string) => {
    setLibrary((current) => ({
      ...current,
      reflections: current.reflections.filter((reflection) => reflection.id !== id),
      collections: current.collections.map((collection) =>
        collection.reflectionIds.includes(id)
          ? {
              ...collection,
              reflectionIds: collection.reflectionIds.filter((reflectionId) => reflectionId !== id),
              updatedAt: new Date().toISOString(),
            }
          : collection,
      ),
    }));
  }, []);

  const toggleReflectionFavourite = useCallback(
    (id: string) => {
      const current = library.reflections.find((reflection) => reflection.id === id);
      if (!current) return false;
      const favourite = !current.favourite;

      setLibrary((libraryState) => ({
        ...libraryState,
        reflections: libraryState.reflections.map((reflection) =>
          reflection.id === id
            ? { ...reflection, favourite, updatedAt: new Date().toISOString() }
            : reflection,
        ),
      }));

      return favourite;
    },
    [library.reflections],
  );

  const addReflectionToCollection = useCallback(
    (collectionId: string, reflectionId: string): CollectionMutationResult => {
      const target = library.collections.find((collection) => collection.id === collectionId);
      if (!target) return 'missing';
      if (target.reflectionIds.includes(reflectionId)) return 'duplicate';

      setLibrary((current) => ({
        ...current,
        collections: current.collections.map((collection) =>
          collection.id === collectionId
            ? {
                ...collection,
                reflectionIds: [...collection.reflectionIds, reflectionId],
                updatedAt: new Date().toISOString(),
              }
            : collection,
        ),
      }));

      return 'added';
    },
    [library.collections],
  );

  const removeReflectionFromCollection = useCallback(
    (collectionId: string, reflectionId: string) => {
      setLibrary((current) => ({
        ...current,
        collections: current.collections.map((collection) =>
          collection.id === collectionId
            ? {
                ...collection,
                reflectionIds: collection.reflectionIds.filter((id) => id !== reflectionId),
                updatedAt: new Date().toISOString(),
              }
            : collection,
        ),
      }));
    },
    [],
  );

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
      createReflection,
      updateReflection,
      deleteReflection,
      toggleReflectionFavourite,
      addReflectionToCollection,
      removeReflectionFromCollection,
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
      createReflection,
      updateReflection,
      deleteReflection,
      toggleReflectionFavourite,
      addReflectionToCollection,
      removeReflectionFromCollection,
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
