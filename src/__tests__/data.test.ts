import { describe, expect, it } from 'vitest';

import { authorList, authorsById } from '@/data/authors';
import { categories, getCategory } from '@/data/categories';
import { curatedCollections } from '@/data/collections';
import {
  getQuote,
  quoteCountByAuthor,
  quoteCountByCategory,
  quotes,
  quotesById,
} from '@/data/quotes';

describe('quote library integrity', () => {
  it('ships a substantial, unique library', () => {
    expect(quotes.length).toBeGreaterThanOrEqual(300);
    expect(quotesById.size).toBe(quotes.length);
    expect(new Set(quotes.map((quote) => quote.id)).size).toBe(quotes.length);
    expect(new Set(quotes.map((quote) => quote.text)).size).toBe(quotes.length);
  });

  it('links every quote to a real author and at least one theme', () => {
    for (const quote of quotes) {
      expect(quote.text.trim().length, quote.id).toBeGreaterThanOrEqual(10);
      expect(authorsById.has(quote.authorId), `${quote.id} author`).toBe(true);
      expect(quote.categories.length, `${quote.id} categories`).toBeGreaterThan(0);
      for (const category of quote.categories) {
        expect(getCategory(category), `${quote.id} category ${category}`).toBeDefined();
      }
    }
  });

  it('follows the editorial attribution policy', () => {
    for (const quote of quotes) {
      if (quote.attribution === 'verified') {
        expect(quote.source, `${quote.id} needs a source`).toBeTruthy();
      }
      if (quote.attribution === 'disputed') {
        expect(quote.attributionNote, `${quote.id} needs an explanation`).toBeTruthy();
      }
      if (quote.attribution === 'anonymous') {
        expect(quote.authorId).toBe('proverb');
        expect(quote.source ?? quote.attributionNote).toBeTruthy();
      }
    }

    const statuses = new Set(quotes.map((quote) => quote.attribution));
    expect(statuses).toEqual(new Set(['verified', 'attributed', 'disputed', 'anonymous']));
  });

  it('only publishes checked, conservative source links', () => {
    const linked = quotes.filter((quote) => quote.sourceUrl);
    const allowedHosts = new Set([
      'www.gutenberg.org',
      'www.folger.edu',
      'classics.mit.edu',
      'en.wikisource.org',
    ]);

    expect(linked.length).toBeGreaterThanOrEqual(30);
    for (const quote of linked) {
      const url = new URL(quote.sourceUrl!);
      expect(url.protocol, quote.id).toBe('https:');
      expect(allowedHosts.has(url.hostname), `${quote.id} host ${url.hostname}`).toBe(true);
      expect(quote.source, `${quote.id} has a URL but no source text`).toBeTruthy();
      expect(url.href, `${quote.id} should not carry tracking parameters`).not.toMatch(
        /[?&](utm_|fbclid|gclid)/,
      );
    }
  });

  it('has genuine coverage in all fifteen themes and uses every author', () => {
    expect(categories).toHaveLength(15);

    for (const category of categories) {
      const count = quoteCountByCategory.get(category.id) ?? 0;
      expect(count, `${category.name} should have at least 10 quotes`).toBeGreaterThanOrEqual(10);
    }

    for (const author of authorList) {
      expect(
        quoteCountByAuthor.get(author.id) ?? 0,
        `${author.name} has no quotes`,
      ).toBeGreaterThan(0);
    }
  });

  it('keeps curated collections resolvable', () => {
    expect(curatedCollections.length).toBeGreaterThanOrEqual(5);

    for (const collection of curatedCollections) {
      expect(collection.name.trim().length).toBeGreaterThan(0);
      expect(collection.description.trim().length).toBeGreaterThan(20);
      expect(collection.quoteIds.length).toBeGreaterThanOrEqual(5);
      for (const id of collection.quoteIds) {
        expect(getQuote(id), `${collection.id} references ${id}`).toBeDefined();
      }
    }
  });
});
