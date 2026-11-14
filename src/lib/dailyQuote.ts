import { quotes } from '@/data/quotes';
import { toDateKey } from '@/lib/dates';
import { dailyIndex } from '@/lib/random';
import type { Quote } from '@/types';

/**
 * The same quote for everyone on a given local calendar date. No network call,
 * no API key, and no rotating “featured” content pretending to be editorial.
 */
export function getDailyQuote(date: Date = new Date()): Quote | undefined {
  if (quotes.length === 0) return undefined;
  return quotes[dailyIndex(toDateKey(date), quotes.length)];
}
