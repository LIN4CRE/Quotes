import {
  ArrowUpRight,
  Quote as QuoteIcon,
  Search,
  Tag,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { Modal } from '@/components/ui/Modal';
import { authorRecords } from '@/data/authors';
import { categories } from '@/data/categories';
import { getQuote, quotes } from '@/data/quotes';
import { normalise, searchQuotes } from '@/lib/search';
import { useLibrary } from '@/providers/LibraryProvider';
import { cn } from '@/lib/cn';

interface PaletteResult {
  id: string;
  label: string;
  hint: string;
  to: string;
  group: string;
  icon: LucideIcon;
}

const pageResults: PaletteResult[] = [
  {
    id: 'page-discover',
    label: 'Discover',
    hint: 'Daily quote and random generator',
    to: '/',
    group: 'Pages',
    icon: ArrowUpRight,
  },
  {
    id: 'page-explore',
    label: 'Explore',
    hint: 'Browse themes and authors',
    to: '/explore',
    group: 'Pages',
    icon: ArrowUpRight,
  },
  {
    id: 'page-favourites',
    label: 'Favourites',
    hint: 'Your saved quotes',
    to: '/favourites',
    group: 'Pages',
    icon: ArrowUpRight,
  },
  {
    id: 'page-collections',
    label: 'Collections',
    hint: 'Your grouped lists',
    to: '/collections',
    group: 'Pages',
    icon: ArrowUpRight,
  },
  {
    id: 'page-history',
    label: 'History',
    hint: 'Recently viewed quotes',
    to: '/history',
    group: 'Pages',
    icon: ArrowUpRight,
  },
  {
    id: 'page-advice',
    label: 'Live advice',
    hint: 'Advice Slip integration',
    to: '/advice',
    group: 'Pages',
    icon: ArrowUpRight,
  },
  {
    id: 'page-settings',
    label: 'Settings',
    hint: 'Theme, data, install',
    to: '/settings',
    group: 'Pages',
    icon: ArrowUpRight,
  },
  {
    id: 'page-about',
    label: 'About and sources',
    hint: 'Attribution policy and privacy',
    to: '/about',
    group: 'Pages',
    icon: ArrowUpRight,
  },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { library } = useLibrary();

  const results = useMemo<PaletteResult[]>(() => {
    const trimmed = query.trim();
    const normalised = normalise(trimmed);
    const collected: PaletteResult[] = [];

    const matches = (...values: string[]) =>
      !normalised || values.some((value) => normalise(value).includes(normalised));

    const pages = pageResults.filter((page) => matches(page.label, page.hint));
    if (!trimmed) {
      collected.push(...pages.slice(0, 5));
    } else {
      collected.push(...pages.slice(0, 3));
    }

    if (!trimmed) {
      const recent = library.history
        .map((entry) => getQuote(entry.quoteId))
        .filter((quote): quote is NonNullable<typeof quote> => Boolean(quote))
        .slice(0, 3);

      for (const quote of recent) {
        collected.push({
          id: `recent-${quote.id}`,
          label: quote.text.length > 74 ? `${quote.text.slice(0, 74).trim()}…` : quote.text,
          hint: `${quote.author} · recently viewed`,
          to: `/quote/${quote.id}`,
          group: 'Recent',
          icon: QuoteIcon,
        });
      }
    }

    if (trimmed) {
      for (const quote of searchQuotes(trimmed, { limit: 6 })) {
        collected.push({
          id: `quote-${quote.id}`,
          label: quote.text.length > 74 ? `${quote.text.slice(0, 74).trim()}…` : quote.text,
          hint: quote.author,
          to: `/quote/${quote.id}`,
          group: 'Quotes',
          icon: QuoteIcon,
        });
      }

      for (const author of authorRecords
        .filter((item) => matches(item.name, item.era ?? '', item.nationality ?? ''))
        .slice(0, 4)) {
        collected.push({
          id: `author-${author.id}`,
          label: author.name,
          hint: author.lifespan ?? author.nationality ?? 'Author',
          to: `/author/${author.id}`,
          group: 'Authors',
          icon: UserRound,
        });
      }

      for (const category of categories.filter((item) => matches(item.name)).slice(0, 4)) {
        const count = quotes.filter((quote) => quote.categories.includes(category.id)).length;
        collected.push({
          id: `category-${category.id}`,
          label: category.name,
          hint: `${count} quotes`,
          to: `/category/${category.id}`,
          group: 'Themes',
          icon: Tag,
        });
      }
    }

    return collected;
  }, [query, library.history]);

  useEffect(() => {
    if (activeIndex < 0) return;
    const active = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const choose = (result: PaletteResult | undefined) => {
    if (!result) return;
    onOpenChange(false);
    navigate(result.to);
  };

  const groupLabels = [...new Set(results.map((result) => result.group))];

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(results[activeIndex]);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(Math.max(results.length - 1, 0));
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Search everything"
      description="Jump to a quote, author, theme or page."
      size="lg"
      initialFocusRef={inputRef}
      bodyClassName="p-0"
    >
      <div className="px-5 pb-4 sm:px-6">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle"
            aria-hidden
          />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-results"
            aria-autocomplete="list"
            {...(results[activeIndex]
              ? { 'aria-activedescendant': `command-${results[activeIndex].id}` }
              : {})}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a word, name or theme…"
            aria-label="Search the library"
            className="field h-12 rounded-xl pr-3 pl-9"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>

      <div
        id="command-results"
        role="listbox"
        aria-label="Search results"
        ref={listRef}
        className="max-h-[55dvh] overflow-y-auto border-t border-line px-2 py-2"
      >
        {results.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium text-ink">No matches for “{query.trim()}”</p>
            <p className="mt-1 text-xs text-muted">
              Try an author such as “Seneca”, a theme such as “courage”, or a phrase from the quote.
            </p>
          </div>
        ) : (
          groupLabels.map((group) => (
            <div key={group} className="mb-2">
              <p className="label-caps px-3 py-1.5">{group}</p>
              {results
                .filter((result) => result.group === group)
                .map((result) => {
                  const index = results.indexOf(result);
                  const Icon = result.icon;
                  return (
                    <button
                      key={result.id}
                      type="button"
                      id={`command-${result.id}`}
                      data-index={index}
                      role="option"
                      aria-selected={index === activeIndex}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => choose(result)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                        index === activeIndex
                          ? 'bg-surface-2 text-ink'
                          : 'text-muted hover:bg-surface-2/60',
                      )}
                    >
                      <Icon className="size-4 shrink-0 text-accent" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-ink">
                          {result.label}
                        </span>
                        <span className="block truncate text-[11px] text-subtle">
                          {result.hint}
                        </span>
                      </span>
                      {index === activeIndex ? (
                        <span className="hidden shrink-0 text-[10px] text-subtle sm:block">↵</span>
                      ) : null}
                    </button>
                  );
                })}
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-2.5 text-[10.5px] text-subtle">
        <span>↑↓ navigate · ↵ open · esc close</span>
        <span className="hidden sm:inline">Cmd/Ctrl K</span>
      </div>
    </Modal>
  );
}
