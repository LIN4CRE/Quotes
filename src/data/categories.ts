import type { Category, CategoryId } from '@/types';

export const categories: readonly Category[] = [
  {
    id: 'motivation',
    name: 'Motivation',
    description: 'A push to begin, to continue, or to begin again.',
    tone: 'amber',
  },
  {
    id: 'success',
    name: 'Success',
    description: 'What achievement asks of us — and what it costs.',
    tone: 'gold',
  },
  {
    id: 'life',
    name: 'Life',
    description: 'On living well, paying attention and letting go.',
    tone: 'rose',
  },
  {
    id: 'love',
    name: 'Love',
    description: 'Tenderness, longing and the work of loving.',
    tone: 'crimson',
  },
  {
    id: 'happiness',
    name: 'Happiness',
    description: 'Small pleasures and durable contentment.',
    tone: 'lime',
  },
  {
    id: 'friendship',
    name: 'Friendship',
    description: 'The people who make the world less lonely.',
    tone: 'teal',
  },
  {
    id: 'wisdom',
    name: 'Wisdom',
    description: 'Ideas worth keeping and passing on.',
    tone: 'gold',
  },
  {
    id: 'philosophy',
    name: 'Philosophy',
    description: 'Questions that refuse easy answers.',
    tone: 'indigo',
  },
  {
    id: 'leadership',
    name: 'Leadership',
    description: 'How to hold responsibility for other people.',
    tone: 'sky',
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Building things that last — and the craft of work.',
    tone: 'emerald',
  },
  {
    id: 'confidence',
    name: 'Confidence',
    description: 'Self-belief without self-importance.',
    tone: 'violet',
  },
  {
    id: 'mental-strength',
    name: 'Mental strength',
    description: 'Endurance, perspective and recovery.',
    tone: 'sky',
  },
  {
    id: 'personal-growth',
    name: 'Personal growth',
    description: 'Becoming a little more yourself.',
    tone: 'emerald',
  },
  {
    id: 'humour',
    name: 'Humour',
    description: 'Laughter as a way of seeing clearly.',
    tone: 'amber',
  },
  {
    id: 'inspirational',
    name: 'Inspirational',
    description: 'Words that widen what feels possible.',
    tone: 'rose',
  },
];

export const categoriesById: ReadonlyMap<CategoryId, Category> = new Map(
  categories.map((category) => [category.id, category]),
);

export function getCategory(id: string): Category | undefined {
  return categoriesById.get(id as CategoryId);
}

export const categoryIds = categories.map((category) => category.id);

export function isCategoryId(value: string): value is CategoryId {
  return categoriesById.has(value as CategoryId);
}
