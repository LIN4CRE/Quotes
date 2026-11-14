import { Feather, Heart, Plus, SearchX } from 'lucide-react';
import { useMemo, useState } from 'react';

import { CollectionPicker } from '@/components/library/CollectionPicker';
import { ReflectionCard } from '@/components/reflections/ReflectionCard';
import { ReflectionDialog } from '@/components/reflections/ReflectionDialog';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchField } from '@/components/ui/SearchField';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { normalise } from '@/lib/search';
import { cn } from '@/lib/cn';
import { useLibrary } from '@/providers/LibraryProvider';
import { useToast } from '@/providers/ToastProvider';
import type { Reflection } from '@/types';

type Filter = 'all' | 'favourites';

export default function Reflections() {
  useDocumentTitle('My quotes and reflections');
  const { library, toggleReflectionFavourite, deleteReflection } = useLibrary();
  const { addToast } = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [editor, setEditor] = useState<{ reflection?: Reflection } | null>(null);
  const [deleting, setDeleting] = useState<Reflection | null>(null);
  const [collecting, setCollecting] = useState<Reflection | null>(null);

  const reflections = library.reflections;
  const favouriteCount = reflections.filter((reflection) => reflection.favourite).length;

  const visible = useMemo(() => {
    const needle = normalise(query);
    return reflections
      .filter((reflection) => filter === 'all' || reflection.favourite)
      .filter((reflection) => {
        if (!needle) return true;
        return [reflection.title, reflection.text, reflection.author]
          .filter((value): value is string => Boolean(value))
          .some((value) => normalise(value).includes(needle));
      })
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }, [reflections, query, filter]);

  const handleFavourite = (reflection: Reflection) => {
    const favourite = toggleReflectionFavourite(reflection.id);
    addToast({
      title: favourite ? 'Added to favourite reflections' : 'Removed from favourites',
      variant: 'success',
    });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteReflection(deleting.id);
    addToast({
      title: 'Reflection deleted',
      description: 'It has also been removed from your collections.',
      variant: 'info',
    });
    setDeleting(null);
  };

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Your writing"
        title="My quotes & reflections"
        description="A private notebook for lines you write yourself — a sentence worth keeping, or what a quote made you think. These entries never enter the curated library or claim a historical author."
        actions={
          <Button onClick={() => setEditor({})}>
            <Plus className="size-4" aria-hidden />
            New reflection
          </Button>
        }
      />

      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-accent/25 bg-accent-soft/60 px-4 py-3 text-[12px] leading-relaxed text-muted">
        <Feather className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
        <p>
          <span className="font-medium text-ink">Clearly separate from the quote library.</span>{' '}
          Everything here is written by you, stored only in this browser, and labelled “Your words”.
          It is included in your JSON backup and can be grouped into collections.
        </p>
      </div>

      {reflections.length > 0 ? (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchField
            value={query}
            onChange={setQuery}
            label="Search your reflections"
            placeholder="Search your reflections…"
            id="reflection-search"
            className="w-full sm:max-w-md"
          />
          <div className="flex items-center gap-2" role="group" aria-label="Filter reflections">
            {(
              [
                { value: 'all', label: `All ${reflections.length}` },
                { value: 'favourites', label: `Favourites ${favouriteCount}` },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                aria-pressed={filter === option.value}
                className={cn(
                  'inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-[11.5px] font-medium transition',
                  filter === option.value
                    ? 'border-accent/45 bg-accent-soft text-ink'
                    : 'border-line bg-surface-2 text-muted hover:border-line-strong hover:text-ink',
                )}
              >
                {option.value === 'favourites' ? <Heart className="size-3.5" aria-hidden /> : null}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {visible.length} reflection{visible.length === 1 ? '' : 's'} shown.
      </p>

      {reflections.length === 0 ? (
        <EmptyState
          icon={Feather}
          title="A page for your own words"
          description="Write a sentence you want to remember, or a thought a quotation stirred. Add an optional title and attribution, then keep it here or in a collection."
          action={
            <Button onClick={() => setEditor({})}>
              <Plus className="size-4" aria-hidden />
              Write your first reflection
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          compact
          icon={SearchX}
          title="No reflections match"
          description={
            filter === 'favourites'
              ? 'You have not favourited any reflections yet, or none match this search.'
              : 'Try a shorter phrase, or clear the search to see everything.'
          }
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery('');
                setFilter('all');
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid items-stretch gap-4 md:grid-cols-2">
          {visible.map((reflection) => (
            <ReflectionCard
              key={reflection.id}
              reflection={reflection}
              onEdit={(item) => setEditor({ reflection: item })}
              onDelete={setDeleting}
              onCollect={setCollecting}
              onToggleFavourite={handleFavourite}
            />
          ))}
        </div>
      )}

      {editor ? (
        <ReflectionDialog
          key={editor.reflection?.id ?? 'new'}
          {...(editor.reflection ? { reflection: editor.reflection } : {})}
          onClose={() => setEditor(null)}
        />
      ) : null}

      {collecting ? (
        <CollectionPicker open onClose={() => setCollecting(null)} reflectionId={collecting.id} />
      ) : null}

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete this reflection?"
        description="This cannot be undone. If you might want it later, export a backup first."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete reflection
            </Button>
          </>
        }
      >
        {deleting ? (
          <p className="rounded-xl border border-line bg-surface-2 px-4 py-3 font-serif text-sm leading-relaxed text-muted">
            “{deleting.text.length > 180 ? `${deleting.text.slice(0, 180).trim()}…` : deleting.text}
            ”
          </p>
        ) : null}
      </Modal>
    </div>
  );
}
