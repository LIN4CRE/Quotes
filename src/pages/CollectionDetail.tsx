import { ArrowLeft, ArrowRight, Download, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { CollectionDialog } from '@/components/library/CollectionDialog';
import { QuoteList } from '@/components/quotes/QuoteList';
import { Button, IconButton, LinkButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { MissingPage } from '@/components/ui/MissingPage';
import { Modal } from '@/components/ui/Modal';
import { getQuote } from '@/data/quotes';
import { relativeTime } from '@/lib/dates';
import { datedFilename, downloadText } from '@/lib/download';
import { exportLibraryAsJson } from '@/lib/library';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/providers/LibraryProvider';
import { useSettings } from '@/providers/SettingsProvider';
import { useToast } from '@/providers/ToastProvider';
import { FolderOpen } from 'lucide-react';

export default function CollectionDetail() {
  const { collectionId = '' } = useParams();
  const navigate = useNavigate();
  const { library, removeFromCollection, deleteCollection } = useLibrary();
  const { settings } = useSettings();
  const { addToast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const collection = library.collections.find((item) => item.id === collectionId);
  useDocumentTitle(collection?.name ?? 'Collection');

  if (!collection) {
    return (
      <MissingPage
        title="Collection not found"
        description="This collection may have been deleted, or it belongs to a different browser."
        action={
          <LinkButton to="/collections" variant="secondary">
            View all collections
          </LinkButton>
        }
      />
    );
  }

  const quotes = collection.quoteIds
    .map((id) => getQuote(id))
    .filter((quote): quote is NonNullable<typeof quote> => Boolean(quote));

  const handleDelete = () => {
    deleteCollection(collection.id);
    setDeleteOpen(false);
    addToast({ title: `Deleted “${collection.name}”`, variant: 'info' });
    navigate('/collections', { replace: true });
  };

  const handleExport = () => {
    const payload = exportLibraryAsJson(
      {
        version: 2,
        favourites: [],
        collections: [collection],
        history: [],
        advice: [],
      },
      settings,
    );
    downloadText(payload, datedFilename(`lin4cre-collection-${collection.id}`, 'json'));
    addToast({
      title: 'Collection exported',
      description: 'Import it from Settings on any device.',
      variant: 'success',
    });
  };

  return (
    <div className="animate-rise">
      <Link
        to="/collections"
        className="mb-5 inline-flex items-center gap-1.5 text-[12px] text-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        All collections
      </Link>

      <header className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -top-20 -right-10 size-56 rounded-full bg-accent/10 blur-3xl"
          aria-hidden
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="label-caps flex items-center gap-2">
              <FolderOpen className="size-3.5 text-accent" aria-hidden />
              Collection
            </p>
            <h1 className="display-title mt-2 text-[2rem] break-words text-ink sm:text-[2.6rem]">
              {collection.name}
            </h1>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">
              {collection.description || 'No description yet. Edit the collection to add one.'}
            </p>
            <p className="mt-3 text-[11px] text-subtle">
              {quotes.length} quote{quotes.length === 1 ? '' : 's'} · updated{' '}
              {relativeTime(collection.updatedAt)}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-1.5">
            <IconButton
              label="Edit collection"
              size="md"
              variant="secondary"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-4" aria-hidden />
            </IconButton>
            <IconButton
              label="Export collection"
              size="md"
              variant="secondary"
              onClick={handleExport}
            >
              <Download className="size-4" aria-hidden />
            </IconButton>
            <IconButton
              label="Delete collection"
              size="md"
              variant="danger"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" aria-hidden />
            </IconButton>
          </div>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-subtle">
          Add quotes from the library, a quote page, or the “Collect” action on any card.
        </p>
        <LinkButton to="/search" variant="secondary" size="sm">
          <Plus className="size-3.5" aria-hidden />
          Find quotes to add
        </LinkButton>
      </div>

      <section className="mt-5" aria-label={`Quotes in ${collection.name}`}>
        {quotes.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="This collection is empty"
            description="Search the library and use “Add to collection” on any quote. Your collection will be waiting."
            action={
              <LinkButton to="/search">
                Search quotes
                <ArrowRight className="size-4" aria-hidden />
              </LinkButton>
            }
          />
        ) : (
          <QuoteList
            quotes={quotes}
            pageSize={12}
            resetKey={collection.id}
            extraActions={(quote) => (
              <IconButton
                label="Remove from this collection"
                size="sm"
                onClick={() => {
                  removeFromCollection(collection.id, quote.id);
                  addToast({ title: 'Removed from collection', variant: 'info' });
                }}
              >
                <Trash2 className="size-4" aria-hidden />
              </IconButton>
            )}
          />
        )}
      </section>

      {editOpen ? (
        <CollectionDialog open onClose={() => setEditOpen(false)} collection={collection} />
      ) : null}

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete this collection?"
        description="The quotes stay in the library and in your favourites. Only the collection itself is removed."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Keep collection
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 className="size-4" aria-hidden />
              Delete collection
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          “{collection.name}” contains {collection.quoteIds.length} quote
          {collection.quoteIds.length === 1 ? '' : 's'}. This cannot be undone, but you can export
          the collection first.
        </p>
      </Modal>
    </div>
  );
}
