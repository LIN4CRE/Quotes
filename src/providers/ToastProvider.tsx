import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { cn } from '@/lib/cn';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastInput {
  title: string;
  description?: string | undefined;
  variant?: ToastVariant | undefined;
}

interface Toast extends ToastInput {
  id: number;
}

interface ToastContextValue {
  addToast: (toast: ToastInput) => void;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantIcon = {
  success: CheckCircle2,
  error: TriangleAlert,
  info: Info,
} as const;

const variantClasses: Record<ToastVariant, string> = {
  success: 'text-emerald-300',
  error: 'text-rose-300',
  info: 'text-sky-300',
};

export const TOAST_DURATION = 4500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef<Map<number, number>>(new Map());

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (input: ToastInput) => {
      const id = nextId.current;
      nextId.current += 1;
      const toast: Toast = { id, variant: 'info', ...input };

      setToasts((current) =>
        [
          ...current.filter(
            (item) => item.title !== toast.title || item.description !== toast.description,
          ),
          toast,
        ].slice(-4),
      );

      const timer = window.setTimeout(() => dismissToast(id), TOAST_DURATION);
      timers.current.set(id, timer);
    },
    [dismissToast],
  );

  useEffect(() => {
    const timersMap = timers.current;
    return () => {
      for (const timer of timersMap.values()) window.clearTimeout(timer);
      timersMap.clear();
    };
  }, []);

  const value = useMemo(() => ({ addToast, dismissToast }), [addToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
        aria-live="polite"
        aria-atomic="false"
        data-testid="toast-region"
      >
        {toasts.map((toast) => {
          const Icon = variantIcon[toast.variant ?? 'info'];
          return (
            <div
              key={toast.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-surface/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl motion-safe:animate-toast-in"
            >
              <Icon
                className={cn('mt-0.5 size-5 shrink-0', variantClasses[toast.variant ?? 'info'])}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-[13px] leading-snug text-muted">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="-m-1 rounded-lg p-1 text-subtle transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                aria-label="Dismiss notification"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
