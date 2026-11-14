import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-lg bg-surface-2', className)}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent motion-safe:animate-shimmer" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading page">
      <div className="space-y-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-12 w-3/4 max-w-xl" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>
      <Skeleton className="h-72 w-full rounded-3xl" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function QuoteListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading quotes">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-5 h-6 w-full" />
          <Skeleton className="mt-3 h-6 w-11/12" />
          <Skeleton className="mt-3 h-6 w-2/3" />
          <Skeleton className="mt-6 h-3 w-32" />
        </div>
      ))}
    </div>
  );
}
