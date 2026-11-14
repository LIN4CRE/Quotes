import { act, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import Advice from '@/pages/Advice';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { STORAGE_KEYS } from '@/lib/storage';
import { createEmptyLibrary } from '@/lib/library';
import { renderWithProviders } from '@/test/render';

function setOnline(value: boolean) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value });
  window.dispatchEvent(new Event(value ? 'online' : 'offline'));
}

describe('offline behaviour', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    localStorage.clear();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
  });

  it('tracks connection changes', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    act(() => setOnline(false));
    expect(result.current).toBe(false);

    act(() => setOnline(true));
    expect(result.current).toBe(true);
  });

  it('shows saved advice while offline and disables fetching', () => {
    const library = createEmptyLibrary();
    library.advice.push({
      id: 'advice_1',
      text: 'Keep a glass of water by the desk.',
      savedAt: '2024-05-04T10:00:00.000Z',
      source: 'advice-slip',
    });
    localStorage.setItem(STORAGE_KEYS.library, JSON.stringify(library));

    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    renderWithProviders(<Advice />);

    expect(screen.getByText(/You are offline/i)).toBeInTheDocument();
    expect(screen.getByText('Keep a glass of water by the desk.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Check for advice/i })).toBeDisabled();
  });

  it('renders the offline banner in the shell', async () => {
    const { OfflineBanner } = await import('@/components/layout/StatusBanners');
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    render(<OfflineBanner />);
    expect(screen.getByRole('status')).toHaveTextContent(/You are offline/i);
  });
});
