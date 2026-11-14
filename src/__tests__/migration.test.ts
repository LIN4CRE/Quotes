import { describe, expect, it } from 'vitest';

import { quotes } from '@/data/quotes';
import {
  BackupError,
  LIBRARY_VERSION,
  MAX_REFLECTION_TEXT,
  createEmptyLibrary,
  mergeLibraries,
  parseBackup,
  summariseBackup,
} from '@/lib/library';

const first = quotes[0]!;
const second = quotes[1]!;

/** A real v2 export shape: no reflections, collections without reflectionIds. */
const v2Library = {
  version: 2,
  favourites: [
    { quoteId: first.id, savedAt: '2025-01-04T09:15:00.000Z', note: 'Keep for the workshop.' },
    { quoteId: 'quote-that-no-longer-exists', savedAt: '2025-01-04T09:16:00.000Z' },
  ],
  collections: [
    {
      id: 'collection-old',
      name: 'Winter reading',
      description: 'A shortlist from last year.',
      quoteIds: [first.id, second.id, 'removed-quote'],
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-02T10:00:00.000Z',
    },
  ],
  history: [
    { quoteId: second.id, viewedAt: '2025-01-05T12:00:00.000Z' },
    { quoteId: 'missing-quote', viewedAt: '2025-01-05T12:01:00.000Z' },
  ],
  advice: [
    {
      id: 'advice-1',
      text: 'Take the smaller step.',
      savedAt: '2025-01-03T08:00:00.000Z',
      source: 'advice-slip',
    },
  ],
};

const v2Export = {
  app: 'lin4cre-quotes',
  schemaVersion: 2,
  exportedAt: '2025-01-06T00:00:00.000Z',
  library: v2Library,
};

describe('versioned backup import', () => {
  it('migrates a real v2 export to schema v3 without losing known items', () => {
    const parsed = parseBackup(JSON.stringify(v2Export));
    const preview = summariseBackup(parsed);

    expect(parsed.library.version).toBe(LIBRARY_VERSION);
    expect(parsed.library.reflections).toEqual([]);
    expect(parsed.library.favourites).toHaveLength(1);
    expect(parsed.library.favourites[0]?.note).toBe('Keep for the workshop.');
    expect(parsed.library.collections[0]).toMatchObject({
      id: 'collection-old',
      name: 'Winter reading',
      quoteIds: [first.id, second.id],
      reflectionIds: [],
    });
    expect(parsed.library.history).toHaveLength(1);
    expect(parsed.library.advice).toHaveLength(1);
    expect(preview).toMatchObject({
      favourites: 1,
      notes: 1,
      collections: 1,
      history: 1,
      advice: 1,
      reflections: 0,
    });
    expect(parsed.warnings).toEqual([]);
  });

  it('accepts an unwrapped v2 library object with a plain-library warning', () => {
    const parsed = parseBackup(JSON.stringify(v2Library));
    expect(parsed.library.favourites).toHaveLength(1);
    expect(parsed.warnings[0]).toContain('no LIN4CRE QUOTES signature');
  });

  it('previews a v3 reflection-only backup and preserves reflections', () => {
    const library = createEmptyLibrary();
    library.reflections.push({
      id: 'reflection-1',
      title: ' On attention ',
      text: '  What I keep returning to: attention is a form of generosity.  ',
      favourite: true,
      createdAt: '2025-02-01T10:00:00.000Z',
      updatedAt: '2025-02-01T10:00:00.000Z',
    });

    const parsed = parseBackup(
      JSON.stringify({ app: 'lin4cre-quotes', schemaVersion: 3, library }),
    );

    expect(summariseBackup(parsed)).toMatchObject({ favourites: 0, reflections: 1 });
    expect(parsed.library.reflections[0]).toMatchObject({
      title: 'On attention',
      text: 'What I keep returning to: attention is a form of generosity.',
      favourite: true,
    });
  });

  it.each([
    ['', 'That file is empty.'],
    ['{not json', 'That file is not valid JSON.'],
    ['[]', 'This does not look like a LIN4CRE QUOTES backup.'],
    ['{"hello":"world"}', 'This backup has no favourites, collections or advice to import.'],
    [
      '{"app":"lin4cre-quotes","schemaVersion":3,"library":{"favourites":[]}}',
      'There was nothing to import in that backup.',
    ],
  ])('rejects malformed input %#', (input, message) => {
    expect(() => parseBackup(input)).toThrow(BackupError);
    expect(() => parseBackup(input)).toThrow(message);
  });

  it('warns about a backup from a newer schema instead of silently accepting it', () => {
    const parsed = parseBackup(JSON.stringify({ ...v2Export, schemaVersion: LIBRARY_VERSION + 1 }));
    expect(parsed.warnings.join(' ')).toContain('newer version of the app');
  });

  it('caps overlong reflection text on import', () => {
    const parsed = parseBackup(
      JSON.stringify({
        app: 'lin4cre-quotes',
        schemaVersion: 3,
        library: {
          favourites: [{ quoteId: first.id, savedAt: '2025-01-04T09:15:00.000Z' }],
          reflections: [{ id: 'long', text: 'x'.repeat(MAX_REFLECTION_TEXT + 100) }],
        },
      }),
    );
    expect(parsed.library.reflections[0]?.text.length).toBe(MAX_REFLECTION_TEXT);
  });

  it('deduplicates favourites, collections, history, advice and reflections when merging', () => {
    const current = createEmptyLibrary();
    current.favourites.push({ quoteId: first.id, savedAt: '2025-01-01T00:00:00.000Z' });
    current.collections.push({
      id: 'collection-a',
      name: 'Ideas',
      description: '',
      quoteIds: [first.id],
      reflectionIds: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    });
    current.history.push({ quoteId: first.id, viewedAt: '2025-01-01T00:00:00.000Z' });
    current.advice.push({
      id: 'a1',
      text: 'Take the smaller step.',
      savedAt: '2025-01-01T00:00:00.000Z',
      source: 'advice-slip',
    });

    const incoming = createEmptyLibrary();
    incoming.favourites.push({
      quoteId: first.id,
      savedAt: '2025-02-01T00:00:00.000Z',
      note: 'A newer note.',
    });
    incoming.collections.push({
      id: 'collection-b',
      name: 'ideas',
      description: 'Merged by name.',
      quoteIds: [first.id, second.id],
      reflectionIds: [],
      createdAt: '2025-02-01T00:00:00.000Z',
      updatedAt: '2025-02-01T00:00:00.000Z',
    });
    incoming.history.push({ quoteId: first.id, viewedAt: '2025-02-01T00:00:00.000Z' });
    incoming.advice.push({
      id: 'a2',
      text: '  take the smaller step. ',
      savedAt: '2025-02-01T00:00:00.000Z',
      source: 'advice-slip',
    });

    const merged = mergeLibraries(current, incoming);

    expect(merged.favourites).toHaveLength(1);
    expect(merged.favourites[0]?.note).toBe('A newer note.');
    expect(merged.collections).toHaveLength(1);
    expect(merged.collections[0]?.quoteIds).toEqual([first.id, second.id]);
    expect(merged.history).toHaveLength(1);
    expect(merged.history[0]?.viewedAt).toBe('2025-02-01T00:00:00.000Z');
    expect(merged.advice).toHaveLength(1);
  });
});
