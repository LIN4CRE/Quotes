import { NotebookPen, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button, IconButton } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MAX_NOTE_LENGTH } from '@/lib/library';
import { useLibrary } from '@/providers/LibraryProvider';
import { useToast } from '@/providers/ToastProvider';
import { cn } from '@/lib/cn';

export function QuoteNote({
  quoteId,
  note,
  className,
}: {
  quoteId: string;
  note?: string | undefined;
  className?: string;
}) {
  const { setNote } = useLibrary();
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(note ?? '');

  const openEditor = () => {
    setDraft(note ?? '');
    setOpen(true);
  };

  const save = () => {
    setNote(quoteId, draft);
    setOpen(false);
    addToast({ title: draft.trim() ? 'Note saved' : 'Note removed', variant: 'success' });
  };

  const remove = () => {
    setNote(quoteId, '');
    setOpen(false);
    addToast({ title: 'Note removed', variant: 'info' });
  };

  return (
    <div className={cn('mt-4', className)}>
      {note ? (
        <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-2/70 px-4 py-3">
          <NotebookPen className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="label-caps">Your note</p>
            <p className="mt-1.5 text-[13px] leading-relaxed whitespace-pre-wrap text-muted">
              {note}
            </p>
          </div>
          <IconButton label="Edit note" size="sm" onClick={openEditor} className="-mr-1 shrink-0">
            <Pencil className="size-3.5" aria-hidden />
          </IconButton>
        </div>
      ) : (
        <Button variant="ghost" size="sm" onClick={openEditor} className="-ml-2">
          <NotebookPen className="size-3.5" aria-hidden />
          Add a personal note
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={note ? 'Edit note' : 'Add a note'}
        description="Notes stay in this browser with your saved quote. They are never shared."
        footer={
          <>
            {note ? (
              <Button variant="ghost" onClick={remove} className="mr-auto text-danger">
                <Trash2 className="size-4" aria-hidden />
                Remove note
              </Button>
            ) : null}
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save note</Button>
          </>
        }
      >
        <label htmlFor={`note-${quoteId}`} className="label-caps">
          Note
        </label>
        <textarea
          id={`note-${quoteId}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={5}
          maxLength={MAX_NOTE_LENGTH}
          placeholder="Why this quote matters, where you found it, who it reminds you of…"
          className="field mt-2 resize-y leading-relaxed"
        />
        <p className="mt-2 text-right text-[11px] text-subtle">
          {draft.length} / {MAX_NOTE_LENGTH}
        </p>
      </Modal>
    </div>
  );
}
