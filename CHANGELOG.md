# Changelog

All notable changes to LIN4CRE QUOTES are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [semantic versioning](https://semver.org/).

## [1.1.0] — 2026-11-14

### Added

- **My quotes & reflections** — a private notebook for the reader's own writing, with optional title and personal attribution, favourites, search, edit/delete, collection membership and JSON backup support. Entries are explicitly labelled "Your words" and "Not a historical quotation"; they never enter the curated library or author pages.
- **Provenance links** — checked, work-level source URLs for public-domain editions and archives (Project Gutenberg, Folger Shakespeare Library, MIT Classics, Wikisource), shown on quote detail and appended to copied/shared text. Quotes without a verified link keep the honest "no primary source listed" wording.
- **Attribution correction flow** — a pre-filled GitHub issue form linked from every quote, so a wrong author, wording, source or rights concern can be reported without hunting for a contact page.
- **Real SEO surface** — build-time pre-rendering of 494 public pages (home, about, explore, advice, featured collections, themes, authors and every quote), unique titles, descriptions, canonical URLs, Open Graph/Twitter metadata, `Quotation`/`Person` microdata and JSON-LD, a genuine `sitemap.xml` containing only public pages, a corrected `robots.txt` sitemap pointer and `noindex` on private, browser-local views.
- **Review-then-merge imports** — pasted or uploaded backups are parsed, validated and summarised (favourites, notes, collections, reflections, history, advice and warnings) before anything is merged. Schema v2 libraries migrate to v3, malformed files fail safely and duplicates are collapsed.
- **Buy Me a Coffee** — an accessible, plainly labelled link to `https://paypal.me/dlinacre16` in the footer, About page and mobile More sheet. It opens PayPal in a new tab; there is no payment SDK, key or tracking parameter.
- **Branding package** — a 1280×640 GitHub social preview (under 1 MB) with an editable Pillow generator, refreshed Open Graph card, a real screenshot of the reflections page, About page and current navigation states.
- **Professional project documentation** — this changelog, `CONTRIBUTING.md`, `SECURITY.md`, an architecture overview, issue forms for attribution corrections and bugs, and a rewritten README.
- **`verify:production`** — a single lint → type-check → test → build → artefact-check gate, used by Vercel as its build command.

### Changed

- The library schema is now **v3**, stored under `lin4cre.quotes.library.v3`. A v2 library is read once, migrated and the stale v2 key is removed; the v2 key is never written again.
- `Collection` records now carry `reflectionIds` alongside `quoteIds`.
- The production build now runs static generation after Vite and emits clean URLs (`/about`, `/quote/:id`) through `vercel.json`.
- The SPA rewrite excludes asset, icon and file-extension paths, so a missing static resource returns a real 404 instead of an HTML document.
- About page copy states plainly that the MIT licence covers code, not quotation texts.

### Fixed

- Advice deduplication during merges now trims whitespace before comparing, matching import normalisation.
- Accessible-name mismatches on the support link, source links and "Show more quotes" control (axe `label-content-name-mismatch`).
- Ordered, labelled empty/error/loading states and mobile tap targets for the new reflection and import surfaces.

### Verification

See the README for the exact commands and results recorded for this release. Browser evidence was produced with real headless Chromium against the production build, including 48 axe scans across both themes and desktop/mobile viewports.

## [1.0.0] — 2026-11-14

### Added

- Initial public release: 302 attributed quotations, 167 authors and 15 themes.
- Daily quote, random quote deck, search, author and theme pages, featured collections.
- Favourites, private notes, custom collections, reading history and local persistence.
- Copy/share actions with attribution, canvas-generated quote images, and native Web Share where available.
- Advice Slip integration, hardened and kept separate from quotations.
- Installable PWA with offline shell, prompt-based updates and a full icon set.
- Strict TypeScript, Vitest suite, axe checks, security headers, documentation and a live Vercel deployment.
