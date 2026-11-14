import { RefreshCw, TriangleAlert, WifiOff, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useLibrary } from '@/providers/LibraryProvider';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 border-b border-warning/20 bg-warning/10 px-4 py-2 text-center text-[12px] text-warning"
    >
      <WifiOff className="size-3.5 shrink-0" aria-hidden />
      You are offline. Saved quotes, favourites and collections still work.
    </div>
  );
}

export function StorageBanner() {
  const { storageAvailable, persistFailed } = useLibrary();
  if (storageAvailable && !persistFailed) return null;

  return (
    <div
      role="alert"
      className="flex items-center justify-center gap-2 border-b border-danger/25 bg-danger/10 px-4 py-2 text-center text-[12px] text-danger"
    >
      <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
      This browser is blocking local storage, so changes will not survive a refresh. Check private
      browsing or site data settings.
    </div>
  );
}

export function PwaUpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true });

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-center gap-3 border-b border-accent/20 bg-accent-soft px-4 py-2 text-center text-[12px] text-accent"
    >
      <span>A new version of LIN4CRE QUOTES is available.</span>
      <button
        type="button"
        onClick={() => void updateServiceWorker(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 px-2.5 py-1 font-medium transition hover:bg-accent/10"
      >
        <RefreshCw className="size-3" aria-hidden />
        Refresh
      </button>
      <button
        type="button"
        onClick={() => setNeedRefresh(false)}
        aria-label="Dismiss update notice"
        className="rounded-full p-1 transition hover:bg-accent/10"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
