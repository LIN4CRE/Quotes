import { hashString } from '@/lib/random';
import { cn } from '@/lib/cn';

const palettes = [
  'border-amber-300/25 bg-amber-300/10 text-ink',
  'border-rose-300/25 bg-rose-300/10 text-ink',
  'border-violet-300/25 bg-violet-300/10 text-ink',
  'border-emerald-300/25 bg-emerald-300/10 text-ink',
  'border-sky-300/25 bg-sky-300/10 text-ink',
  'border-teal-300/25 bg-teal-300/10 text-ink',
] as const;

export function initialsOf(name: string): string {
  const words = name
    .replace(/[^\p{L}\s'-]/gu, ' ')
    .split(/[\s-]+/)
    .filter(Boolean);

  if (words.length === 0) return '?';
  if (words.length === 1) return (words[0] ?? '').slice(0, 2).toUpperCase();
  return `${(words[0] ?? '').charAt(0)}${(words[words.length - 1] ?? '').charAt(0)}`.toUpperCase();
}

export function AuthorAvatar({
  name,
  size = 'md',
  className,
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const palette = palettes[hashString(name) % palettes.length] ?? palettes[0];
  const sizing = {
    sm: 'size-8 text-[11px]',
    md: 'size-10 text-xs',
    lg: 'size-16 text-lg',
  } as const;

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full border font-semibold tracking-wide',
        palette,
        sizing[size],
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
