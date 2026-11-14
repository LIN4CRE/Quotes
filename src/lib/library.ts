import { quotesById } from '@/data/quotes';
import type {
  AdviceEntry,
  Collection,
  HistoryEntry,
  LibraryData,
  SavedQuote,
  Settings,
} from '@/types';

export const LIBRARY_VERSION = 2 as const;
export const HISTORY_LIMIT = 100;
export const ADVICE_LIMIT = 400;
export const MAX_COLLECTIONS = 100;
export const MAX_COLLECTION_NAME = 80;
export const MAX_COLLECTION_DESCRIPTION = 240;
export const MAX_NOTE_LENGTH = 2000;

export function createEmptyLibrary(): LibraryData {
  return {
    version: LIBRARY_VERSION,
    favourites: [],
    collections: [],
    history: [],
    advice: [],
  };
}

export function createId(prefix: string): string {
  const cryptoApi = typeof crypto !== 'undefined' ? crypto : undefined;

  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return `${prefix}_${cryptoApi.randomUUID()}`;
  }

  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || value.length < 10) return false;
  return !Number.isNaN(new Date(value).getTime());
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function normaliseFavourite(value: unknown): SavedQuote | null {
  if (!isRecord(value)) return null;
  const quoteId = typeof value.quoteId === 'string' ? value.quoteId : null;
  if (!quoteId || !quotesById.has(quoteId)) return null;
  if (!isIsoDate(value.savedAt)) return null;

  const note =
    typeof value.note === 'string' ? value.note.trim().slice(0, MAX_NOTE_LENGTH) : undefined;

  return {
    quoteId,
    savedAt: new Date(value.savedAt).toISOString(),
    ...(note ? { note } : {}),
  };
}

function normaliseCollection(value: unknown): Collection | null {
  if (!isRecord(value)) return null;

  const name = cleanText(value.name, MAX_COLLECTION_NAME);
  if (!name) return null;

  const id = typeof value.id === 'string' && value.id.length > 0 ? value.id : createId('col');
  const createdAt = isIsoDate(value.createdAt)
    ? new Date(value.createdAt).toISOString()
    : new Date().toISOString();
  const updatedAt = isIsoDate(value.updatedAt)
    ? new Date(value.updatedAt).toISOString()
    : createdAt;
  const description =
    typeof value.description === 'string'
      ? value.description.trim().slice(0, MAX_COLLECTION_DESCRIPTION)
      : '';

  const quoteIds = Array.isArray(value.quoteIds)
    ? [
        ...new Set(
          value.quoteIds.filter((id): id is string => typeof id === 'string' && quotesById.has(id)),
        ),
      ]
    : [];

  return { id, name, description, createdAt, updatedAt, quoteIds };
}

function normaliseHistoryEntry(value: unknown): HistoryEntry | null {
  if (!isRecord(value)) return null;
  if (typeof value.quoteId !== 'string' || !quotesById.has(value.quoteId)) return null;
  if (!isIsoDate(value.viewedAt)) return null;
  return { quoteId: value.quoteId, viewedAt: new Date(value.viewedAt).toISOString() };
}

function normaliseAdviceEntry(value: unknown): AdviceEntry | null {
  if (!isRecord(value)) return null;
  const text = cleanText(value.text, 500);
  if (!text) return null;
  if (!isIsoDate(value.savedAt)) return null;

  const id = typeof value.id === 'string' && value.id.length > 0 ? value.id : createId('advice');

  return {
    id,
    text,
    savedAt: new Date(value.savedAt).toISOString(),
    source: 'advice-slip',
  };
}

export interface NormaliseResult {
  library: LibraryData;
  repaired: boolean;
}

/**
 * Accepts anything (stored JSON, imported file, an older schema) and returns a
 * valid library. Unknown quote ids are dropped rather than rendered as blanks.
 */
export function normaliseLibrary(raw: unknown): NormaliseResult {
  const empty = createEmptyLibrary();
  if (!isRecord(raw)) return { library: empty, repaired: true };

  const favourites = Array.isArray(raw.favourites)
    ? raw.favourites.map(normaliseFavourite).filter((item): item is SavedQuote => item !== null)
    : [];
  const collections = Array.isArray(raw.collections)
    ? raw.collections
        .map(normaliseCollection)
        .filter((item): item is Collection => item !== null)
        .slice(0, MAX_COLLECTIONS)
    : [];
  const history = Array.isArray(raw.history)
    ? raw.history
        .map(normaliseHistoryEntry)
        .filter((item): item is HistoryEntry => item !== null)
        .sort((left, right) => right.viewedAt.localeCompare(left.viewedAt))
        .slice(0, HISTORY_LIMIT)
    : [];
  const advice = Array.isArray(raw.advice)
    ? raw.advice
        .map(normaliseAdviceEntry)
        .filter((item): item is AdviceEntry => item !== null)
        .sort((left, right) => left.savedAt.localeCompare(right.savedAt))
        .slice(-ADVICE_LIMIT)
    : [];

  const dedupedFavourites = dedupeBy(favourites, (item) => item.quoteId);
  const dedupedCollections = dedupeBy(collections, (item) => item.id);
  const dedupedHistory = dedupeBy(history, (item) => item.quoteId);
  const seenAdvice = new Set<string>();
  const dedupedAdvice = advice.filter((item) => {
    const key = item.text.toLowerCase();
    if (seenAdvice.has(key)) return false;
    seenAdvice.add(key);
    return true;
  });

  const library: LibraryData = {
    version: LIBRARY_VERSION,
    favourites: dedupedFavourites,
    collections: dedupedCollections,
    history: dedupedHistory,
    advice: dedupedAdvice,
  };

  const repaired =
    !Array.isArray(raw.favourites) ||
    !Array.isArray(raw.collections) ||
    !Array.isArray(raw.history) ||
    !Array.isArray(raw.advice) ||
    raw.version !== LIBRARY_VERSION ||
    dedupedFavourites.length !== favourites.length ||
    dedupedCollections.length !== collections.length ||
    dedupedAdvice.length !== advice.length;

  return { library, repaired };
}

function dedupeBy<T>(items: T[], keyOf: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyOf(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Merges an imported library into the current one without losing local notes. */
export function mergeLibraries(current: LibraryData, incoming: LibraryData): LibraryData {
  const favourites = current.favourites.map((item) => ({ ...item }));

  for (const incomingFavourite of incoming.favourites) {
    const existing = favourites.find((item) => item.quoteId === incomingFavourite.quoteId);
    if (!existing) {
      favourites.push(incomingFavourite);
    } else if (!existing.note && incomingFavourite.note) {
      existing.note = incomingFavourite.note;
    }
  }

  const collections = current.collections.map((collection) => ({
    ...collection,
    quoteIds: [...collection.quoteIds],
  }));

  for (const incomingCollection of incoming.collections) {
    const byId = collections.find((item) => item.id === incomingCollection.id);
    const byName = collections.find(
      (item) => item.name.toLowerCase() === incomingCollection.name.toLowerCase(),
    );
    const target = byId ?? byName;

    if (target) {
      target.quoteIds = [...new Set([...target.quoteIds, ...incomingCollection.quoteIds])];
      if (!target.description && incomingCollection.description) {
        target.description = incomingCollection.description;
      }
      if (incomingCollection.updatedAt > target.updatedAt) {
        target.updatedAt = incomingCollection.updatedAt;
      }
    } else if (collections.length < MAX_COLLECTIONS) {
      collections.push({ ...incomingCollection, quoteIds: [...incomingCollection.quoteIds] });
    }
  }

  const historyByQuote = new Map<string, HistoryEntry>();
  for (const entry of [...current.history, ...incoming.history]) {
    const existing = historyByQuote.get(entry.quoteId);
    if (!existing || entry.viewedAt > existing.viewedAt) {
      historyByQuote.set(entry.quoteId, entry);
    }
  }

  const history = [...historyByQuote.values()]
    .sort((left, right) => right.viewedAt.localeCompare(left.viewedAt))
    .slice(0, HISTORY_LIMIT);

  const advice = [...current.advice];
  const seenAdvice = new Set(advice.map((item) => item.text.toLowerCase()));
  for (const entry of incoming.advice) {
    const key = entry.text.toLowerCase();
    if (!seenAdvice.has(key)) {
      advice.push(entry);
      seenAdvice.add(key);
    }
  }

  return {
    version: LIBRARY_VERSION,
    favourites,
    collections,
    history,
    advice: advice.slice(-ADVICE_LIMIT),
  };
}

export interface BackupFile {
  app: 'lin4cre-quotes';
  schemaVersion: number;
  exportedAt: string;
  library: LibraryData;
  settings?: Settings;
}

export function createBackup(library: LibraryData, settings?: Settings): BackupFile {
  return {
    app: 'lin4cre-quotes',
    schemaVersion: LIBRARY_VERSION,
    exportedAt: new Date().toISOString(),
    library,
    ...(settings ? { settings } : {}),
  };
}

export class BackupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackupError';
  }
}

export interface ParsedBackup {
  library: LibraryData;
  warnings: string[];
}

/** Validates a pasted or uploaded backup. Throws BackupError with a user-safe message. */
export function parseBackup(text: string): ParsedBackup {
  if (!text.trim()) {
    throw new BackupError('That file is empty.');
  }
  if (text.length > 5_000_000) {
    throw new BackupError('That backup is too large to import.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new BackupError('That file is not valid JSON.');
  }

  if (!isRecord(parsed)) {
    throw new BackupError('This does not look like a LIN4CRE QUOTES backup.');
  }

  const candidate = 'library' in parsed ? parsed.library : parsed;

  if (!isRecord(candidate)) {
    throw new BackupError('This backup does not contain a library.');
  }

  const hasKnownFields =
    Array.isArray(candidate.favourites) ||
    Array.isArray(candidate.collections) ||
    Array.isArray(candidate.advice) ||
    Array.isArray(candidate.history);

  if (!hasKnownFields) {
    throw new BackupError('This backup has no favourites, collections or advice to import.');
  }

  const { library } = normaliseLibrary(candidate);
  const warnings: string[] = [];

  if (!('app' in parsed) || parsed.app !== 'lin4cre-quotes') {
    warnings.push('The file has no LIN4CRE QUOTES signature; it was imported as a plain library.');
  }

  if (typeof parsed.schemaVersion === 'number' && parsed.schemaVersion > LIBRARY_VERSION) {
    warnings.push(
      'The backup was created by a newer version of the app. Some details may be skipped.',
    );
  }

  const total = library.favourites.length + library.collections.length + library.advice.length;
  if (total === 0) {
    throw new BackupError('There was nothing to import in that backup.');
  }

  return { library, warnings };
}

export function exportLibraryAsJson(library: LibraryData, settings?: Settings): string {
  return JSON.stringify(createBackup(library, settings), null, 2);
}

export function exportFavouritesAsMarkdown(library: LibraryData): string {
  const lines: string[] = [
    '# LIN4CRE QUOTES — saved quotes',
    '',
    `Exported ${new Date().toISOString().slice(0, 10)}. ${library.favourites.length} saved quote${
      library.favourites.length === 1 ? '' : 's'
    }.`,
    '',
  ];

  if (library.favourites.length === 0) {
    lines.push('_No favourites saved yet._');
    return lines.join('\n');
  }

  for (const favourite of library.favourites) {
    const quote = quotesById.get(favourite.quoteId);
    if (!quote) continue;

    lines.push(`> ${quote.text}`);
    lines.push('');
    const attribution =
      quote.attribution === 'verified'
        ? ''
        : quote.attribution === 'disputed'
          ? ' _(disputed attribution)_'
          : quote.attribution === 'anonymous'
            ? ' _(proverb)_'
            : ' _(widely attributed)_';
    lines.push(`— **${quote.author}**${quote.source ? `, ${quote.source}` : ''}${attribution}`);
    if (favourite.note) {
      lines.push('');
      lines.push(`**Note:** ${favourite.note}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function validateCollectionName(
  name: string,
  collections: readonly Collection[],
  excludeId?: string,
): string | null {
  const trimmed = name.trim();

  if (!trimmed) return 'Give the collection a name.';
  if (trimmed.length > MAX_COLLECTION_NAME)
    return `Keep the name under ${MAX_COLLECTION_NAME} characters.`;

  const duplicate = collections.some(
    (collection) =>
      collection.id !== excludeId && collection.name.trim().toLowerCase() === trimmed.toLowerCase(),
  );

  return duplicate ? 'You already have a collection with that name.' : null;
}
