import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { AttributionBadge } from '@/components/ui/Badge';
import { AuthorAvatar } from '@/components/quotes/AuthorAvatar';
import { QuoteActions } from '@/components/quotes/QuoteActions';
import { getCategory } from '@/data/categories';
import { cn } from '@/lib/cn';
import { toneStyles } from '@/lib/tones';
import type { Quote } from '@/types';

interface QuoteCardProps {
  quote: Quote;
  variant?: 'default' | 'feature' | 'compact';
  className?: string;
  children?: ReactNode;
  extraActions?: ReactNode;
  showActions?: boolean;
  showCategories?: boolean;
  headingLevel?: 'h2' | 'h3';
}

export function QuoteCard({
  quote,
  variant = 'default',
  className,
  children,
  extraActions,
  showActions = true,
  showCategories = true,
  headingLevel: Heading = 'h3',
}: QuoteCardProps) {
  const firstCategory = quote.categories[0] ? getCategory(quote.categories[0]) : undefined;
  const tone = firstCategory ? toneStyles[firstCategory.tone] : toneStyles.gold;
  const isFeature = variant === 'feature';
  const isCompact = variant === 'compact';

  return (
    <article
      className={cn(
        'group relative isolate overflow-hidden border border-line bg-surface transition-colors duration-300',
        isFeature ? 'rounded-[30px] p-6 shadow-2xl shadow-black/25 sm:p-9' : 'rounded-3xl',
        !isFeature && (isCompact ? 'p-5' : 'p-5 sm:p-7'),
        'hover:border-line-strong',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br opacity-70',
          tone.gradient,
        )}
        aria-hidden
      />
      <span
        className={cn(
          'pointer-events-none absolute -right-2 -bottom-10 -z-10 font-serif leading-none text-ink/[0.035] select-none',
          isFeature ? 'text-[15rem]' : 'text-[9rem]',
        )}
        aria-hidden
      >
        ”
      </span>

      <div className="flex flex-wrap items-center gap-2">
        {showCategories
          ? quote.categories.slice(0, isCompact ? 1 : 2).map((categoryId) => {
              const category = getCategory(categoryId);
              if (!category) return null;
              return (
                <Link
                  key={categoryId}
                  to={`/category/${categoryId}`}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-medium transition hover:brightness-125',
                    toneStyles[category.tone].chip,
                  )}
                >
                  {category.name}
                </Link>
              );
            })
          : null}
        <AttributionBadge status={quote.attribution} compact className="ml-auto" />
      </div>

      <blockquote className={cn('mt-4', isFeature ? 'mt-6' : '')}>
        <Link to={`/quote/${quote.id}`} className="block rounded-lg">
          <Heading
            className={cn(
              'quote-body text-ink transition-colors group-hover:text-white',
              isFeature
                ? 'text-[1.75rem] sm:text-[2.35rem] lg:text-[2.65rem]'
                : isCompact
                  ? 'text-[1.06rem] sm:text-[1.15rem]'
                  : 'text-[1.22rem] sm:text-[1.4rem]',
            )}
          >
            “{quote.text}”
          </Heading>
        </Link>
      </blockquote>

      <footer
        className={cn(
          'mt-5 flex flex-wrap items-center justify-between gap-3',
          !isCompact && 'border-t border-line/80 pt-4',
        )}
      >
        <Link
          to={`/author/${quote.authorId}`}
          className="flex min-w-0 items-center gap-2.5 rounded-lg text-left"
        >
          <AuthorAvatar name={quote.author} size={isCompact ? 'sm' : 'md'} />
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-medium text-ink">{quote.author}</span>
            <span className="block max-w-[16rem] truncate text-[11px] text-subtle">
              {quote.source ??
                (quote.attribution === 'anonymous' ? 'Traditional saying' : 'Source unlisted')}
            </span>
          </span>
        </Link>

        {showActions ? (
          <QuoteActions quote={quote} extra={extraActions} className="-mr-1" />
        ) : (
          <div className="-mr-1 flex items-center gap-1">{extraActions}</div>
        )}
      </footer>

      {children}
    </article>
  );
}
