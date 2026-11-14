import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { attributionStyles } from '@/lib/tones';
import type { AttributionStatus } from '@/types';

export function Badge({
  children,
  className,
  tone = 'neutral',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}) {
  const tones = {
    neutral: 'border-line bg-surface-2 text-muted',
    accent: 'border-accent/25 bg-accent-soft text-accent',
    success: 'border-success/30 bg-success/10 text-success',
    warning: 'border-warning/30 bg-warning/10 text-warning',
    danger: 'border-danger/30 bg-danger/10 text-danger',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function AttributionBadge({
  status,
  compact = false,
  className,
}: {
  status: AttributionStatus;
  compact?: boolean;
  className?: string;
}) {
  const style = attributionStyles[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-medium',
        style.className,
        className,
      )}
      title={style.description}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" aria-hidden />
      {compact ? style.short : style.label}
    </span>
  );
}
