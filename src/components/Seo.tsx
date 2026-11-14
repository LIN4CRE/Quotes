import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import {
  buildJsonLd,
  isPrivatePath,
  resolvePublicRoute,
  SITE_NAME,
  SITE_URL,
  type RouteSeo,
} from '@/lib/seoContent';

const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(href: string | null) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!href) {
    link?.remove();
    return;
  }
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.append(link);
  }
  link.href = href;
}

function setJsonLd(route: RouteSeo | null) {
  let script = document.getElementById('route-jsonld') as HTMLScriptElement | null;
  if (!route) {
    script?.remove();
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'route-jsonld';
    document.head.append(script);
  }
  script.textContent = JSON.stringify(buildJsonLd(route));
}

function applyPublicMetadata(route: RouteSeo) {
  const canonical = `${SITE_URL}${route.path === '/' ? '/' : route.path}`;
  document.title = route.title;
  setMeta('name', 'description', route.description);
  setMeta('name', 'robots', 'index,follow,max-image-preview:large');
  setMeta('property', 'og:type', route.ogType);
  setMeta('property', 'og:site_name', SITE_NAME);
  setMeta('property', 'og:title', route.title);
  setMeta('property', 'og:description', route.description);
  setMeta('property', 'og:url', canonical);
  setMeta('property', 'og:image', DEFAULT_IMAGE);
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', route.title);
  setMeta('name', 'twitter:description', route.description);
  setMeta('name', 'twitter:image', DEFAULT_IMAGE);
  setCanonical(canonical);
  setJsonLd(route);
}

/**
 * Route-aware document metadata for client-side navigation. The initial HTML
 * for public routes is generated at build time with the same values; this
 * keeps the document consistent once React takes over.
 */
export function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const route = resolvePublicRoute(pathname);
    if (route) {
      applyPublicMetadata(route);
      return;
    }

    // Private pages are local views, not indexable content.
    setMeta('name', 'robots', 'noindex,nofollow');
    setCanonical(null);
    setJsonLd(null);
    if (isPrivatePath(pathname)) {
      document.title = document.title.includes(SITE_NAME)
        ? document.title
        : `${document.title} — ${SITE_NAME}`;
      return;
    }

    document.title = `Page not found — ${SITE_NAME}`;
    setJsonLd(null);
    setMeta('name', 'description', 'That page could not be found on LIN4CRE QUOTES.');
    setMeta('property', 'og:title', `Page not found — ${SITE_NAME}`);
    setMeta('property', 'og:description', 'That page could not be found on LIN4CRE QUOTES.');
  }, [pathname]);

  return null;
}
