import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { quotes } from '@/data/quotes';
import { buildQuoteText } from '@/lib/share';
import { STORAGE_KEYS } from '@/lib/storage';
import { attributionStyles } from '@/lib/tones';
import QuoteDetail from '@/pages/QuoteDetail';
import { renderRoute } from '@/test/render';

const verified = quotes.find((quote) => quote.attribution === 'verified' && quote.source)!;
const disputed = quotes.find((quote) => quote.attribution === 'disputed')!;

function renderQuote(quoteId: string) {
  return renderRoute('/quote/:quoteId', <QuoteDetail />, `/quote/${quoteId}`);
}

describe('quote detail page', () => {
  beforeEach(() => {
    localStorage.clear();
    Reflect.deleteProperty(navigator, 'clipboard');
    Reflect.deleteProperty(navigator, 'share');
  });

  it('renders the quote, source and attribution label', () => {
    renderQuote(verified.id);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(verified.author);
    expect(screen.getByText(`“${verified.text}”`)).toBeInTheDocument();
    expect(screen.getAllByText(attributionStyles.verified.label).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(
        new RegExp(verified.source!.slice(0, 24).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      ).length,
    ).toBeGreaterThan(0);
  });

  it('records the quote in reading history', async () => {
    renderQuote(verified.id);

    await waitFor(() => {
      const raw = localStorage.getItem(STORAGE_KEYS.library);
      expect(raw).toBeTruthy();
      const stored = JSON.parse(raw!) as { history: Array<{ quoteId: string }> };
      expect(stored.history[0]?.quoteId).toBe(verified.id);
    });
  });

  it('saves to favourites, reveals notes and persists the save', async () => {
    const user = userEvent.setup();
    renderQuote(verified.id);

    await user.click(screen.getByRole('button', { name: 'Save quote' }));

    expect(screen.getByRole('button', { name: 'Saved' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Add a personal note/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Add a personal note/i }));
    await user.type(screen.getByLabelText('Note'), 'For the Monday talk.');
    await user.click(screen.getByRole('button', { name: 'Save note' }));

    expect(screen.getByText('For the Monday talk.')).toBeInTheDocument();

    await waitFor(() => {
      const raw = localStorage.getItem(STORAGE_KEYS.library);
      const stored = JSON.parse(raw!) as { favourites: Array<{ quoteId: string; note?: string }> };
      expect(stored.favourites[0]).toMatchObject({
        quoteId: verified.id,
        note: 'For the Monday talk.',
      });
    });
  });

  it('copies the quote with attribution and reports the result', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    renderQuote(verified.id);
    await user.click(screen.getByRole('button', { name: /Copy with author/i }));

    expect(writeText).toHaveBeenCalledWith(buildQuoteText(verified));
    expect(await screen.findByText('Copied to clipboard')).toBeInTheDocument();
  });

  it('uses the Web Share API when the browser supports it', async () => {
    const user = userEvent.setup();
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { configurable: true, value: share });

    renderQuote(verified.id);
    await user.click(screen.getByRole('button', { name: /^Share$/i }));

    expect(share).toHaveBeenCalledWith({
      title: 'LIN4CRE QUOTES',
      text: buildQuoteText(verified),
    });
    expect(await screen.findByText('Shared')).toBeInTheDocument();
  });

  it('explains disputed attributions instead of hiding them', () => {
    renderQuote(disputed.id);

    expect(screen.getAllByText(attributionStyles.disputed.label).length).toBeGreaterThan(0);
    expect(screen.getByText('What we know')).toBeInTheDocument();
    expect(screen.getByText(disputed.attributionNote!)).toBeInTheDocument();
  });

  it('handles an unknown quote id gracefully', () => {
    renderQuote('not-a-real-quote');
    expect(screen.getByRole('heading', { name: 'Quote not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Discover' })).toHaveAttribute('href', '/');
  });

  it('opens the collection picker and can create a collection', async () => {
    const user = userEvent.setup();
    renderQuote(verified.id);

    await user.click(screen.getByRole('button', { name: 'Collect' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /New collection/i }));
    await user.type(screen.getByLabelText('Collection name'), 'Evening reading');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      const raw = localStorage.getItem(STORAGE_KEYS.library);
      const stored = JSON.parse(raw!) as {
        collections: Array<{ name: string; quoteIds: string[] }>;
      };
      expect(stored.collections[0]?.name).toBe('Evening reading');
      expect(stored.collections[0]?.quoteIds).toContain(verified.id);
    });
  });

  it('navigates back to the previous view', async () => {
    const user = userEvent.setup();
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => undefined);
    renderQuote(verified.id);

    await user.click(screen.getByRole('button', { name: /Back/i }));
    expect(back).toHaveBeenCalled();
    back.mockRestore();
  });
});
