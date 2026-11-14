import { FolderOpen, Layers, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CollectionCard, CuratedCollectionCard } from '@/components/library/CollectionCards';
import { CollectionDialog } from '@/components/library/CollectionDialog';
import { Button, LinkButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader, SectionHeader } from '@/components/ui/PageHeader';
import { curatedCollections } from '@/data/collections';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/providers/LibraryProvider';

export default function Collections() {
  useDocumentTitle('Collections');
  const { library } = useLibrary();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Your library"
        title="Collections"
        description="Group quotes by project, theme or feeling. Collections live in this browser with your favourites; export a backup from Settings."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" aria-hidden />
            New collection
          </Button>
        }
      />

      <section aria-labelledby="your-collections-heading">
        <SectionHeader
          id="your-collections-heading"
          title="Your collections"
          description={
            library.collections.length > 0
              ? `${library.collections.length} collection${library.collections.length === 1 ? '' : 's'} saved locally.`
              : undefined
          }
        />

        {library.collections.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No collections yet"
            description="Create a collection for the quotes you want to return to — a talk you are writing, a gift, or a theme you are thinking about."
            action={
              <>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="size-4" aria-hidden />
                  Create a collection
                </Button>
                <LinkButton to="/favourites" variant="secondary">
                  Browse favourites
                </LinkButton>
              </>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {library.collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-line-strong px-5 py-8 text-muted transition hover:border-accent/50 hover:bg-surface/60 hover:text-ink"
            >
              <span className="grid size-10 place-items-center rounded-full border border-line bg-surface-2">
                <Plus className="size-4" aria-hidden />
              </span>
              <span className="text-sm font-medium">New collection</span>
            </button>
          </div>
        )}
      </section>

      <section className="mt-14" aria-labelledby="featured-collections-heading">
        <SectionHeader
          id="featured-collections-heading"
          title="Featured collections"
          description="Editor-curated sets. Open one and save it to your own library."
          action={
            <span className="inline-flex items-center gap-1 text-[11px] text-subtle">
              <Sparkles className="size-3.5" aria-hidden />
              {curatedCollections.length} collections
            </span>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {curatedCollections.map((collection) => (
            <CuratedCollectionCard
              key={collection.id}
              collection={collection}
              showSaveHint={false}
            />
          ))}
        </div>
      </section>

      <div className="mt-10 flex items-start gap-3 rounded-2xl border border-line bg-surface/60 px-5 py-4 text-[11.5px] leading-relaxed text-muted">
        <Layers className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
        <p>
          A quote can live in as many collections as you like. Removing a quote from a collection
          does not remove it from your favourites, and deleting a collection never deletes quotes
          themselves.
        </p>
      </div>

      {dialogOpen ? (
        <CollectionDialog
          open
          onClose={() => setDialogOpen(false)}
          onSaved={(collection) => navigate(`/collections/${collection.id}`)}
        />
      ) : null}
    </div>
  );
}
