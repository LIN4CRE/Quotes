import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string | undefined;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('mb-8 sm:mb-10', className)}>
      {eyebrow ? <p className="label-caps">{eyebrow}</p> : null}
      <h1 className="display-title mt-2 text-[2.15rem] text-ink sm:text-[2.9rem]">{title}</h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-[15px]">
          {description}
        </p>
      ) : null}
      {children}
      {actions ? <div className="mt-5 flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function SectionHeader({
  id,
  title,
  description,
  action,
  className,
}: {
  id?: string;
  title: string;
  description?: string | undefined;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-5 flex flex-wrap items-end justify-between gap-3', className)}>
      <div>
        <h2 id={id} className="text-xl font-semibold text-ink sm:text-2xl">
          {title}
        </h2>
        {description ? <p className="mt-1 text-[13px] text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
