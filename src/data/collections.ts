import type { CuratedCollection } from '@/types';

/**
 * Editor-made collections. Every id is checked against the quote library in
 * the automated test suite, so a broken link cannot ship.
 */
export const curatedCollections: readonly CuratedCollection[] = [
  {
    id: 'stoic-foundations',
    name: 'Stoic Foundations',
    description: 'What is within your control, and what is not.',
    tone: 'indigo',
    quoteIds: [
      'aurelius-be-one',
      'aurelius-impediment',
      'seneca-time',
      'seneca-imagination',
      'epictetus-reaction',
      'epictetus-first-say',
      'frankl-attitude',
      'murakami-pain',
      'chodron-sky',
      'proverb-this-too',
    ],
  },
  {
    id: 'begin-again',
    name: 'Begin Again',
    description: 'For mornings when starting is the hard part.',
    tone: 'amber',
    quoteIds: [
      'mandela-impossible',
      'tolkien-started',
      'lao-tzu-journey',
      'frost-through',
      'beckett-fail',
      'rowling-failure',
      'angelou-better',
      'clear-vote',
      'jobs-stay-hungry',
      'frank-improve',
    ],
  },
  {
    id: 'love-in-letters',
    name: 'Love, in Letters',
    description: 'Longing, devotion and the language of affection.',
    tone: 'crimson',
    quoteIds: [
      'shakespeare-love',
      'shakespeare-summer',
      'browning-love',
      'bronte-souls',
      'neruda-dark-things',
      'austen-loved-less',
      'rilke-solitudes',
      'cummings-heart',
      'hugo-loved',
      'saint-exupery-rose',
    ],
  },
  {
    id: 'the-creative-life',
    name: 'The Creative Life',
    description: 'Attention, craft and the courage to make things.',
    tone: 'rose',
    quoteIds: [
      'oliver-attention',
      'dillard-days',
      'woolf-room',
      'king-books',
      'atwood-word',
      'calvino-classic',
      'borges-library',
      'lamott-perfectionism',
      'jobs-design',
      'feynman-understand',
    ],
  },
  {
    id: 'leading-well',
    name: 'Leading Well',
    description: 'Responsibility, clarity and the long view.',
    tone: 'sky',
    quoteIds: [
      'lao-tzu-leader',
      'brown-clear',
      'powell-problems',
      'mandela-courage',
      'mlk-injustice',
      'lewis-courage',
      'wooden-success',
      'sinek-why',
      'tutu-good',
      'maxwell-way',
    ],
  },
  {
    id: 'a-quieter-mind',
    name: 'A Quieter Mind',
    description: 'Perspective for noisy days.',
    tone: 'teal',
    quoteIds: [
      'seneca-imagination',
      'aurelius-impediment',
      'chodron-sky',
      'nhat-hanh-breathing',
      'proverb-this-too',
      'hemingway-broken',
      'cohen-crack',
      'lamott-unplug',
      'oliver-good',
      'camus-summer',
    ],
  },
];

export function getCuratedCollection(id: string): CuratedCollection | undefined {
  return curatedCollections.find((collection) => collection.id === id);
}
