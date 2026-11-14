import { ArrowRight, Download, FileJson, Heart, SearchX, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { QuoteNote } from '@/components/library/NoteEditor';
import { AuthorAvatar } from '@/components/quotes/AuthorAvatar';
import { QuoteActions } from '@/components/quotes/QuoteActions';
import { Button, IconButton, LinkButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchField } from '@/components/ui/SearchField';
import { getQuote } from '@/data/quotes';
import { formatSavedAt } from '@/lib/dates';
import { datedFilename, downloadText } from '@/lib/download';
import { exportFavouritesAsMarkdown, exportLibraryAsJson } from '@/lib/library';
import { normalise } from '@/lib/search';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/providers/LibraryProvider';
import { useSettings } from '@/providers/SettingsProvider';
import { useToast } from '@/providers/ToastProvider';

type SortMode = 'recent' | 'oldest' | 'author';

export default function Favourites() {
  useDocumentTitle('Favourites');
  const { library, removeFavourite, storageAvailable } = useLibrary();
  const { settings } = useSettings();
  const { addToast } = useToast();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('recent');

  const entries = useMemo(() => {
    const list = library.favourites
      .map((favourite) => ({ favourite, quote: getQuote(favourite.quoteId) }))
      .filter(
        (
          entry,
        ): entry is { favourite: typeof entry.favourite; quote: NonNullable<typeof entry.quote> } =>
          Boolean(entry.quote),
      );

    const term = normalise(query);
    const filtered = term
      ? list.filter(({ quote }) => normalise(`${quote.text} ${quote.author}`).includes(term))
      : list;

    return [...filtered].sort((left, right) => {
      if (sort === 'author') return left.quote.author.localeCompare(right.quote.author);
      if (sort === 'oldest') return left.favourite.savedAt.localeCompare(right.favourite.savedAt);
      return right.favourite.savedAt.localeCompare(left.favourite.savedAt);
    });
  }, [library.favourites, query, sort]);

  const collectionsByQuote = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const collection of library.collections) {
      for (const quoteId of collection.quoteIds) {
        const names = map.get(quoteId) ?? [];
        names.push(collection.name);
        map.set(quoteId, names);
      }
    }
    return map;
  }, [library.collections]);

  const handleExportJson = () => {
    downloadText(
      exportLibraryAsJson(library, settings),
      datedFilename('lin4cre-quotes-backup', 'json'),
    );
    addToast({
      title: 'Backup downloaded',
      description: 'A JSON file with your favourites, collections and saved advice.',
      variant: 'success',
    });
  };

  const handleExportMarkdown = () => {
    downloadText(
      exportFavouritesAsMarkdown(library),
      datedFilename('lin4cre-quotes-favourites', 'md'),
      'text/markdown',
    );
    addToast({ title: 'Markdown downloaded', variant: 'success' });
  };

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Your library"
        title="Favourites"
        description={
          library.favourites.length > 0
            ? `${library.favourites.length} saved quote${library.favourites.length === 1 ? '' : 's'}, stored in this browser only. Add notes, file them into collections, or export a backup.`
            : 'Saved quotes live here. They are stored in this browser and never uploaded.'
        }
        actions={
          library.favourites.length > 0 ? (
            <>
              <Button variant="secondary" onClick={handleExportJson}>
                <FileJson className="size-4" aria-hidden />
                Export JSON
              </Button>
              <Button variant="outline" onClick={handleExportMarkdown}>
                <Download className="size-4" aria-hidden />
                Export Markdown
              </Button>
            </>
          ) : null
        }
      />

      {library.favourites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          description="Tap the heart on any quote to keep it here. Favourites work offline, never require an account and never leave this device."
          action={
            <>
              <LinkButton to="/">Discover a quote</LinkButton>
              <LinkButton to="/explore" variant="secondary">
                Browse themes
              </LinkButton>
            </>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchField
              id="favourites-search"
              value={query}
              onChange={setQuery}
              label="Search favourites"
              placeholder="Search your saved quotes…"
              className="w-full sm:max-w-sm"
            />
            <div className="flex items-center gap-2">
              <label htmlFor="favourites-sort" className="text-[11.5px] text-subtle">
                Sort
              </label>
              <select
                id="favourites-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortMode)}
                className="field h-10 w-auto py-0 pr-8 text-[12.5px]"
              >
                <option value="recent">Recently saved</option>
                <option value="oldest">Oldest first</option>
                <option value="author">Author A–Z</option>
              </select>
            </div>
          </div>

          {!storageAvailable ? (
            <p className="mt-3 rounded-xl border border-danger/25 bg-danger/5 px-3 py-2 text-[11.5px] text-danger">
              Local storage is unavailable, so these saves will not survive a refresh.
            </p>
          ) : null}

          <p className="mt-3 text-[11.5px] text-subtle" aria-live="polite">
            Showing {entries.length} of {library.favourites.length} saved quote
            {library.favourites.length === 1 ? '' : 's'}.
          </p>

          {entries.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                icon={SearchX}
                compact
                title="No saved quotes match that search"
                description="Try a different word, or clear the search field."
                action={
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="text-sm font-medium text-accent underline underline-offset-4"
                  >
                    Clear search
                  </button>
                }
              />
            </div>
          ) : (
            <ul className="mt-5 space-y-4">
              {entries.map(({ favourite, quote }) => {
                const collectionNames = collectionsByQuote.get(quote.id) ?? [];
                return (
                  <li
                    key={quote.id}
                    className="relative overflow-hidden rounded-3xl border border-line bg-surface p-5 sm:p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link to={`/quote/${quote.id}`} className="flex min-w-0 items-center gap-2.5">
                        <AuthorAvatar name={quote.author} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate text-[12.5px] font-medium text-ink">
                            {quote.author}
                          </span>
                          <span className="block text-[10.5px] text-subtle">
                            Saved {formatSavedAt(favourite.savedAt)}
                          </span>
                        </span>
                      </Link>
                      <div className="flex items-center gap-1">
                        <QuoteActions
                          quote={quote}
                          showImage={false}
                          extra={
                            <IconButton
                              label="Remove saved quote"
                              size="sm"
                              onClick={() => {
                                removeFavourite(quote.id);
                                addToast({ title: 'Removed from favourites', variant: 'info' });
                              }}
                            >
                              <Trash2 className="size-4" aria-hidden />
                            </IconButton>
                          }
                        />
                      </div>
                    </div>

                    <Link to={`/quote/${quote.id}`} className="mt-4 block">
                      <p className="quote-body text-[1.15rem] text-ink sm:text-[1.3rem]">
                        “{quote.text}”
                      </p>
                    </Link>

                    <QuoteNote quoteId={quote.id} note={favourite.note} />

                    {collectionNames.length > 0 ? (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10.5px] text-subtle">In:</span>
                        {collectionNames.map((name) => (
                          <span key={name} className="chip px-2 py-0.5 text-[10px]">
                            {name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/60 px-5 py-4">
            <p className="text-[11.5px] text-muted">
              These saves are local to this browser. Export a backup before clearing site data or
              switching devices.
            </p>
            <Link
              to="/settings"
              className="inline-flex items-center gap-1 text-[11.5px] font-medium text-accent transition hover:underline"
            >
              Data and backup settings
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
