import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  MAX_COLLECTION_DESCRIPTION,
  MAX_COLLECTION_NAME,
  validateCollectionName,
} from '@/lib/library';
import { useLibrary } from '@/providers/LibraryProvider';
import { useToast } from '@/providers/ToastProvider';
import type { Collection } from '@/types';

interface CollectionDialogProps {
  open: boolean;
  onClose: () => void;
  collection?: Collection;
  onSaved?: (collection: Collection) => void;
}

export function CollectionDialog({ open, onClose, collection, onSaved }: CollectionDialogProps) {
  const { library, createCollection, updateCollection } = useLibrary();
  const { addToast } = useToast();
  const [name, setName] = useState(collection?.name ?? '');
  const [description, setDescription] = useState(collection?.description ?? '');
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(collection);

  const handleSave = () => {
    const validation = validateCollectionName(name, library.collections, collection?.id);
    if (validation) {
      setError(validation);
      return;
    }

    if (collection) {
      updateCollection(collection.id, { name, description });
      addToast({ title: 'Collection updated', variant: 'success' });
      onSaved?.({ ...collection, name: name.trim(), description: description.trim() });
      onClose();
      return;
    }

    const created = createCollection(name, description);
    if (!created) {
      setError('That collection could not be created.');
      return;
    }

    addToast({ title: `Created “${created.name}”`, variant: 'success' });
    onSaved?.(created);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit collection' : 'New collection'}
      description={
        isEdit
          ? 'Rename this collection or update its description.'
          : 'Give the collection a name. You can add quotes from any quote card or quote page.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{isEdit ? 'Save changes' : 'Create collection'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="collection-name" className="label-caps">
            Name
          </label>
          <input
            id="collection-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
            maxLength={MAX_COLLECTION_NAME}
            placeholder="e.g. Leadership notes"
            className="field mt-2"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'collection-name-error' : undefined}
          />
          {error ? (
            <p id="collection-name-error" role="alert" className="mt-2 text-xs text-danger">
              {error}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="collection-description" className="label-caps">
            Description <span className="font-normal tracking-normal text-subtle">(optional)</span>
          </label>
          <textarea
            id="collection-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={MAX_COLLECTION_DESCRIPTION}
            rows={3}
            placeholder="What is this collection for?"
            className="field mt-2 resize-y leading-relaxed"
          />
          <p className="mt-1 text-right text-[10.5px] text-subtle">
            {description.length} / {MAX_COLLECTION_DESCRIPTION}
          </p>
        </div>
      </div>
    </Modal>
  );
}
