import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-surface/40 text-center',
        compact ? 'px-5 py-10' : 'px-6 py-16 sm:py-20',
        className,
      )}
    >
      <div className="grid size-14 place-items-center rounded-2xl border border-line bg-surface-2 text-accent">
        <Icon className="size-6" aria-hidden />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}
