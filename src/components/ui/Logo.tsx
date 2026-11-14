import { Link } from 'react-router-dom';

import { cn } from '@/lib/cn';

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-[13px] bg-gradient-to-br from-[#f3c987] via-[#d99a4e] to-[#8f5a1f] shadow-lg shadow-black/25 ring-1 ring-white/25',
        className,
      )}
      aria-hidden="true"
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_55%)]" />
      <svg viewBox="0 0 24 24" className="relative size-5 text-[#1a1206]" fill="currentColor">
        <path d="M9.35 5.6C6.42 7.05 4.65 9.68 4.65 12.75c0 3.14 1.93 5.1 4.35 5.1 2.1 0 3.65-1.5 3.65-3.55 0-1.92-1.35-3.28-3.2-3.28-.26 0-.5.03-.72.09.42-1.55 1.62-2.78 3.3-3.63L9.35 5.6Zm9.9 0c-2.93 1.45-4.7 4.08-4.7 7.15 0 3.14 1.93 5.1 4.35 5.1 2.1 0 3.65-1.5 3.65-3.55 0-1.92-1.35-3.28-3.2-3.28-.26 0-.5.03-.72.09.42-1.55 1.62-2.78 3.3-3.63L19.25 5.6Z" />
      </svg>
    </span>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      to="/"
      className={cn('group inline-flex items-center gap-3 rounded-xl', className)}
      aria-label={compact ? 'LIN4CRE QUOTES — home' : undefined}
    >
      <LogoMark />
      {compact ? null : (
        <span className="flex min-w-0 flex-col">
          <span className="text-[12px] leading-none font-semibold tracking-[0.36em] text-ink">
            LIN4CRE
          </span>
          <span className="mt-1.5 font-serif text-[11px] leading-none tracking-[0.34em] text-muted uppercase">
            QUOTES
          </span>
        </span>
      )}
    </Link>
  );
}
