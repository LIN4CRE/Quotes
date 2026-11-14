import { Search, X } from 'lucide-react';
import type { FormEvent } from 'react';

import { cn } from '@/lib/cn';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  autoFocus?: boolean;
  onSubmit?: () => void;
  className?: string;
  inputClassName?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Search quotes, authors or themes…',
  label = 'Search quotes',
  id = 'quote-search',
  autoFocus = false,
  onSubmit,
  className,
  inputClassName,
}: SearchFieldProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit?.();
  };

  return (
    <form role="search" onSubmit={handleSubmit} className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-subtle"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          'field h-12 rounded-2xl pr-11 pl-11 text-[15px] [&::-webkit-search-cancel-button]:hidden',
          inputClassName,
        )}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-subtle transition hover:bg-surface-3 hover:text-ink"
          aria-label="Clear search"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </form>
  );
}
