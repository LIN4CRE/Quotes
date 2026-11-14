import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { AuthorAvatar } from '@/components/quotes/AuthorAvatar';
import { CorrectionLink } from '@/components/quotes/CorrectionLink';
import { QuoteList } from '@/components/quotes/QuoteList';
import { LinkButton } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { authorsById } from '@/data/authors';
import { quotes } from '@/data/quotes';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function AuthorPage() {
  const { authorId = '' } = useParams();
  const author = authorsById.get(authorId);
  const authorQuotes = quotes.filter((quote) => quote.authorId === authorId);

  useDocumentTitle(author?.name ?? 'Author');

  if (!author) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="display-title text-3xl text-ink">Author not found</h1>
        <p className="mt-3 text-sm text-muted">
          That author is not in the library. Browse the full author list instead.
        </p>
        <LinkButton to="/explore" className="mt-6">
          <ArrowLeft className="size-4" aria-hidden />
          Back to Explore
        </LinkButton>
      </div>
    );
  }

  const categories = new Set(authorQuotes.flatMap((quote) => quote.categories)).size;

  return (
    <div className="animate-rise">
      <nav aria-label="Breadcrumb" className="mb-5">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-[12px] text-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Explore authors
        </Link>
      </nav>

      <header className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -top-16 -right-12 size-56 rounded-full bg-accent/10 blur-3xl"
          aria-hidden
        />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <AuthorAvatar name={author.name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="label-caps">Author</p>
            <PageHeader title={author.name} className="mb-0 mt-1" />
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-subtle">
              {author.lifespan ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" aria-hidden />
                  {author.lifespan}
                </span>
              ) : null}
              {author.nationality ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" aria-hidden />
                  {author.nationality}
                </span>
              ) : null}
              <span>{author.era ?? 'Historical'}</span>
              <span>
                {authorQuotes.length} quote{authorQuotes.length === 1 ? '' : 's'}
              </span>
              {categories > 0 ? <span>{categories} themes</span> : null}
            </div>
            <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-muted">{author.bio}</p>
            <p className="mt-3 max-w-2xl text-[11px] leading-relaxed text-subtle">
              This biography is an editorial summary, not a quotation. Dates and works are
              cross-checked against standard references; the source for each quotation is recorded
              on its quote page.
            </p>
            <CorrectionLink label="Report a biography or attribution correction" className="mt-2" />
          </div>
        </div>
      </header>

      <section className="mt-8" aria-labelledby="author-quotes">
        <h2 id="author-quotes" className="mb-4 text-xl font-semibold text-ink">
          Quotes by {author.name}
        </h2>
        {authorQuotes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line px-6 py-12 text-center text-sm text-muted">
            No quotes by this author are in the library yet.
          </div>
        ) : (
          <QuoteList quotes={authorQuotes} pageSize={12} resetKey={author.id} />
        )}
      </section>
    </div>
  );
}
