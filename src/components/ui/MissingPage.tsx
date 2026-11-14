import { SearchX } from 'lucide-react';
import type { ReactNode } from 'react';

export function MissingPage({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-lg py-14 text-center sm:py-20">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-line bg-surface-2 text-accent">
        <SearchX className="size-6" aria-hidden />
      </div>
      <h1 className="display-title mt-5 text-3xl text-ink">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}
