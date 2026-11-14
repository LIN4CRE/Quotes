import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildQuoteText, canShareFiles, canUseWebShare, copyText, shareQuote } from '@/lib/share';
import { quotes } from '@/data/quotes';
import type { Quote } from '@/types';

const base: Quote = {
  id: 'test-quote',
  text: 'The unexamined life is not worth living.',
  authorId: 'socrates',
  author: 'Socrates',
  categories: ['philosophy'],
  attribution: 'attributed',
  source: 'Apology',
  year: -399,
};

function withClipboard(writeText = vi.fn().mockResolvedValue(undefined)) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  return writeText;
}

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, 'clipboard');
  Reflect.deleteProperty(navigator, 'share');
  Reflect.deleteProperty(navigator, 'canShare');
});

describe('sharing text', () => {
  it('labels uncertain attributions instead of overstating them', () => {
    expect(buildQuoteText(base)).toBe(
      '“The unexamined life is not worth living.”\n\n— Socrates, Apology (widely attributed)',
    );

    const disputed = quotes.find((quote) => quote.attribution === 'disputed')!;
    expect(buildQuoteText(disputed)).toContain('(disputed attribution)');

    const anonymous = quotes.find((quote) => quote.attribution === 'anonymous')!;
    expect(buildQuoteText(anonymous)).toMatch(/— Proverb/);
  });

  it('can omit attribution or the source', () => {
    expect(buildQuoteText(base, { includeAttribution: false })).toBe(
      '“The unexamined life is not worth living.”',
    );
    const withYearlessSource = buildQuoteText(base, { includeSource: false });
    expect(withYearlessSource).toBe(
      '“The unexamined life is not worth living.”\n\n— Socrates (widely attributed)',
    );
  });

  it('reports clipboard success and failure honestly', async () => {
    const writeText = withClipboard();
    await expect(copyText('hello')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });
    document.execCommand = vi.fn().mockReturnValue(true);
    await expect(copyText('fallback')).resolves.toBe(true);

    document.execCommand = vi.fn().mockReturnValue(false);
    await expect(copyText('fallback')).resolves.toBe(false);
  });

  it('uses Web Share when available and falls back to copying otherwise', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { configurable: true, value: share });
    withClipboard(vi.fn().mockResolvedValue(undefined));

    expect(canUseWebShare()).toBe(true);
    await expect(shareQuote(base)).resolves.toBe('shared');
    expect(share).toHaveBeenCalledWith({
      title: 'LIN4CRE QUOTES',
      text: buildQuoteText(base),
    });

    Reflect.deleteProperty(navigator, 'share');
    expect(canUseWebShare()).toBe(false);
    await expect(shareQuote(base)).resolves.toBe('copied');
  });

  it('treats a dismissed share sheet as cancelled', async () => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn().mockRejectedValue(new DOMException('Cancelled', 'AbortError')),
    });
    withClipboard();

    await expect(shareQuote(base)).resolves.toBe('cancelled');
  });

  it('detects file sharing support', () => {
    expect(canShareFiles()).toBe(false);
    Object.defineProperty(navigator, 'share', { configurable: true, value: vi.fn() });
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: vi.fn() });
    expect(canShareFiles()).toBe(true);
  });
});
