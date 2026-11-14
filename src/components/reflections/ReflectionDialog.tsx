import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MAX_REFLECTION_AUTHOR, MAX_REFLECTION_TEXT, MAX_REFLECTION_TITLE } from '@/lib/library';
import type { Reflection } from '@/types';
import { useLibrary } from '@/providers/LibraryProvider';
import { useToast } from '@/providers/ToastProvider';

interface ReflectionDialogProps {
  reflection?: Reflection;
  onClose: () => void;
}

/**
 * Editor for locally written reflections. The parent mounts this component
 * only while the dialog is open, so each edit starts from a clean draft.
 */
export function ReflectionDialog({ reflection, onClose }: ReflectionDialogProps) {
  const { createReflection, updateReflection } = useLibrary();
  const { addToast } = useToast();
  const [title, setTitle] = useState(reflection?.title ?? '');
  const [text, setText] = useState(reflection?.text ?? '');
  const [author, setAuthor] = useState(reflection?.author ?? '');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const save = () => {
    if (!text.trim()) {
      setError('Write something first — a line, an observation or a reflection.');
      textareaRef.current?.focus();
      return;
    }

    if (reflection) {
      updateReflection(reflection.id, { title, text, author });
      addToast({ title: 'Reflection updated', variant: 'success' });
    } else {
      const created = createReflection({ title, text, author });
      if (!created) {
        setError('This reflection could not be saved. The local limit may have been reached.');
        return;
      }
      addToast({
        title: 'Reflection saved',
        description: 'Kept privately in this browser.',
        variant: 'success',
      });
    }

    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={reflection ? 'Edit reflection' : 'New reflection'}
      description="Your own words, kept in this browser. They are never presented as historical quotations or included in the curated library."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{reflection ? 'Save changes' : 'Save reflection'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="reflection-title" className="label-caps">
            Title <span className="normal-case tracking-normal text-subtle">(optional)</span>
          </label>
          <input
            id="reflection-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={MAX_REFLECTION_TITLE}
            placeholder="e.g. On beginning again"
            className="field mt-2"
          />
        </div>

        <div>
          <label htmlFor="reflection-text" className="label-caps">
            Quote or reflection
          </label>
          <textarea
            id="reflection-text"
            ref={textareaRef}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setError('');
            }}
            rows={8}
            maxLength={MAX_REFLECTION_TEXT}
            placeholder="Write the line you want to keep, or what it made you think."
            className="field mt-2 resize-y font-serif text-[16px] leading-relaxed"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'reflection-error' : 'reflection-hint'}
          />
          <div className="mt-1 flex items-start justify-between gap-3">
            <p id="reflection-hint" className="text-[10.5px] leading-relaxed text-subtle">
              This is your writing. It is not checked against sources and is never labelled
              verified.
            </p>
            <span className="shrink-0 text-[10.5px] text-subtle tabular-nums">
              {text.length}/{MAX_REFLECTION_TEXT}
            </span>
          </div>
          {error ? (
            <p id="reflection-error" role="alert" className="mt-2 text-xs text-danger">
              {error}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="reflection-author" className="label-caps">
            Author or personal attribution{' '}
            <span className="normal-case tracking-normal text-subtle">(optional)</span>
          </label>
          <input
            id="reflection-author"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            maxLength={MAX_REFLECTION_AUTHOR}
            placeholder="e.g. Me, or a friend’s name"
            className="field mt-2"
          />
        </div>
      </div>
    </Modal>
  );
}
