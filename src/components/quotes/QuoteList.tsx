import { useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { QuoteCard } from '@/components/quotes/QuoteCard';
import type { Quote } from '@/types';

interface QuoteListProps {
  quotes: readonly Quote[];
  pageSize?: number;
  resetKey?: string;
  children?: (quote: Quote) => ReactNode;
  extraActions?: (quote: Quote) => ReactNode;
  variant?: 'default' | 'compact';
  className?: string;
}

export function QuoteList({
  quotes,
  pageSize = 10,
  resetKey = '',
  children,
  extraActions,
  variant = 'default',
  className,
}: QuoteListProps) {
  const resetSignal = `${resetKey}:${pageSize}:${quotes.length}`;
  const [pagination, setPagination] = useState({ signal: resetSignal, visible: pageSize });

  // Reset during render (not in an effect) when the list identity changes.
  if (pagination.signal !== resetSignal) {
    setPagination({ signal: resetSignal, visible: pageSize });
  }

  const visible = pagination.visible;
  const shown = quotes.slice(0, visible);
  const remaining = quotes.length - shown.length;

  return (
    <div className={className}>
      <div className="space-y-4">
        {shown.map((quote) => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            variant={variant}
            {...(extraActions ? { extraActions: extraActions(quote) } : {})}
          >
            {children?.(quote)}
          </QuoteCard>
        ))}
      </div>

      {remaining > 0 ? (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() =>
              setPagination((current) => ({ ...current, visible: current.visible + pageSize }))
            }
            aria-label={`Show more quotes, ${remaining} remaining`}
          >
            Show more quotes
            <span className="text-[11px] text-subtle tabular-nums">{remaining} left</span>
          </Button>
        </div>
      ) : quotes.length > pageSize ? (
        <p className="mt-6 text-center text-[11px] text-subtle" role="status">
          That is all {quotes.length} quotes.
        </p>
      ) : null}
    </div>
  );
}
