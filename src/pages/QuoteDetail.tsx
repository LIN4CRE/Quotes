import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  Copy,
  FolderPlus,
  Heart,
  Image as ImageIcon,
  Info,
  Share2,
  TriangleAlert,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { CollectionPicker } from '@/components/library/CollectionPicker';
import { QuoteNote } from '@/components/library/NoteEditor';
import { AuthorAvatar } from '@/components/quotes/AuthorAvatar';
import { QuoteCard } from '@/components/quotes/QuoteCard';
import { QuoteImageDialog } from '@/components/share/QuoteImageDialog';
import { AttributionBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MissingPage } from '@/components/ui/MissingPage';
import { getAuthor } from '@/data/authors';
import { getCategory } from '@/data/categories';
import { getQuote, quotes } from '@/data/quotes';
import { buildQuoteText, copyText, shareQuote } from '@/lib/share';
import { attributionStyles } from '@/lib/tones';
import { cn } from '@/lib/cn';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/providers/LibraryProvider';
import { useToast } from '@/providers/ToastProvider';

export default function QuoteDetail() {
  const { quoteId = '' } = useParams();
  const quote = getQuote(quoteId);
  const { recordView, isFavourite, toggleFavourite, library } = useLibrary();
  const { addToast } = useToast();
  const [imageOpen, setImageOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  useDocumentTitle(quote ? `${quote.author} — quote` : 'Quote');

  useEffect(() => {
    if (quote) recordView(quote.id);
  }, [quote, recordView]);

  const favourite = quote ? isFavourite(quote.id) : false;
  const favouriteEntry = library.favourites.find((entry) => entry.quoteId === quoteId);

  const related = useMemo(() => {
    if (!quote) return [];
    const category = quote.categories[0];
    if (!category) return [];
    return quotes
      .filter((item) => item.id !== quote.id && item.categories.includes(category))
      .slice(0, 3);
  }, [quote]);

  if (!quote) {
    return (
      <MissingPage
        title="Quote not found"
        description="This quote may have been removed or the link may be mistyped. The library is still here."
        action={
          <Link
            to="/"
            className="inline-flex h-10 items-center rounded-full bg-accent px-4 text-sm font-medium text-accent-ink"
          >
            Back to Discover
          </Link>
        }
      />
    );
  }

  const author = getAuthor(quote.authorId);
  const attribution = attributionStyles[quote.attribution];
  const firstCategory = quote.categories[0];
  const category = firstCategory ? getCategory(firstCategory) : undefined;
  const collectionsWithQuote = library.collections.filter((collection) =>
    collection.quoteIds.includes(quote.id),
  );

  const handleCopy = async (withAttribution: boolean) => {
    const copied = await copyText(withAttribution ? buildQuoteText(quote) : quote.text);
    addToast({
      title: copied ? 'Copied to clipboard' : 'Could not copy',
      description: copied
        ? withAttribution
          ? 'Quote and attribution copied.'
          : 'Quote text copied without attribution.'
        : 'Your browser blocked clipboard access.',
      variant: copied ? 'success' : 'error',
    });
  };

  const handleShare = async () => {
    const result = await shareQuote(quote);
    if (result === 'cancelled') return;
    if (result === 'shared') {
      addToast({ title: 'Shared', variant: 'success' });
      return;
    }
    addToast({
      title: 'Quote copied',
      description: 'This browser cannot use native sharing, so the text was copied.',
      variant: 'success',
    });
  };

  const handleFavourite = () => {
    const added = toggleFavourite(quote.id);
    addToast({
      title: added ? 'Saved to favourites' : 'Removed from favourites',
      variant: 'success',
    });
  };

  return (
    <div className="animate-rise">
      <h1 className="sr-only">Quote by {quote.author}</h1>
      <div className="mb-5 flex flex-wrap items-center gap-2 text-[12px] text-muted">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 rounded-full px-1 py-1 transition hover:text-ink"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back
        </button>
        <span className="text-subtle" aria-hidden>
          /
        </span>
        <Link to="/" className="transition hover:text-ink">
          Discover
        </Link>
        {category ? (
          <>
            <span className="text-subtle" aria-hidden>
              /
            </span>
            <Link to={`/category/${category.id}`} className="transition hover:text-ink">
              {category.name}
            </Link>
          </>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <article className="relative isolate overflow-hidden rounded-[30px] border border-line bg-surface p-6 shadow-2xl shadow-black/20 sm:p-9">
          <span
            className="pointer-events-none absolute -right-6 -bottom-16 -z-10 font-serif text-[16rem] leading-none text-ink/[0.03] select-none"
            aria-hidden
          >
            ”
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {quote.categories.map((categoryId) => {
              const item = getCategory(categoryId);
              if (!item) return null;
              return (
                <Link
                  key={categoryId}
                  to={`/category/${categoryId}`}
                  className="chip transition hover:border-line-strong hover:text-ink"
                >
                  {item.name}
                </Link>
              );
            })}
            <AttributionBadge status={quote.attribution} className="ml-auto" />
          </div>

          <blockquote className="mt-6">
            <p className="quote-body text-[1.7rem] text-ink sm:text-[2.15rem]">“{quote.text}”</p>
          </blockquote>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4">
            <Link to={`/author/${quote.authorId}`} className="flex items-center gap-3">
              <AuthorAvatar name={quote.author} size="md" />
              <span>
                <span className="block text-sm font-medium text-ink">{quote.author}</span>
                <span className="block text-[11px] text-subtle">
                  {author?.lifespan ?? 'Author'}
                  {author?.nationality ? ` · ${author.nationality}` : ''}
                </span>
              </span>
            </Link>
            {quote.source ? (
              <p className="text-[11.5px] text-subtle">
                <span className="text-muted">Source:</span> {quote.source}
                {quote.year ? ` · ${quote.year}` : ''}
              </p>
            ) : (
              <p className="text-[11.5px] text-subtle">No primary source listed</p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant={favourite ? 'secondary' : 'primary'}
              onClick={handleFavourite}
              aria-pressed={favourite}
            >
              <Heart
                className={cn('size-4', favourite && 'fill-current text-accent')}
                aria-hidden
              />
              {favourite ? 'Saved' : 'Save quote'}
            </Button>
            <Button variant="secondary" onClick={() => handleCopy(true)}>
              <Copy className="size-4" aria-hidden />
              Copy with author
            </Button>
            <Button variant="ghost" onClick={() => handleCopy(false)}>
              Copy text only
            </Button>
            <Button variant="secondary" onClick={handleShare}>
              <Share2 className="size-4" aria-hidden />
              Share
            </Button>
            <Button variant="secondary" onClick={() => setImageOpen(true)}>
              <ImageIcon className="size-4" aria-hidden />
              Create image
            </Button>
            <Button variant="secondary" onClick={() => setCollectionsOpen(true)}>
              <FolderPlus className="size-4" aria-hidden />
              Collect
            </Button>
          </div>

          {favourite ? (
            <QuoteNote quoteId={quote.id} note={favouriteEntry?.note} />
          ) : (
            <p className="mt-5 text-[11.5px] text-subtle">
              Save this quote to add a private note or remove it from collections later.
            </p>
          )}
        </article>

        <aside className="space-y-4">
          <section
            className="rounded-2xl border border-line bg-surface p-5"
            aria-labelledby="attribution-heading"
          >
            <h2 id="attribution-heading" className="label-caps">
              Attribution
            </h2>
            <div className="mt-3">
              <AttributionBadge status={quote.attribution} />
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-muted">{attribution.description}</p>

            {quote.attributionNote ? (
              <div
                className={cn(
                  'mt-4 rounded-xl border p-3 text-[11.5px] leading-relaxed',
                  quote.attribution === 'disputed'
                    ? 'border-danger/25 bg-danger/5 text-danger/90'
                    : 'border-line bg-surface-2 text-muted',
                )}
              >
                <p className="mb-1 flex items-center gap-1.5 font-medium">
                  {quote.attribution === 'disputed' ? (
                    <TriangleAlert className="size-3.5" aria-hidden />
                  ) : (
                    <Info className="size-3.5" aria-hidden />
                  )}
                  What we know
                </p>
                {quote.attributionNote}
              </div>
            ) : null}

            <p className="mt-3 border-t border-line pt-3 text-[11.5px] text-subtle">
              {quote.source
                ? `Source: ${quote.source}${quote.year ? `, ${quote.year}` : ''}`
                : 'No primary source has been confirmed for this wording.'}
            </p>
            <Link
              to="/about"
              className="mt-2 inline-flex items-center gap-1 text-[11.5px] text-accent transition hover:underline"
            >
              How attribution is graded
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          </section>

          {author ? (
            <section
              className="rounded-2xl border border-line bg-surface p-5"
              aria-labelledby="author-heading"
            >
              <h2 id="author-heading" className="label-caps">
                About the author
              </h2>
              <Link to={`/author/${author.id}`} className="mt-3 flex items-center gap-3">
                <AuthorAvatar name={author.name} size="md" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{author.name}</span>
                  <span className="block truncate text-[11px] text-subtle">
                    {author.lifespan ?? author.era}
                  </span>
                </span>
              </Link>
              <p className="mt-3 text-[12px] leading-relaxed text-muted">{author.bio}</p>
              <Link
                to={`/author/${author.id}`}
                className="mt-3 inline-flex items-center gap-1 text-[11.5px] text-accent transition hover:underline"
              >
                All quotes by {author.name.split(' ')[0]}
                <ArrowRight className="size-3" aria-hidden />
              </Link>
            </section>
          ) : null}

          <section
            className="rounded-2xl border border-line bg-surface p-5"
            aria-labelledby="collections-heading"
          >
            <h2 id="collections-heading" className="label-caps flex items-center gap-2">
              <BookMarked className="size-3.5" aria-hidden />
              In your collections
            </h2>
            {collectionsWithQuote.length > 0 ? (
              <ul className="mt-3 space-y-1.5">
                {collectionsWithQuote.map((collection) => (
                  <li key={collection.id}>
                    <Link
                      to={`/collections/${collection.id}`}
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[12px] text-muted transition hover:bg-surface-2 hover:text-ink"
                    >
                      <span className="truncate">{collection.name}</span>
                      <ArrowRight className="size-3 shrink-0" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
                Not in a collection yet. Collections group quotes for a project, a mood or a person.
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setCollectionsOpen(true)}
            >
              <FolderPlus className="size-3.5" aria-hidden />
              {collectionsWithQuote.length > 0 ? 'Manage collections' : 'Add to a collection'}
            </Button>
          </section>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mt-12" aria-labelledby="related-heading">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 id="related-heading" className="text-xl font-semibold text-ink">
              More on {category?.name ?? 'this theme'}
            </h2>
            {category ? (
              <Link
                to={`/category/${category.id}`}
                className="inline-flex items-center gap-1 text-[12px] text-muted transition hover:text-ink"
              >
                View theme
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            ) : null}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {related.map((item) => (
              <QuoteCard key={item.id} quote={item} variant="compact" showCategories={false} />
            ))}
          </div>
        </section>
      ) : null}

      <QuoteImageDialog open={imageOpen} onClose={() => setImageOpen(false)} quote={quote} />
      <CollectionPicker
        open={collectionsOpen}
        onClose={() => setCollectionsOpen(false)}
        quoteId={quote.id}
      />
    </div>
  );
}
