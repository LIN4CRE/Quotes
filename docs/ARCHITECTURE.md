# Architecture

LIN4CRE QUOTES is a static React application. There is no server, database, account system, analytics or runtime configuration. Everything the reader saves stays in their browser.

## Request and build path

```
Browser
  └─ static HTML (pre-rendered for public routes)
       ├─ hashed CSS + JS from /assets
       ├─ React boots and replaces the static reading view
       └─ client-side routing (React Router)
            └─ localStorage library (v3)

Build
  tsc -b
  vite build                 → hashed assets, manifest, service worker
  node scripts/generate-static.mjs
       ├─ reads typed data through Vite's SSR loader
       ├─ writes 494 route-specific HTML files with metadata + reading content
       ├─ writes dist/sitemap.xml
       └─ writes dist/robots.txt
```

Vercel runs `npm run verify:production` as its build command. Only a build that passes lint, strict type-checking, the Vitest suite, the production build and the artefact/SEO checks can be deployed.

## Source layout

| Area                      | Responsibility                                                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `src/data/`               | Curated quotes, authors, themes, featured collections and the checked source-URL map. Content is static TypeScript, validated by tests. |
| `src/lib/library.ts`      | Schema constants, validation/normalisation, merging, import/export and summaries. Pure functions, heavily tested.                       |
| `src/lib/storage.ts`      | Versioned `localStorage` access, availability probing and the read-only v2 fallback.                                                    |
| `src/lib/seoContent.ts`   | The single definition of public routes and their metadata. Used by both the client and the static generator.                            |
| `src/providers/`          | React context for settings, library state and toasts. Library mutations persist through `storage`.                                      |
| `src/pages/`              | One lazy-loaded module per route.                                                                                                       |
| `src/components/`         | Layout, quote, library, reflection, search, share and UI primitives.                                                                    |
| `src/services/advice.ts`  | Advice Slip client with timeout, validation and error mapping.                                                                          |
| `scripts/check-build.mjs` | Post-build verification of artefacts, headers, sitemap, static pages and metadata.                                                      |

## Data model

`LibraryData` is versioned and normalised on every read:

```ts
interface LibraryData {
  version: 3;
  favourites: Favourite[]; // quoteId, savedAt, optional note
  collections: Collection[]; // quoteIds + reflectionIds
  history: HistoryEntry[]; // capped at 100, one entry per quote
  advice: AdviceEntry[]; // separate from quotations
  reflections: Reflection[]; // the reader's own words
}
```

Limits are enforced in one place (`src/lib/library.ts`): 100 collections, 500 reflections, 2,000-character notes, 5,000-character reflections. Unknown quote ids are dropped rather than rendered as empty cards. Malformed records are skipped, and the loader reports whether it repaired data.

### Migrations and imports

1. `storage` reads `lin4cre.quotes.library.v3`.
2. If absent, it reads the v2 key once and migrates it (`reflections: []`, `version: 3`, collections gain `reflectionIds`). The v2 key is then removed so it cannot go stale.
3. An imported file is size-limited, parsed as JSON, checked for a library shape, normalised field by field and summarised.
4. The UI shows the summary and warnings; only then can the reader merge.
5. Merging unions favourites (local notes win), collections (by id or case-insensitive name), history (newest wins), advice (trimmed, case-insensitive dedupe) and reflections (by id).

Older, newer and unsigned files are handled explicitly. A backup created by a newer schema is accepted with a warning rather than being trusted blindly.

## Rendering and SEO

This is not a server-rendered app. It has two coordinated layers:

- **Build-time reading view.** `scripts/generate-static.mjs` loads the same data modules through Vite, renders semantic HTML into `#root`, sets route-specific `<title>`, description, canonical, Open Graph, Twitter and robots tags, and writes a real `.html` file per public route. Crawlers and no-JavaScript readers get the quotation, author, source and attribution status.
- **Client metadata.** `src/components/Seo.tsx` applies the same route metadata after navigation and switches private routes to `noindex` with no canonical. React replaces the reading view on boot; the public data remains visible.

`vercel.json` enables `cleanUrls`, so `/quote/aurelius-be-one` serves `quote/aurelius-be-one.html`. The SPA rewrite is negative: paths containing an extension or under `/assets/` or `/icons/` are never rewritten to `index.html`. Missing files therefore return a genuine 404 rather than an HTML 200.

Private views (`/favourites`, `/collections`, `/history`, `/reflections`, `/settings`, `/random`, `/search`) are deliberately absent from the sitemap and disallowed in `robots.txt`. They are local state, not content.

## PWA and offline behaviour

`vite-plugin-pwa` generates a Workbox service worker that precaches the shell, hashed assets, fonts, icons and manifest. Navigation falls back to `index.html`; Advice Slip is `NetworkOnly`. Updates are prompt-based so an open session is never swapped underneath the reader. The app is usable offline for everything except fetching new advice.

## Security and privacy

- Static hosting only; no secrets or environment variables.
- Strict CSP and security headers in `vercel.json`.
- All user text is rendered as React text nodes, never as HTML.
- Imports are untrusted input: bounded size, validated fields, unknown references dropped.
- Reflections are labelled as the reader's own words and are excluded from the quote library and author pages.
- The support link is a plain anchor to PayPal; no payment code runs in the app.

## Accessibility

Semantic landmarks and one `h1` per page, a skip link, focus-trapped dialogs with restoration, visible focus, live regions for result counts and toasts, reduced-motion support and semantic colour tokens for both themes. The release verification includes axe scans across both themes and desktop/mobile viewports.

## Trade-offs

- **Static generation instead of SSR.** It keeps hosting free and the app inspectable, at the cost of duplicate HTML for every public route and a build step that must stay in sync with the route table.
- **`localStorage` instead of IndexedDB.** Simple and synchronous, adequate for a few hundred items, but not suitable for large media or cross-device sync.
- **Microdata and JSON-LD as well as client metadata.** Microdata survives the no-JavaScript view; the client metadata keeps navigation correct. Both are maintained from the same content definitions, with tests guarding the data.
- **Hand-curated data.** No quotation API, no scraping and no generated content. The library is finite by design and every attribution is deliberate.
