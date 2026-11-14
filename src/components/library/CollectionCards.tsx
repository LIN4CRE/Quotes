import { ArrowRight, ArrowUpRight, FolderOpen, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

import { AuthorAvatar } from '@/components/quotes/AuthorAvatar';
import { authorsById } from '@/data/authors';
import { getQuote, quoteCountByAuthor } from '@/data/quotes';
import { relativeTime } from '@/lib/dates';
import { cn } from '@/lib/cn';
import { toneStyles } from '@/lib/tones';
import type { Collection, CuratedCollection } from '@/types';

export function CollectionCard({ collection }: { collection: Collection }) {
  const previews = collection.quoteIds
    .slice(0, 2)
    .map((id) => getQuote(id))
    .filter((quote): quote is NonNullable<typeof quote> => Boolean(quote));

  return (
    <Link
      to={`/collections/${collection.id}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lg hover:shadow-black/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid size-11 place-items-center rounded-xl border border-line bg-surface-2 text-accent">
          <FolderOpen className="size-5" aria-hidden />
        </div>
        <ArrowUpRight
          className="size-4 text-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden
        />
      </div>
      <h3 className="mt-4 font-serif text-lg font-semibold text-ink">{collection.name}</h3>
      <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-[12px] leading-relaxed text-muted">
        {collection.description || `${collection.quoteIds.length} saved quotes in this collection.`}
      </p>

      {previews.length > 0 ? (
        <ul className="mt-4 space-y-2 border-t border-line pt-3">
          {previews.map((quote) => (
            <li
              key={quote.id}
              className="flex items-start gap-2 text-[11px] leading-snug text-subtle"
            >
              <span className="mt-1 size-1 shrink-0 rounded-full bg-accent/70" aria-hidden />
              <span className="line-clamp-2">“{quote.text}”</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 border-t border-line pt-3 text-[11px] text-subtle">No quotes yet.</p>
      )}

      <div className="mt-auto flex items-center justify-between pt-4 text-[10.5px] text-subtle">
        <span>
          {collection.quoteIds.length} quote{collection.quoteIds.length === 1 ? '' : 's'}
        </span>
        <span>Updated {relativeTime(collection.updatedAt)}</span>
      </div>
    </Link>
  );
}

export function CuratedCollectionCard({
  collection,
  showSaveHint = true,
}: {
  collection: CuratedCollection;
  showSaveHint?: boolean;
}) {
  const tone = toneStyles[collection.tone];
  const preview = collection.quoteIds[0] ? getQuote(collection.quoteIds[0]) : undefined;

  return (
    <Link
      to={`/featured/${collection.id}`}
      className="group relative isolate flex flex-col overflow-hidden rounded-3xl border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lg hover:shadow-black/20"
    >
      <span
        className={cn(
          'pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br opacity-70',
          tone.gradient,
        )}
        aria-hidden
      />
      <div className="flex items-center justify-between gap-2">
        <span className="chip border-white/10 bg-black/10 text-[10px] tracking-wide uppercase">
          Featured
        </span>
        <ArrowRight
          className="size-4 text-subtle transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </div>

      <h3 className="mt-4 font-serif text-xl font-semibold text-ink">{collection.name}</h3>
      <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{collection.description}</p>

      {preview ? (
        <p className="mt-4 line-clamp-3 border-t border-line/70 pt-3 font-serif text-[13px] leading-relaxed text-ink/80">
          “{preview.text}”
        </p>
      ) : null}

      <div className="mt-auto flex items-center justify-between pt-4 text-[10.5px] text-subtle">
        <span>
          {collection.quoteIds.length} quote{collection.quoteIds.length === 1 ? '' : 's'}
        </span>
        {showSaveHint ? (
          <span className="inline-flex items-center gap-1">
            <Lock className="size-3" aria-hidden />
            Saved locally
          </span>
        ) : null}
      </div>
    </Link>
  );
}

export function AuthorCard({ authorId, className }: { authorId: string; className?: string }) {
  const author = authorsById.get(authorId);
  if (!author) return null;

  const count = quoteCountByAuthor.get(authorId) ?? 0;

  return (
    <Link
      to={`/author/${author.id}`}
      className={cn(
        'group flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 transition hover:border-line-strong hover:bg-surface-2/60',
        className,
      )}
    >
      <AuthorAvatar name={author.name} size="md" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-medium text-ink">{author.name}</span>
        <span className="block truncate text-[11px] text-subtle">
          {author.lifespan ?? author.era ?? 'Author'}
          {author.nationality ? ` · ${author.nationality}` : ''}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2 text-[10.5px] text-subtle tabular-nums">
        {count}
        <ArrowRight
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}
