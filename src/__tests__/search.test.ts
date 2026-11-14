import { describe, expect, it } from 'vitest';

import { quotes } from '@/data/quotes';
import { highlightParts, matchesFilters, normalise, searchQuotes } from '@/lib/search';

describe('search', () => {
  it('normalises case, accents and punctuation', () => {
    expect(normalise('  Café — ÉLÉGANT! ')).toBe('cafe elegant');
  });

  it('finds quotes by text and by author surname', () => {
    const textResults = searchQuotes('courage');
    expect(textResults.length).toBeGreaterThan(0);
    expect(textResults.some((quote) => normalise(quote.text).includes('courage'))).toBe(true);

    const authorResults = searchQuotes('rumi');
    expect(authorResults.length).toBeGreaterThan(0);
    expect(authorResults.every((quote) => quote.authorId === 'rumi')).toBe(true);

    expect(searchQuotes('zzzzzzzz-no-such-quote')).toHaveLength(0);
  });

  it('filters by theme and attribution', () => {
    const humour = searchQuotes('', { category: 'humour' });
    expect(humour.length).toBeGreaterThan(0);
    expect(humour.every((quote) => quote.categories.includes('humour'))).toBe(true);

    const disputed = searchQuotes('', { attribution: 'disputed' });
    expect(disputed.length).toBeGreaterThan(0);
    expect(disputed.every((quote) => quote.attribution === 'disputed')).toBe(true);

    const hidden = searchQuotes('', { hideDisputed: true });
    expect(hidden.some((quote) => quote.attribution === 'disputed')).toBe(false);
    expect(hidden.length).toBeLessThan(quotes.length);
  });

  it('respects result limits and author filters', () => {
    const limited = searchQuotes('', { limit: 7 });
    expect(limited).toHaveLength(7);

    const authorId = quotes[0]!.authorId;
    const byAuthor = searchQuotes('', { authorId });
    expect(byAuthor.length).toBeGreaterThan(0);
    expect(byAuthor.every((quote) => quote.authorId === authorId)).toBe(true);
  });

  it('matches filters independently of free text', () => {
    const quote = quotes.find((item) => item.attribution === 'verified');
    expect(quote).toBeDefined();
    expect(matchesFilters(quote!, { attribution: 'verified' })).toBe(true);
    expect(matchesFilters(quote!, { hideDisputed: true })).toBe(true);

    const disputed = quotes.find((item) => item.attribution === 'disputed');
    expect(disputed).toBeDefined();
    expect(matchesFilters(disputed!, { hideDisputed: true })).toBe(false);
  });

  it('splits text into highlight parts around every match', () => {
    const parts = highlightParts('Courage is not the absence of fear', 'courage');
    expect(parts.some((part) => part.match && part.text.toLowerCase() === 'courage')).toBe(true);
    expect(parts.map((part) => part.text).join('')).toBe('Courage is not the absence of fear');
    expect(highlightParts('Nothing here', '')).toHaveLength(1);
  });
});
