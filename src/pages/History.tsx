import { ArrowRight, History as HistoryIcon, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { AuthorAvatar } from '@/components/quotes/AuthorAvatar';
import { AttributionBadge } from '@/components/ui/Badge';
import { Button, LinkButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { getQuote } from '@/data/quotes';
import { dayLabel, relativeTime } from '@/lib/dates';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/providers/LibraryProvider';
import { useToast } from '@/providers/ToastProvider';

export default function HistoryPage() {
  useDocumentTitle('History');
  const { library, clearHistory } = useLibrary();
  const { addToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const groups = useMemo(() => {
    const map = new Map<
      string,
      Array<{ quote: NonNullable<ReturnType<typeof getQuote>>; viewedAt: string }>
    >();

    for (const entry of library.history) {
      const quote = getQuote(entry.quoteId);
      if (!quote) continue;
      const label = dayLabel(entry.viewedAt);
      const list = map.get(label) ?? [];
      list.push({ quote, viewedAt: entry.viewedAt });
      map.set(label, list);
    }

    return [...map.entries()];
  }, [library.history]);

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Your library"
        title="Reading history"
        description="The most recent quotes you opened, newest first. History is stored only in this browser and capped at 100 entries."
        actions={
          library.history.length > 0 ? (
            <Button variant="outline" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="size-4" aria-hidden />
              Clear history
            </Button>
          ) : null
        }
      />

      {library.history.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No reading history yet"
          description="Open any quote and it will appear here so you can find your way back."
          action={<LinkButton to="/">Find a quote</LinkButton>}
        />
      ) : (
        <div className="space-y-8">
          <p className="text-[11.5px] text-subtle">
            {library.history.length} entr{library.history.length === 1 ? 'y' : 'ies'}, most recent
            first.
          </p>

          {groups.map(([label, entries]) => (
            <section key={label} aria-labelledby={`day-${label.replace(/\s+/g, '-')}`}>
              <h2
                id={`day-${label.replace(/\s+/g, '-')}`}
                className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-subtle uppercase"
              >
                {label}
              </h2>
              <ul className="space-y-2">
                {entries.map(({ quote, viewedAt }) => (
                  <li
                    key={`${quote.id}-${viewedAt}`}
                    className="group flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-line-strong"
                  >
                    <AuthorAvatar name={quote.author} size="sm" className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <Link to={`/quote/${quote.id}`} className="block">
                        <p className="line-clamp-2 font-serif text-[14px] leading-snug text-ink transition group-hover:text-white">
                          “{quote.text}”
                        </p>
                      </Link>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] text-subtle">
                        <span>{quote.author}</span>
                        <span aria-hidden>·</span>
                        <span>{relativeTime(viewedAt)}</span>
                        <AttributionBadge status={quote.attribution} compact className="ml-1" />
                      </p>
                    </div>
                    <Link
                      to={`/quote/${quote.id}`}
                      className="mt-1 shrink-0 rounded-full p-1.5 text-subtle transition hover:bg-surface-2 hover:text-ink"
                      aria-label={`Open quote by ${quote.author}`}
                    >
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Clear reading history?"
        description="This only removes the history list. Your saved quotes and collections are untouched."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clearHistory();
                setConfirmOpen(false);
                addToast({ title: 'Reading history cleared', variant: 'info' });
              }}
            >
              Clear history
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          {library.history.length} entr{library.history.length === 1 ? 'y' : 'ies'} will be removed
          from this browser. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
