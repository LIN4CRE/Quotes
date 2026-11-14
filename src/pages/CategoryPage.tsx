import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { QuoteList } from '@/components/quotes/QuoteList';
import { LinkButton } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchField } from '@/components/ui/SearchField';
import { getCategory, isCategoryId } from '@/data/categories';
import { quoteCountByCategory, quotes } from '@/data/quotes';
import { searchQuotes } from '@/lib/search';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSettings } from '@/providers/SettingsProvider';
import { cn } from '@/lib/cn';
import { toneStyles } from '@/lib/tones';
import type { AttributionStatus } from '@/types';

const attributionOptions: Array<{ value: AttributionStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All attributions' },
  { value: 'verified', label: 'Verified sources' },
  { value: 'attributed', label: 'Widely attributed' },
  { value: 'disputed', label: 'Disputed' },
  { value: 'anonymous', label: 'Proverbs' },
];

export default function CategoryPage() {
  const { categoryId = '' } = useParams();
  const { settings } = useSettings();
  const [query, setQuery] = useState('');
  const [attribution, setAttribution] = useState<AttributionStatus | 'all'>('all');

  const category = isCategoryId(categoryId) ? getCategory(categoryId) : undefined;
  useDocumentTitle(category?.name ?? 'Theme');

  const hideDisputed = !settings.showDisputed && attribution !== 'disputed';

  const results = useMemo(() => {
    if (!category) return [];
    return searchQuotes(query, {
      category: category.id,
      attribution,
      hideDisputed,
    });
  }, [category, query, attribution, hideDisputed]);

  if (!category) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="display-title text-3xl text-ink">Theme not found</h1>
        <p className="mt-3 text-sm text-muted">
          That theme does not exist in this library. Browse the full list instead.
        </p>
        <LinkButton to="/explore" className="mt-6">
          <ArrowLeft className="size-4" aria-hidden />
          Back to Explore
        </LinkButton>
      </div>
    );
  }

  const tone = toneStyles[category.tone];
  const total = quoteCountByCategory.get(category.id) ?? 0;

  return (
    <div className="animate-rise">
      <nav aria-label="Breadcrumb" className="mb-5">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-[12px] text-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Explore themes
        </Link>
      </nav>

      <div className="relative isolate overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <span
          className={cn(
            'pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br opacity-80',
            tone.gradient,
          )}
          aria-hidden
        />
        <span
          className={cn(
            'absolute -top-16 -right-10 -z-10 size-56 rounded-full blur-3xl',
            tone.glow,
          )}
          aria-hidden
        />
        <PageHeader
          eyebrow="Theme"
          title={category.name}
          description={category.description}
          className="mb-0"
          actions={
            <span className="chip">
              {total} quote{total === 1 ? '' : 's'} in this theme
            </span>
          }
        />
      </div>

      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchField
          id="category-search"
          value={query}
          onChange={setQuery}
          label={`Search ${category.name} quotes`}
          placeholder={`Search ${category.name.toLowerCase()} quotes…`}
          className="w-full lg:max-w-md"
        />
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 shrink-0 text-subtle" aria-hidden />
          <label htmlFor="category-attribution" className="sr-only">
            Filter by attribution
          </label>
          <select
            id="category-attribution"
            value={attribution}
            onChange={(event) => setAttribution(event.target.value as AttributionStatus | 'all')}
            className="field h-10 w-auto py-0 pr-8 text-[12.5px]"
          >
            {attributionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-3 text-[11.5px] text-subtle" aria-live="polite">
        Showing {results.length} of {total} quotes
        {query.trim() ? ` matching “${query.trim()}”` : ''}.
        {hideDisputed ? ' Disputed attributions are hidden in Settings.' : ''}
      </p>

      <div className="mt-5">
        {results.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line px-6 py-14 text-center">
            <h2 className="text-lg font-medium text-ink">No quotes match those filters</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Try a different word, or reset the attribution filter to see everything in{' '}
              {category.name}.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setAttribution('all');
              }}
              className="mt-5 text-sm font-medium text-accent underline underline-offset-4"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <QuoteList
            quotes={results}
            pageSize={10}
            resetKey={`${query}|${attribution}|${settings.showDisputed}`}
          />
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-2">
        <span className="text-[11.5px] text-subtle">Keep exploring:</span>
        {quotes.length > 0
          ? Array.from(new Set(quotes.flatMap((quote) => quote.categories)))
              .filter((id) => id !== category.id)
              .slice(0, 4)
              .map((id) => {
                const related = getCategory(id);
                if (!related) return null;
                return (
                  <Link
                    key={id}
                    to={`/category/${id}`}
                    className="chip transition hover:border-line-strong hover:text-ink"
                  >
                    {related.name}
                  </Link>
                );
              })
          : null}
      </div>
    </div>
  );
}
