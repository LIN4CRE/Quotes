import { Flag } from 'lucide-react';

import { REPO_URL } from '@/lib/constants';
import { cn } from '@/lib/cn';
import type { Quote } from '@/types';

interface CorrectionLinkProps {
  quote?: Quote;
  className?: string;
  label?: string;
}

/** Opens a pre-titled GitHub issue form so a correction can be acted on. */
export function CorrectionLink({
  quote,
  className,
  label = 'Report an attribution correction',
}: CorrectionLinkProps) {
  const title = quote
    ? `[Attribution] ${quote.id} — ${quote.author}`
    : '[Attribution] Correction or rights concern';
  const href = `${REPO_URL}/issues/new?template=attribution-correction.yml&title=${encodeURIComponent(title)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex min-h-8 items-center gap-1.5 rounded-lg text-[11.5px] text-muted underline decoration-line-strong underline-offset-4 transition hover:text-ink hover:decoration-accent',
        className,
      )}
    >
      <Flag className="size-3.5 shrink-0" aria-hidden />
      {label}
    </a>
  );
}
