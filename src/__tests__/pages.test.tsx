import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { quotes } from '@/data/quotes';
import { createEmptyLibrary, exportLibraryAsJson } from '@/lib/library';
import { STORAGE_KEYS } from '@/lib/storage';
import Collections from '@/pages/Collections';
import CollectionDetail from '@/pages/CollectionDetail';
import Favourites from '@/pages/Favourites';
import SearchPage from '@/pages/SearchPage';
import Settings from '@/pages/Settings';
import { renderWithProviders } from '@/test/render';

const first = quotes[0]!;
const second = quotes[1]!;

vi.mock('@/lib/download', () => ({
  downloadText: vi.fn(),
  downloadBlob: vi.fn(),
  datedFilename: (base: string, extension: string) => `${base}.${extension}`,
}));

import { downloadText } from '@/lib/download';

function seedLibrary(overrides: Partial<ReturnType<typeof createEmptyLibrary>> = {}) {
  const library = { ...createEmptyLibrary(), ...overrides };
  localStorage.setItem(STORAGE_KEYS.library, JSON.stringify(library));
  return library;
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('search page', () => {
  it('searches text and authors from the URL', async () => {
    renderWithProviders(<SearchPage />, '/search?q=rumi');

    expect(screen.getByRole('heading', { name: 'Find the right words' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/matching “rumi”/);
    expect(screen.getByRole('heading', { name: 'Authors' })).toBeInTheDocument();
    expect(screen.getAllByText('Rumi').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Search quotes')).toHaveValue('rumi');
  });

  it('filters by theme and reports the state live', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchPage />, '/search');

    await user.selectOptions(screen.getByLabelText('Filter by theme'), 'humour');

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/quotes in view/);
    });
    expect(screen.queryByText('No quotes found')).not.toBeInTheDocument();
  });

  it('shows a helpful empty state for a hopeless query', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchPage />, '/search');

    await user.type(screen.getByLabelText('Search quotes'), 'zzzz-no-quote-matches');
    expect(await screen.findByText('No quotes found')).toBeInTheDocument();
    expect(screen.getByText(/Nothing matched “zzzz-no-quote-matches”/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear search and filters' }));
    expect(screen.queryByText('No quotes found')).not.toBeInTheDocument();
  });
});

describe('favourites page', () => {
  it('lists saved quotes with notes and collection membership', () => {
    seedLibrary({
      favourites: [
        { quoteId: first.id, savedAt: new Date().toISOString(), note: 'Saved for later' },
      ],
      collections: [
        {
          id: 'col_1',
          name: 'Morning pages',
          description: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          quoteIds: [first.id],
        },
      ],
    });

    renderWithProviders(<Favourites />);

    expect(screen.getByRole('heading', { name: 'Favourites' })).toBeInTheDocument();
    expect(screen.getByText(`“${first.text}”`)).toBeInTheDocument();
    expect(screen.getByText('Saved for later')).toBeInTheDocument();
    expect(screen.getByText('Morning pages')).toBeInTheDocument();
  });

  it('removes a saved quote and falls back to the empty state', async () => {
    const user = userEvent.setup();
    seedLibrary({
      favourites: [{ quoteId: first.id, savedAt: new Date().toISOString() }],
    });

    renderWithProviders(<Favourites />);
    await user.click(screen.getByRole('button', { name: 'Remove saved quote' }));

    expect(await screen.findByText('Nothing saved yet')).toBeInTheDocument();
  });

  it('exports a JSON backup and a Markdown list', async () => {
    const user = userEvent.setup();
    seedLibrary({
      favourites: [
        { quoteId: first.id, savedAt: new Date().toISOString(), note: 'A private note' },
      ],
    });

    renderWithProviders(<Favourites />);
    await user.click(screen.getByRole('button', { name: /Export JSON/i }));

    expect(downloadText).toHaveBeenCalledTimes(1);
    const [payload, filename] = vi.mocked(downloadText).mock.calls[0] as [string, string];
    expect(filename).toBe('lin4cre-quotes-backup.json');
    const parsed = JSON.parse(payload) as { app: string; library: { favourites: unknown[] } };
    expect(parsed.app).toBe('lin4cre-quotes');
    expect(parsed.library.favourites).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: /Export Markdown/i }));
    expect(downloadText).toHaveBeenCalledTimes(2);
    const markdown = vi.mocked(downloadText).mock.calls[1]?.[0] as string;
    expect(markdown).toContain(first.text);
    expect(markdown).toContain('A private note');
  });
});

describe('collections', () => {
  it('creates a collection, renames it and deletes it', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/:collectionId" element={<CollectionDetail />} />
      </Routes>,
      '/collections',
    );

    expect(screen.getByText('No collections yet')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'New collection' }));
    await user.type(screen.getByLabelText('Name'), 'Leadership notes');
    await user.type(screen.getByLabelText(/Description/i), 'For the team offsite');
    await user.click(screen.getByRole('button', { name: 'Create collection' }));

    expect(await screen.findByRole('heading', { name: 'Leadership notes' })).toBeInTheDocument();
    expect(screen.getByText('This collection is empty')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit collection' }));
    const dialog = screen.getByRole('dialog');
    const nameField = within(dialog).getByLabelText('Name');
    await user.clear(nameField);
    await user.type(nameField, 'Offsite notes');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('heading', { name: 'Offsite notes' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete collection' }));
    const confirm = screen.getByRole('dialog');
    await user.click(within(confirm).getByRole('button', { name: 'Delete collection' }));

    expect(await screen.findByRole('heading', { name: 'Collections' })).toBeInTheDocument();
    expect(screen.getByText('No collections yet')).toBeInTheDocument();
  });

  it('lists quotes inside a collection and removes one', async () => {
    const user = userEvent.setup();
    seedLibrary({
      collections: [
        {
          id: 'col_reading',
          name: 'Reading',
          description: 'Worth revisiting',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          quoteIds: [first.id, second.id],
        },
      ],
    });

    renderWithProviders(
      <Routes>
        <Route path="/collections/:collectionId" element={<CollectionDetail />} />
      </Routes>,
      '/collections/col_reading',
    );

    expect(screen.getByText(`“${first.text}”`)).toBeInTheDocument();
    expect(screen.getByText(`“${second.text}”`)).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Remove from this collection' })[0]!);

    await waitFor(() => {
      expect(screen.queryByText(`“${first.text}”`)).not.toBeInTheDocument();
    });
  });

  it('handles a missing collection', () => {
    renderWithProviders(
      <Routes>
        <Route path="/collections/:collectionId" element={<CollectionDetail />} />
      </Routes>,
      '/collections/nope',
    );

    expect(screen.getByRole('heading', { name: 'Collection not found' })).toBeInTheDocument();
  });
});

describe('settings data management', () => {
  it('exports the library as JSON', async () => {
    const user = userEvent.setup();
    seedLibrary({
      favourites: [{ quoteId: first.id, savedAt: new Date().toISOString() }],
    });

    renderWithProviders(<Settings />);
    await user.click(screen.getByRole('button', { name: /Export backup/i }));

    expect(downloadText).toHaveBeenCalledTimes(1);
    const payload = vi.mocked(downloadText).mock.calls[0]?.[0] as string;
    expect(JSON.parse(payload).library.favourites).toHaveLength(1);
  });

  it('imports a pasted backup and merges it with local data', async () => {
    const user = userEvent.setup();
    seedLibrary();

    const incoming = createEmptyLibrary();
    incoming.favourites.push(
      { quoteId: first.id, savedAt: '2024-06-01T10:00:00.000Z' },
      { quoteId: second.id, savedAt: '2024-06-02T10:00:00.000Z' },
    );

    renderWithProviders(<Settings />);
    await user.click(screen.getByRole('button', { name: 'Paste JSON' }));

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Backup JSON'), {
      target: { value: exportLibraryAsJson(incoming) },
    });
    await user.click(within(dialog).getByRole('button', { name: 'Import' }));

    expect(await screen.findByText('Backup imported')).toBeInTheDocument();
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.library)!) as {
        favourites: unknown[];
      };
      expect(stored.favourites).toHaveLength(2);
    });
  });

  it('reports invalid JSON instead of silently doing nothing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Settings />);

    await user.click(screen.getByRole('button', { name: 'Paste JSON' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Backup JSON'), {
      target: { value: '{not json' },
    });
    await user.click(within(dialog).getByRole('button', { name: 'Import' }));

    expect(within(dialog).getByRole('alert')).toHaveTextContent('not valid JSON');
  });

  it('clears all saved data only after confirmation', async () => {
    const user = userEvent.setup();
    seedLibrary({
      favourites: [{ quoteId: first.id, savedAt: new Date().toISOString(), note: 'Keep me' }],
    });

    renderWithProviders(<Settings />);
    await user.click(screen.getByRole('button', { name: /Clear all saved data/i }));

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Clear everything' }));

    expect(await screen.findByText('Library cleared')).toBeInTheDocument();
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.library)!) as {
        favourites: unknown[];
      };
      expect(stored.favourites).toHaveLength(0);
    });
  });

  it('changes theme, text size and motion preferences', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Settings />);

    await user.click(screen.getByRole('radio', { name: /Light/ }));
    expect(document.documentElement.dataset.theme).toBe('light');

    await user.click(screen.getByRole('button', { name: 'Large' }));
    expect(document.documentElement.dataset.font).toBe('lg');

    await user.click(screen.getByRole('switch', { name: /Reduce motion/i }));
    expect(document.documentElement.dataset.motion).toBe('reduced');
  });
});
