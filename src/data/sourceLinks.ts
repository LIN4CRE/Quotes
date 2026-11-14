/**
 * Work-level links for sources whose text or a reliable edition is available
 * from a stable public archive.
 *
 * These are *work* links, not claims that a particular line appears at that
 * exact URL. Every link below was checked against the publisher's catalogue
 * (Project Gutenberg, the Folger Shakespeare Library, the Internet Classics
 * Archive or Wikisource). Sources without a checked link deliberately have no
 * entry: the interface then says that no primary-source link is listed.
 */
const GUTENBERG = 'https://www.gutenberg.org/ebooks';

export const sourceLinks: Readonly<Record<string, string>> = {
  // Stoic and ancient philosophy
  'Meditations, 10.16': `${GUTENBERG}/2680`,
  'Meditations, 5.20': `${GUTENBERG}/2680`,
  'Discourses, 3.23 (translated)': 'https://classics.mit.edu/Epictetus/discourses.html',
  'Letters to Lucilius, 13': 'https://en.wikisource.org/wiki/Moral_letters_to_Lucilius',
  'Tao Te Ching, chapter 64 (translated)': `${GUTENBERG}/216`,
  'Tao Te Ching, chapter 33 (translated)': `${GUTENBERG}/216`,
  'Tao Te Ching, chapter 17 (translated, adapted)': `${GUTENBERG}/216`,
  'The Art of War, chapter 3 (translated)': `${GUTENBERG}/132`,

  // Shakespeare
  'Hamlet, Act I, Scene 3': 'https://www.folger.edu/explore/shakespeares-works/hamlet/read/',
  'Hamlet, Act II, Scene 2': 'https://www.folger.edu/explore/shakespeares-works/hamlet/read/',
  'Measure for Measure, Act I, Scene 4':
    'https://www.folger.edu/explore/shakespeares-works/measure-for-measure/read/',
  'Sonnet 116': `${GUTENBERG}/1041`,
  'Sonnet 18': `${GUTENBERG}/1041`,
  'As You Like It, Act II, Scene 7':
    'https://www.folger.edu/explore/shakespeares-works/as-you-like-it/read/',
  'As You Like It, Act V, Scene 1':
    'https://www.folger.edu/explore/shakespeares-works/as-you-like-it/read/',
  'Romeo and Juliet, Act II, Scene 2':
    'https://www.folger.edu/explore/shakespeares-works/romeo-and-juliet/read/',
  'Julius Caesar, Act II, Scene 2':
    'https://www.folger.edu/explore/shakespeares-works/julius-caesar/read/',
  'A Midsummer Night’s Dream, Act III, Scene 2':
    'https://www.folger.edu/explore/shakespeares-works/a-midsummer-nights-dream/read/',

  // Novels and essays in the public domain (US)
  'Pride and Prejudice, opening line': `${GUTENBERG}/1342`,
  'Northanger Abbey': `${GUTENBERG}/121`,
  Emma: `${GUTENBERG}/158`,
  'David Copperfield, opening line': `${GUTENBERG}/766`,
  'Wuthering Heights': `${GUTENBERG}/768`,
  'Jane Eyre': `${GUTENBERG}/1260`,
  'Les Misérables (translated)': `${GUTENBERG}/135`,
  'Anna Karenina, opening line': `${GUTENBERG}/1399`,
  'Anne of Green Gables': `${GUTENBERG}/45`,
  'Anne of Green Gables series': `${GUTENBERG}/45`,
  Walden: `${GUTENBERG}/205`,
  'The Great Gatsby, closing line': `${GUTENBERG}/64317`,
  'The Importance of Being Earnest': `${GUTENBERG}/844`,
};

export function getSourceUrl(source: string | undefined): string | undefined {
  if (!source) return undefined;
  return sourceLinks[source];
}

/** Human-readable archive name used next to a source link. */
export function sourceSiteName(url: string): string {
  try {
    const host = new URL(url).hostname;
    if (host.endsWith('gutenberg.org')) return 'Project Gutenberg';
    if (host.endsWith('folger.edu')) return 'Folger Shakespeare Library';
    if (host.endsWith('mit.edu')) return 'Internet Classics Archive';
    if (host.endsWith('wikisource.org')) return 'Wikisource';
    return host.replace(/^www\./, '');
  } catch {
    return 'source';
  }
}
