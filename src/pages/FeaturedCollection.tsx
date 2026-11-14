import { ArrowLeft, BookmarkPlus, Check, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { QuoteList } from '@/components/quotes/QuoteList';
import { Button, LinkButton } from '@/components/ui/Button';
import { MissingPage } from '@/components/ui/MissingPage';
import { curatedCollections, getCuratedCollection } from '@/data/collections';
import { getQuote } from '@/data/quotes';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/providers/LibraryProvider';
import { useToast } from '@/providers/ToastProvider';
import { cn } from '@/lib/cn';
import { toneStyles } from '@/lib/tones';

export default function FeaturedCollection() {
  const { collectionId = '' } = useParams();
  const navigate = useNavigate();
  const curated = getCuratedCollection(collectionId);
  const { library, createCollection } = useLibrary();
  const { addToast } = useToast();

  useDocumentTitle(curated?.name ?? 'Featured collection');

  if (!curated) {
    return (
      <MissingPage
        title="Featured collection not found"
        description="That curated collection does not exist. Browse the featured sets instead."
        action={
          <LinkButton to="/collections" variant="secondary">
            All collections
          </LinkButton>
        }
      />
    );
  }

  const existing = library.collections.find(
    (collection) => collection.name.toLowerCase() === curated.name.toLowerCase(),
  );

  const quotes = curated.quoteIds
    .map((id) => getQuote(id))
    .filter((quote): quote is NonNullable<typeof quote> => Boolean(quote));

  const tone = toneStyles[curated.tone];

  const saveCollection = () => {
    if (existing) {
      navigate(`/collections/${existing.id}`);
      return;
    }

    const created = createCollection(curated.name, curated.description, curated.quoteIds);
    if (!created) {
      addToast({ title: 'Could not save the collection', variant: 'error' });
      return;
    }
    addToast({
      title: `Saved “${created.name}”`,
      description: `${created.quoteIds.length} quotes copied to your collections.`,
      variant: 'success',
    });
    navigate(`/collections/${created.id}`);
  };

  return (
    <div className="animate-rise">
      <Link
        to="/collections"
        className="mb-5 inline-flex items-center gap-1.5 text-[12px] text-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Collections
      </Link>

      <header className="relative isolate overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-9">
        <span
          className={cn(
            'pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br opacity-80',
            tone.gradient,
          )}
          aria-hidden
        />
        <span
          className={cn(
            'absolute -top-20 -right-12 -z-10 size-64 rounded-full blur-3xl',
            tone.glow,
          )}
          aria-hidden
        />
        <p className="label-caps flex items-center gap-2">
          <Sparkles className="size-3.5 text-accent" aria-hidden />
          Featured collection
        </p>
        <h1 className="display-title mt-2 text-[2.1rem] text-ink sm:text-[3rem]">{curated.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{curated.description}</p>
        <p className="mt-3 text-[11px] text-subtle">{quotes.length} quotes · curated by LIN4CRE</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={saveCollection} variant={existing ? 'secondary' : 'primary'}>
            {existing ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <BookmarkPlus className="size-4" aria-hidden />
            )}
            {existing ? 'Open saved collection' : 'Save to my collections'}
          </Button>
          <LinkButton to={`/collections`} variant="ghost">
            Browse other collections
          </LinkButton>
        </div>
        {existing ? (
          <p className="mt-3 text-[11px] text-subtle">
            You already saved this set as “{existing.name}”. Saving again would create a duplicate.
          </p>
        ) : (
          <p className="mt-3 text-[11px] text-subtle">
            Saving copies these {quotes.length} quotes into a new collection you can edit, annotate
            and delete.
          </p>
        )}
      </header>

      <div className="mt-8">
        <QuoteList quotes={quotes} pageSize={12} resetKey={curated.id} />
      </div>

      <section className="mt-12" aria-labelledby="other-collections">
        <h2 id="other-collections" className="text-xl font-semibold text-ink">
          Other featured sets
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {curatedCollections
            .filter((collection) => collection.id !== curated.id)
            .map((collection) => (
              <Link
                key={collection.id}
                to={`/featured/${collection.id}`}
                className="chip px-3 py-1.5 text-[12px] transition hover:border-line-strong hover:text-ink"
              >
                {collection.name}
                <span className="text-subtle">{collection.quoteIds.length}</span>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
