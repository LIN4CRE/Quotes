import { ArrowRight, SearchX, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { AuthorCard } from '@/components/library/CollectionCards';
import { AuthorAvatar } from '@/components/quotes/AuthorAvatar';
import { QuoteActions } from '@/components/quotes/QuoteActions';
import { AttributionBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchField } from '@/components/ui/SearchField';
import { authorList } from '@/data/authors';
import { categories, getCategory, isCategoryId } from '@/data/categories';
import { quotes } from '@/data/quotes';
import { highlightParts, normalise, searchQuotes } from '@/lib/search';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSettings } from '@/providers/SettingsProvider';
import type { AttributionStatus, CategoryId, Quote } from '@/types';

const attributionOptions: Array<{ value: AttributionStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All attributions' },
  { value: 'verified', label: 'Verified sources' },
  { value: 'attributed', label: 'Widely attributed' },
  { value: 'disputed', label: 'Disputed' },
  { value: 'anonymous', label: 'Proverbs' },
];

const suggestions = [
  'courage',
  'love',
  'wisdom',
  'stoic',
  'writing',
  'happiness',
  'failure',
  'kindness',
];

export default function SearchPage() {
  useDocumentTitle('Search');
  const [params, setParams] = useSearchParams();
  const { settings } = useSettings();

  const paramQuery = params.get('q') ?? '';
  const paramCategory = params.get('category') ?? 'all';
  const [query, setQuery] = useState(paramQuery);
  const [category, setCategory] = useState<CategoryId | 'all'>(
    isCategoryId(paramCategory) ? paramCategory : 'all',
  );
  const [attribution, setAttribution] = useState<AttributionStatus | 'all'>('all');
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const next = new URLSearchParams(params);
      if (query.trim()) next.set('q', query.trim());
      else next.delete('q');
      if (category !== 'all') next.set('category', category);
      else next.delete('category');

      if (next.toString() !== params.toString()) {
        setParams(next, { replace: true });
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [query, category, params, setParams]);

  const hideDisputed = !settings.showDisputed && attribution !== 'disputed';

  const results = useMemo(
    () =>
      searchQuotes(deferredQuery, {
        category,
        attribution,
        hideDisputed,
      }),
    [deferredQuery, category, attribution, hideDisputed],
  );

  const matchingAuthors = useMemo(() => {
    const term = normalise(deferredQuery);
    if (!term) return [];
    return authorList.filter((author) => normalise(author.name).includes(term)).slice(0, 4);
  }, [deferredQuery]);

  const trimmed = deferredQuery.trim();
  const hasFilters = category !== 'all' || attribution !== 'all' || Boolean(trimmed);

  const reset = () => {
    setQuery('');
    setCategory('all');
    setAttribution('all');
  };

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Search"
        title="Find the right words"
        description={`Search ${quotes.length} quotes by text, author, theme or source. Results show the source note so you can judge each attribution.`}
      />

      <div className="sticky top-16 z-20 -mx-4 bg-canvas/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 md:top-0 lg:-mx-10 lg:px-10">
        <SearchField
          id="library-search"
          value={query}
          onChange={setQuery}
          autoFocus
          onSubmit={() => undefined}
          placeholder="Try “courage”, “Rumi”, or a phrase you remember…"
          className="mx-auto max-w-3xl"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-subtle">
          <SlidersHorizontal className="size-3.5" aria-hidden />
          Filters
        </div>
        <label htmlFor="search-category" className="sr-only">
          Filter by theme
        </label>
        <select
          id="search-category"
          value={category}
          onChange={(event) => setCategory(event.target.value as CategoryId | 'all')}
          className="field h-9 w-auto py-0 pr-8 pl-3 text-[12px]"
        >
          <option value="all">All themes</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <label htmlFor="search-attribution" className="sr-only">
          Filter by attribution
        </label>
        <select
          id="search-attribution"
          value={attribution}
          onChange={(event) => setAttribution(event.target.value as AttributionStatus | 'all')}
          className="field h-9 w-auto py-0 pr-8 pl-3 text-[12px]"
        >
          {attributionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {hasFilters ? (
          <button
            type="button"
            onClick={reset}
            className="text-[11.5px] text-muted underline decoration-line-strong underline-offset-4 transition hover:text-ink"
          >
            Reset
          </button>
        ) : null}
      </div>

      <p className="mt-4 text-[12px] text-subtle" aria-live="polite" role="status">
        {trimmed
          ? `${results.length} quote${results.length === 1 ? '' : 's'} matching “${trimmed}”`
          : `${results.length} quotes in view`}
        {matchingAuthors.length > 0
          ? ` · ${matchingAuthors.length} author${matchingAuthors.length === 1 ? '' : 's'}`
          : ''}
        {hideDisputed ? ' · disputed attributions hidden' : ''}
      </p>

      {!trimmed && !hasFilters ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="rounded-3xl border border-line bg-surface p-6">
            <p className="label-caps flex items-center gap-2">
              <Sparkles className="size-3.5 text-accent" aria-hidden />
              Suggestions
            </p>
            <h2 className="mt-2 font-serif text-2xl text-ink">Start with a word</h2>
            <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted">
              Search is instant and works offline. Try one of these:
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setQuery(suggestion)}
                  className="chip px-3 py-1.5 text-[12px] transition hover:border-accent/40 hover:text-ink"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label-caps mb-2">Browse themes</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.slice(0, 8).map((item) => (
                <Link
                  key={item.id}
                  to={`/category/${item.id}`}
                  className="rounded-xl border border-line bg-surface px-3 py-2.5 text-[12px] text-muted transition hover:border-line-strong hover:text-ink"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {trimmed && matchingAuthors.length > 0 ? (
        <section className="mt-8" aria-labelledby="author-results">
          <h2
            id="author-results"
            className="mb-3 text-[13px] font-semibold tracking-wide text-muted uppercase"
          >
            Authors
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {matchingAuthors.map((author) => (
              <AuthorCard key={author.id} authorId={author.id} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8" aria-label="Quote results">
        {results.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No quotes found"
            description={
              trimmed
                ? `Nothing matched “${trimmed}”${category !== 'all' ? ` in ${getCategory(category)?.name}` : ''}. Try a shorter word, an author's surname, or clear the filters.`
                : 'No quotes match the current filters.'
            }
            action={
              <>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex h-10 items-center rounded-full border border-line bg-surface-2 px-4 text-sm font-medium text-ink transition hover:border-line-strong"
                >
                  Clear search and filters
                </button>
                <Link
                  to="/explore"
                  className="inline-flex h-10 items-center gap-1 rounded-full px-3 text-sm text-muted transition hover:text-ink"
                >
                  Browse themes
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </>
            }
          />
        ) : (
          <ul className="space-y-4">
            {results.slice(0, 60).map((quote) => (
              <li key={quote.id}>
                <SearchResultCard quote={quote} query={trimmed} />
              </li>
            ))}
          </ul>
        )}

        {results.length > 60 ? (
          <p className="mt-6 text-center text-[11.5px] text-subtle">
            Showing the 60 strongest matches. Add a filter or a more specific phrase to narrow the
            list.
          </p>
        ) : null}
      </section>
    </div>
  );
}

function SearchResultCard({ quote, query }: { quote: Quote; query: string }) {
  const parts = highlightParts(quote.text, query);

  return (
    <article className="relative overflow-hidden rounded-3xl border border-line bg-surface p-5 transition hover:border-line-strong sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {quote.categories.slice(0, 2).map((categoryId) => {
          const category = getCategory(categoryId);
          if (!category) return null;
          return (
            <Link
              key={categoryId}
              to={`/category/${categoryId}`}
              className="chip transition hover:border-line-strong hover:text-ink"
            >
              {category.name}
            </Link>
          );
        })}
        <AttributionBadge status={quote.attribution} compact className="ml-auto" />
      </div>

      <blockquote className="mt-3">
        <Link to={`/quote/${quote.id}`} className="block">
          <p className="quote-body text-[1.15rem] text-ink sm:text-[1.3rem]">
            “
            {parts.map((part, index) =>
              part.match ? (
                <mark
                  key={`${part.text}-${index}`}
                  className="rounded bg-accent/15 px-0.5 text-accent-strong"
                >
                  {part.text}
                </mark>
              ) : (
                <span key={`${part.text}-${index}`}>{part.text}</span>
              ),
            )}
            ”
          </p>
        </Link>
      </blockquote>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Link to={`/author/${quote.authorId}`} className="flex min-w-0 items-center gap-2.5">
          <AuthorAvatar name={quote.author} size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-[12.5px] font-medium text-ink">
              {quote.author}
            </span>
            <span className="block truncate text-[10.5px] text-subtle">
              {quote.source ?? 'Source unlisted'}
            </span>
          </span>
        </Link>
        <QuoteActions quote={quote} />
      </div>
    </article>
  );
}
