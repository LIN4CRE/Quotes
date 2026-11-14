import { getCategory } from '@/data/categories';
import { quotes } from '@/data/quotes';
import type { AttributionStatus, CategoryId, Quote } from '@/types';

export interface SearchFilters {
  category?: CategoryId | 'all';
  authorId?: string;
  attribution?: AttributionStatus | 'all';
  hideDisputed?: boolean;
  limit?: number;
}

export interface HighlightPart {
  text: string;
  match: boolean;
}

const attributionRank: Record<AttributionStatus, number> = {
  verified: 4,
  attributed: 3,
  anonymous: 3,
  disputed: 2,
};

/** Lowercase, strip accents and collapse whitespace. */
export function normalise(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenise(query: string): string[] {
  return normalise(query).split(' ').filter(Boolean);
}

function categoryNames(quote: Quote): string {
  return quote.categories.map((id) => getCategory(id)?.name ?? id).join(' ');
}

export function scoreQuote(quote: Quote, query: string): number {
  const tokens = tokenise(query);
  if (tokens.length === 0) return 1;

  const text = normalise(quote.text);
  const author = normalise(quote.author);
  const categories = normalise(categoryNames(quote));
  const source = normalise(quote.source ?? '');
  const haystack = `${text} ${author} ${categories} ${source}`;

  if (!tokens.every((token) => haystack.includes(token))) return 0;

  let score = 0;

  if (text.includes(normalise(query))) score += 16;
  if (author.includes(normalise(query))) score += 12;

  for (const token of tokens) {
    if (text.includes(token)) score += 5;
    if (author.includes(token)) score += 4;
    if (categories.includes(token)) score += 2;
    if (source.includes(token)) score += 1;
  }

  // Favour concise quotes slightly when scores tie.
  score += Math.max(0, 3 - quote.text.length / 160);
  score += attributionRank[quote.attribution] * 0.25;

  return Math.round(score * 100) / 100;
}

export function matchesFilters(quote: Quote, filters: SearchFilters): boolean {
  if (
    filters.category &&
    filters.category !== 'all' &&
    !quote.categories.includes(filters.category)
  ) {
    return false;
  }
  if (filters.authorId && quote.authorId !== filters.authorId) return false;
  if (
    filters.attribution &&
    filters.attribution !== 'all' &&
    quote.attribution !== filters.attribution
  ) {
    return false;
  }
  if (filters.hideDisputed && quote.attribution === 'disputed') return false;
  return true;
}

export function searchQuotes(
  query: string,
  filters: SearchFilters = {},
  pool: readonly Quote[] = quotes,
): Quote[] {
  const trimmed = query.trim();
  const results = pool
    .filter((quote) => matchesFilters(quote, filters))
    .map((quote) => ({ quote, score: scoreQuote(quote, trimmed) }))
    .filter((entry) => entry.score > 0)
    .sort(
      (left, right) => right.score - left.score || left.quote.text.length - right.quote.text.length,
    )
    .map((entry) => entry.quote);

  return filters.limit ? results.slice(0, filters.limit) : results;
}

/** Splits text into segments so matches can be highlighted without innerHTML. */
export function highlightParts(text: string, query: string): HighlightPart[] {
  const tokens = tokenise(query).filter((token) => token.length >= 2);
  if (tokens.length === 0) return [{ text, match: false }];

  const escaped = [...tokens]
    .sort((left, right) => right.length - left.length)
    .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({ text: part, match: tokens.includes(normalise(part)) }));
}
