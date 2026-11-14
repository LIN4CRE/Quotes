import { getAuthor, type AuthorId } from '@/data/authors';
import type { AttributionStatus, CategoryId, Quote } from '@/types';

interface QuoteDetails {
  source?: string;
  year?: number;
  attributionNote?: string;
}

/**
 * Builds a fully resolved quote. Author names come from the author register so
 * a quote can never display a name that is not also linked on its author page.
 */
function q(
  id: string,
  text: string,
  authorId: AuthorId,
  categories: CategoryId[],
  attribution: AttributionStatus,
  details: QuoteDetails = {},
): Quote {
  const author = getAuthor(authorId);

  if (!author) {
    throw new Error(`Unknown author "${authorId}" for quote "${id}"`);
  }

  return {
    id,
    text,
    authorId,
    author: author.name,
    categories,
    attribution,
    ...(details.source === undefined ? {} : { source: details.source }),
    ...(details.year === undefined ? {} : { year: details.year }),
    ...(details.attributionNote === undefined ? {} : { attributionNote: details.attributionNote }),
  };
}

/**
 * The local quote library.
 *
 * Editorial policy:
 * - Words are reproduced from published works, recorded speeches or documented
 *   interviews wherever possible.
 * - `attributed` means the line circulates widely under that name but no
 *   definitive primary source has been established.
 * - `disputed` means the attribution is contested or known to be wrong. These
 *   are kept deliberately, clearly labelled, because they are part of how
 *   quotations travel — but they are never presented as verified.
 * - No quote is invented and no author is credited speculatively.
 */
export const quotes: readonly Quote[] = [
  // ——— Stoics and ancient philosophy ———
  q(
    'aurelius-be-one',
    'Waste no more time arguing about what a good man should be. Be one.',
    'marcus-aurelius',
    ['philosophy', 'personal-growth', 'wisdom'],
    'verified',
    { source: 'Meditations, 10.16', year: 175 },
  ),
  q(
    'aurelius-impediment',
    'The impediment to action advances action. What stands in the way becomes the way.',
    'marcus-aurelius',
    ['mental-strength', 'philosophy', 'motivation'],
    'verified',
    { source: 'Meditations, 5.20', year: 175 },
  ),
  q(
    'aurelius-thoughts',
    'The happiness of your life depends upon the quality of your thoughts.',
    'marcus-aurelius',
    ['happiness', 'philosophy'],
    'attributed',
    {
      attributionNote:
        'A popular paraphrase of the Meditations rather than a single verbatim line. The idea is genuinely Stoic; the wording is later.',
    },
  ),
  q(
    'seneca-time',
    'It is not that we have a short time to live, but that we waste a lot of it.',
    'seneca',
    ['life', 'philosophy', 'personal-growth'],
    'verified',
    { source: 'On the Shortness of Life' },
  ),
  q(
    'seneca-imagination',
    'We suffer more often in imagination than in reality.',
    'seneca',
    ['mental-strength', 'philosophy'],
    'verified',
    { source: 'Letters to Lucilius, 13' },
  ),
  q(
    'seneca-luck',
    'Luck is what happens when preparation meets opportunity.',
    'seneca',
    ['success', 'motivation'],
    'disputed',
    {
      attributionNote:
        'No passage in Seneca’s surviving work matches this sentence. It is a modern distillation often printed as Stoic advice.',
    },
  ),
  q(
    'epictetus-reaction',
    'It’s not what happens to you, but how you react to it that matters.',
    'epictetus',
    ['mental-strength', 'philosophy'],
    'attributed',
    {
      attributionNote:
        'A compressed paraphrase of the opening of the Enchiridion: “It is not events that disturb people, it is their judgements concerning them.”',
    },
  ),
  q(
    'epictetus-first-say',
    'First say to yourself what you would be; and then do what you have to do.',
    'epictetus',
    ['personal-growth', 'motivation'],
    'attributed',
    { source: 'Discourses, 3.23 (translated)' },
  ),
  q(
    'epictetus-wealth',
    'Wealth consists not in having great possessions, but in having few wants.',
    'epictetus',
    ['wisdom', 'happiness'],
    'attributed',
    {
      attributionNote:
        'Widely attributed to Epictetus; closest to the spirit of Discourses 4.7 on freedom from desire, but not a direct quotation.',
    },
  ),
  q(
    'socrates-unexamined',
    'The unexamined life is not worth living.',
    'socrates',
    ['philosophy', 'wisdom'],
    'verified',
    { source: 'Plato, Apology, 38a' },
  ),
  q(
    'socrates-wonder',
    'Wonder is the beginning of wisdom.',
    'socrates',
    ['wisdom', 'philosophy'],
    'attributed',
    {
      attributionNote:
        'A summary of Socrates’ outlook found in later writers, including Plato’s Theaetetus; the sentence itself is not in the dialogue.',
    },
  ),
  q(
    'plato-victory',
    'The first and greatest victory is to conquer yourself.',
    'plato',
    ['confidence', 'philosophy', 'personal-growth'],
    'attributed',
    {
      attributionNote:
        'Circulated as Plato, but not traced to a specific passage. It echoes themes in the Republic and the Laws.',
    },
  ),
  q(
    'aristotle-habit',
    'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    'aristotle',
    ['personal-growth', 'success'],
    'attributed',
    {
      attributionNote:
        'This is Will Durant’s summary of Aristotle in The Story of Philosophy (1926), not a quotation from Aristotle.',
    },
  ),
  q(
    'aristotle-educate',
    'It is the mark of an educated mind to be able to entertain a thought without accepting it.',
    'aristotle',
    ['wisdom', 'philosophy'],
    'disputed',
    {
      attributionNote:
        'No source in Aristotle’s surviving works. The line appears in modern quotation collections and probably originated in the nineteenth or twentieth century.',
    },
  ),
  q(
    'aristotle-happiness',
    'Happiness depends upon ourselves.',
    'aristotle',
    ['happiness', 'philosophy'],
    'attributed',
    {
      attributionNote:
        'A short paraphrase of the Nicomachean Ethics, where happiness is described as an activity of the soul in accordance with virtue.',
    },
  ),
  q(
    'heraclitus-river',
    'No man ever steps in the same river twice, for it’s not the same river and he’s not the same man.',
    'heraclitus',
    ['philosophy', 'life'],
    'attributed',
    {
      attributionNote:
        'A later paraphrase of Heraclitus’ fragments on ever-flowing water, not a direct surviving quotation.',
    },
  ),
  q(
    'epicurus-desire',
    'Do not spoil what you have by desiring what you have not; remember that what you now have was once among the things you only hoped for.',
    'epicurus',
    ['happiness', 'wisdom'],
    'verified',
    { source: 'Vatican Sayings, 35' },
  ),
  q(
    'epicurus-friends',
    'It is not so much our friends’ help that helps us, as the confidence of their help.',
    'epicurus',
    ['friendship', 'philosophy'],
    'verified',
    { source: 'Vatican Sayings, 34' },
  ),
  q(
    'confucius-slow',
    'It does not matter how slowly you go as long as you do not stop.',
    'confucius',
    ['motivation', 'personal-growth'],
    'attributed',
    {
      attributionNote:
        'Frequently printed as Confucius, but not located in the Analects in this wording. It reflects the traditional emphasis on perseverance.',
    },
  ),
  q(
    'confucius-glory',
    'Our greatest glory is not in never falling, but in rising every time we fall.',
    'confucius',
    ['mental-strength', 'inspirational'],
    'attributed',
    {
      attributionNote:
        'Also widely attributed to Nelson Mandela. It appears in Western collections of Confucius sayings, but no Chinese source has been confirmed.',
    },
  ),
  q(
    'lao-tzu-journey',
    'The journey of a thousand miles begins with a single step.',
    'lao-tzu',
    ['motivation', 'personal-growth'],
    'verified',
    { source: 'Tao Te Ching, chapter 64 (translated)' },
  ),
  q(
    'lao-tzu-knowing',
    'Knowing others is intelligence; knowing yourself is true wisdom. Mastering others is strength; mastering yourself is true power.',
    'lao-tzu',
    ['wisdom', 'confidence', 'philosophy'],
    'verified',
    { source: 'Tao Te Ching, chapter 33 (translated)' },
  ),
  q(
    'lao-tzu-letgo',
    'When I let go of what I am, I become what I might be.',
    'lao-tzu',
    ['personal-growth', 'philosophy'],
    'attributed',
    {
      attributionNote:
        'A modern rendering of Taoist ideas about self-forgetting; not a literal line from the Tao Te Ching.',
    },
  ),
  q(
    'lao-tzu-leader',
    'A leader is best when people barely know he exists. When his work is done, they will say: we did it ourselves.',
    'lao-tzu',
    ['leadership', 'wisdom'],
    'verified',
    { source: 'Tao Te Ching, chapter 17 (translated, adapted)' },
  ),
  q(
    'sun-tzu-supreme',
    'The supreme art of war is to subdue the enemy without fighting.',
    'sun-tzu',
    ['leadership', 'wisdom'],
    'verified',
    { source: 'The Art of War, chapter 3 (translated)' },
  ),
  q(
    'sun-tzu-chaos',
    'In the midst of chaos, there is also opportunity.',
    'sun-tzu',
    ['leadership', 'business', 'motivation'],
    'attributed',
    {
      attributionNote:
        'A popular English rendering of advice in The Art of War about turning disorder to advantage; the wording is modern.',
    },
  ),
  q(
    'rumi-wound',
    'The wound is the place where the Light enters you.',
    'rumi',
    ['mental-strength', 'personal-growth'],
    'attributed',
    { source: 'Popular English translation by Coleman Barks' },
  ),
  q(
    'rumi-yesterday',
    'Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.',
    'rumi',
    ['personal-growth', 'wisdom'],
    'disputed',
    {
      attributionNote:
        'Very widely shared online, but no reliable source has been found in Rumi’s poetry. Treat it as a modern saying.',
    },
  ),
  q(
    'rumi-friend',
    'Friend, our closeness is this: anywhere you put your foot, feel me in the firmness under you.',
    'rumi',
    ['friendship', 'love'],
    'attributed',
    { source: 'Coleman Barks translation of Rumi' },
  ),
  q(
    'tagore-service',
    'I slept and dreamt that life was joy. I awoke and saw that life was service. I acted and behold, service was joy.',
    'rabindranath-tagore',
    ['inspirational', 'personal-growth'],
    'attributed',
    { source: 'Recorded in several collections of Tagore’s sayings' },
  ),
  q(
    'sappho-remember',
    'Someone will remember us, I say, even in another time.',
    'sappho',
    ['love', 'wisdom'],
    'verified',
    { source: 'Fragment 147 (translated)' },
  ),

  // ——— Justice, courage and public life ———
  q(
    'mlk-light',
    'Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that.',
    'martin-luther-king-jr',
    ['inspirational', 'love', 'leadership'],
    'verified',
    { source: 'Strength to Love', year: 1963 },
  ),
  q(
    'mlk-injustice',
    'Injustice anywhere is a threat to justice everywhere.',
    'martin-luther-king-jr',
    ['leadership', 'inspirational'],
    'verified',
    { source: 'Letter from Birmingham Jail', year: 1963 },
  ),
  q(
    'mlk-time',
    'The time is always right to do what is right.',
    'martin-luther-king-jr',
    ['motivation', 'leadership'],
    'verified',
    { source: 'Commencement address, Oberlin College', year: 1965 },
  ),
  q(
    'mlk-arc',
    'The arc of the moral universe is long, but it bends toward justice.',
    'martin-luther-king-jr',
    ['inspirational', 'leadership'],
    'attributed',
    {
      attributionNote:
        'King used this image in sermons and speeches while crediting the nineteenth-century abolitionist Theodore Parker.',
    },
  ),
  q(
    'mandela-impossible',
    'It always seems impossible until it’s done.',
    'nelson-mandela',
    ['motivation', 'inspirational'],
    'attributed',
    {
      attributionNote:
        'Widely attributed to Mandela and consistent with his speeches, but no specific recorded source has been established.',
    },
  ),
  q(
    'mandela-education',
    'Education is the most powerful weapon which you can use to change the world.',
    'nelson-mandela',
    ['inspirational', 'personal-growth'],
    'verified',
    { source: 'Speech at Madison Park High School, Boston', year: 1990 },
  ),
  q(
    'mandela-glory',
    'The greatest glory in living lies not in never falling, but in rising every time we fall.',
    'nelson-mandela',
    ['mental-strength', 'inspirational'],
    'disputed',
    {
      attributionNote:
        'Often attributed to Mandela and to Confucius; neither attribution has a verified primary source. The wording resembles a nineteenth-century inspirational line.',
    },
  ),
  q(
    'mandela-courage',
    'I learned that courage was not the absence of fear, but the triumph over it.',
    'nelson-mandela',
    ['mental-strength', 'leadership', 'confidence'],
    'verified',
    { source: 'Long Walk to Freedom', year: 1994 },
  ),
  q(
    'lincoln-character',
    'Nearly all men can stand adversity, but if you want to test a man’s character, give him power.',
    'abraham-lincoln',
    ['leadership', 'wisdom'],
    'attributed',
    {
      attributionNote:
        'Frequently attributed to Lincoln, but no contemporary source has been confirmed. It is often included in collections of his sayings.',
    },
  ),
  q(
    'lincoln-house',
    'A house divided against itself cannot stand.',
    'abraham-lincoln',
    ['leadership', 'philosophy'],
    'verified',
    { source: 'Speech accepting the Illinois Republican nomination', year: 1858 },
  ),
  q(
    'douglass-power',
    'Power concedes nothing without a demand. It never did and it never will.',
    'frederick-douglass',
    ['leadership', 'motivation'],
    'verified',
    { source: 'West India Emancipation speech, Canandaigua', year: 1857 },
  ),
  q(
    'douglass-read',
    'Once you learn to read, you will be forever free.',
    'frederick-douglass',
    ['wisdom', 'inspirational'],
    'attributed',
    {
      attributionNote:
        'A widely used summary of Douglass’s argument that literacy is a path to freedom; the exact sentence is not confirmed in his writings.',
    },
  ),
  q(
    'washington-success',
    'Success is to be measured not so much by the position that one has reached in life as by the obstacles which he has overcome.',
    'booker-t-washington',
    ['success', 'mental-strength'],
    'verified',
    { source: 'Up from Slavery', year: 1901 },
  ),
  q(
    'parks-mind',
    'I have learned over the years that when one’s mind is made up, this diminishes fear; knowing what must be done does away with fear.',
    'rosa-parks',
    ['mental-strength', 'confidence'],
    'verified',
    { source: 'Rosa Parks: My Story', year: 1992 },
  ),
  q(
    'parks-tired',
    'The only tired I was, was tired of giving in.',
    'rosa-parks',
    ['mental-strength', 'inspirational'],
    'attributed',
    {
      attributionNote:
        'A widely quoted recollection of Parks’s decision in 1955. Paraphrases of her account vary between interviews and books.',
    },
  ),
  q(
    'malala-one-child',
    'One child, one teacher, one book, one pen can change the world.',
    'malala-yousafzai',
    ['inspirational', 'personal-growth'],
    'verified',
    { source: 'Address to the United Nations Youth Assembly', year: 2013 },
  ),
  q(
    'malala-voices',
    'We realize the importance of our voices only when we are silenced.',
    'malala-yousafzai',
    ['inspirational', 'confidence'],
    'verified',
    { source: 'I Am Malala', year: 2013 },
  ),
  q(
    'thunberg-small',
    'No one is too small to make a difference.',
    'greta-thunberg',
    ['inspirational', 'motivation'],
    'verified',
    { source: 'No One Is Too Small to Make a Difference', year: 2019 },
  ),
  q(
    'tutu-good',
    'Do your little bit of good where you are; it’s those little bits of good put together that overwhelm the world.',
    'desmond-tutu',
    ['inspirational', 'leadership'],
    'attributed',
    {
      attributionNote:
        'Frequently quoted from Tutu’s sermons and speeches; the exact sermon is not consistently documented.',
    },
  ),

  // ——— Science, curiosity and the examined life ———
  q(
    'einstein-imagination',
    'Imagination is more important than knowledge.',
    'albert-einstein',
    ['wisdom', 'inspirational'],
    'verified',
    { source: 'Interview in The Saturday Evening Post', year: 1929 },
  ),
  q(
    'einstein-bicycle',
    'Life is like riding a bicycle. To keep your balance you must keep moving.',
    'albert-einstein',
    ['life', 'mental-strength'],
    'verified',
    { source: 'Letter to his son Eduard', year: 1930 },
  ),
  q(
    'einstein-insanity',
    'Insanity is doing the same thing over and over again and expecting different results.',
    'albert-einstein',
    ['wisdom', 'personal-growth', 'humour'],
    'disputed',
    {
      attributionNote:
        'No Einstein source exists. The line has been traced to Narcotics Anonymous literature and similar self-help texts from the early 1980s.',
    },
  ),
  q(
    'einstein-value',
    'Strive not to be a success, but rather to be of value.',
    'albert-einstein',
    ['success', 'wisdom'],
    'attributed',
    {
      attributionNote:
        'A widely circulated Einstein line, often linked to his essays of the 1930s, but without a stable primary citation.',
    },
  ),
  q(
    'newton-giants',
    'If I have seen further it is by standing on the shoulders of Giants.',
    'isaac-newton',
    ['wisdom', 'personal-growth'],
    'verified',
    { source: 'Letter to Robert Hooke', year: 1675 },
  ),
  q(
    'lovelace-engine',
    'The Analytical Engine has no pretensions whatever to originate anything. It can do whatever we know how to order it to perform.',
    'ada-lovelace',
    ['business', 'wisdom'],
    'verified',
    { source: 'Notes on the Analytical Engine', year: 1843 },
  ),
  q(
    'feynman-fool',
    'The first principle is that you must not fool yourself — and you are the easiest person to fool.',
    'richard-feynman',
    ['wisdom', 'personal-growth'],
    'verified',
    { source: 'Cargo Cult Science lecture', year: 1974 },
  ),
  q(
    'feynman-understand',
    'What I cannot create, I do not understand.',
    'richard-feynman',
    ['wisdom', 'personal-growth'],
    'verified',
    { source: 'Written on his blackboard at the time of his death', year: 1988 },
  ),
  q(
    'curie-fear',
    'Nothing in life is to be feared, it is only to be understood.',
    'marie-curie',
    ['mental-strength', 'wisdom'],
    'attributed',
    {
      attributionNote:
        'Often quoted from Curie, but the exact source is not firmly documented. The sentiment echoes her public lectures on science.',
    },
  ),
  q(
    'curie-confidence',
    'Life is not easy for any of us. But what of that? We must have perseverance and above all confidence in ourselves.',
    'marie-curie',
    ['confidence', 'mental-strength'],
    'attributed',
    {
      attributionNote:
        'Widely quoted from Curie’s writings and lectures; collections differ slightly in wording.',
    },
  ),
  q(
    'sagan-cosmos',
    'We are a way for the cosmos to know itself.',
    'carl-sagan',
    ['inspirational', 'wisdom'],
    'verified',
    { source: 'Cosmos', year: 1980 },
  ),
  q(
    'sagan-evidence',
    'Extraordinary claims require extraordinary evidence.',
    'carl-sagan',
    ['wisdom', 'philosophy'],
    'attributed',
    {
      attributionNote:
        'Popularised by Sagan in Cosmos, but the phrasing has earlier roots, including the work of Marcello Truzzi.',
    },
  ),
  q(
    'sagan-known',
    'Somewhere, something incredible is waiting to be known.',
    'carl-sagan',
    ['inspirational', 'wisdom'],
    'disputed',
    {
      attributionNote:
        'Often attributed to Sagan, but the sentence was written by Sharon Begley in a 1977 Newsweek article about him.',
    },
  ),
  q(
    'carson-beauty',
    'Those who contemplate the beauty of the earth find reserves of strength that will endure as long as life lasts.',
    'rachel-carson',
    ['inspirational', 'mental-strength'],
    'verified',
    { source: 'The Sense of Wonder', year: 1965 },
  ),
  q(
    'goodall-difference',
    'What you do makes a difference, and you have to decide what kind of difference you want to make.',
    'jane-goodall',
    ['inspirational', 'personal-growth'],
    'attributed',
    {
      attributionNote:
        'A widely quoted line from Goodall’s public talks; the exact interview or book varies between sources.',
    },
  ),
  q(
    'attenborough-care',
    'No one will protect what they don’t care about; and no one will care about what they have never experienced.',
    'david-attenborough',
    ['inspirational', 'leadership'],
    'attributed',
    { source: 'Attributed from his nature documentaries and interviews' },
  ),

  // ——— Writers on life, love and attention ———
  q(
    'shakespeare-self',
    'This above all: to thine own self be true.',
    'william-shakespeare',
    ['confidence', 'wisdom'],
    'verified',
    { source: 'Hamlet, Act I, Scene 3', year: 1601 },
  ),
  q(
    'shakespeare-thinking',
    'There is nothing either good or bad, but thinking makes it so.',
    'william-shakespeare',
    ['philosophy', 'wisdom'],
    'verified',
    { source: 'Hamlet, Act II, Scene 2', year: 1601 },
  ),
  q(
    'shakespeare-doubts',
    'Our doubts are traitors, and make us lose the good we oft might win, by fearing to attempt.',
    'william-shakespeare',
    ['confidence', 'motivation'],
    'verified',
    { source: 'Measure for Measure, Act I, Scene 4', year: 1604 },
  ),
  q(
    'shakespeare-love',
    'Love is not love which alters when it alteration finds.',
    'william-shakespeare',
    ['love', 'wisdom'],
    'verified',
    { source: 'Sonnet 116', year: 1609 },
  ),
  q(
    'shakespeare-summer',
    'Shall I compare thee to a summer’s day? Thou art more lovely and more temperate.',
    'william-shakespeare',
    ['love'],
    'verified',
    { source: 'Sonnet 18', year: 1609 },
  ),
  q(
    'shakespeare-stage',
    'All the world’s a stage, and all the men and women merely players.',
    'william-shakespeare',
    ['life', 'wisdom'],
    'verified',
    { source: 'As You Like It, Act II, Scene 7', year: 1599 },
  ),
  q(
    'shakespeare-fool',
    'The fool doth think he is wise, but the wise man knows himself to be a fool.',
    'william-shakespeare',
    ['wisdom', 'humour'],
    'verified',
    { source: 'As You Like It, Act V, Scene 1', year: 1599 },
  ),
  q(
    'shakespeare-parting',
    'Parting is such sweet sorrow.',
    'william-shakespeare',
    ['love'],
    'verified',
    { source: 'Romeo and Juliet, Act II, Scene 2', year: 1597 },
  ),
  q(
    'shakespeare-cowards',
    'Cowards die many times before their deaths; the valiant never taste of death but once.',
    'william-shakespeare',
    ['mental-strength', 'philosophy'],
    'verified',
    { source: 'Julius Caesar, Act II, Scene 2', year: 1599 },
  ),
  q(
    'shakespeare-fierce',
    'And though she be but little, she is fierce.',
    'william-shakespeare',
    ['confidence'],
    'verified',
    { source: 'A Midsummer Night’s Dream, Act III, Scene 2', year: 1595 },
  ),
  q(
    'austen-truth',
    'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
    'jane-austen',
    ['humour', 'love', 'wisdom'],
    'verified',
    { source: 'Pride and Prejudice, opening line', year: 1813 },
  ),
  q(
    'austen-friends',
    'There is nothing I would not do for those who are really my friends. I have no notion of loving people by halves; it is not my nature.',
    'jane-austen',
    ['friendship', 'love'],
    'verified',
    { source: 'Northanger Abbey', year: 1817 },
  ),
  q(
    'austen-loved-less',
    'If I loved you less, I might be able to talk about it more.',
    'jane-austen',
    ['love'],
    'verified',
    { source: 'Emma', year: 1815 },
  ),
  q(
    'dickens-hero',
    'Whether I shall turn out to be the hero of my own life, or whether that station will be held by anybody else, these pages must show.',
    'charles-dickens',
    ['life', 'personal-growth'],
    'verified',
    { source: 'David Copperfield, opening line', year: 1850 },
  ),
  q(
    'bronte-souls',
    'Whatever our souls are made of, his and mine are the same.',
    'emily-bronte',
    ['love'],
    'verified',
    { source: 'Wuthering Heights', year: 1847 },
  ),
  q(
    'bronte-free',
    'I am no bird; and no net ensnares me: I am a free human being with an independent will.',
    'charlotte-bronte',
    ['confidence', 'wisdom'],
    'verified',
    { source: 'Jane Eyre', year: 1847 },
  ),
  q(
    'browning-love',
    'How do I love thee? Let me count the ways.',
    'elizabeth-barrett-browning',
    ['love'],
    'verified',
    { source: 'Sonnets from the Portuguese, 43', year: 1850 },
  ),
  q(
    'rilke-patience',
    'Be patient toward all that is unsolved in your heart and try to love the questions themselves.',
    'rainer-maria-rilke',
    ['personal-growth', 'wisdom'],
    'verified',
    { source: 'Letters to a Young Poet', year: 1903 },
  ),
  q(
    'rilke-solitudes',
    'Love consists in this, that two solitudes protect and border and greet each other.',
    'rainer-maria-rilke',
    ['love', 'philosophy'],
    'attributed',
    { source: 'Letters to a Young Poet (translated)' },
  ),
  q(
    'neruda-forgetting',
    'Love is so short, forgetting is so long.',
    'pablo-neruda',
    ['love'],
    'verified',
    { source: 'Tonight I Can Write the Saddest Lines (translated)' },
  ),
  q(
    'neruda-dark-things',
    'I love you as certain dark things are to be loved, in secret, between the shadow and the soul.',
    'pablo-neruda',
    ['love'],
    'verified',
    { source: 'One Hundred Love Sonnets, XVII (translated)' },
  ),
  q(
    'cummings-heart',
    'i carry your heart with me (i carry it in my heart)',
    'e-e-cummings',
    ['love'],
    'verified',
    { source: '[i carry your heart with me(i carry it in]' },
  ),
  q(
    'hugo-loved',
    'The greatest happiness of life is the conviction that we are loved; loved for ourselves, or rather, loved in spite of ourselves.',
    'victor-hugo',
    ['love', 'happiness'],
    'attributed',
    { source: 'Les Misérables (translated)' },
  ),
  q(
    'eliot-joined',
    'What greater thing is there for two human souls than to feel that they are joined for life — to strengthen each other in all labour, to rest on each other in all sorrow.',
    'george-eliot',
    ['love', 'friendship'],
    'verified',
    { source: 'Adam Bede', year: 1859 },
  ),
  q(
    'tolstoy-families',
    'All happy families are alike; each unhappy family is unhappy in its own way.',
    'leo-tolstoy',
    ['life', 'love'],
    'verified',
    { source: 'Anna Karenina, opening line', year: 1878 },
  ),
  q(
    'marquez-heart',
    'He was still too young to know that the heart’s memory eliminates the bad and magnifies the good.',
    'gabriel-garcia-marquez',
    ['love', 'life'],
    'verified',
    { source: 'Love in the Time of Cholera (translated)', year: 1985 },
  ),
  q(
    'gibran-children',
    'Your children are not your children. They are the sons and daughters of Life’s longing for itself.',
    'kahlil-gibran',
    ['love', 'wisdom'],
    'verified',
    { source: 'The Prophet', year: 1923 },
  ),
  q(
    'gibran-work',
    'Work is love made visible.',
    'kahlil-gibran',
    ['business', 'love'],
    'verified',
    { source: 'The Prophet', year: 1923 },
  ),
  q(
    'gibran-love',
    'Love one another, but make not a bond of love.',
    'kahlil-gibran',
    ['love', 'friendship'],
    'verified',
    { source: 'The Prophet', year: 1923 },
  ),
  q(
    'saint-exupery-rose',
    'It is the time you have wasted for your rose that makes your rose so important.',
    'antoine-de-saint-exupery',
    ['love', 'friendship'],
    'verified',
    { source: 'The Little Prince (translated)', year: 1943 },
  ),
  q(
    'saint-exupery-desert',
    'What makes the desert beautiful is that somewhere it hides a well.',
    'antoine-de-saint-exupery',
    ['life', 'inspirational'],
    'verified',
    { source: 'The Little Prince (translated)', year: 1943 },
  ),
  q(
    'saint-exupery-tamed',
    'You become responsible, forever, for what you have tamed.',
    'antoine-de-saint-exupery',
    ['love', 'friendship'],
    'verified',
    { source: 'The Little Prince (translated)', year: 1943 },
  ),
  q(
    'montgomery-octobers',
    'I’m so glad I live in a world where there are Octobers.',
    'l-m-montgomery',
    ['happiness', 'life'],
    'verified',
    { source: 'Anne of Green Gables', year: 1908 },
  ),
  q(
    'montgomery-friends',
    'True friends are always together in spirit.',
    'l-m-montgomery',
    ['friendship'],
    'attributed',
    { source: 'Anne of Green Gables series' },
  ),
  q(
    'milne-honey',
    'A day without a friend is like a pot without a single drop of honey left inside.',
    'a-a-milne',
    ['friendship', 'humour'],
    'attributed',
    {
      attributionNote:
        'Collected in Pooh’s Little Instruction Book, a gift book drawn from Milne’s characters; not a line from the original stories.',
    },
  ),
  q(
    'milne-hundred',
    'If you live to be a hundred, I want to live to be a hundred minus one day so I never have to live without you.',
    'a-a-milne',
    ['friendship', 'love'],
    'disputed',
    {
      attributionNote:
        'This line is not found in Milne’s Winnie-the-Pooh books. It circulates widely online as a Pooh quotation.',
    },
  ),
  q(
    'lewis-friendship',
    'Friendship is born at that moment when one person says to another: “What! You too? I thought I was the only one.”',
    'c-s-lewis',
    ['friendship'],
    'verified',
    { source: 'The Four Loves', year: 1960 },
  ),
  q(
    'lewis-courage',
    'Courage is not simply one of the virtues, but the form of every virtue at the testing point.',
    'c-s-lewis',
    ['mental-strength', 'leadership'],
    'verified',
    { source: 'The Screwtape Letters', year: 1942 },
  ),
  q(
    'lewis-integrity',
    'Integrity is doing the right thing even when no one is watching.',
    'c-s-lewis',
    ['wisdom', 'personal-growth'],
    'disputed',
    {
      attributionNote:
        'Often printed as C. S. Lewis, but no source has been found in his books, letters or essays.',
    },
  ),
  q(
    'tolkien-wander',
    'Not all those who wander are lost.',
    'j-r-r-tolkien',
    ['life', 'wisdom'],
    'verified',
    { source: 'The Fellowship of the Ring, “The Riddle of Strider”', year: 1954 },
  ),
  q(
    'tolkien-started',
    'It’s the job that’s never started as takes longest to finish.',
    'j-r-r-tolkien',
    ['motivation', 'personal-growth'],
    'verified',
    { source: 'The Fellowship of the Ring', year: 1954 },
  ),
  q(
    'tolkien-half',
    'I don’t know half of you half as well as I should like; and I like less than half of you half as well as you deserve.',
    'j-r-r-tolkien',
    ['humour', 'friendship'],
    'verified',
    { source: 'The Fellowship of the Ring', year: 1954 },
  ),
  q(
    'camus-summer',
    'In the depth of winter, I finally learned that within me there lay an invincible summer.',
    'albert-camus',
    ['mental-strength', 'inspirational'],
    'verified',
    { source: 'Return to Tipasa', year: 1952 },
  ),
  q(
    'camus-walk',
    'Don’t walk behind me; I may not lead. Don’t walk in front of me; I may not follow. Just walk beside me and be my friend.',
    'albert-camus',
    ['friendship'],
    'disputed',
    {
      attributionNote:
        'No source in Camus’s work. It is a modern friendship saying that has attached itself to his name.',
    },
  ),
  q(
    'sartre-free',
    'Man is condemned to be free.',
    'jean-paul-sartre',
    ['philosophy', 'life'],
    'verified',
    { source: 'Existentialism Is a Humanism', year: 1946 },
  ),
  q(
    'nietzsche-why',
    'He who has a why to live can bear almost any how.',
    'friedrich-nietzsche',
    ['mental-strength', 'philosophy'],
    'verified',
    { source: 'Twilight of the Idols, “Maxims and Arrows”', year: 1889 },
  ),
  q(
    'nietzsche-stronger',
    'What does not kill me makes me stronger.',
    'friedrich-nietzsche',
    ['mental-strength', 'philosophy'],
    'verified',
    { source: 'Twilight of the Idols, “Maxims and Arrows”', year: 1889 },
  ),
  q(
    'kierkegaard-backwards',
    'Life can only be understood backwards; but it must be lived forwards.',
    'soren-kierkegaard',
    ['philosophy', 'life'],
    'verified',
    { source: 'Journals, IV A 164', year: 1843 },
  ),
  q(
    'weil-attention',
    'Attention is the rarest and purest form of generosity.',
    'simone-weil',
    ['wisdom', 'love'],
    'attributed',
    { source: 'Letter to Joë Bousquet', year: 1942 },
  ),
  q(
    'weil-neighbour',
    'The love of our neighbour in all its fullness simply means being able to say to him: “What are you going through?”',
    'simone-weil',
    ['love', 'wisdom'],
    'verified',
    { source: 'Waiting for God (translated)', year: 1951 },
  ),
  q(
    'russell-fools',
    'The whole problem with the world is that fools and fanatics are always so certain of themselves, and wiser people so full of doubts.',
    'bertrand-russell',
    ['wisdom', 'philosophy'],
    'attributed',
    {
      attributionNote:
        'A paraphrase of Russell’s 1933 essay “The Triumph of Stupidity”, which says something similar in different words.',
    },
  ),
  q(
    'russell-good-life',
    'The good life is one inspired by love and guided by knowledge.',
    'bertrand-russell',
    ['life', 'happiness', 'philosophy'],
    'verified',
    { source: 'What I Believe', year: 1925 },
  ),
  q(
    'wittgenstein-language',
    'The limits of my language mean the limits of my world.',
    'ludwig-wittgenstein',
    ['philosophy', 'wisdom'],
    'verified',
    { source: 'Tractatus Logico-Philosophicus, 5.6', year: 1921 },
  ),
  q(
    'descartes-think',
    'I think, therefore I am.',
    'rene-descartes',
    ['philosophy', 'wisdom'],
    'verified',
    { source: 'Discourse on the Method', year: 1637 },
  ),
  q(
    'kant-sapere',
    'Sapere aude! Have courage to use your own understanding.',
    'immanuel-kant',
    ['wisdom', 'confidence', 'philosophy'],
    'verified',
    { source: 'What Is Enlightenment?', year: 1784 },
  ),
  q(
    'spinoza-peace',
    'Peace is not an absence of war; it is a virtue, a state of mind, a disposition for benevolence, confidence, justice.',
    'baruch-spinoza',
    ['philosophy', 'leadership'],
    'verified',
    { source: 'Political Treatise (translated)', year: 1677 },
  ),
  q(
    'pascal-room',
    'All of humanity’s problems stem from man’s inability to sit quietly in a room alone.',
    'blaise-pascal',
    ['philosophy', 'mental-strength'],
    'attributed',
    {
      attributionNote:
        'A free translation of a passage in the Pensées about diversion and the fear of solitude; English versions vary.',
    },
  ),
  q(
    'montaigne-misfortunes',
    'My life has been full of terrible misfortunes most of which never happened.',
    'michel-de-montaigne',
    ['mental-strength', 'humour'],
    'attributed',
    {
      attributionNote:
        'A compact English paraphrase of Montaigne’s essay “Of Vanity”, not a literal quotation.',
    },
  ),
  q(
    'voltaire-questions',
    'Judge a man by his questions rather than by his answers.',
    'voltaire',
    ['wisdom', 'philosophy'],
    'attributed',
    {
      attributionNote:
        'Widely attributed to Voltaire but not located in his writings; a similar idea appears in other Enlightenment authors.',
    },
  ),
  q(
    'machiavelli-feared',
    'It is better to be feared than loved, if you cannot be both.',
    'niccolo-machiavelli',
    ['leadership', 'philosophy'],
    'verified',
    { source: 'The Prince, chapter 17 (translated)', year: 1532 },
  ),
  q('nicholson-read', 'We read to know we’re not alone.', 'c-s-lewis', ['wisdom'], 'disputed', {
    attributionNote:
      'Written by the playwright William Nicholson for Shadowlands (1989) and placed in the mouth of C. S. Lewis. It is not a Lewis quotation.',
  }),
  q(
    'borges-library',
    'I have always imagined that Paradise will be a kind of library.',
    'jorge-luis-borges',
    ['wisdom'],
    'verified',
    { source: 'Poem of the Gifts (translated)' },
  ),
  q(
    'calvino-classic',
    'A classic is a book that has never finished saying what it has to say.',
    'italo-calvino',
    ['wisdom'],
    'verified',
    { source: 'Why Read the Classics?', year: 1991 },
  ),
  q(
    'king-books',
    'Books are a uniquely portable magic.',
    'stephen-king',
    ['wisdom', 'inspirational'],
    'verified',
    { source: 'On Writing', year: 2000 },
  ),
  q(
    'atwood-word',
    'A word after a word after a word is power.',
    'margaret-atwood',
    ['wisdom', 'confidence'],
    'verified',
    { source: 'Spelling', year: 1981 },
  ),
  q(
    'zusak-reading',
    'Reading is a conversation. All books talk.',
    'markus-zusak',
    ['wisdom'],
    'verified',
    { source: 'The Book Thief', year: 2005 },
  ),
  q(
    'hemingway-book',
    'There is no friend as loyal as a book.',
    'ernest-hemingway',
    ['wisdom', 'friendship'],
    'attributed',
    {
      attributionNote:
        'Frequently attributed to Hemingway, but no source has been confirmed in his published writing.',
    },
  ),

  // ——— Attention, mortality and the good life ———
  q(
    'thoreau-desperation',
    'The mass of men lead lives of quiet desperation.',
    'henry-david-thoreau',
    ['life', 'wisdom'],
    'verified',
    { source: 'Walden', year: 1854 },
  ),
  q(
    'thoreau-dreams',
    'Go confidently in the direction of your dreams. Live the life you have imagined.',
    'henry-david-thoreau',
    ['motivation', 'life'],
    'attributed',
    {
      attributionNote:
        'A popular compression of the closing paragraphs of Walden (“I learned this, at least, by my experiment…”).',
    },
  ),
  q(
    'whitman-multitudes',
    'Do I contradict myself? Very well then I contradict myself, (I am large, I contain multitudes.)',
    'walt-whitman',
    ['confidence', 'wisdom'],
    'verified',
    { source: 'Song of Myself', year: 1855 },
  ),
  q(
    'whitman-sunshine',
    'Keep your face always toward the sunshine — and shadows will fall behind you.',
    'walt-whitman',
    ['inspirational', 'happiness'],
    'attributed',
    {
      attributionNote:
        'Widely attributed to Whitman, but no verified source appears in Leaves of Grass.',
    },
  ),
  q(
    'dickinson-hope',
    'Hope is the thing with feathers that perches in the soul.',
    'emily-dickinson',
    ['inspirational', 'happiness'],
    'verified',
    { source: 'Poem 254 (“Hope is the thing with feathers”)', year: 1861 },
  ),
  q(
    'dickinson-forever',
    'Forever is composed of nows.',
    'emily-dickinson',
    ['life', 'wisdom'],
    'verified',
    { source: 'Poem 690', year: 1863 },
  ),
  q(
    'frost-through',
    'The best way out is always through.',
    'robert-frost',
    ['mental-strength', 'motivation'],
    'verified',
    { source: 'A Servant to Servants', year: 1914 },
  ),
  q(
    'frost-road',
    'Two roads diverged in a wood, and I — I took the one less traveled by, and that has made all the difference.',
    'robert-frost',
    ['life', 'motivation'],
    'verified',
    { source: 'The Road Not Taken', year: 1916 },
  ),
  q(
    'frost-life-goes-on',
    'In three words I can sum up everything I’ve learned about life: it goes on.',
    'robert-frost',
    ['life', 'mental-strength'],
    'attributed',
    {
      attributionNote:
        'A widely circulated Frost line that has not been traced to a published poem or letter.',
    },
  ),
  q(
    'eliot-risk',
    'Only those who will risk going too far can possibly find out how far one can go.',
    't-s-eliot',
    ['motivation', 'confidence'],
    'verified',
    { source: 'Preface to Transit of Venus by Harry Crosby', year: 1931 },
  ),
  q(
    'woolf-room',
    'A woman must have money and a room of her own if she is to write fiction.',
    'virginia-woolf',
    ['wisdom', 'confidence'],
    'verified',
    { source: 'A Room of One’s Own', year: 1929 },
  ),
  q(
    'woolf-pieces',
    'Arrange whatever pieces come your way.',
    'virginia-woolf',
    ['life', 'personal-growth'],
    'attributed',
    {
      attributionNote:
        'Recorded in Woolf’s diaries and letters in variants; often quoted without full context.',
    },
  ),
  q(
    'orwell-freedom',
    'Freedom is the freedom to say that two plus two make four. If that is granted, all else follows.',
    'george-orwell',
    ['philosophy', 'wisdom'],
    'verified',
    { source: 'Nineteen Eighty-Four', year: 1949 },
  ),
  q(
    'orwell-past',
    'Who controls the past controls the future. Who controls the present controls the past.',
    'george-orwell',
    ['philosophy', 'wisdom'],
    'verified',
    { source: 'Nineteen Eighty-Four', year: 1949 },
  ),
  q(
    'hemingway-broken',
    'The world breaks everyone and afterward many are strong at the broken places.',
    'ernest-hemingway',
    ['mental-strength', 'life'],
    'verified',
    { source: 'A Farewell to Arms', year: 1929 },
  ),
  q(
    'hemingway-courage',
    'Courage is grace under pressure.',
    'ernest-hemingway',
    ['mental-strength', 'confidence'],
    'disputed',
    {
      attributionNote:
        'Recorded by Dorothy Parker as Hemingway’s phrase, but not found in his published work. Treat the attribution as uncertain.',
    },
  ),
  q(
    'fitzgerald-test',
    'The test of a first-rate intelligence is the ability to hold two opposed ideas in the mind at the same time and still retain the ability to function.',
    'f-scott-fitzgerald',
    ['wisdom', 'philosophy'],
    'verified',
    { source: 'The Crack-Up', year: 1936 },
  ),
  q(
    'fitzgerald-boats',
    'So we beat on, boats against the current, borne back ceaselessly into the past.',
    'f-scott-fitzgerald',
    ['life', 'love'],
    'verified',
    { source: 'The Great Gatsby, closing line', year: 1925 },
  ),
  q(
    'murakami-pain',
    'Pain is inevitable. Suffering is optional.',
    'haruki-murakami',
    ['mental-strength', 'life'],
    'attributed',
    {
      attributionNote:
        'Often attributed to Kafka on the Shore, but it is a much older saying with Buddhist roots. The exact source is unclear.',
    },
  ),
  q(
    'vonnegut-pretend',
    'We are what we pretend to be, so we must be careful about what we pretend to be.',
    'kurt-vonnegut',
    ['wisdom', 'personal-growth'],
    'verified',
    { source: 'Mother Night', year: 1961 },
  ),
  q(
    'adams-where',
    'I may not have gone where I intended to go, but I think I have ended up where I needed to be.',
    'douglas-adams',
    ['life', 'inspirational'],
    'attributed',
    { source: 'The Long Dark Tea-Time of the Soul' },
  ),
  q(
    'coelho-universe',
    'And when you want something, all the universe conspires in helping you to achieve it.',
    'paulo-coelho',
    ['motivation', 'inspirational'],
    'verified',
    { source: 'The Alchemist (translated)', year: 1988 },
  ),
  q(
    'white-morning',
    'I arise in the morning torn between a desire to improve the world and a desire to enjoy the world. This makes it hard to plan the day.',
    'e-b-white',
    ['humour', 'life'],
    'verified',
    { source: 'Interview in The New York Times', year: 1969 },
  ),
  q(
    'didion-stories',
    'We tell ourselves stories in order to live.',
    'joan-didion',
    ['wisdom', 'life'],
    'verified',
    { source: 'The White Album', year: 1979 },
  ),
  q(
    'le-guin-journey',
    'It is good to have an end to journey toward; but it is the journey that matters, in the end.',
    'ursula-k-le-guin',
    ['life', 'wisdom'],
    'attributed',
    {
      attributionNote:
        'Widely attributed to Le Guin; the phrasing varies between quotation collections.',
    },
  ),
  q(
    'oliver-life',
    'Tell me, what is it you plan to do with your one wild and precious life?',
    'mary-oliver',
    ['life', 'inspirational'],
    'verified',
    { source: 'The Summer Day', year: 1990 },
  ),
  q(
    'oliver-attention',
    'Instructions for living a life: pay attention. Be astonished. Tell about it.',
    'mary-oliver',
    ['wisdom', 'happiness', 'inspirational'],
    'verified',
    { source: 'Sometimes', year: 2005 },
  ),
  q(
    'oliver-good',
    'You do not have to be good. You do not have to walk on your knees for a hundred miles through the desert, repenting.',
    'mary-oliver',
    ['mental-strength', 'inspirational'],
    'verified',
    { source: 'Wild Geese', year: 1986 },
  ),
  q(
    'dillard-days',
    'How we spend our days is, of course, how we spend our lives.',
    'annie-dillard',
    ['life', 'personal-growth'],
    'verified',
    { source: 'The Writing Life', year: 1989 },
  ),
  q(
    'lamott-unplug',
    'Almost everything will work again if you unplug it for a few minutes, including you.',
    'anne-lamott',
    ['mental-strength', 'humour'],
    'verified',
    { source: 'Almost Everything', year: 2018 },
  ),
  q(
    'lamott-perfectionism',
    'Perfectionism is the voice of the oppressor.',
    'anne-lamott',
    ['personal-growth', 'confidence'],
    'verified',
    { source: 'Bird by Bird', year: 1994 },
  ),
  q(
    'brown-vulnerability',
    'Vulnerability is not winning or losing; it’s having the courage to show up and be seen when we have no control over the outcome.',
    'brene-brown',
    ['confidence', 'mental-strength'],
    'attributed',
    { source: 'Daring Greatly', year: 2012 },
  ),
  q(
    'brown-clear',
    'Clear is kind. Unclear is unkind.',
    'brene-brown',
    ['leadership', 'wisdom'],
    'verified',
    { source: 'Dare to Lead', year: 2018 },
  ),
  q(
    'brown-talk',
    'Talk to yourself like you would to someone you love.',
    'brene-brown',
    ['confidence', 'personal-growth'],
    'attributed',
    {
      attributionNote:
        'A widely shared line from Brené Brown’s talks and writing; the exact published source varies.',
    },
  ),
  q(
    'angelou-change',
    'If you don’t like something, change it. If you can’t change it, change your attitude.',
    'maya-angelou',
    ['personal-growth', 'mental-strength'],
    'attributed',
    {
      attributionNote:
        'Frequently quoted from Angelou’s interviews and speeches; no single definitive source.',
    },
  ),
  q(
    'angelou-feel',
    'People will forget what you said, people will forget what you did, but people will never forget how you made them feel.',
    'maya-angelou',
    ['inspirational', 'love'],
    'disputed',
    {
      attributionNote:
        'Universally attributed to Angelou online, but no verified source has been found. It may originate in a later motivational text.',
    },
  ),
  q(
    'angelou-nothing',
    'Nothing will work unless you do.',
    'maya-angelou',
    ['motivation', 'confidence'],
    'attributed',
    { source: 'Attributed from Angelou’s public talks' },
  ),
  q(
    'angelou-better',
    'Do the best you can until you know better. Then when you know better, do better.',
    'maya-angelou',
    ['personal-growth', 'wisdom'],
    'attributed',
    {
      attributionNote:
        'Widely attributed to Angelou, but the exact source is not documented. The phrasing also echoes other self-help writers.',
    },
  ),
  q(
    'angelou-story',
    'There is no greater agony than bearing an untold story inside you.',
    'maya-angelou',
    ['wisdom', 'personal-growth'],
    'verified',
    { source: 'I Know Why the Caged Bird Sings', year: 1969 },
  ),
  q(
    'angelou-reduced',
    'You may not control all the events that happen to you, but you can decide not to be reduced by them.',
    'maya-angelou',
    ['mental-strength', 'personal-growth'],
    'verified',
    { source: 'Letter to My Daughter', year: 2008 },
  ),
  q(
    'angelou-rise',
    'You may shoot me with your words, you may cut me with your eyes, you may kill me with your hatefulness, but still, like air, I’ll rise.',
    'maya-angelou',
    ['inspirational', 'mental-strength', 'confidence'],
    'verified',
    { source: 'Still I Rise', year: 1978 },
  ),
  q(
    'angelou-success',
    'Success is liking yourself, liking what you do, and liking how you do it.',
    'maya-angelou',
    ['success', 'happiness'],
    'attributed',
    {
      attributionNote:
        'Frequently quoted from Angelou’s interviews; collections differ in wording and no primary source is consistently cited.',
    },
  ),
  q(
    'morrison-book',
    'If there’s a book that you want to read, but it hasn’t been written yet, then you must write it.',
    'toni-morrison',
    ['motivation', 'personal-growth'],
    'verified',
    { source: 'Speech at the Ohio Arts Council', year: 1981 },
  ),
  q(
    'baldwin-faced',
    'Not everything that is faced can be changed, but nothing can be changed until it is faced.',
    'james-baldwin',
    ['wisdom', 'inspirational'],
    'verified',
    { source: 'As Much Truth As One Can Bear', year: 1962 },
  ),
  q(
    'lorde-self',
    'Caring for myself is not self-indulgence, it is self-preservation, and that is an act of political warfare.',
    'audre-lorde',
    ['mental-strength', 'personal-growth'],
    'verified',
    { source: 'A Burst of Light', year: 1988 },
  ),
  q(
    'walker-power',
    'The most common way people give up their power is by thinking they don’t have any.',
    'alice-walker',
    ['confidence', 'personal-growth'],
    'attributed',
    {
      attributionNote:
        'Widely quoted from Alice Walker, but the exact essay or interview is not consistently documented.',
    },
  ),
  q(
    'rowling-failure',
    'It is impossible to live without failing at something, unless you live so cautiously that you might as well not have lived at all — in which case, you fail by default.',
    'j-k-rowling',
    ['mental-strength', 'personal-growth'],
    'verified',
    { source: 'Harvard University commencement address', year: 2008 },
  ),
  q(
    'beckett-fail',
    'Ever tried. Ever failed. No matter. Try again. Fail again. Fail better.',
    'samuel-beckett',
    ['mental-strength', 'motivation'],
    'verified',
    { source: 'Worstward Ho', year: 1983 },
  ),

  // ——— Work, leadership and craft ———
  q(
    'jobs-work',
    'Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work. And the only way to do great work is to love what you do.',
    'steve-jobs',
    ['business', 'success', 'motivation'],
    'verified',
    { source: 'Stanford University commencement address', year: 2005 },
  ),
  q(
    'jobs-design',
    'Design is not just what it looks like and feels like. Design is how it works.',
    'steve-jobs',
    ['business', 'wisdom'],
    'verified',
    { source: 'Interview in The New York Times', year: 2003 },
  ),
  q(
    'jobs-stay-hungry',
    'Stay hungry. Stay foolish.',
    'steve-jobs',
    ['motivation', 'success'],
    'verified',
    {
      source: 'Stanford University commencement address (quoting the Whole Earth Catalog)',
      year: 2005,
    },
  ),
  q(
    'buffett-price',
    'Price is what you pay. Value is what you get.',
    'warren-buffett',
    ['business', 'wisdom'],
    'verified',
    { source: 'Berkshire Hathaway shareholder letter', year: 2008 },
  ),
  q(
    'buffett-tree',
    'Someone’s sitting in the shade today because someone planted a tree a long time ago.',
    'warren-buffett',
    ['business', 'success'],
    'attributed',
    {
      attributionNote:
        'A familiar Buffett line from interviews and meetings; recordings vary and no single written source is standard.',
    },
  ),
  q(
    'buffett-reputation',
    'It takes 20 years to build a reputation and five minutes to ruin it. If you think about that, you’ll do things differently.',
    'warren-buffett',
    ['business', 'leadership'],
    'attributed',
    {
      attributionNote:
        'Widely attributed to Buffett, though the exact phrasing differs across interviews and speeches.',
    },
  ),
  q(
    'gates-customers',
    'Your most unhappy customers are your greatest source of learning.',
    'bill-gates',
    ['business', 'leadership'],
    'attributed',
    { source: 'Business @ the Speed of Thought', year: 1999 },
  ),
  q(
    'drucker-purpose',
    'The purpose of business is to create and keep a customer.',
    'peter-drucker',
    ['business', 'leadership'],
    'attributed',
    {
      attributionNote:
        'A core Drucker idea, stated in slightly different words across his books, including The Practice of Management and Managing for Results.',
    },
  ),
  q(
    'drucker-measured',
    'What gets measured gets managed.',
    'peter-drucker',
    ['business', 'leadership'],
    'disputed',
    {
      attributionNote:
        'Repeatedly attributed to Drucker, but no passage in his writing uses this sentence. Its origin is unclear.',
    },
  ),
  q(
    'drucker-management',
    'Management is doing things right; leadership is doing the right things.',
    'peter-drucker',
    ['leadership', 'business'],
    'attributed',
    {
      attributionNote:
        'A popular Drucker summary that appears in varying forms; the distinction is genuinely his, the exact wording is not.',
    },
  ),
  q(
    'collins-good',
    'Good is the enemy of great.',
    'jim-collins',
    ['business', 'success', 'leadership'],
    'verified',
    { source: 'Good to Great', year: 2001 },
  ),
  q(
    'dalio-pain',
    'Pain plus reflection equals progress.',
    'ray-dalio',
    ['business', 'personal-growth'],
    'verified',
    { source: 'Principles', year: 2017 },
  ),
  q(
    'godin-customers',
    'Don’t find customers for your products, find products for your customers.',
    'seth-godin',
    ['business', 'wisdom'],
    'attributed',
    { source: 'Attributed from Seth Godin’s blog and talks' },
  ),
  q(
    'graham-scale',
    'Do things that don’t scale.',
    'paul-graham',
    ['business', 'motivation'],
    'verified',
    { source: 'Essay: Do Things that Don’t Scale', year: 2013 },
  ),
  q(
    'hoffman-embarrassed',
    'If you’re not embarrassed by the first version of your product, you’ve launched too late.',
    'reid-hoffman',
    ['business', 'confidence'],
    'attributed',
    {
      attributionNote:
        'A well-known Reid Hoffman line from interviews and talks; the exact wording is often paraphrased.',
    },
  ),
  q(
    'branson-buses',
    'Opportunities are like buses; there’s always another one coming.',
    'richard-branson',
    ['business', 'motivation'],
    'attributed',
    { source: 'Attributed from Branson’s books and interviews' },
  ),
  q(
    'ford-think',
    'Whether you think you can, or you think you can’t — you’re right.',
    'henry-ford',
    ['confidence', 'motivation'],
    'attributed',
    {
      attributionNote:
        'Widely attributed to Ford, but no primary source has been verified in his published writing.',
    },
  ),
  q(
    'ford-horses',
    'If I had asked people what they wanted, they would have said faster horses.',
    'henry-ford',
    ['business', 'humour'],
    'disputed',
    {
      attributionNote:
        'No source in Ford’s writing or recorded interviews. The line is a modern business anecdote attached to his name.',
    },
  ),
  q(
    'bezos-brand',
    'Your brand is what other people say about you when you’re not in the room.',
    'jeff-bezos',
    ['business', 'wisdom'],
    'attributed',
    {
      attributionNote:
        'Frequently attributed to Bezos, but the exact interview or letter is not consistently identified.',
    },
  ),
  q(
    'sinek-why',
    'People don’t buy what you do; they buy why you do it.',
    'simon-sinek',
    ['business', 'leadership'],
    'attributed',
    { source: 'Start With Why and his 2009 TED talk' },
  ),
  q(
    'maxwell-way',
    'A leader is one who knows the way, goes the way, and shows the way.',
    'john-c-maxwell',
    ['leadership'],
    'attributed',
    {
      attributionNote:
        'Widely attributed to John C. Maxwell; earlier versions of the saying also circulate.',
    },
  ),
  q(
    'powell-problems',
    'The day soldiers stop bringing you their problems is the day you have stopped leading them.',
    'colin-powell',
    ['leadership'],
    'attributed',
    {
      attributionNote:
        'A widely quoted Powell observation from talks and interviews, with several recorded variants.',
    },
  ),
  q(
    'eisenhower-leadership',
    'Leadership is the art of getting someone else to do something you want done because he wants to do it.',
    'dwight-d-eisenhower',
    ['leadership'],
    'attributed',
    {
      attributionNote: 'Widely attributed to Eisenhower, but no primary source has been confirmed.',
    },
  ),
  q(
    'truman-credit',
    'It is amazing what you can accomplish if you do not care who gets the credit.',
    'harry-s-truman',
    ['leadership'],
    'attributed',
    {
      attributionNote:
        'Commonly attributed to Truman, but its earliest documented use is uncertain and it may predate him.',
    },
  ),
  q(
    'wooden-success',
    'Success is peace of mind which is a direct result of self-satisfaction in knowing you did your best to become the best you are capable of becoming.',
    'john-wooden',
    ['success', 'leadership'],
    'verified',
    { source: 'His personal definition of success', year: 1934 },
  ),
  q(
    'jordan-fail',
    'I’ve missed more than 9,000 shots in my career. I’ve lost almost 300 games. 26 times, I’ve been trusted to take the game-winning shot and missed. I’ve failed over and over and over again in my life. And that is why I succeed.',
    'michael-jordan',
    ['success', 'mental-strength'],
    'attributed',
    {
      attributionNote:
        'A widely used Nike campaign quotation from the 1990s; its exact origin between Jordan and the advertisement is unclear.',
    },
  ),
  q(
    'serena-champion',
    'I really think a champion is defined not by their wins but by how they can recover when they fall.',
    'serena-williams',
    ['success', 'mental-strength'],
    'attributed',
    { source: 'Attributed from Williams’s interviews' },
  ),
  q(
    'bjk-pressure',
    'Pressure is a privilege.',
    'billie-jean-king',
    ['confidence', 'mental-strength'],
    'attributed',
    { source: 'Pressure Is a Privilege (book title and talks)', year: 2008 },
  ),
  q(
    'bjk-champions',
    'Champions keep playing until they get it right.',
    'billie-jean-king',
    ['success', 'motivation'],
    'attributed',
    { source: 'Attributed from King’s writing and interviews' },
  ),
  q(
    'lombardi-knocked',
    'It’s not whether you get knocked down; it’s whether you get back up.',
    'vince-lombardi',
    ['mental-strength', 'success'],
    'attributed',
    {
      attributionNote:
        'Attributed to Lombardi in many sports collections; the exact speech or writing is difficult to verify.',
    },
  ),
  q(
    'ali-shoe',
    'It isn’t the mountains ahead to climb that wear you out; it’s the pebble in your shoe.',
    'muhammad-ali',
    ['mental-strength', 'wisdom'],
    'attributed',
    {
      attributionNote:
        'Frequently attributed to Ali, with variations; no primary written source has been confirmed.',
    },
  ),
  q(
    'ali-float',
    'Float like a butterfly, sting like a bee.',
    'muhammad-ali',
    ['confidence', 'humour'],
    'verified',
    { source: 'Pre-fight rhyme, popularised before the 1964 Liston fight' },
  ),
  q(
    'gretzky-shots',
    'You miss 100% of the shots you don’t take.',
    'wayne-gretzky',
    ['success', 'motivation'],
    'attributed',
    {
      attributionNote:
        'Popularly attributed to Gretzky, who has used the line; it is also widely attributed to others and the original source is unclear.',
    },
  ),
  q(
    'earhart-adventure',
    'Adventure is worthwhile in itself.',
    'amelia-earhart',
    ['life', 'inspirational'],
    'verified',
    { source: 'Last Flight', year: 1937 },
  ),
  q(
    'earhart-act',
    'The most difficult thing is the decision to act, the rest is merely tenacity.',
    'amelia-earhart',
    ['motivation', 'confidence'],
    'attributed',
    { source: 'Attributed from Earhart’s writing and lectures' },
  ),
  q(
    'pele-success',
    'Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing or learning to do.',
    'pele',
    ['success', 'business'],
    'attributed',
    {
      attributionNote:
        'Widely attributed to Pelé in motivational collections; no primary source has been verified.',
    },
  ),
  q(
    'biles-regret',
    'I’d rather regret the risks that didn’t work out than the chances I didn’t take at all.',
    'simone-biles',
    ['confidence', 'motivation'],
    'attributed',
    { source: 'Attributed from Biles’s interviews and social media' },
  ),

  // ——— Confidence, self-knowledge and courage ———
  q(
    'emerson-enthusiasm',
    'Nothing great was ever achieved without enthusiasm.',
    'ralph-waldo-emerson',
    ['motivation', 'success'],
    'verified',
    { source: 'Essays: Circles', year: 1841 },
  ),
  q(
    'emerson-trust',
    'Trust thyself: every heart vibrates to that iron string.',
    'ralph-waldo-emerson',
    ['confidence', 'personal-growth'],
    'verified',
    { source: 'Self-Reliance', year: 1841 },
  ),
  q(
    'emerson-be-yourself',
    'To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.',
    'ralph-waldo-emerson',
    ['confidence', 'personal-growth'],
    'disputed',
    {
      attributionNote:
        'No Emerson source has been found. The line appears in twentieth-century quotation books and may be a later paraphrase.',
    },
  ),
  q(
    'emerson-friend',
    'The only way to have a friend is to be one.',
    'ralph-waldo-emerson',
    ['friendship'],
    'verified',
    { source: 'Essays: Friendship', year: 1841 },
  ),
  q(
    'emerson-success',
    'To know even one life has breathed easier because you have lived. This is to have succeeded.',
    'ralph-waldo-emerson',
    ['success', 'inspirational'],
    'disputed',
    {
      attributionNote:
        'Often printed as Emerson’s “What is Success?”. The poem was written by Bessie Anderson Stanley in 1905 and later misattributed.',
    },
  ),
  q(
    'roosevelt-eleanor-inferior',
    'No one can make you feel inferior without your consent.',
    'eleanor-roosevelt',
    ['confidence', 'mental-strength'],
    'attributed',
    {
      attributionNote:
        'Widely attributed to Eleanor Roosevelt and used in her name; the earliest documented source is unclear.',
    },
  ),
  q(
    'roosevelt-eleanor-scare',
    'Do one thing every day that scares you.',
    'eleanor-roosevelt',
    ['confidence', 'motivation'],
    'disputed',
    {
      attributionNote:
        'Frequently printed on posters as Eleanor Roosevelt. No source in her writing has been found; it may be a modern motivational line.',
    },
  ),
  q(
    'roosevelt-eleanor-future',
    'The future belongs to those who believe in the beauty of their dreams.',
    'eleanor-roosevelt',
    ['inspirational', 'motivation'],
    'attributed',
    {
      attributionNote:
        'Widely attributed to Roosevelt, but no verified source has been established.',
    },
  ),
  q(
    'roosevelt-eleanor-do',
    'You must do the things you think you cannot do.',
    'eleanor-roosevelt',
    ['confidence', 'motivation'],
    'verified',
    { source: 'You Learn by Living', year: 1960 },
  ),
  q(
    'roosevelt-do-what',
    'Do what you can, with what you have, where you are.',
    'theodore-roosevelt',
    ['motivation', 'personal-growth'],
    'attributed',
    {
      attributionNote:
        'A famous Roosevelt line that has not been traced to a specific speech or book; it may be a paraphrase of his ethos.',
    },
  ),
  q(
    'churchill-never',
    'Never give in, never give in, never, never, never.',
    'winston-churchill',
    ['mental-strength', 'motivation'],
    'verified',
    { source: 'Speech at Harrow School', year: 1941 },
  ),
  q(
    'churchill-continue',
    'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    'winston-churchill',
    ['success', 'mental-strength'],
    'disputed',
    {
      attributionNote:
        'No Churchill source exists. The line is a modern motivational saying that borrows his voice.',
    },
  ),
  q(
    'churchill-hell',
    'If you’re going through hell, keep going.',
    'winston-churchill',
    ['mental-strength', 'motivation'],
    'disputed',
    {
      attributionNote:
        'No verified Churchill source. The phrase appears in later quotation collections and speeches by others.',
    },
  ),
  q(
    'williamson-fear',
    'Our deepest fear is not that we are inadequate. Our deepest fear is that we are powerful beyond measure.',
    'marianne-williamson',
    ['confidence', 'inspirational'],
    'verified',
    {
      source: 'A Return to Love',
      year: 1992,
      attributionNote:
        'Often misattributed to Nelson Mandela because it was quoted in his 1994 inaugural address. The words are Marianne Williamson’s.',
    },
  ),
  q(
    'okeeffe-terrified',
    'I’ve been absolutely terrified every moment of my life — and I’ve never let it keep me from doing a single thing I wanted to do.',
    'georgia-okeeffe',
    ['confidence', 'mental-strength'],
    'attributed',
    { source: 'Attributed from O’Keeffe’s interviews and letters' },
  ),
  q(
    'kahlo-wings',
    'Feet, what do I need you for when I have wings to fly?',
    'frida-kahlo',
    ['confidence', 'mental-strength'],
    'verified',
    { source: 'Her diary (translated)' },
  ),
  q(
    'hepburn-katharine-rules',
    'If you obey all the rules, you miss all the fun.',
    'katharine-hepburn',
    ['confidence', 'humour'],
    'attributed',
    {
      attributionNote:
        'Widely quoted as Katharine Hepburn; the exact interview or film source is not consistently documented.',
    },
  ),
  q(
    'west-once',
    'You only live once, but if you do it right, once is enough.',
    'mae-west',
    ['life', 'humour'],
    'attributed',
    { source: 'Attributed from Mae West’s performances and interviews' },
  ),
  q(
    'hepburn-audrey-impossible',
    'Nothing is impossible, the word itself says “I’m possible”!',
    'audrey-hepburn',
    ['confidence', 'motivation'],
    'attributed',
    {
      attributionNote:
        'Popularly attributed to Audrey Hepburn, but no verified interview or writing matches it.',
    },
  ),
  q(
    'steinem-truth',
    'The truth will set you free, but first it will piss you off.',
    'proverb',
    ['humour', 'wisdom'],
    'anonymous',
    {
      attributionNote:
        'Often attributed to Gloria Steinem, who popularised it; it also appears in earlier feminist writing. Presented here as a modern proverb.',
    },
  ),

  // ——— Habits, growth and the inner life ———
  q(
    'duckworth-endurance',
    'Enthusiasm is common. Endurance is rare.',
    'angela-duckworth',
    ['personal-growth', 'mental-strength'],
    'verified',
    { source: 'Grit', year: 2016 },
  ),
  q(
    'clear-goals',
    'You do not rise to the level of your goals. You fall to the level of your systems.',
    'james-clear',
    ['personal-growth', 'success'],
    'verified',
    { source: 'Atomic Habits', year: 2018 },
  ),
  q(
    'clear-vote',
    'Every action you take is a vote for the type of person you wish to become.',
    'james-clear',
    ['personal-growth', 'motivation'],
    'verified',
    { source: 'Atomic Habits', year: 2018 },
  ),
  q(
    'dweck-becoming',
    'Becoming is better than being.',
    'carol-dweck',
    ['personal-growth', 'confidence'],
    'attributed',
    { source: 'Mindset', year: 2006 },
  ),
  q(
    'rogers-paradox',
    'The curious paradox is that when I accept myself just as I am, then I can change.',
    'carl-rogers',
    ['personal-growth', 'mental-strength'],
    'verified',
    { source: 'On Becoming a Person', year: 1961 },
  ),
  q(
    'campbell-bliss',
    'Follow your bliss.',
    'joseph-campbell',
    ['personal-growth', 'inspirational'],
    'verified',
    { source: 'The Power of Myth', year: 1988 },
  ),
  q(
    'campbell-letgo',
    'We must be willing to let go of the life we planned so as to have the life that is waiting for us.',
    'joseph-campbell',
    ['personal-growth', 'life'],
    'attributed',
    {
      attributionNote:
        'Campbell used versions of this idea in lectures; the neat phrasing is often an editorial paraphrase.',
    },
  ),
  q(
    'watts-dance',
    'The only way to make sense out of change is to plunge into it, move with it, and join the dance.',
    'alan-watts',
    ['philosophy', 'personal-growth'],
    'verified',
    { source: 'The Wisdom of Insecurity', year: 1951 },
  ),
  q(
    'watts-now',
    'This is the real secret of life — to be completely engaged with what you are doing in the here and now. And instead of calling it work, realize it is play.',
    'alan-watts',
    ['personal-growth', 'happiness'],
    'attributed',
    {
      attributionNote:
        'A popular distillation of Watts’s lectures on the present moment; exact transcript wording differs.',
    },
  ),
  q(
    'chodron-sky',
    'You are the sky. Everything else is just the weather.',
    'pema-chodron',
    ['mental-strength', 'wisdom'],
    'attributed',
    {
      attributionNote:
        'Widely quoted from Pema Chödrön’s teachings; collections vary in exact wording.',
    },
  ),
  q(
    'nhat-hanh-breathing',
    'Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.',
    'thich-nhat-hanh',
    ['mental-strength', 'wisdom'],
    'attributed',
    { source: 'Attributed from his mindfulness teachings' },
  ),
  q(
    'ram-dass-home',
    'We’re all just walking each other home.',
    'ram-dass',
    ['friendship', 'inspirational'],
    'attributed',
    {
      attributionNote:
        'A well-known Ram Dass line from talks; the exact recording or book varies between sources.',
    },
  ),
  q(
    'thurman-alive',
    'Don’t ask yourself what the world needs. Ask yourself what makes you come alive, and go do that, because what the world needs is people who have come alive.',
    'howard-thurman',
    ['personal-growth', 'inspirational'],
    'attributed',
    {
      attributionNote:
        'Widely attributed to Howard Thurman; a related passage appears in his writing, but this exact wording is a popular paraphrase.',
    },
  ),
  q(
    'mead-doubt',
    'Never doubt that a small group of thoughtful, committed citizens can change the world; indeed, it’s the only thing that ever has.',
    'margaret-mead',
    ['inspirational', 'leadership'],
    'attributed',
    {
      attributionNote:
        'One of the most quoted lines of the twentieth century, but no verified Mead publication contains it. It is likely a paraphrase of her talks.',
    },
  ),
  q(
    'fuller-model',
    'You never change things by fighting the existing reality. To change something, build a new model that makes the existing model obsolete.',
    'buckminster-fuller',
    ['business', 'inspirational'],
    'attributed',
    {
      attributionNote:
        'A signature Fuller idea, widely quoted from his lectures and writings with slight variations.',
    },
  ),
  q(
    'ten-boom-worry',
    'Worry does not empty tomorrow of its sorrow, it empties today of its strength.',
    'corrie-ten-boom',
    ['mental-strength', 'wisdom'],
    'attributed',
    { source: 'Clippings from My Notebook', year: 1982 },
  ),
  q(
    'niebuhr-serenity',
    'God, grant me the serenity to accept the things I cannot change, the courage to change the things I can, and the wisdom to know the difference.',
    'reinhold-niebuhr',
    ['mental-strength', 'wisdom'],
    'verified',
    {
      source: 'The Serenity Prayer',
      attributionNote:
        'Niebuhr is generally credited with the prayer, which circulated from the 1930s and became widely used in recovery programmes.',
    },
  ),
  q(
    'proverb-this-too',
    'This too shall pass.',
    'proverb',
    ['mental-strength', 'life'],
    'anonymous',
    {
      attributionNote:
        'A very old saying found in Persian, Jewish and Christian traditions. No single author can be identified.',
    },
  ),
  q(
    'proverb-fall-seven',
    'Fall seven times, stand up eight.',
    'proverb',
    ['mental-strength', 'motivation'],
    'anonymous',
    {
      attributionNote: 'A Japanese proverb (七転び八起き), widely used as a motto of perseverance.',
    },
  ),
  q(
    'proverb-go-far',
    'If you want to go fast, go alone. If you want to go far, go together.',
    'proverb',
    ['friendship', 'leadership'],
    'anonymous',
    {
      attributionNote:
        'Widely described as an African proverb, though the earliest documented source is unclear. Presented as a proverb, not a verified quotation.',
    },
  ),
  q(
    'mill-happy',
    'Those only are happy who have their minds fixed on some object other than their own happiness.',
    'john-stuart-mill',
    ['happiness', 'philosophy'],
    'verified',
    { source: 'Autobiography', year: 1873 },
  ),
  q(
    'dalai-lama-compassion',
    'If you want others to be happy, practice compassion. If you want to be happy, practice compassion.',
    'dalai-lama',
    ['happiness', 'love'],
    'attributed',
    {
      attributionNote:
        'A widely quoted summary of the Dalai Lama’s teaching; wordings vary between his books and talks.',
    },
  ),
  q(
    'hawthorne-butterfly',
    'Happiness is a butterfly, which when pursued, is always just beyond your grasp, but which, if you will sit down quietly, may alight upon you.',
    'nathaniel-hawthorne',
    ['happiness', 'wisdom'],
    'attributed',
    {
      attributionNote:
        'Commonly attributed to Hawthorne, but no source has been found in his published work.',
    },
  ),

  // ——— Humour ———
  q(
    'adams-deadlines',
    'I love deadlines. I like the whooshing sound they make as they fly by.',
    'douglas-adams',
    ['humour', 'business'],
    'attributed',
    {
      attributionNote:
        'A signature Adams line from interviews and readings; the exact source varies.',
    },
  ),
  q(
    'adams-lunchtime',
    'Time is an illusion. Lunchtime doubly so.',
    'douglas-adams',
    ['humour', 'life'],
    'verified',
    { source: 'The Hitchhiker’s Guide to the Galaxy', year: 1979 },
  ),
  q(
    'adams-42',
    'The answer to the ultimate question of life, the universe, and everything is forty-two.',
    'douglas-adams',
    ['humour', 'life'],
    'verified',
    { source: 'The Hitchhiker’s Guide to the Galaxy', year: 1979 },
  ),
  q(
    'twain-schooling',
    'I have never let my schooling interfere with my education.',
    'mark-twain',
    ['humour', 'personal-growth'],
    'attributed',
    {
      attributionNote:
        'Firmly associated with Twain in popular quotation, but no verified source has been located.',
    },
  ),
  q(
    'twain-facts',
    'Get your facts first, then you can distort them as you please.',
    'mark-twain',
    ['humour', 'wisdom'],
    'attributed',
    {
      attributionNote:
        'A well-known Twain quip, widely printed but without a confirmed primary source.',
    },
  ),
  q(
    'twain-tomorrow',
    'Never put off till tomorrow what may be done day after tomorrow just as well.',
    'mark-twain',
    ['humour', 'personal-growth'],
    'attributed',
    {
      attributionNote:
        'A comic inversion of the proverb, attributed to Twain in many collections; the source is unverified.',
    },
  ),
  q(
    'twain-travel',
    'Travel is fatal to prejudice, bigotry, and narrow-mindedness.',
    'mark-twain',
    ['wisdom', 'life'],
    'verified',
    { source: 'The Innocents Abroad', year: 1869 },
  ),
  q(
    'twain-death',
    'The report of my death was an exaggeration.',
    'mark-twain',
    ['humour', 'wisdom'],
    'verified',
    { source: 'Note to a reporter, New York Journal', year: 1897 },
  ),
  q(
    'twain-courage',
    'Courage is resistance to fear, mastery of fear — not absence of fear.',
    'mark-twain',
    ['mental-strength', 'confidence'],
    'verified',
    { source: 'Pudd’nhead Wilson', year: 1894 },
  ),
  q(
    'twain-habit',
    'Nothing so needs reforming as other people’s habits.',
    'mark-twain',
    ['humour', 'wisdom'],
    'verified',
    { source: 'Pudd’nhead Wilson', year: 1894 },
  ),
  q(
    'pratchett-open-mind',
    'The trouble with having an open mind, of course, is that people will insist on coming along and trying to put things in it.',
    'terry-pratchett',
    ['humour', 'wisdom'],
    'verified',
    { source: 'Diggers', year: 1990 },
  ),
  q(
    'pratchett-stupidity',
    'Real stupidity beats artificial intelligence every time.',
    'terry-pratchett',
    ['humour', 'wisdom'],
    'verified',
    { source: 'Hogfather', year: 1996 },
  ),
  q(
    'pratchett-cats',
    'In ancient times cats were worshipped as gods; they have not forgotten this.',
    'terry-pratchett',
    ['humour'],
    'attributed',
    {
      attributionNote:
        'A Pratchett line quoted in many forms; the exact book and wording vary between editions.',
    },
  ),
  q(
    'wilde-stars',
    'We are all in the gutter, but some of us are looking at the stars.',
    'oscar-wilde',
    ['inspirational', 'life'],
    'verified',
    { source: 'Lady Windermere’s Fan', year: 1892 },
  ),
  q(
    'wilde-truth',
    'The truth is rarely pure and never simple.',
    'oscar-wilde',
    ['wisdom', 'humour'],
    'verified',
    { source: 'The Importance of Being Earnest', year: 1895 },
  ),
  q(
    'wilde-temptation',
    'I can resist everything except temptation.',
    'oscar-wilde',
    ['humour'],
    'verified',
    { source: 'Lady Windermere’s Fan', year: 1892 },
  ),
  q(
    'wilde-be-yourself',
    'Be yourself; everyone else is already taken.',
    'oscar-wilde',
    ['confidence', 'humour'],
    'disputed',
    {
      attributionNote:
        'No source in Wilde’s plays, essays or letters. The line is a twentieth-century witticism that has settled comfortably under his name.',
    },
  ),
  q(
    'groucho-club',
    'I refuse to join any club that would have me as a member.',
    'groucho-marx',
    ['humour', 'confidence'],
    'attributed',
    {
      attributionNote:
        'A classic Groucho line repeated in interviews and films; the exact first appearance is disputed.',
    },
  ),
  q(
    'groucho-dog',
    'Outside of a dog, a book is man’s best friend. Inside of a dog it’s too dark to read.',
    'groucho-marx',
    ['humour', 'wisdom'],
    'attributed',
    { source: 'Attributed from Groucho’s stage and screen routines' },
  ),
  q(
    'wright-forever',
    'I intend to live forever. So far, so good.',
    'steven-wright',
    ['humour', 'life'],
    'attributed',
    {
      attributionNote: 'A signature Steven Wright one-liner; recorded performances vary slightly.',
    },
  ),
  q(
    'wright-everything',
    'You can’t have everything. Where would you put it?',
    'steven-wright',
    ['humour', 'life'],
    'attributed',
    { source: 'Attributed from Steven Wright’s stand-up routines' },
  ),
  q(
    'bryson-des-moines',
    'I come from Des Moines. Somebody had to.',
    'bill-bryson',
    ['humour', 'life'],
    'verified',
    { source: 'The Lost Continent', year: 1989 },
  ),

  // ——— Motivation and beginnings ———
  q(
    'frank-improve',
    'How wonderful it is that nobody need wait a single moment before starting to improve the world.',
    'anne-frank',
    ['inspirational', 'motivation'],
    'verified',
    { source: 'The Diary of a Young Girl', year: 1947 },
  ),
  q(
    'frank-people',
    'In spite of everything I still believe that people are really good at heart.',
    'anne-frank',
    ['inspirational', 'mental-strength'],
    'verified',
    { source: 'The Diary of a Young Girl', year: 1947 },
  ),
  q(
    'frankl-attitude',
    'Everything can be taken from a man but one thing: the last of the human freedoms — to choose one’s attitude in any given set of circumstances.',
    'viktor-frankl',
    ['mental-strength', 'philosophy'],
    'verified',
    { source: 'Man’s Search for Meaning', year: 1946 },
  ),
  q(
    'frankl-change',
    'When we are no longer able to change a situation, we are challenged to change ourselves.',
    'viktor-frankl',
    ['mental-strength', 'personal-growth'],
    'verified',
    { source: 'Man’s Search for Meaning', year: 1946 },
  ),
  q(
    'frankl-happiness',
    'Happiness cannot be pursued; it must ensue.',
    'viktor-frankl',
    ['happiness', 'philosophy'],
    'verified',
    { source: 'Man’s Search for Meaning', year: 1946 },
  ),
  q(
    'keller-life',
    'Life is either a daring adventure or nothing at all.',
    'helen-keller',
    ['life', 'inspirational'],
    'verified',
    { source: 'The Open Door', year: 1957 },
  ),
  q(
    'keller-suffering',
    'Although the world is full of suffering, it is full also of the overcoming of it.',
    'helen-keller',
    ['mental-strength', 'inspirational'],
    'verified',
    { source: 'Optimism', year: 1903 },
  ),
  q(
    'keller-together',
    'Alone we can do so little; together we can do so much.',
    'helen-keller',
    ['friendship', 'inspirational'],
    'attributed',
    {
      attributionNote:
        'Frequently attributed to Keller, but no precise publication has been confirmed.',
    },
  ),
  q(
    'keller-sight',
    'The only thing worse than being blind is having sight but no vision.',
    'helen-keller',
    ['inspirational', 'wisdom'],
    'attributed',
    {
      attributionNote:
        'Widely attributed to Keller; the exact source is not consistently documented.',
    },
  ),
  q(
    'goethe-begin',
    'Whatever you can do, or dream you can, begin it. Boldness has genius, power and magic in it.',
    'johann-wolfgang-von-goethe',
    ['motivation', 'success'],
    'disputed',
    {
      attributionNote:
        'Not a Goethe quotation. It is a loose paraphrase, via John Anster’s 1835 translation of Faust, assembled by later writers.',
    },
  ),
  q(
    'goethe-knowing',
    'Knowing is not enough; we must apply. Willing is not enough; we must do.',
    'johann-wolfgang-von-goethe',
    ['motivation', 'personal-growth'],
    'attributed',
    {
      attributionNote:
        'Often quoted from Goethe; close in spirit to passages in Wilhelm Meister but not a verified direct quotation.',
    },
  ),
  q(
    'franklin-knowledge',
    'An investment in knowledge pays the best interest.',
    'benjamin-franklin',
    ['wisdom', 'personal-growth'],
    'attributed',
    {
      attributionNote:
        'Printed in many Franklin collections, but not found in the surviving Poor Richard’s Almanack issues.',
    },
  ),
  q(
    'franklin-time',
    'Dost thou love life? Then do not squander time, for that is the stuff life is made of.',
    'benjamin-franklin',
    ['life', 'personal-growth'],
    'verified',
    { source: 'Poor Richard’s Almanack', year: 1746 },
  ),
  q(
    'franklin-well-done',
    'Well done is better than well said.',
    'benjamin-franklin',
    ['success', 'business'],
    'verified',
    { source: 'Poor Richard’s Almanack', year: 1737 },
  ),
  q(
    'cohen-crack',
    'There is a crack in everything. That’s how the light gets in.',
    'leonard-cohen',
    ['mental-strength', 'inspirational', 'life'],
    'verified',
    { source: 'Anthem, on The Future', year: 1992 },
  ),
  q(
    'marley-music',
    'One good thing about music, when it hits you, you feel no pain.',
    'bob-marley',
    ['happiness', 'inspirational'],
    'verified',
    { source: 'Trenchtown Rock', year: 1971 },
  ),
  q(
    'lennon-life',
    'Life is what happens to you while you’re busy making other plans.',
    'john-lennon',
    ['life', 'wisdom'],
    'verified',
    { source: 'Beautiful Boy (Darling Boy)', year: 1980 },
  ),
  q(
    'parton-rainbow',
    'If you want the rainbow, you gotta put up with the rain.',
    'dolly-parton',
    ['motivation', 'happiness'],
    'attributed',
    { source: 'Attributed from Dolly Parton’s songs and interviews' },
  ),
  q(
    'parton-storms',
    'Storms make trees take deeper roots.',
    'dolly-parton',
    ['mental-strength', 'personal-growth'],
    'attributed',
    { source: 'Attributed from Dolly Parton’s interviews' },
  ),
] as const;

export const quotesById: ReadonlyMap<string, Quote> = new Map(
  quotes.map((quote) => [quote.id, quote]),
);

export function getQuote(id: string): Quote | undefined {
  return quotesById.get(id);
}

export const quoteCountByAuthor: ReadonlyMap<string, number> = quotes.reduce((map, quote) => {
  map.set(quote.authorId, (map.get(quote.authorId) ?? 0) + 1);
  return map;
}, new Map<string, number>());

export const quoteCountByCategory: ReadonlyMap<CategoryId, number> = quotes.reduce((map, quote) => {
  for (const category of quote.categories) {
    map.set(category, (map.get(category) ?? 0) + 1);
  }
  return map;
}, new Map<CategoryId, number>());
