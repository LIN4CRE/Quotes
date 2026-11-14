import { Check, CircleAlert, Copy, Loader2, Radio, RefreshCw, Trash2, WifiOff } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button, IconButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { formatSavedAt, relativeTime } from '@/lib/dates';
import { copyText } from '@/lib/share';
import { useLibrary } from '@/providers/LibraryProvider';
import { useToast } from '@/providers/ToastProvider';
import { fetchAdvice, ADVICE_ENDPOINT, AdviceError } from '@/services/advice';
import { cn } from '@/lib/cn';

let autoFetchedThisSession = false;

type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export default function Advice() {
  useDocumentTitle('Live advice');
  const isOnline = useOnlineStatus();
  const { library, addAdvice, removeAdvice, clearAdvice } = useLibrary();
  const { addToast } = useToast();

  const [status, setStatus] = useState<RequestStatus>('idle');
  const [error, setError] = useState('');
  const [liveText, setLiveText] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [wasDuplicate, setWasDuplicate] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);

  const loadingRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const wasOnlineRef = useRef(isOnline);

  const request = useCallback(async () => {
    if (loadingRef.current) return;

    if (!isOnline) {
      setStatus('error');
      setError('You are offline. Saved entries are still available below.');
      return;
    }

    loadingRef.current = true;
    setStatus('loading');
    setError('');

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const payload = await fetchAdvice(controller.signal);
      setLiveText(payload.advice);
      setStatus('success');
      setWasDuplicate(false);

      const result = addAdvice(payload.advice);

      if (result === 'duplicate') {
        setWasDuplicate(true);
        setSavedAt(null);
        addToast({
          title: 'Advice already saved',
          description: 'Duplicates are not added twice.',
          variant: 'info',
        });
      } else {
        setSavedAt(new Date().toISOString());
        addToast({
          title: 'Advice saved',
          description: 'Stored on this device with a timestamp.',
          variant: 'success',
        });
      }
    } catch (reason) {
      if (controller.signal.aborted) return;
      const message =
        reason instanceof AdviceError
          ? reason.message
          : 'The advice service could not be reached. Try again shortly.';
      setStatus('error');
      setError(message);
      addToast({ title: 'Could not fetch advice', description: message, variant: 'error' });
    } finally {
      loadingRef.current = false;
    }
  }, [addAdvice, addToast, isOnline]);

  // Preserve the original page's behaviour: fetch once when the page opens online.
  useEffect(() => {
    if (!isOnline || autoFetchedThisSession) return;
    const timer = window.setTimeout(() => {
      autoFetchedThisSession = true;
      void request();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isOnline, request]);

  // ...and fetch again when the connection returns.
  useEffect(() => {
    const reconnected = !wasOnlineRef.current && isOnline;
    wasOnlineRef.current = isOnline;
    if (!reconnected) return;
    const timer = window.setTimeout(() => void request(), 0);
    return () => window.clearTimeout(timer);
  }, [isOnline, request]);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const entries = [...library.advice].reverse();

  const handleCopy = async (text: string) => {
    const copied = await copyText(text);
    addToast({
      title: copied ? 'Copied to clipboard' : 'Could not copy',
      variant: copied ? 'success' : 'error',
    });
  };

  const connectionState = !isOnline
    ? { label: 'Offline', className: 'border-danger/30 bg-danger/10 text-danger', dot: 'bg-danger' }
    : status === 'loading'
      ? {
          label: 'Contacting Advice Slip…',
          className: 'border-accent/30 bg-accent-soft text-accent',
          dot: 'bg-accent animate-pulse',
        }
      : {
          label: 'Online',
          className: 'border-success/30 bg-success/10 text-success',
          dot: 'bg-success',
        };

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Source · Advice Slip"
        title="Live advice"
        description="The working idea from the original g.html page, rebuilt: fetch a tip when you ask, check your connection, avoid duplicates and keep timestamped entries. Advice is not the same as an attributed quotation, so it lives here rather than in the quote library."
        actions={
          <>
            <span
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11.5px] font-medium',
                connectionState.className,
              )}
            >
              <span className={cn('size-1.5 rounded-full', connectionState.dot)} aria-hidden />
              {connectionState.label}
            </span>
            <Button onClick={() => void request()} disabled={!isOnline || status === 'loading'}>
              {status === 'loading' ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="size-4" aria-hidden />
              )}
              {status === 'loading' ? 'Checking…' : 'Check for advice'}
            </Button>
          </>
        }
      />

      {!isOnline ? (
        <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-[12px] leading-relaxed text-warning">
          <WifiOff className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            You are offline.{' '}
            {entries.length > 0
              ? `Showing your ${entries.length} saved entries.`
              : 'No entries have been saved yet.'}{' '}
            New advice needs a connection.
          </p>
        </div>
      ) : null}

      {status === 'error' && error ? (
        <div
          role="alert"
          className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-danger/25 bg-danger/5 px-4 py-3 text-[12px] text-danger"
        >
          <span className="flex items-start gap-2">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {error}
          </span>
          {isOnline ? (
            <button
              type="button"
              onClick={() => void request()}
              className="rounded-full border border-danger/30 px-3 py-1 font-medium transition hover:bg-danger/10"
            >
              Try again
            </button>
          ) : null}
        </div>
      ) : null}

      {liveText ? (
        <section
          aria-labelledby="live-advice-result"
          className="relative overflow-hidden rounded-3xl border border-accent/25 bg-surface p-6 sm:p-8"
        >
          <div
            className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-accent/10 blur-3xl"
            aria-hidden
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-[10.5px] font-medium text-accent">
              <Radio className="size-3" aria-hidden />
              {wasDuplicate ? 'Already in your saved entries' : 'Fresh from Advice Slip'}
            </span>
            {savedAt && !wasDuplicate ? (
              <span className="text-[10.5px] text-subtle">Saved {relativeTime(savedAt)}</span>
            ) : null}
          </div>
          <h2 id="live-advice-result" className="sr-only">
            Latest advice
          </h2>
          <blockquote className="mt-4">
            <p className="quote-body text-[1.4rem] text-ink sm:text-[1.75rem]">“{liveText}”</p>
          </blockquote>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleCopy(liveText)}>
              <Copy className="size-3.5" aria-hidden />
              Copy advice
            </Button>
            {wasDuplicate ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                <Check className="size-3.5 text-success" aria-hidden />
                No duplicate was created.
              </span>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="mt-8" aria-labelledby="saved-advice-heading">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="saved-advice-heading" className="text-xl font-semibold text-ink">
              Saved entries
            </h2>
            <p className="mt-1 text-[11.5px] text-subtle">
              {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} · stored on this device ·
              duplicates prevented
            </p>
          </div>
          {entries.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setClearOpen(true)}>
              <Trash2 className="size-3.5" aria-hidden />
              Clear all
            </Button>
          ) : null}
        </div>

        {entries.length === 0 ? (
          <EmptyState
            icon={Radio}
            compact
            title="No advice saved yet"
            description="Use “Check for advice” while online. Each tip is saved with its timestamp and never duplicated."
          />
        ) : (
          <ul className="space-y-2.5">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="group flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-line-strong"
              >
                <div className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-surface-2 text-accent">
                  <Radio className="size-3.5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] leading-relaxed text-ink">{entry.text}</p>
                  <p className="mt-1.5 text-[10.5px] text-subtle">
                    Saved {formatSavedAt(entry.savedAt)} · Advice Slip
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <IconButton label="Copy advice" size="sm" onClick={() => handleCopy(entry.text)}>
                    <Copy className="size-3.5" aria-hidden />
                  </IconButton>
                  <IconButton
                    label="Remove saved advice"
                    size="sm"
                    onClick={() => {
                      removeAdvice(entry.id);
                      addToast({ title: 'Entry removed', variant: 'info' });
                    }}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 grid gap-3 sm:grid-cols-2" aria-label="About the advice source">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="label-caps">How this source works</h2>
          <p className="mt-2 text-[12px] leading-relaxed text-muted">
            Advice Slip is a free public API. Requests include a cache-busting timestamp, are never
            cached by the service worker, and every response is validated for status, content type
            and shape before it reaches the page.
          </p>
          <a
            href={ADVICE_ENDPOINT}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-block text-[11.5px] break-all text-accent underline underline-offset-4"
          >
            {ADVICE_ENDPOINT}
          </a>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="label-caps">Why it is separate</h2>
          <p className="mt-2 text-[12px] leading-relaxed text-muted">
            The service returns anonymous advice, not quotations. It is excluded from author pages,
            attribution badges and quote images. No advice entry is ever attributed to a person.
          </p>
          <Link
            to="/about"
            className="mt-3 inline-block text-[11.5px] text-accent underline underline-offset-4"
          >
            Read the editorial policy
          </Link>
        </div>
      </section>

      <Modal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="Clear saved advice?"
        description="This removes the advice entries only. Favourites, collections and history are untouched."
        footer={
          <>
            <Button variant="secondary" onClick={() => setClearOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clearAdvice();
                setClearOpen(false);
                setLiveText('');
                setSavedAt(null);
                addToast({ title: 'Saved advice cleared', variant: 'info' });
              }}
            >
              Clear saved advice
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          {entries.length} saved entr{entries.length === 1 ? 'y' : 'ies'} will be removed from this
          browser.
        </p>
      </Modal>
    </div>
  );
}
