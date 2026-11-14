import { vi } from 'vitest';

/** Stand-in for vite-plugin-pwa's virtual registration hook in jsdom tests. */
export function useRegisterSW() {
  return {
    needRefresh: [false, vi.fn()] as const,
    offlineReady: [false, vi.fn()] as const,
    updateServiceWorker: vi.fn(),
  };
}
