import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { quotes } from '@/data/quotes';
import { createEmptyLibrary } from '@/lib/library';
import { STORAGE_KEYS } from '@/lib/storage';
import { LibraryProvider, useLibrary } from '@/providers/LibraryProvider';

const first = quotes[0]!;
const second = quotes[1]!;

function wrapper({ children }: { children: ReactNode }) {
  return <LibraryProvider>{children}</LibraryProvider>;
}

function mountLibrary() {
  return renderHook(() => useLibrary(), { wrapper });
}

describe('library state and persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds and removes favourites and stores notes', () => {
    const { result } = mountLibrary();

    act(() => {
      expect(result.current.isFavourite(first.id)).toBe(false);
      expect(result.current.toggleFavourite(first.id)).toBe(true);
    });

    expect(result.current.isFavourite(first.id)).toBe(true);
    expect(result.current.library.favourites).toHaveLength(1);
    expect(result.current.library.favourites[0]?.savedAt).toMatch(/^\d{4}-/);

    act(() => result.current.setNote(first.id, '  Remember this for the talk.  '));
    expect(result.current.library.favourites[0]?.note).toBe('Remember this for the talk.');

    act(() => result.current.setNote(first.id, ''));
    expect(result.current.library.favourites[0]?.note).toBeUndefined();

    act(() => {
      expect(result.current.toggleFavourite(first.id)).toBe(false);
    });
    expect(result.current.library.favourites).toHaveLength(0);
  });

  it('creates collections, prevents duplicates and removes quotes', () => {
    const { result } = mountLibrary();
    let collectionId = '';

    act(() => {
      const created = result.current.createCollection('  Reading list  ', 'For later');
      expect(created?.name).toBe('Reading list');
      collectionId = created?.id ?? '';
    });

    act(() => {
      expect(result.current.createCollection('reading LIST')).toBeNull();
      expect(result.current.createCollection('   ')).toBeNull();
    });

    expect(result.current.library.collections).toHaveLength(1);

    act(() => {
      expect(result.current.addToCollection(collectionId, first.id)).toBe('added');
    });
    act(() => {
      expect(result.current.addToCollection(collectionId, first.id)).toBe('duplicate');
      expect(result.current.addToCollection('missing-collection', second.id)).toBe('missing');
    });
    expect(result.current.library.collections[0]?.quoteIds).toEqual([first.id]);

    act(() => result.current.removeFromCollection(collectionId, first.id));
    expect(result.current.library.collections[0]?.quoteIds).toEqual([]);

    act(() => result.current.updateCollection(collectionId, { name: 'Shortlist' }));
    expect(result.current.library.collections[0]?.name).toBe('Shortlist');

    act(() => result.current.deleteCollection(collectionId));
    expect(result.current.library.collections).toHaveLength(0);
  });

  it('keeps history unique, newest first and capped', () => {
    const { result } = mountLibrary();

    act(() => result.current.recordView(first.id));
    act(() => result.current.recordView(second.id));
    act(() => result.current.recordView(first.id));

    expect(result.current.library.history).toHaveLength(2);
    expect(result.current.library.history[0]?.quoteId).toBe(first.id);
    expect(result.current.library.history[1]?.quoteId).toBe(second.id);

    act(() => result.current.clearHistory());
    expect(result.current.library.history).toHaveLength(0);
  });

  it('prevents duplicate advice and timestamps saved entries', () => {
    const { result } = mountLibrary();

    act(() => {
      expect(result.current.addAdvice('  Walk before you scroll.  ')).toBe('added');
    });
    act(() => {
      expect(result.current.addAdvice('Walk   before you scroll.')).toBe('duplicate');
    });

    expect(result.current.library.advice).toHaveLength(1);
    expect(result.current.library.advice[0]?.text).toBe('Walk before you scroll.');
    expect(result.current.library.advice[0]?.savedAt).toMatch(/^\d{4}-/);
    expect(result.current.library.advice[0]?.source).toBe('advice-slip');
  });

  it('persists to local storage and rehydrates after a remount', async () => {
    const firstRender = mountLibrary();

    act(() => firstRender.result.current.toggleFavourite(second.id));

    await waitFor(() => {
      const raw = localStorage.getItem(STORAGE_KEYS.library);
      expect(raw).toBeTruthy();
      expect(JSON.parse(raw!)?.favourites).toHaveLength(1);
    });

    firstRender.unmount();

    const secondRender = mountLibrary();
    expect(secondRender.result.current.library.favourites).toHaveLength(1);
    expect(secondRender.result.current.library.favourites[0]?.quoteId).toBe(second.id);
  });

  it('migrates entries saved by the original g.html page once', async () => {
    localStorage.setItem(
      STORAGE_KEYS.legacyAdvice,
      JSON.stringify([
        { text: 'Sleep on it before replying.', savedAt: '2024-03-02T09:15:00.000Z' },
        { text: 'Sleep on it before replying.', savedAt: '2024-03-02T09:16:00.000Z' },
        { text: 'not a valid entry' },
      ]),
    );

    const { result } = mountLibrary();

    expect(result.current.library.advice).toHaveLength(1);
    expect(result.current.library.advice[0]?.text).toBe('Sleep on it before replying.');

    await waitFor(() => {
      expect(localStorage.getItem(STORAGE_KEYS.legacyAdvice)).toBeNull();
    });
  });

  it('merges imported data without dropping local notes', () => {
    const { result } = mountLibrary();

    act(() => result.current.toggleFavourite(first.id));
    act(() => result.current.setNote(first.id, 'My own note'));

    const incoming = createEmptyLibrary();
    incoming.favourites.push({
      quoteId: first.id,
      savedAt: '2024-01-01T00:00:00.000Z',
      note: 'Imported note',
    });
    incoming.favourites.push({
      quoteId: second.id,
      savedAt: '2024-01-01T00:00:00.000Z',
    });
    incoming.collections.push({
      id: 'col_imported',
      name: 'Imported',
      description: 'From another browser',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      quoteIds: [second.id],
      reflectionIds: [],
    });

    act(() => result.current.mergeImportedLibrary(incoming));

    expect(result.current.library.favourites).toHaveLength(2);
    expect(result.current.library.favourites[0]?.note).toBe('My own note');
    expect(result.current.library.collections[0]?.name).toBe('Imported');
  });

  it('clears the whole library while keeping the provider usable', () => {
    const { result } = mountLibrary();

    act(() => result.current.toggleFavourite(first.id));
    act(() => result.current.addAdvice('Keep a notebook.'));

    act(() => result.current.clearLibrary());

    expect(result.current.library).toEqual(createEmptyLibrary());
    expect(result.current.library.favourites).toHaveLength(0);
  });
});
