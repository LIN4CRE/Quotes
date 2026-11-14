import { authorList, authorsById } from '@/data/authors';
import { categories, getCategory } from '@/data/categories';
import { curatedCollections } from '@/data/collections';
import { quotes, quotesById, quoteCountByCategory } from '@/data/quotes';
import type { Author, Category, CuratedCollection, Quote } from '@/types';

export const SITE_URL = 'https://lin4cre-quotes.vercel.app';
export const SITE_NAME = 'LIN4CRE QUOTES';
export const DEFAULT_DESCRIPTION =
  'A curated library of 302 attributed quotes across 15 themes and 167 authors. Discover a daily quote, save favourites, write private reflections, build collections and share elegant quote images.';

export type PublicKind =
  'home' | 'about' | 'explore' | 'advice' | 'quote' | 'author' | 'category' | 'featured';

export interface RouteSeo {
  path: string;
  kind: PublicKind;
  title: string;
  description: string;
  ogType: 'website' | 'article' | 'profile';
  quote?: Quote;
  author?: Author;
  category?: Category;
  collection?: CuratedCollection;
}

export function truncate(value: string, length: number): string {
  const collapsed = value.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= length) return collapsed;
  return `${collapsed.slice(0, length - 1).trimEnd()}…`;
}

function quoteTitle(quote: Quote): string {
  return `“${truncate(quote.text, 90)}” — ${quote.author}`;
}

function quoteDescription(quote: Quote): string {
  const source = quote.source
    ? ` Source: ${quote.source}${quote.year ? `, ${quote.year}` : ''}.`
    : '';
  const status =
    quote.attribution === 'verified'
      ? 'Verified attribution.'
      : quote.attribution === 'attributed'
        ? 'Widely attributed; no definitive primary source is listed.'
        : quote.attribution === 'disputed'
          ? 'Disputed attribution, shown with an explanation.'
          : 'A traditional proverb with no named author.';
  return truncate(`${quote.text} — ${quote.author}.${source} ${status}`, 168);
}

function categoryDescription(category: Category): string {
  const count = quoteCountByCategory.get(category.id) ?? 0;
  return truncate(
    `${category.description} Browse ${count} attributed quotes on ${category.name.toLowerCase()}.`,
    168,
  );
}

function authorDescription(author: Author): string {
  const count = quotes.filter((quote) => quote.authorId === author.id).length;
  return truncate(`${author.bio} Browse ${count} attributed quote${count === 1 ? '' : 's'}.`, 168);
}

export function buildPublicRoutes(): RouteSeo[] {
  const routes: RouteSeo[] = [
    {
      path: '/',
      kind: 'home',
      title: `${SITE_NAME} — Find a line that stays with you`,
      description: DEFAULT_DESCRIPTION,
      ogType: 'website',
    },
    {
      path: '/explore',
      kind: 'explore',
      title: `Explore themes and authors — ${SITE_NAME}`,
      description:
        'Browse 15 themes and 167 authors in a hand-curated quotation library, with every attribution status shown openly.',
      ogType: 'website',
    },
    {
      path: '/about',
      kind: 'about',
      title: `About, sources and attribution policy — ${SITE_NAME}`,
      description:
        'How LIN4CRE QUOTES handles verified, widely attributed, disputed and anonymous quotations, plus privacy, data and correction information.',
      ogType: 'website',
    },
    {
      path: '/advice',
      kind: 'advice',
      title: `Live advice — ${SITE_NAME}`,
      description:
        'A second opinion on demand from the free Advice Slip service, with validation, timestamps and offline handling. Kept separate from attributed quotations.',
      ogType: 'website',
    },
  ];

  for (const collection of curatedCollections) {
    routes.push({
      path: `/featured/${collection.id}`,
      kind: 'featured',
      title: `${collection.name} — a featured quote collection — ${SITE_NAME}`,
      description: `${collection.description} ${collection.quoteIds.length} curated quotes, saved locally when you choose.`,
      ogType: 'website',
      collection,
    });
  }

  for (const category of categories) {
    routes.push({
      path: `/category/${category.id}`,
      kind: 'category',
      title: `${category.name} quotes — ${SITE_NAME}`,
      description: categoryDescription(category),
      ogType: 'website',
      category,
    });
  }

  for (const author of authorList) {
    routes.push({
      path: `/author/${author.id}`,
      kind: 'author',
      title: `${author.name} quotes — ${SITE_NAME}`,
      description: authorDescription(author),
      ogType: 'profile',
      author,
    });
  }

  for (const quote of quotes) {
    routes.push({
      path: `/quote/${quote.id}`,
      kind: 'quote',
      title: `${quoteTitle(quote)} — ${SITE_NAME}`,
      description: quoteDescription(quote),
      ogType: 'article',
      quote,
    });
  }

  return routes;
}

/** Resolves a public route, or null when the route is private or unknown. */
export function resolvePublicRoute(pathname: string): RouteSeo | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const record = publicRouteMap.get(path);
  if (record) return record;

  const quoteMatch = /^\/quote\/([^/]+)$/.exec(path);
  if (quoteMatch?.[1]) {
    const quote = quotesById.get(decodeURIComponent(quoteMatch[1]));
    if (quote) {
      return {
        path: `/quote/${quote.id}`,
        kind: 'quote',
        title: `${quoteTitle(quote)} — ${SITE_NAME}`,
        description: quoteDescription(quote),
        ogType: 'article',
        quote,
      };
    }
  }

  const authorMatch = /^\/author\/([^/]+)$/.exec(path);
  if (authorMatch?.[1]) {
    const author = authorsById.get(decodeURIComponent(authorMatch[1]));
    if (author) {
      return {
        path: `/author/${author.id}`,
        kind: 'author',
        title: `${author.name} quotes — ${SITE_NAME}`,
        description: authorDescription(author),
        ogType: 'profile',
        author,
      };
    }
  }

  const categoryMatch = /^\/category\/([^/]+)$/.exec(path);
  if (categoryMatch?.[1]) {
    const category = getCategory(decodeURIComponent(categoryMatch[1]) as Category['id']);
    if (category) {
      return {
        path: `/category/${category.id}`,
        kind: 'category',
        title: `${category.name} quotes — ${SITE_NAME}`,
        description: categoryDescription(category),
        ogType: 'website',
        category,
      };
    }
  }

  return null;
}

const publicRouteMap = new Map<string, RouteSeo>();
for (const route of buildPublicRoutes()) {
  publicRouteMap.set(route.path, route);
}

export const PRIVATE_PATHS = [
  '/favourites',
  '/collections',
  '/history',
  '/reflections',
  '/settings',
  '/random',
  '/search',
] as const;

export function isPrivatePath(pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return PRIVATE_PATHS.some(
    (privatePath) => path === privatePath || path.startsWith(`${privatePath}/`),
  );
}

export type JsonLd = Record<string, unknown>;

/**
 * Structured data for a public route. Kept next to the route definitions so the
 * static HTML and the client update describe the same page.
 */
export function buildJsonLd(route: RouteSeo): JsonLd {
  const url = `${SITE_URL}${route.path === '/' ? '/' : route.path}`;

  if (route.kind === 'quote' && route.quote) {
    const quote = route.quote;
    return {
      '@context': 'https://schema.org',
      '@type': 'Quotation',
      '@id': `${url}#quotation`,
      url,
      text: quote.text,
      creator: { '@type': 'Person', name: quote.author },
      ...(quote.source ? { citation: quote.source } : {}),
      ...(quote.sourceUrl ? { isBasedOn: quote.sourceUrl } : {}),
      ...(quote.attribution !== 'verified'
        ? {
            disambiguatingDescription:
              quote.attribution === 'attributed'
                ? 'Widely attributed; no definitive primary source confirmed.'
                : quote.attribution === 'disputed'
                  ? 'Disputed attribution; see the attribution note on the page.'
                  : 'Traditional or anonymous saying.',
          }
        : {}),
    };
  }

  if (route.kind === 'author' && route.author) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${url}#person`,
      url,
      name: route.author.name,
      description: [route.author.bio, route.author.lifespan, route.author.nationality]
        .filter(Boolean)
        .join(' · '),
    };
  }

  if (route.kind === 'category' && route.category) {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${url}#collection`,
      url,
      name: route.category.name,
      description: route.category.description,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    };
  }

  if (route.kind === 'featured' && route.collection) {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${url}#collection`,
      url,
      name: route.collection.name,
      description: route.collection.description,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    };
  }

  const type =
    route.kind === 'about'
      ? 'AboutPage'
      : route.kind === 'explore'
        ? 'CollectionPage'
        : route.kind === 'home'
          ? 'WebSite'
          : 'WebPage';

  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#page`,
    url,
    name: route.title,
    description: route.description,
    ...(route.kind === 'home' ? { publisher: { '@type': 'Organization', name: SITE_NAME } } : {}),
    ...(route.kind === 'home'
      ? {
          potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE_URL}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        }
      : {}),
  };
}
