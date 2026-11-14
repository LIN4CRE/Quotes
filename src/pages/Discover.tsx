import {
  ArrowRight,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Shuffle,
  Sparkles,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { CategoryCard } from '@/components/discover/CategoryCard';
import { CuratedCollectionCard } from '@/components/library/CollectionCards';
import { AuthorAvatar } from '@/components/quotes/AuthorAvatar';
import { QuoteCard } from '@/components/quotes/QuoteCard';
import { Button, IconButton, LinkButton } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/PageHeader';
import { categories } from '@/data/categories';
import { curatedCollections } from '@/data/collections';
import { getQuote, quotes } from '@/data/quotes';
import { getDailyQuote } from '@/lib/dailyQuote';
import { formatLongDate, relativeTime } from '@/lib/dates';
import { pickRandom, shuffle } from '@/lib/random';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/providers/LibraryProvider';

export default function Discover() {
  useDocumentTitle();
  const { library } = useLibrary();
  const [daily] = useState(() => getDailyQuote());
  const [deck, setDeck] = useState<string[]>(() => shuffle(quotes.map((quote) => quote.id)));
  const [position, setPosition] = useState(0);

  const current = getQuote(deck[position] ?? '') ?? quotes[0];
  const canGoBack = position > 0;
  const total = deck.length;

  const next = useCallback(() => {
    setPosition((index) => (index + 1 < total ? index + 1 : 0));
  }, [total]);

  const previous = useCallback(() => {
    setPosition((index) => Math.max(0, index - 1));
  }, []);

  const refresh = useCallback(() => {
    const chosen = pickRandom(quotes, (quote) => quote.id === current?.id);
    if (!chosen) return;
    setDeck([
      chosen.id,
      ...shuffle(quotes.filter((quote) => quote.id !== chosen.id).map((quote) => quote.id)),
    ]);
    setPosition(0);
  }, [current?.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        previous();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [next, previous]);

  const recent = library.history
    .slice(0, 2)
    .map((entry) => getQuote(entry.quoteId))
    .filter((quote): quote is NonNullable<typeof quote> => Boolean(quote));

  const latestAdvice = library.advice[library.advice.length - 1];

  if (!daily || !current) return null;

  return (
    <div className="animate-rise">
      <section aria-labelledby="discover-title">
        <p className="label-caps flex items-center gap-2">
          <Sparkles className="size-3.5 text-accent" aria-hidden />
          {formatLongDate(new Date())}
        </p>
        <h1
          id="discover-title"
          className="display-title mt-3 max-w-3xl text-[2.6rem] sm:text-[4rem]"
        >
          Find a line that <span className="text-accent italic">stays</span> with you.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-[15px]">
          A curated library of quotes with their sources checked. Save what matters, group it into
          collections, and make something worth sharing.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <LinkButton to="/explore" size="md">
            Explore the library
            <ArrowRight className="size-4" aria-hidden />
          </LinkButton>
          <Button variant="secondary" onClick={refresh}>
            <Shuffle className="size-4" aria-hidden />
            Surprise me
          </Button>
          <Link
            to="/favourites"
            className="ml-1 inline-flex items-center gap-1.5 rounded-full px-2 py-2 text-[13px] text-muted transition hover:text-ink"
          >
            <BookMarked className="size-4" aria-hidden />
            {library.favourites.length} saved
          </Link>
        </div>
      </section>

      <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <section aria-labelledby="daily-quote-label" className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p id="daily-quote-label" className="label-caps flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden />
              Quote of the day
            </p>
            <span className="text-[10.5px] text-subtle">Changes at local midnight</span>
          </div>
          <QuoteCard quote={daily} variant="feature" headingLevel="h2" />
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-subtle">
            <ShieldCheck className="size-3.5" aria-hidden />
            Attribution is labelled on every quote — verified, attributed or disputed.
          </p>
        </section>

        <aside
          aria-labelledby="surprise-label"
          className="relative flex min-w-0 flex-col overflow-hidden rounded-3xl border border-line bg-surface p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <p id="surprise-label" className="label-caps flex items-center gap-2">
              <Shuffle className="size-3.5 text-accent" aria-hidden />
              Surprise me
            </p>
            <span className="rounded-full border border-line bg-surface-2 px-2 py-0.5 text-[10px] text-subtle tabular-nums">
              {position + 1} / {total}
            </span>
          </div>

          <div className="mt-5 flex-1">
            <blockquote>
              <Link to={`/quote/${current.id}`} className="block">
                <p className="quote-body text-[1.35rem] text-ink transition hover:text-white sm:text-[1.5rem]">
                  “{current.text}”
                </p>
              </Link>
            </blockquote>
            <Link
              to={`/author/${current.authorId}`}
              className="mt-4 flex items-center gap-2.5 rounded-lg"
            >
              <AuthorAvatar name={current.author} size="sm" />
              <span className="min-w-0">
                <span className="block truncate text-[12.5px] font-medium text-ink">
                  {current.author}
                </span>
                <span className="block truncate text-[10.5px] text-subtle">
                  {current.source ?? 'Source unlisted'}
                </span>
              </span>
            </Link>
          </div>

          <div className="mt-5 flex items-center justify-between gap-2 border-t border-line pt-3">
            <div className="flex items-center gap-1">
              <IconButton label="Previous quote" size="sm" onClick={previous} disabled={!canGoBack}>
                <ChevronLeft className="size-4" aria-hidden />
              </IconButton>
              <IconButton label="Next quote" size="sm" onClick={next}>
                <ChevronRight className="size-4" aria-hidden />
              </IconButton>
              <IconButton label="Shuffle a new quote" size="sm" onClick={refresh}>
                <Shuffle className="size-4" aria-hidden />
              </IconButton>
            </div>
            <Link
              to={`/quote/${current.id}`}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-muted transition hover:text-ink"
            >
              Open quote
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          <p className="mt-2 text-[10px] text-subtle">Tip: use ← and → to move through quotes.</p>
        </aside>
      </div>

      <section className="mt-14" aria-labelledby="featured-collections-heading">
        <SectionHeader
          id="featured-collections-heading"
          title="Featured collections"
          description="Small, deliberate sets — save one to your own library in a click."
          action={
            <Link
              to="/collections"
              className="inline-flex items-center gap-1 text-[12px] text-muted transition hover:text-ink"
            >
              All collections
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {curatedCollections.slice(0, 3).map((collection) => (
            <CuratedCollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="themes-heading">
        <SectionHeader
          id="themes-heading"
          title="Browse by theme"
          description="From motivation to humour — every theme has real, sourced quotes."
          action={
            <Link
              to="/explore"
              className="inline-flex items-center gap-1 text-[12px] text-muted transition hover:text-ink"
            >
              All 15 themes
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categories.slice(0, 6).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {recent.length > 0 ? (
        <section className="mt-14" aria-labelledby="recent-heading">
          <SectionHeader
            id="recent-heading"
            title="Recently viewed"
            description="Picks up where you left off — stored only on this device."
            action={
              <Link
                to="/history"
                className="inline-flex items-center gap-1 text-[12px] text-muted transition hover:text-ink"
              >
                Full history
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            }
          />
          <div className="grid gap-3 md:grid-cols-2">
            {recent.map((quote) => {
              const viewedAt = library.history.find(
                (entry) => entry.quoteId === quote.id,
              )?.viewedAt;
              return (
                <QuoteCard key={quote.id} quote={quote} variant="compact" showCategories={false}>
                  {viewedAt ? (
                    <p className="mt-3 text-[10.5px] text-subtle">
                      Viewed {relativeTime(viewedAt)}
                    </p>
                  ) : null}
                </QuoteCard>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-14 grid gap-3 sm:grid-cols-2" aria-label="More from LIN4CRE">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <p className="label-caps">Live advice</p>
          <h2 className="mt-2 font-serif text-lg text-ink">A second opinion, on demand</h2>
          {latestAdvice ? (
            <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-muted">
              “{latestAdvice.text}”
            </p>
          ) : (
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
              The Advice Slip integration from the original page still works — with validation,
              saved timestamps and offline handling.
            </p>
          )}
          <Link
            to="/advice"
            className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent transition hover:underline"
          >
            {library.advice.length > 0
              ? `Open your ${library.advice.length} saved tips`
              : 'Try live advice'}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5">
          <p className="label-caps">How this works</p>
          <h2 className="mt-2 font-serif text-lg text-ink">Attribution, not guesswork</h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
            Quotes are stored locally with a source note and an honest attribution status. Disputed
            lines are kept — but never presented as fact.
          </p>
          <Link
            to="/about"
            className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent transition hover:underline"
          >
            Read the attribution policy
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </section>

      <div className="mt-10 flex flex-col items-center justify-between gap-3 rounded-2xl border border-line bg-surface/60 px-5 py-4 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-full border border-line bg-surface-2 text-accent">
            <BookMarked className="size-4" aria-hidden />
          </div>
          <p className="text-[12px] text-muted">
            Favourites, collections and notes stay in this browser.{' '}
            <span className="text-subtle">Export a backup any time from Settings.</span>
          </p>
        </div>
        <Link
          to="/settings"
          className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-accent transition hover:underline"
        >
          Manage data
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      <p className="sr-only" aria-live="polite">
        Shuffled quote by {current.author}: {current.text}
      </p>
    </div>
  );
}
