# LIN4CRE QUOTES

**A quote library with its sources attached.** Discover a daily quote, browse fifteen themes and 167 authors, follow checked source links, save favourites, write private reflections, build collections, and make branded share images — all without an account, a backend or a tracking pixel.

[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Licence: MIT](https://img.shields.io/badge/licence-MIT-231f20.svg)](#licence)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-PayPal-e7b66b?logo=paypal&logoColor=1a1206)](https://paypal.me/dlinacre16)

**Live:** [lin4cre-quotes.vercel.app](https://lin4cre-quotes.vercel.app) · **Version 1.1.0** — `main` deploys to production on Vercel through a full verification gate; every pull request gets a preview deployment.

If the library is useful to you, you can [buy me a coffee through PayPal](https://paypal.me/dlinacre16). It is a plain link — no payment code runs in the app, and nothing is tracked.

---

## Screenshots

![LIN4CRE QUOTES — Discover in dark mode](docs/screenshots/desktop-home.png)

| Quote detail                                                                                   | Share-image generator                                                            |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| ![Quote detail with attribution, actions and notes](docs/screenshots/desktop-quote-detail.png) | ![Canvas-rendered branded quote image](docs/screenshots/desktop-quote-image.png) |

| Light theme                                                         | Collections                                                                   |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| ![Discover in light theme](docs/screenshots/desktop-home-light.png) | ![Personal and curated collections](docs/screenshots/desktop-collections.png) |

| My quotes & reflections                                                             | About, attribution and support                                                        |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| ![Private reflections kept on the device](docs/screenshots/desktop-reflections.png) | ![About page with attribution policy and support](docs/screenshots/desktop-about.png) |

<p align="center">
  <img src="docs/screenshots/mobile-home.png" alt="Mobile home screen" width="270" />
  &nbsp;&nbsp;
  <img src="docs/screenshots/mobile-more-menu.png" alt="Mobile navigation sheet" width="270" />
</p>

All screenshots are of the real application, captured in headless Chromium against the production build at 1440×1000 and 390×844 (2× on mobile). No mock-ups.

---

## Features

### Discovery

- **Quote of the day** — deterministic for the local date, so it changes at local midnight without a server.
- **Random quote deck** with refresh, previous/next history and keyboard arrows.
- **Fifteen themes** — Motivation, Success, Life, Love, Happiness, Friendship, Wisdom, Philosophy, Leadership, Business, Confidence, Mental strength, Personal growth, Humour and Inspirational.
- **167 author pages** with short biographies, lifespans and every quote in the library by that author.
- **Featured collections** — six editor-curated sets that can be opened and copied into a personal library.
- **Recently viewed** history (100 entries, deduplicated, grouped by day).
- **Full search** across quote text, author names, themes and sources, with highlighted matches and attribution filters.
- **Checked source links** on quote detail where a public-domain edition or archive exists, plus a one-click attribution-correction form everywhere a claim is made.

### Personal library

- **Favourites** with one-tap add/remove and private notes (up to 2,000 characters).
- **Custom collections** with names, descriptions, inline creation, rename, delete, and add/remove quotes from any card.
- **Reading history** that you can clear without touching saved quotes.
- **Local persistence** in `localStorage`, versioned and validated on load.
- **My quotes & reflections** — a private notebook for your own words, with optional title/personal attribution, favourites, search, edit/delete and collection membership. Always labelled “Your words” and “Not a historical quotation”; never mixed into the curated library.
- **Review-then-merge JSON import** with a summary of favourites, notes, collections, reflections, history and advice before anything changes; malformed files are rejected safely.
- **Versioned migrations** from the v2 library schema and from the original `g.html` advice entries (`growing-page-entries-v1`).
- **Markdown export** of favourites and JSON export of everything, including reflections.
- Clear, honest **empty, error and loading states** throughout.

### Sharing

- Copy the quote text alone, or copy it **with attribution and source**.
- Native **Web Share API** where supported, with a clipboard fallback.
- **Canvas-generated PNG images** in three social formats: portrait (1080×1350), square (1080×1080) and wide (1200×630) — drawn locally, never uploaded.
- Exported cards carry the author, source where known, attribution status and the LIN4CRE mark.

### Platform

- **Dark-first design** with a warm-paper light theme, self-hosted variable fonts and a custom logo/favicon set.
- **PWA**: installable manifest, maskable icons, generated service worker, precached app shell, offline fallback and an in-app update prompt.
- **Offline-safe library**: favourites, notes, collections, history and saved advice remain available without a network.
- **Keyboard shortcuts**: `⌘/Ctrl K` command palette, `/` search, `?` shortcut guide, `r` random quote, `t` cycle theme.
- **Accessibility**: semantic landmarks, skip link, focus-trapped dialogs, labelled controls, visible focus, AA contrast in both themes and reduced-motion support.
- **Security headers** and a strict Content-Security-Policy configured in `vercel.json`; no secrets, no API keys and no environment variables.
- **SEO that survives a static host**: 494 pre-rendered public pages, a real XML sitemap, canonical/OG/Twitter metadata and `noindex` on private local views.

### Support

- A plainly labelled **Buy Me a Coffee** link to `https://paypal.me/dlinacre16` in the footer, About page and mobile More sheet.
- It opens PayPal in a new tab with `rel="noopener noreferrer"`; the app contains no payment SDK, key, popup or pressure messaging.

---

## Tech stack

| Layer   | Choice                                                                                      |
| ------- | ------------------------------------------------------------------------------------------- |
| UI      | React 19, TypeScript 5.9 (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| Build   | Vite 8, `@vitejs/plugin-react`                                                              |
| Styling | Tailwind CSS 4 with semantic CSS-variable theme tokens                                      |
| Routing | React Router 7, lazy-loaded routes with an error boundary                                   |
| Icons   | Lucide React plus a small inlined GitHub mark                                               |
| Type    | Fraunces Variable (display serif) and Inter Variable (UI sans), self-hosted via Fontsource  |
| PWA     | `vite-plugin-pwa` 2 / Workbox (generateSW), prompt-based updates                            |
| Tests   | Vitest 5, Testing Library, jsdom, axe-core                                                  |
| Hosting | Vercel (static build, SPA rewrite, security headers)                                        |
| CI      | GitHub Actions — lint, type-check, tests, build, artefact verification                      |

No paid services, no backend, no database and no analytics.

---

## Getting started

Requirements: **Node.js 22** (see `.nvmrc`) and npm.

```bash
npm ci
npm run dev        # http://localhost:5173
```

### Scripts

| Command                                      | What it does                                                                      |
| -------------------------------------------- | --------------------------------------------------------------------------------- |
| `npm run dev`                                | Vite development server with HMR                                                  |
| `npm run build`                              | Type-check, build with Vite/Workbox, then pre-render public pages and the sitemap |
| `npm run preview`                            | Serve the production build locally                                                |
| `npm run typecheck`                          | Strict TypeScript project build                                                   |
| `npm run lint`                               | ESLint (flat config, React Hooks rules)                                           |
| `npm test`                                   | Vitest run (79 tests)                                                             |
| `npm run check:build`                        | Verifies artefacts, SEO output, sitemap, headers and static pages (87 conditions) |
| `npm run verify:production`                  | The full Vercel gate: lint → typecheck → tests → build → check:build              |
| `npm run format` / `format:check`            | Prettier                                                                          |
| `npm run icons`                              | Regenerates PNG icons and the Open Graph card (requires Python 3 + Pillow)        |
| `python3 scripts/generate-social-preview.py` | Regenerates the 1280×640 social preview and OG card                               |

### Rebuilding artwork

The generated PNGs are committed, so a normal build never needs Python. To regenerate the icons and Open Graph image after changing the mark:

```bash
python3 -m pip install --user Pillow
npm run icons
```

`public/favicon.svg` and `public/icons/icon-maskable.svg` are the editable vector sources. The social preview and its upload instructions live in [`docs/branding/`](docs/branding/README.md).

---

## Project structure

```
├── .github/ISSUE_TEMPLATE/ # attribution, bug and correction issue forms
├── public/                 # favicon, PWA icons, 1280×640 OG card, robots.txt
├── docs/
│   ├── ARCHITECTURE.md     # data model, rendering, SEO and security decisions
│   ├── branding/           # social preview + upload instructions
│   └── screenshots/        # real application screenshots used above
├── scripts/
│   ├── check-build.mjs     # post-build artefact and SEO checks
│   ├── generate-static.mjs # pre-renders public routes, sitemap.xml and robots.txt
│   ├── generate-icons.py   # Pillow artwork generator
│   └── generate-social-preview.py # editable 1280×640 social preview source
├── src/
│   ├── components/
│   │   ├── Seo.tsx         # route-aware document metadata
│   │   ├── discover/       # theme cards
│   │   ├── layout/         # shell, sidebar, mobile nav, banners, shortcuts
│   │   ├── library/        # collection cards/dialog, picker, note editor
│   │   ├── quotes/         # quote card, list, actions, source/correction links
│   │   ├── reflections/    # private reflection editor and card
│   │   ├── search/         # command palette
│   │   ├── share/          # canvas image dialog
│   │   └── ui/             # buttons, modal, badges, fields, skeletons, logo
│   ├── data/               # quotes, authors, categories, curated collections
│   ├── hooks/              # online status, media query, install prompt, title
│   ├── lib/                # search, storage, library model, SEO content, dates, sharing, image
│   ├── pages/              # one module per route (lazy-loaded)
│   ├── providers/          # settings, library, toasts
│   ├── services/           # Advice Slip client with validation
│   ├── test/               # setup, PWA mock, render helpers
│   ├── types/              # shared domain types
│   ├── App.tsx             # route table
│   ├── index.css           # theme tokens, primitives, animations
│   └── main.tsx            # entry point and provider composition
├── vercel.json             # verify gate, clean URLs, negative SPA rewrite, headers
└── vite.config.ts          # Tailwind, PWA manifest/workbox, Vitest config
```

---

## Content and attribution

The quote library is **curated offline content** shipped with the app, not fetched from a quotation API. Every quote has an explicit attribution status:

| Status                   | Meaning                                                     | Handling                                                    |
| ------------------------ | ----------------------------------------------------------- | ----------------------------------------------------------- |
| **Verified source**      | Documented in the cited work, speech or interview           | Source and year shown                                       |
| **Widely attributed**    | Circulated with the author but no definitive primary source | Labelled as attributed, including in copied text and images |
| **Disputed attribution** | Contested or known misattribution                           | Kept and labelled; an explanation is shown                  |
| **Proverb**              | Traditional saying with no identifiable author              | Attributed to “Proverb”, never to a named person            |

The status is not decorative: it changes the wording of copied quotes and the label drawn onto exported images. Quotes are **never invented**, and no uncertain line is silently presented as verified.

### Source links and corrections

- Where a quotation belongs to a public-domain work, the app links to a checked edition or archive — Project Gutenberg, the Folger Shakespeare Library, MIT Classics or Wikisource. Links are work-level, not invented page anchors, and only added after the destination has been verified.
- Where no reliable link exists — including in-copyright works and translations without a traceable source — the interface says so and leaves the source unlinked. There is no placeholder button.
- Source URLs are appended to copied text and share text alongside the attribution status.
- Every quote page offers a pre-filled **attribution correction** issue form. Reports can cover author, wording, source/date, rights concerns or a missing note. Corrections are reviewed as editorial evidence, not as votes.
- The MIT licence covers the application code only. Quotation texts remain the property of their authors and rights holders; their inclusion here is not a claim of permission or public-domain status.

The full editorial rules are in [CONTRIBUTING.md](CONTRIBUTING.md#content-rules). Security reports should go through [SECURITY.md](SECURITY.md), not a public issue.

### Live advice (the `g.html` integration)

The original page fetched a tip from the free [Advice Slip API](https://api.adviceslip.com/). That functionality is preserved on **Live advice** with substantial hardening:

- Fetch-on-request from `https://api.adviceslip.com/advice?time=…` with `cache: 'no-store'`.
- 10-second timeout via `AbortController`, online/offline detection and visible connection status.
- HTTP, rate-limit (429), malformed-JSON, network and timeout errors mapped to honest messages.
- Payload validated (`slip.advice`, 1–500 characters) before use.
- Saved entries are deduplicated by normalised text, timestamped, capped and restorable after refresh.
- Legacy `growing-page-entries-v1` entries are migrated once, with duplicates removed.
- Advice is kept separate from quotations: it is anonymous, not attributed, and never enters author pages or quote images.
- The service worker treats Advice Slip as **NetworkOnly**, so stale advice is never presented as fresh.

The quote library never depends on this API.

---

## Persistence, export and sync

| Key                          | Contents                                                        |
| ---------------------------- | --------------------------------------------------------------- |
| `lin4cre.quotes.library.v3`  | favourites, notes, collections, history, advice and reflections |
| `lin4cre.quotes.library.v2`  | read once during upgrade, then removed; never written again     |
| `lin4cre.quotes.settings.v1` | theme, text size, motion and disputed-quote preferences         |
| `growing-page-entries-v1`    | legacy advice entries read once and removed after migration     |

Data is read defensively: malformed records are skipped, unknown quote ids are discarded, collections are capped at 100, reflections at 500, names at 80 characters and reflection text at 5,000. A v2 library is migrated once to v3, with collections gaining `reflectionIds`. If `localStorage` is unavailable or full, a visible banner warns that changes will not survive a refresh.

Exports are pretty-printed JSON with an `app` signature, schema version, timestamp, the full library and optional settings. Imports are parsed, validated and **previewed before merging** — favourites, notes, collections, reflections, history, advice and any warnings. Merging never overwrites blindly: local notes win, matching collection names and ids are combined, duplicate reflections are kept once, and history/advice are deduplicated. Malformed or empty files produce a clear error instead of partial silent changes.

**There is no cross-device sync, and the app never pretends there is.** Use export/import to move a library between browsers.

---

## SEO and static output

The app remains a client-side React application, but public content is not trapped behind JavaScript:

- **494 public pages are pre-rendered at build time**: home, about, explore, advice, six featured collections, fifteen themes, 167 authors and all 302 quote pages.
- Each page has a unique `<title>`, meta description, canonical URL, Open Graph and Twitter metadata, and indexable robots directive. Quote and author pages also contain schema.org microdata and route-specific JSON-LD (`Quotation`, `Person`, `CollectionPage`, `WebSite`).
- The pre-rendered HTML contains the quotation, author, source and attribution status in a readable editorial layout. React replaces it on boot.
- `/sitemap.xml` is a real XML document listing only public pages. Private, browser-local views (`/favourites`, `/collections`, `/history`, `/reflections`, `/settings`, `/random`, `/search`) are excluded and marked `noindex`.
- `/robots.txt` contains the correct absolute `Sitemap:` line.
- `vercel.json` enables clean URLs and a **negative** SPA rewrite: paths with a file extension or under `/assets/`/`/icons/` are never rewritten to `index.html`, so a missing resource returns 404 rather than an HTML 200.
- `scripts/check-build.mjs` verifies all of the above on every build, including the sitemap count, absence of private URLs, canonical/OG tags and the pre-rendered quote content.

There is no SEO server or runtime process: the output is static files produced by `npm run build`.

---

## PWA and offline behaviour

- Manifest: standalone display, start URL `/`, scope `/`, theme/background `#08090b`, 192/512/maskable icons and three app shortcuts.
- Service worker: precaches the HTML shell, hashed JS/CSS, self-hosted fonts, icons and manifest; navigation falls back to `index.html` for deep links.
- Updates use `registerType: 'prompt'`; a banner offers a refresh instead of replacing the app mid-session.
- Advice Slip requests are excluded from caching and require a network.

### Install

- **iPhone/iPad:** Share → **Add to Home Screen**.
- **Android (Chrome):** menu → **Install app** / **Add to Home Screen**.
- **Desktop (Chrome/Edge):** install icon in the address bar, or **Settings → Install the app**.
- Safari on iOS does not fire `beforeinstallprompt`; the Settings page documents the manual route.

---

## Accessibility

- One `h1` per page, labelled landmarks, a skip link and a logical heading order.
- Dialogs trap focus, close on `Escape`, lock background scrolling and restore focus.
- Every icon-only control has an accessible name; stateful controls expose `aria-pressed`/`aria-selected`.
- Live regions announce search result counts, toast messages and connection state.
- Semantic colour tokens provide AA contrast in both themes (verified with axe-core in Chromium).
- Motion respects `prefers-reduced-motion`, a `data-motion` attribute and an in-app switch.

---

## Testing

All of the following were run on the implementation in this repository.

| Check                              | Command                                                 | Result                                                                                                                        |
| ---------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Strict type-check                  | `npm run typecheck`                                     | Passed                                                                                                                        |
| Lint                               | `npm run lint`                                          | Passed                                                                                                                        |
| Unit/component tests               | `npm test`                                              | **79 passed / 79** across 10 files                                                                                            |
| Production build                   | `npm run build`                                         | Passed (87 precache entries, 494 pre-rendered pages, sitemap)                                                                 |
| Artefact verification              | `npm run check:build`                                   | **87/87 conditions passed**                                                                                                   |
| Full verification gate             | `npm run verify:production`                             | Passed — lint, typecheck, tests, build, artefact checks                                                                       |
| Browser flows (Chromium)           | script against `vite preview` of the production build   | **28/28 passed** — reflections, import preview, source/correction links, support, mobile More, static HTML, sitemap, metadata |
| Accessibility (axe-core, Chromium) | 48 scans across 12 routes × desktop/mobile × dark/light | **0 violations** (WCAG 2.0/2.1 A and AA)                                                                                      |
| PWA/offline (Chromium, v1.0 base)  | script against `vite preview`                           | **6/6 passed** — SW control, manifest, precache, offline reload, offline navigation, deep link                                |

Test coverage includes:

- data integrity (unique quotes, real authors/themes, attribution rules, all 15 themes, curated collections);
- search ranking, filters, accents/punctuation and highlight segmentation;
- library state: favourites, notes, collections, duplicates, history, advice deduplication, migration, merge, clear, rehydration;
- Advice Slip validation, HTTP/rate-limit/offline/malformed/network handling;
- quote text with attribution/disputed/proverb labels, clipboard success/failure, Web Share and cancellation;
- quote detail: rendering, history recording, save/note, copy, share, disputed notes, 404, collection creation, back navigation;
- search/favourites/collections/settings pages, import/export, invalid JSON, destructive-action confirmation, theme/font/motion settings;
- application startup, routing, 404, keyboard shortcuts and axe checks in jsdom;
- offline hook, offline advice state and the shell offline banner;
- reflection creation, validation, favourites, editing, collection membership and deletion;
- v2→v3 migration, import previews, malformed/untrusted files, newer-schema warnings and merge deduplication;
- static page content, sitemap completeness and the absence of private routes.

Browser-only checks above were executed in this build environment with headless Chromium against the production build and are not part of the committed CI suite (CI runs lint, type-check, Vitest, build and artefact checks). No test result is claimed unless it was actually run.

---

## Deployment

`vercel.json` is the complete deployment configuration:

- Framework `vite`, install `npm ci`, output `dist`.
- Build command `npm run verify:production`: Vercel cannot deploy a build that fails lint, type-checking, tests, the production build or artefact checks.
- `cleanUrls` so pre-rendered pages are served at `/about`, `/quote/:id` and so on.
- Negative SPA rewrite to `/index.html` only for genuine application routes; static resources are excluded so missing files return 404.
- Explicit XML content type and caching for `/sitemap.xml`, plus caching for `/robots.txt`.
- CSP allowing only self-hosted assets plus `https://api.adviceslip.com`; `img-src` includes `blob:` for generated images.
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`.
- Immutable one-year caching for hashed assets; no-cache for `sw.js` and the manifest; `Service-Worker-Allowed: /`.

The Vercel project is connected to **`LIN4CRE/Quotes`**, with `main` as the production branch and automatic preview deployments for pull requests. No environment variables are required.

To deploy elsewhere: `npm ci && npm run build`, serve `dist/` as static files with clean URLs and an SPA fallback to `index.html` for extensionless routes only, and keep the headers above if your host supports them. Do not fall back for `/sitemap.xml`, `/robots.txt`, assets or missing images.

---

## Known limitations

- The library is finite and maintained by hand (302 quotes at the time of writing); it is not a complete quotation archive.
- Attribution research is careful but not infallible. Disputed entries carry an explanation and corrections are welcome.
- Some quotations are common English translations rather than the original wording.
- Advice Slip is an external free service; it can be slow, rate-limited or unavailable.
- Native sharing, clipboard and install prompts depend on browser support.
- Local data is per browser and per device; clearing site data removes the library unless you exported a backup. Reflections have the same limitation and are never uploaded.
- Pre-rendered metadata is generated from the same data modules as the app. A new public route must be registered in both places, and the build fails its checks if the sitemap or a static page is missing.
- Source links are work-level and intentionally limited to verified archives. Many in-copyright quotations have no link, and the interface says so.
- Generated images use locally available fonts. The app loads Fraunces and Inter, but a browser that blocks font loading will fall back to serif/sans-serif metrics.

---

## Project documentation

- [Architecture](docs/ARCHITECTURE.md) — data model, migrations, rendering, SEO, security and trade-offs.
- [Contributing](CONTRIBUTING.md) — setup, content rules, tests and pull-request expectations.
- [Security policy](SECURITY.md) — private reporting and the security model.
- [Changelog](CHANGELOG.md) — what changed in 1.1.0.
- [Branding](docs/branding/README.md) — social preview, palette and upload instructions.

## Support the project

LIN4CRE QUOTES is free, has no ads and no tracking. If it is useful to you, you can [buy me a coffee through PayPal](https://paypal.me/dlinacre16). The link opens in a new tab; PayPal handles the payment, and this app never sees your details. No account, subscription or feature is unlocked by supporting.

## Licence

Application code: [MIT](LICENSE). **The MIT licence does not cover quotation texts.** Quotations remain the property of their authors and rights holders and are included for reference and inspiration; translations may carry separate rights. Their inclusion is not a claim of permission, public-domain status or endorsement. Fonts are licensed under the SIL Open Font License via Fontsource. Icons are from [Lucide](https://lucide.dev) (ISC). Advice content is provided by [Advice Slip](https://api.adviceslip.com/).
