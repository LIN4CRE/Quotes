#!/usr/bin/env node
/**
 * Build-time static generation for public pages.
 *
 * The application remains a Vite/React SPA. This script takes the built
 * index.html (with hashed assets already injected), writes route-specific
 * metadata and a meaningful no-JavaScript reading view into #root, and emits
 * a real XML sitemap. React replaces the reading view as soon as it boots.
 *
 * Data is loaded through Vite's SSR module loader so the generator uses the
 * same typed quote library as the application — no duplicated content.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const SITE_URL = 'https://lin4cre-quotes.vercel.app';
const SITE_NAME = 'LIN4CRE QUOTES';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeXml(value) {
  return escapeHtml(value);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function setMeta(html, attribute, key, content) {
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
  const pattern = new RegExp(`<meta\\s+(?:name|property)=["']${escapeRegExp(key)}["'][^>]*>`, 'i');
  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace('</head>', `    ${tag}\n  </head>`);
}

function renderJsonLd(route, buildJsonLd) {
  const data = buildJsonLd(route);
  const json = JSON.stringify(data).replaceAll('<', '\\u003c');
  return `<script type="application/ld+json" id="route-jsonld">${json}</script>`;
}

function renderHead(html, route, indexable, jsonLd) {
  const canonical = `${SITE_URL}${route.path === '/' ? '/' : route.path}`;
  let output = html;

  output = output.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(route.title)}</title>`);
  output = setMeta(output, 'name', 'description', route.description);
  output = setMeta(
    output,
    'name',
    'robots',
    indexable ? 'index,follow,max-image-preview:large' : 'noindex,nofollow',
  );
  output = setMeta(output, 'property', 'og:type', route.ogType);
  output = setMeta(output, 'property', 'og:site_name', SITE_NAME);
  output = setMeta(output, 'property', 'og:title', route.title);
  output = setMeta(output, 'property', 'og:description', route.description);
  output = setMeta(output, 'property', 'og:url', canonical);
  output = setMeta(output, 'property', 'og:image', OG_IMAGE);
  output = setMeta(output, 'property', 'og:image:width', '1280');
  output = setMeta(output, 'property', 'og:image:height', '640');
  output = setMeta(output, 'property', 'og:image:alt', `${SITE_NAME} — editorial quote library`);
  output = setMeta(output, 'property', 'og:locale', 'en_GB');
  output = setMeta(output, 'name', 'twitter:card', 'summary_large_image');
  output = setMeta(output, 'name', 'twitter:title', route.title);
  output = setMeta(output, 'name', 'twitter:description', route.description);
  output = setMeta(output, 'name', 'twitter:image', OG_IMAGE);

  output = output.replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '');
  output = output.replace(
    '</head>',
    `    <link rel="canonical" href="${escapeHtml(canonical)}" />\n    <link rel="sitemap" type="application/xml" href="${SITE_URL}/sitemap.xml" />\n    ${jsonLd}\n  </head>`,
  );

  return output;
}

function statusLabel(quote) {
  if (quote.attribution === 'verified') return 'Verified source';
  if (quote.attribution === 'attributed') return 'Widely attributed';
  if (quote.attribution === 'disputed') return 'Disputed attribution';
  return 'Proverb / anonymous';
}

function shell(route, bodyHtml) {
  return `<div class="prerender-shell">
  <header class="prerender-header">
    <a class="prerender-brand" href="/" aria-label="LIN4CRE QUOTES home"><span class="prerender-mark" aria-hidden="true">“</span><span><b>LIN4CRE</b><small>QUOTES</small></span></a>
    <nav aria-label="Primary"><a href="/explore">Explore</a><a href="/about">Sources</a><a href="/settings">Settings</a></nav>
  </header>
  <main id="main" class="prerender-main">${bodyHtml}</main>
  <footer class="prerender-footer"><p>${escapeHtml(SITE_NAME)} — quotes are attributed, never invented. Your library stays on your device.</p><p><a href="${SITE_URL}/about">Attribution policy</a> · <a href="https://paypal.me/dlinacre16" target="_blank" rel="noopener noreferrer">Buy Me a Coffee via PayPal</a></p></footer>
</div>`;
}

function quoteLinks(list, limit = 12) {
  return `<ul class="prerender-quotes">${list
    .slice(0, limit)
    .map(
      (quote) =>
        `<li><a href="/quote/${escapeHtml(quote.id)}"><span class="prerender-quote-text">“${escapeHtml(quote.text)}”</span><span class="prerender-quote-by">${escapeHtml(quote.author)}</span></a></li>`,
    )
    .join('')}</ul>`;
}

function renderBody(route, data) {
  const { quotes, categories, authorList, quoteCountByCategory } = data;

  if (route.kind === 'home') {
    const themes = categories.slice(0, 6);
    return `<section itemprop="about" itemscope itemtype="https://schema.org/WebSite">
      <meta itemprop="name" content="${escapeHtml(SITE_NAME)}" />
      <p class="prerender-eyebrow">A curated quote library · 302 quotes · 167 authors</p>
      <h1 class="prerender-title">Find a line that <em>stays with you.</em></h1>
      <p class="prerender-lede">A curated library of quotes with their sources checked. Discover a daily quote, browse 15 themes and 167 authors, save favourites, write private reflections, build collections and share beautiful quote images. Your library stays on your device.</p>
      <p><a class="prerender-cta" href="/explore">Explore the library</a> <a class="prerender-link" href="/about">How attribution works</a></p>
      <h2>Browse by theme</h2>
      <ul class="prerender-grid">${themes
        .map(
          (category) =>
            `<li><a href="/category/${escapeHtml(category.id)}"><b>${escapeHtml(category.name)}</b><span>${quoteCountByCategory.get(category.id) ?? 0} quotes</span></a></li>`,
        )
        .join('')}</ul>
      <p><a class="prerender-link" href="/explore">All 15 themes and 167 authors →</a></p>
    </section>`;
  }

  if (route.kind === 'explore') {
    return `<section>
      <p class="prerender-eyebrow">Explore</p>
      <h1 class="prerender-title">Themes and authors</h1>
      <p class="prerender-lede">Fifteen deliberate themes and a register of 167 authors, each linked to the quotations in the library.</p>
      <h2>Themes</h2>
      <ul class="prerender-grid">${categories
        .map(
          (category) =>
            `<li><a href="/category/${escapeHtml(category.id)}"><b>${escapeHtml(category.name)}</b><span>${quoteCountByCategory.get(category.id) ?? 0} quotes</span></a></li>`,
        )
        .join('')}</ul>
      <h2>Authors</h2>
      <ul class="prerender-authors">${authorList
        .slice(0, 40)
        .map(
          (author) =>
            `<li><a href="/author/${escapeHtml(author.id)}">${escapeHtml(author.name)}</a></li>`,
        )
        .join('')}</ul>
      <p><a class="prerender-link" href="/search">Search the full library →</a></p>
    </section>`;
  }

  if (route.kind === 'about') {
    return `<section>
      <p class="prerender-eyebrow">About</p>
      <h1 class="prerender-title">A small library with its sources attached</h1>
      <p class="prerender-lede">LIN4CRE QUOTES is built around one rule: never present a quotation as more certain than it is. The app runs entirely in your browser, with no account, database or analytics.</p>
      <h2>Attribution statuses</h2>
      <dl class="prerender-definitions">
        <dt>Verified</dt><dd>Documented in a named work, speech or interview, with a source note where one exists.</dd>
        <dt>Widely attributed</dt><dd>Circulates under the author's name without a definitive primary source. Labelled honestly in copied text and images.</dd>
        <dt>Disputed</dt><dd>Contested or known misattribution, kept visible with an explanation rather than silently deleted.</dd>
        <dt>Anonymous</dt><dd>A proverb or traditional saying with no identifiable author.</dd>
      </dl>
      <h2>Privacy and data</h2>
      <p>Favourites, notes, collections, reflections, history and saved advice are stored in your browser's local storage. They are not uploaded and do not sync between devices. Export a JSON backup from Settings to move them.</p>
      <h2>Corrections and rights</h2>
      <p>Attribution and wording corrections are welcome through the repository's issue forms. The MIT licence covers the application code, not the quotation texts, which remain the property of their authors and rights holders.</p>
      <p><a class="prerender-link" href="https://github.com/LIN4CRE/Quotes/issues/new?template=attribution-correction.yml">Report an attribution or rights concern →</a></p>
    </section>`;
  }

  if (route.kind === 'advice') {
    return `<section>
      <p class="prerender-eyebrow">Live advice</p>
      <h1 class="prerender-title">A second opinion, on demand</h1>
      <p class="prerender-lede">The Advice Slip integration from the original page, with stricter validation, duplicate prevention, timestamps and offline handling. Advice is anonymous and deliberately kept separate from attributed quotations.</p>
      <p><a class="prerender-cta" href="/advice">Open live advice</a></p>
      <p class="prerender-note">Advice Slip is an external free service. It requires a network connection; saved advice remains available offline.</p>
    </section>`;
  }

  if (route.kind === 'featured' && route.collection) {
    const collection = route.collection;
    const items = collection.quoteIds
      .map((id) => quotes.find((quote) => quote.id === id))
      .filter(Boolean);
    return `<section>
      <p class="prerender-eyebrow">Featured collection</p>
      <h1 class="prerender-title">${escapeHtml(collection.name)}</h1>
      <p class="prerender-lede">${escapeHtml(collection.description)}</p>
      <p class="prerender-note">${items.length} curated quotes. You can save the collection to your own library; it never leaves this device.</p>
      ${quoteLinks(items, 10)}
    </section>`;
  }

  if (route.kind === 'category' && route.category) {
    const items = quotes.filter((quote) => quote.categories.includes(route.category.id));
    return `<section>
      <p class="prerender-eyebrow">Theme · ${items.length} quotes</p>
      <h1 class="prerender-title">${escapeHtml(route.category.name)} quotes</h1>
      <p class="prerender-lede">${escapeHtml(route.category.description)}</p>
      ${quoteLinks(items, 12)}
      <p><a class="prerender-link" href="/explore">Browse all themes →</a></p>
    </section>`;
  }

  if (route.kind === 'author' && route.author) {
    const author = route.author;
    const items = quotes.filter((quote) => quote.authorId === author.id);
    return `<section itemscope itemtype="https://schema.org/Person">
      <meta itemprop="url" content="${SITE_URL}/author/${escapeHtml(author.id)}" />
      <p class="prerender-eyebrow">Author · ${items.length} quote${items.length === 1 ? '' : 's'}</p>
      <h1 class="prerender-title" itemprop="name">${escapeHtml(author.name)}</h1>
      <p class="prerender-note">${[author.lifespan, author.nationality, author.era].filter(Boolean).map(escapeHtml).join(' · ')}</p>
      <p class="prerender-lede" itemprop="description">${escapeHtml(author.bio)}</p>
      ${quoteLinks(items, 12)}
      <p><a class="prerender-link" href="/explore">Explore more authors →</a></p>
    </section>`;
  }

  if (route.kind === 'quote' && route.quote) {
    const quote = route.quote;
    const extras = quote.attributionNote
      ? `<p class="prerender-note">${escapeHtml(quote.attributionNote)}</p>`
      : '';
    return `<article itemscope itemtype="https://schema.org/Quotation">
      <p class="prerender-eyebrow">Quote · ${statusLabel(quote)}</p>
      <h1 class="prerender-title">${escapeHtml(quote.author)}</h1>
      <blockquote class="prerender-quote"><p itemprop="text">“${escapeHtml(quote.text)}”</p></blockquote>
      <p class="prerender-quote-by">— <span itemprop="author" itemscope itemtype="https://schema.org/Person"><span itemprop="name">${escapeHtml(quote.author)}</span></span></p>
      <p class="prerender-note">${quote.source ? `Source: ${escapeHtml(quote.source)}${quote.year ? `, ${escapeHtml(String(quote.year))}` : ''}` : 'No primary source has been confirmed for this wording.'}</p>
      ${quote.sourceUrl ? `<p><a class="prerender-link" href="${escapeHtml(quote.sourceUrl)}" rel="noopener noreferrer">View the source edition →</a></p>` : ''}
      <p class="prerender-note">Attribution status: ${statusLabel(quote)}. ${escapeHtml(quote.attribution === 'verified' ? 'This wording is documented in the named source.' : quote.attribution === 'disputed' ? 'The attribution is contested and should not be presented as fact.' : quote.attribution === 'anonymous' ? 'This is a traditional saying with no named author.' : 'No definitive primary source has been established.')}</p>
      ${extras}
      <p><a class="prerender-cta" href="/quote/${escapeHtml(quote.id)}">Open this quote in the app</a></p>
      <p><a class="prerender-link" href="/category/${escapeHtml(quote.categories[0] ?? 'wisdom')}">More ${escapeHtml(quote.categories[0] ?? 'quotes')} →</a></p>
    </article>`;
  }

  return '<h1 class="prerender-title">LIN4CRE QUOTES</h1><p class="prerender-lede">A curated quote library.</p>';
}

function routeFile(routePath) {
  if (routePath === '/') return path.join(DIST, 'index.html');
  return path.join(DIST, `${routePath.replace(/^\//, '')}.html`);
}

async function main() {
  const server = await createServer({
    root: ROOT,
    configFile: false,
    resolve: { alias: { '@': path.join(ROOT, 'src') } },
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
    optimizeDeps: { noDiscovery: true },
  });

  let routes;
  let data;
  let buildJsonLd;
  try {
    const seo = await server.ssrLoadModule('/src/lib/seoContent.ts');
    const quoteData = await server.ssrLoadModule('/src/data/quotes.ts');
    const authorData = await server.ssrLoadModule('/src/data/authors.ts');
    const categoryData = await server.ssrLoadModule('/src/data/categories.ts');
    routes = seo.buildPublicRoutes();
    buildJsonLd = seo.buildJsonLd;
    data = {
      quotes: quoteData.quotes,
      authorList: authorData.authorList,
      categories: categoryData.categories,
      quoteCountByCategory: quoteData.quoteCountByCategory,
    };
  } finally {
    await server.close();
  }

  const baseHtml = await readFile(path.join(DIST, 'index.html'), 'utf8');
  const indexable =
    process.env.VERCEL_ENV !== 'preview' && process.env.VERCEL_ENV !== 'development';
  const seenPaths = new Set();

  for (const route of routes) {
    if (seenPaths.has(route.path)) continue;
    seenPaths.add(route.path);

    const body = shell(route, renderBody(route, data));
    let html = renderHead(baseHtml, route, indexable, renderJsonLd(route, buildJsonLd));
    html = html.replace(/<div id="root"[^>]*>[\s\S]*?<\/div>/i, `<div id="root">${body}</div>`);
    html = html.replace(/<noscript>[\s\S]*?<\/noscript>/i, '');

    const file = routeFile(route.path);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, html, 'utf8');
  }

  const urls = routes
    .map(
      (route) =>
        `  <url><loc>${escapeXml(`${SITE_URL}${route.path === '/' ? '/' : route.path}`)}</loc></url>`,
    )
    .join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap, 'utf8');

  const robots = `User-agent: *\nAllow: /\nDisallow: /favourites\nDisallow: /collections\nDisallow: /history\nDisallow: /reflections\nDisallow: /settings\nDisallow: /random\nDisallow: /search\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  await writeFile(path.join(DIST, 'robots.txt'), robots, 'utf8');

  console.log(
    `Static generation: ${seenPaths.size} public pages, ${SITE_URL}/sitemap.xml, ${indexable ? 'indexable' : 'noindex (preview)'} metadata.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
