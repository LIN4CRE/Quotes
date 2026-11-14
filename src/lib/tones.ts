import type { CategoryTone } from '@/types';

export interface ToneStyle {
  /** Tailwind classes for a small tinted chip. */
  chip: string;
  /** Tailwind gradient stops for decorative panels. */
  gradient: string;
  /** A soft radial glow. */
  glow: string;
  /** Hex colours used when drawing share images on canvas. */
  canvas: readonly [string, string];
}

/**
 * Tailwind needs to see complete class names at build time, so tone styles are
 * written out rather than composed from variables.
 */
export const toneStyles: Record<CategoryTone, ToneStyle> = {
  gold: {
    chip: 'border-amber-300/30 bg-amber-300/10 text-ink',
    gradient: 'from-amber-300/20 via-yellow-200/5 to-transparent',
    glow: 'bg-amber-300/20',
    canvas: ['#f0c27b', '#8a5a1f'],
  },
  rose: {
    chip: 'border-rose-300/30 bg-rose-300/10 text-ink',
    gradient: 'from-rose-300/20 via-pink-200/5 to-transparent',
    glow: 'bg-rose-300/20',
    canvas: ['#e7a0a0', '#6b2f3a'],
  },
  violet: {
    chip: 'border-violet-300/30 bg-violet-300/10 text-ink',
    gradient: 'from-violet-300/20 via-purple-200/5 to-transparent',
    glow: 'bg-violet-300/20',
    canvas: ['#c3a6f0', '#4a3570'],
  },
  sky: {
    chip: 'border-sky-300/30 bg-sky-300/10 text-ink',
    gradient: 'from-sky-300/20 via-cyan-200/5 to-transparent',
    glow: 'bg-sky-300/20',
    canvas: ['#9dc9e8', '#28516b'],
  },
  emerald: {
    chip: 'border-emerald-300/30 bg-emerald-300/10 text-ink',
    gradient: 'from-emerald-300/20 via-green-200/5 to-transparent',
    glow: 'bg-emerald-300/20',
    canvas: ['#9fd8b8', '#1f5a40'],
  },
  amber: {
    chip: 'border-orange-300/30 bg-orange-300/10 text-ink',
    gradient: 'from-orange-300/20 via-amber-200/5 to-transparent',
    glow: 'bg-orange-300/20',
    canvas: ['#e8b07a', '#6d3d18'],
  },
  teal: {
    chip: 'border-teal-300/30 bg-teal-300/10 text-ink',
    gradient: 'from-teal-300/20 via-cyan-200/5 to-transparent',
    glow: 'bg-teal-300/20',
    canvas: ['#8fd4c8', '#1f5a52'],
  },
  indigo: {
    chip: 'border-indigo-300/30 bg-indigo-300/10 text-ink',
    gradient: 'from-indigo-300/20 via-blue-200/5 to-transparent',
    glow: 'bg-indigo-300/20',
    canvas: ['#a7b0e8', '#2f3766'],
  },
  crimson: {
    chip: 'border-red-300/30 bg-red-300/10 text-ink',
    gradient: 'from-red-300/20 via-rose-200/5 to-transparent',
    glow: 'bg-red-300/20',
    canvas: ['#e59a9a', '#64232b'],
  },
  lime: {
    chip: 'border-lime-300/30 bg-lime-300/10 text-ink',
    gradient: 'from-lime-300/20 via-green-200/5 to-transparent',
    glow: 'bg-lime-300/20',
    canvas: ['#c6d78a', '#48551f'],
  },
};

export const attributionStyles = {
  verified: {
    label: 'Verified source',
    short: 'Verified',
    description: 'Documented in the cited work, speech or interview.',
    className: 'border-success/25 bg-success/10 text-success',
  },
  attributed: {
    label: 'Widely attributed',
    short: 'Attributed',
    description:
      'Widely associated with the author, but no definitive primary source has been established.',
    className: 'border-warning/25 bg-warning/10 text-warning',
  },
  disputed: {
    label: 'Disputed attribution',
    short: 'Disputed',
    description:
      'The attribution is contested or known to be a misattribution. The note explains what is known.',
    className: 'border-danger/25 bg-danger/10 text-danger',
  },
  anonymous: {
    label: 'Proverb',
    short: 'Proverb',
    description: 'A traditional saying without an identifiable author.',
    className: 'border-sky-300/25 bg-sky-300/10 text-ink',
  },
} as const;
