# Contributing to LIN4CRE QUOTES

Thank you for taking the time to help. This is a small, deliberately dependency-light project. Contributions that improve accuracy, accessibility, clarity or reliability are more valuable than new surface area.

By participating you agree to keep discussion civil and to follow the [Code of Conduct](CODE_OF_CONDUCT.md) if one is added. Until then, the standard is simple: be decent, assume good faith and critique the work rather than the person.

## Before you begin

- **Bugs and corrections:** use the [issue forms](https://github.com/LIN4CRE/Quotes/issues/new/choose).
- **Security problems:** do **not** open a public issue. Follow [SECURITY.md](SECURITY.md).
- **Large features:** open an issue first. The app intentionally has no backend, accounts, analytics or paid services; proposals that require them are out of scope.

## Development setup

Requirements: Node.js 22 (see `.nvmrc`) and npm. Python 3 with Pillow is only needed to regenerate artwork.

```bash
git clone https://github.com/LIN4CRE/Quotes.git
cd Quotes
npm ci
npm run dev
```

The same commands CI and Vercel use are available locally:

```bash
npm run lint        # ESLint
npm run typecheck   # strict TypeScript project build
npm test            # Vitest
npm run build       # tsc, Vite build and static SEO generation
npm run check:build # production-artefact and SEO checks
npm run format:check
```

Before opening a pull request, run the single gate that mirrors Vercel:

```bash
npm run verify:production
```

That script runs lint → type-check → tests → build → artefact checks. It must pass on a clean checkout.

## Content rules

The library's credibility depends on restraint. Any change to `src/data/` must respect these rules:

1. **Never invent a quotation, author, date, title or source.** If you cannot establish a source, label the item `attributed` or `disputed` and write an honest `attributionNote`.
2. **Do not upgrade an attribution status without evidence.** "Verified" means the wording is documented in the named work; a quote being famous is not evidence.
3. **Source URLs must resolve.** Add a link only when it points to a publisher, archive, library catalogue or public-domain edition that actually contains the work. A general search URL or an unverified guess is not acceptable.
4. **Translations matter.** Name the translator where known. Common English translations do not become the author's original words.
5. **In-copyright quotations may have no link.** That is expected. Keep the "no primary source listed" wording rather than supplying a dead or infringing link.
6. **Anonymous and traditional sayings** are attributed to `Proverb`, never to a convenient named person.
7. **Do not claim that the MIT licence covers quotation texts.** It covers the application code only.

If a change touches the attribution display, also update the corresponding tests in `src/__tests__/data.test.ts` or explain why the test should change.

## Code style

- TypeScript is strict, including `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Avoid non-null assertions unless the invariant is local and obvious.
- Prefer semantic theme tokens (`text-ink`, `text-muted`, `bg-surface`, `border-line`, `text-accent-strong`) over raw colours so both themes remain accessible.
- Use the existing primitives in `src/components/ui/` before adding new patterns. Dialogs must use `Modal` so focus trapping and scroll locking stay consistent.
- Icon-only controls need an accessible name. Do not put an `aria-label` on a link whose visible text would then fall outside the accessible name — this is a documented axe failure (`label-content-name-mismatch`).
- Keep the app local-first. A feature that requires a server, database or third-party account is out of scope.
- New dependencies need a clear reason: a security fix, a compatibility requirement or a capability that would otherwise mean a lot of hand-written code. Avoid casual major upgrades.

Format with Prettier (`npm run format`) before committing. The repository checks formatting in CI.

## Tests

- Add or update unit/component tests for behaviour, not implementation details.
- Import and migration changes must be tested against realistic older-format data, including malformed input.
- Browser-only verification (real Chromium flows, axe scans, offline behaviour) is done manually before a release; record what was actually run rather than claiming coverage.
- Never mark a test as passing without running it. If something cannot be executed in your environment, say so.

## SEO and static generation

Public pages are pre-rendered at build time by `scripts/generate-static.mjs` using the typed data modules. When adding a public route:

1. Register it in both `src/App.tsx` and `src/lib/seoContent.ts`.
2. Keep private, local-only views out of `buildPublicRoutes()` and add them to `PRIVATE_PATHS`.
3. Run `npm run build && npm run check:build` and confirm the sitemap count and metadata checks.

`/sitemap.xml`, `/robots.txt`, `/about.html` and every quote/author/theme page are real static files. Do not "fix" a missing static file by widening the SPA rewrite in `vercel.json`; add the file or correct the negative rewrite instead.

## Commits and pull requests

- Work on a feature branch; do not push directly to `main`.
- Use focused commits with an imperative summary, for example `Add citation links to quote detail`.
- Describe the user-visible change, the tests you ran and anything you could not verify.
- Link the relevant issue. Screenshots are welcome for visual changes; use the real app, not a mock-up.
- Pull requests must pass `npm run verify:production`. Vercel builds with the same command, so a red build blocks deployment.

## Licence of contributions

By submitting a contribution you agree that code contributions are licensed under the repository's [MIT licence](LICENSE). You confirm that you have the right to submit any text or media you add. Quotation texts remain the property of their authors and rights holders; do not submit material you cannot justify including.
