import { BookOpen, ExternalLink } from 'lucide-react';

import { sourceSiteName } from '@/data/sourceLinks';
import { cn } from '@/lib/cn';
import type { Quote } from '@/types';

interface SourceLinkProps {
  quote: Quote;
  className?: string;
  compact?: boolean;
}

/**
 * A work-level link to a checked edition or archive. It is rendered only when
 * the editorial data includes a URL, so an absent link is an honest "not
 * listed" rather than a disabled control.
 */
export function SourceLink({ quote, className, compact = false }: SourceLinkProps) {
  if (!quote.sourceUrl) return null;

  const site = sourceSiteName(quote.sourceUrl);

  return (
    <a
      href={quote.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group inline-flex min-h-8 items-center gap-1.5 rounded-lg text-[11.5px] font-medium text-accent underline decoration-accent/35 underline-offset-4 transition hover:text-accent-strong hover:decoration-accent',
        className,
      )}
    >
      <BookOpen className="size-3.5 shrink-0" aria-hidden />
      {compact ? `Source at ${site}` : `View source at ${site}`}
      <ExternalLink className="size-3 shrink-0 opacity-70" aria-hidden />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
