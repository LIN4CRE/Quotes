import { ArrowRight, Users } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';

import { CategoryCard } from '@/components/discover/CategoryCard';
import { AuthorCard } from '@/components/library/CollectionCards';
import { Button, LinkButton } from '@/components/ui/Button';
import { PageHeader, SectionHeader } from '@/components/ui/PageHeader';
import { SearchField } from '@/components/ui/SearchField';
import { authorList } from '@/data/authors';
import { categories } from '@/data/categories';
import { quoteCountByAuthor, quotes } from '@/data/quotes';
import { normalise } from '@/lib/search';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const AUTHORS_INITIAL = 12;

export default function Explore() {
  useDocumentTitle('Explore');
  const [authorQuery, setAuthorQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const deferredQuery = useDeferredValue(authorQuery);

  const filteredAuthors = useMemo(() => {
    const query = normalise(deferredQuery);
    return [...authorList]
      .filter((author) => {
        if (!query) return true;
        return normalise(
          `${author.name} ${author.era ?? ''} ${author.nationality ?? ''} ${author.lifespan ?? ''}`,
        ).includes(query);
      })
      .sort((left, right) => {
        const countDiff =
          (quoteCountByAuthor.get(right.id) ?? 0) - (quoteCountByAuthor.get(left.id) ?? 0);
        return countDiff || left.name.localeCompare(right.name);
      });
  }, [deferredQuery]);

  const visibleAuthors = showAll ? filteredAuthors : filteredAuthors.slice(0, AUTHORS_INITIAL);
  const quotedAuthors = quoteCountByAuthor.size;

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="The library"
        title="Explore"
        description={`${quotes.length} quotes across ${categories.length} themes and ${quotedAuthors} authors. Every entry carries a source note and a clear attribution status.`}
        actions={
          <>
            <LinkButton to="/search" variant="secondary">
              Search the library
              <ArrowRight className="size-4" aria-hidden />
            </LinkButton>
            <LinkButton to="/collections" variant="outline">
              Featured collections
            </LinkButton>
          </>
        }
      />

      <section aria-labelledby="themes-heading">
        <SectionHeader
          id="themes-heading"
          title="Themes"
          description="Fifteen curated ways into the library."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="authors-heading">
        <SectionHeader
          id="authors-heading"
          title="Authors"
          description="Philosophers, novelists, scientists, athletes and one anonymous tradition."
        />

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchField
            id="author-search"
            value={authorQuery}
            onChange={(value) => {
              setAuthorQuery(value);
              setShowAll(false);
            }}
            label="Filter authors"
            placeholder="Filter authors by name, era or nationality…"
            className="w-full sm:max-w-sm"
          />
          <p className="text-[11.5px] text-subtle" aria-live="polite">
            {filteredAuthors.length} author{filteredAuthors.length === 1 ? '' : 's'}
          </p>
        </div>

        {visibleAuthors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line px-5 py-10 text-center text-sm text-muted">
            No authors match “{authorQuery.trim()}”.
            <button
              type="button"
              className="ml-1 text-accent underline underline-offset-4"
              onClick={() => setAuthorQuery('')}
            >
              Clear the filter
            </button>
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleAuthors.map((author) => (
              <AuthorCard key={author.id} authorId={author.id} />
            ))}
          </div>
        )}

        {filteredAuthors.length > AUTHORS_INITIAL ? (
          <div className="mt-5 flex justify-center">
            <Button variant="outline" onClick={() => setShowAll((current) => !current)}>
              <Users className="size-4" aria-hidden />
              {showAll ? 'Show fewer authors' : `Show all ${filteredAuthors.length} authors`}
            </Button>
          </div>
        ) : null}
      </section>

      <section className="mt-14 rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-xl">
            <p className="label-caps">Looking for something specific?</p>
            <h2 className="mt-2 font-serif text-2xl text-ink">Search every word and name</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Search matches quote text, authors, themes and sources. Filters let you narrow results
              to verified attributions.
            </p>
          </div>
          <LinkButton to="/search">
            Open search
            <ArrowRight className="size-4" aria-hidden />
          </LinkButton>
        </div>
        <p className="mt-5 text-[10.5px] text-subtle">
          Tip: press ⌘/Ctrl K anywhere to jump to a quote, author or theme.
        </p>
      </section>
    </div>
  );
}
