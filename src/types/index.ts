export type CategoryId =
  | 'motivation'
  | 'success'
  | 'life'
  | 'love'
  | 'happiness'
  | 'friendship'
  | 'wisdom'
  | 'philosophy'
  | 'leadership'
  | 'business'
  | 'confidence'
  | 'mental-strength'
  | 'personal-growth'
  | 'humour'
  | 'inspirational';

/**
 * How confident we are that the words belong to the named author.
 *
 * - `verified`: the quote is documented in a named work or recorded speech.
 * - `attributed`: widely attributed to the author but without a definitive
 *   primary source. Shown with a clear "widely attributed" label.
 * - `disputed`: attribution is contested or known to be a misattribution.
 *   Shown with a warning and an explanation.
 * - `anonymous`: a proverb or folk saying with no named author.
 */
export type AttributionStatus = 'verified' | 'attributed' | 'disputed' | 'anonymous';

export interface Author {
  id: string;
  name: string;
  bio: string;
  lifespan?: string;
  nationality?: string;
  era?: string;
}

export interface Quote {
  id: string;
  text: string;
  authorId: string;
  author: string;
  categories: CategoryId[];
  attribution: AttributionStatus;
  source?: string;
  /** Optional work-level link to a checked public-domain edition or archive. */
  sourceUrl?: string;
  year?: number;
  attributionNote?: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  /** Token used to pick a fixed gradient palette (never built dynamically). */
  tone: CategoryTone;
}

export type CategoryTone =
  'gold' | 'rose' | 'violet' | 'sky' | 'emerald' | 'amber' | 'teal' | 'indigo' | 'crimson' | 'lime';

export interface CuratedCollection {
  id: string;
  name: string;
  description: string;
  tone: CategoryTone;
  quoteIds: string[];
}

export interface SavedQuote {
  quoteId: string;
  savedAt: string;
  note?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  quoteIds: string[];
  /** User-written reflections grouped in this collection. */
  reflectionIds: string[];
}

/**
 * A locally written quotation or personal reflection. It is deliberately a
 * separate type from `Quote`: it has no historical attribution status and is
 * never blended into the curated library, search results or author pages.
 */
export interface Reflection {
  id: string;
  title?: string;
  text: string;
  author?: string;
  favourite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEntry {
  quoteId: string;
  viewedAt: string;
}

export interface AdviceEntry {
  id: string;
  text: string;
  savedAt: string;
  source: 'advice-slip';
}

export interface LibraryData {
  version: 3;
  favourites: SavedQuote[];
  collections: Collection[];
  history: HistoryEntry[];
  advice: AdviceEntry[];
  reflections: Reflection[];
}

export type ThemePreference = 'dark' | 'light' | 'system';
export type FontScale = 'sm' | 'md' | 'lg';
export type MotionPreference = 'system' | 'reduced';

export interface Settings {
  theme: ThemePreference;
  fontScale: FontScale;
  motion: MotionPreference;
  showDisputed: boolean;
}

export type ShareOutcome = 'shared' | 'copied' | 'downloaded' | 'cancelled' | 'failed';
