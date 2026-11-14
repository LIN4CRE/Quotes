import { Coffee, ExternalLink } from 'lucide-react';

import { SUPPORT_URL } from '@/lib/constants';
import { cn } from '@/lib/cn';

interface SupportButtonProps {
  /**
   * `full` shows the PayPal explanation beside the label; `compact` keeps the
   * footer and mobile sheet on one line.
   */
  variant?: 'full' | 'compact';
  className?: string;
}

/**
 * A plain external link to PayPal. There is no embedded checkout, script,
 * tracking parameter or payment code in the application.
 */
export function SupportButton({ variant = 'full', className }: SupportButtonProps) {
  return (
    <a
      href={SUPPORT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group inline-flex min-h-10 items-center gap-2 rounded-full border border-accent/35 bg-accent-soft px-3.5 text-[12px] font-medium text-ink transition',
        'hover:border-accent/60 hover:bg-accent/15 focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
    >
      <Coffee className="size-4 shrink-0 text-accent" aria-hidden />
      <span className="whitespace-nowrap">Buy Me a Coffee</span>
      {variant === 'full' ? (
        <span className="hidden text-[10.5px] font-normal text-subtle sm:inline">
          Support via PayPal
        </span>
      ) : null}
      <ExternalLink
        className="size-3 shrink-0 text-subtle transition group-hover:text-muted"
        aria-hidden
      />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
