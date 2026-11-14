import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { quoteCountByCategory } from '@/data/quotes';
import { cn } from '@/lib/cn';
import { toneStyles } from '@/lib/tones';
import type { Category } from '@/types';

export function CategoryCard({ category, className }: { category: Category; className?: string }) {
  const tone = toneStyles[category.tone];
  const count = quoteCountByCategory.get(category.id) ?? 0;

  return (
    <Link
      to={`/category/${category.id}`}
      className={cn(
        'group relative isolate overflow-hidden rounded-2xl border border-line bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lg hover:shadow-black/20 sm:p-5',
        className,
      )}
    >
      <span
        className={cn(
          'pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br opacity-60',
          tone.gradient,
        )}
        aria-hidden
      />
      <span
        className={cn('absolute -top-8 -right-8 -z-10 size-24 rounded-full blur-2xl', tone.glow)}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-2">
        <h3 className="font-serif text-[1.05rem] font-semibold text-ink">{category.name}</h3>
        <ArrowUpRight
          className="mt-0.5 size-4 shrink-0 text-subtle transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
          aria-hidden
        />
      </div>
      <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-muted">
        {category.description}
      </p>
      <p className="mt-4 text-[10.5px] font-medium tracking-wide text-subtle tabular-nums">
        {count} quote{count === 1 ? '' : 's'}
      </p>
    </Link>
  );
}
