import { X } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/cn';
import { IconButton } from '@/components/ui/Button';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  bodyClassName?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Accessible dialog: focus is moved in, trapped, and restored on close.
 * Escape and backdrop clicks close it; background scrolling is locked.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  bodyClassName,
  initialFocusRef,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onCloseRef.current();
      return;
    }

    if (event.key !== 'Tab') return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (element) => !element.hasAttribute('disabled') && element.offsetParent !== null,
    );

    if (focusable.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const firstFocusable = initialFocusRef?.current ?? panel?.querySelector<HTMLElement>(FOCUSABLE);
    (firstFocusable ?? panel)?.focus();

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [open, handleKeyDown, initialFocusRef]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm motion-safe:animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        {...(description ? { 'aria-describedby': descriptionId } : {})}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-2xl shadow-black/50 motion-safe:animate-scale-in sm:rounded-3xl',
          size === 'sm' && 'sm:max-w-md',
          size === 'md' && 'sm:max-w-lg',
          size === 'lg' && 'sm:max-w-2xl',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-[13px] leading-relaxed text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <IconButton label="Close dialog" size="sm" onClick={onClose} className="-mr-1 shrink-0">
            <X className="size-4" aria-hidden />
          </IconButton>
        </div>

        <div className={cn('min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6', bodyClassName)}>
          {children}
        </div>

        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-2/50 px-5 py-3.5 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
