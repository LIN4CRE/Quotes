import { Check, FolderPlus, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { getQuote } from '@/data/quotes';
import { useLibrary } from '@/providers/LibraryProvider';
import { useToast } from '@/providers/ToastProvider';
import { cn } from '@/lib/cn';
import { validateCollectionName } from '@/lib/library';

interface CollectionPickerProps {
  open: boolean;
  onClose: () => void;
  quoteId?: string;
  reflectionId?: string;
}

export function CollectionPicker({ open, onClose, quoteId, reflectionId }: CollectionPickerProps) {
  const {
    library,
    createCollection,
    addToCollection,
    removeFromCollection,
    addReflectionToCollection,
    removeReflectionFromCollection,
  } = useLibrary();
  const { addToast } = useToast();
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const quote = quoteId ? getQuote(quoteId) : undefined;
  const reflection = reflectionId
    ? library.reflections.find((item) => item.id === reflectionId)
    : undefined;
  const preview = quote?.text ?? reflection?.text;

  const isInCollection = (collection: (typeof library.collections)[number]) =>
    quoteId
      ? collection.quoteIds.includes(quoteId)
      : collection.reflectionIds.includes(reflectionId ?? '');

  const handleToggle = (collectionId: string, checked: boolean) => {
    if (quoteId) {
      if (checked) {
        const result = addToCollection(collectionId, quoteId);
        if (result === 'duplicate') {
          addToast({ title: 'Already in that collection', variant: 'info' });
        } else if (result === 'added') {
          addToast({ title: 'Added to collection', variant: 'success' });
        }
      } else {
        removeFromCollection(collectionId, quoteId);
        addToast({ title: 'Removed from collection', variant: 'info' });
      }
      return;
    }

    if (!reflectionId) return;

    if (checked) {
      const result = addReflectionToCollection(collectionId, reflectionId);
      if (result === 'duplicate') {
        addToast({ title: 'Already in that collection', variant: 'info' });
      } else if (result === 'added') {
        addToast({ title: 'Reflection added to collection', variant: 'success' });
      }
    } else {
      removeReflectionFromCollection(collectionId, reflectionId);
      addToast({ title: 'Reflection removed from collection', variant: 'info' });
    }
  };

  const handleCreate = () => {
    const message = validateCollectionName(newName, library.collections);
    if (message) {
      setError(message);
      return;
    }

    const collection = createCollection(
      newName,
      '',
      quoteId ? [quoteId] : [],
      reflectionId ? [reflectionId] : [],
    );
    if (!collection) {
      setError('That collection could not be created.');
      return;
    }

    addToast({
      title: `Created “${collection.name}”`,
      description: quoteId ? 'Quote added to it.' : 'Reflection added to it.',
      variant: 'success',
    });
    setNewName('');
    setError(null);
    setCreating(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add to collection"
      description="Collections are saved in this browser alongside your favourites."
      footer={
        <Button variant="secondary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="space-y-4">
        {preview ? (
          <p className="rounded-xl border border-line bg-surface-2 px-4 py-3 font-serif text-sm leading-relaxed text-muted">
            {quote ? '“' : ''}
            {preview.length > 120 ? `${preview.slice(0, 120).trim()}…` : preview}
            {quote ? '”' : ''}
          </p>
        ) : null}

        {library.collections.length === 0 && !creating ? (
          <p className="text-sm text-muted">
            You do not have any collections yet. Create one to group quotes by theme, project or
            mood.
          </p>
        ) : null}

        <ul className="space-y-2">
          {library.collections.map((collection) => {
            const checked = isInCollection(collection);
            return (
              <li key={collection.id}>
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition',
                    checked
                      ? 'border-accent/35 bg-accent-soft'
                      : 'border-line bg-surface-2 hover:border-line-strong',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-5 shrink-0 place-items-center rounded-md border transition',
                      checked
                        ? 'border-accent bg-accent text-accent-ink'
                        : 'border-line-strong bg-surface',
                    )}
                    aria-hidden
                  >
                    {checked ? <Check className="size-3.5" strokeWidth={3} /> : null}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(event) => handleToggle(collection.id, event.target.checked)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {collection.name}
                    </span>
                    <span className="block text-[11px] text-subtle">
                      {collection.quoteIds.length} quote
                      {collection.quoteIds.length === 1 ? '' : 's'}
                      {collection.reflectionIds.length > 0
                        ? ` · ${collection.reflectionIds.length} reflection${
                            collection.reflectionIds.length === 1 ? '' : 's'
                          }`
                        : ''}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        {creating ? (
          <div className="rounded-xl border border-line bg-surface-2 p-3">
            <label htmlFor="new-collection-name" className="label-caps">
              Collection name
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="new-collection-name"
                value={newName}
                onChange={(event) => {
                  setNewName(event.target.value);
                  setError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleCreate();
                  }
                }}
                maxLength={80}
                placeholder="e.g. Monday reflections"
                className="field"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'new-collection-error' : undefined}
              />
              <Button onClick={handleCreate} className="shrink-0">
                Create
              </Button>
            </div>
            {error ? (
              <p id="new-collection-error" className="mt-2 text-xs text-danger" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" aria-hidden />
            New collection
          </Button>
        )}

        {library.collections.length === 0 && !creating ? (
          <div className="flex items-center gap-2 text-xs text-subtle">
            <FolderPlus className="size-4" aria-hidden />
            Collections appear on the Collections page.
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
