import { BookOpenCheck, Lock, ScrollText, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { GitHubIcon } from '@/components/ui/GitHubIcon';
import { PageHeader } from '@/components/ui/PageHeader';
import { quotes } from '@/data/quotes';
import { APP_VERSION, REPO_URL } from '@/lib/constants';
import { attributionStyles } from '@/lib/tones';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { AttributionStatus } from '@/types';

const statuses: AttributionStatus[] = ['verified', 'attributed', 'disputed', 'anonymous'];

const examples: Record<AttributionStatus, string> = {
  verified:
    '“The mass of men lead lives of quiet desperation.” — Henry David Thoreau, Walden (1854)',
  attributed:
    '“It always seems impossible until it’s done.” — commonly attributed to Nelson Mandela, with no confirmed primary source',
  disputed:
    '“Insanity is doing the same thing over and over again and expecting different results.” — no Einstein source exists; the line traces to later recovery literature',
  anonymous: '“This too shall pass.” — a traditional saying with no identifiable author',
};

export default function About() {
  useDocumentTitle('About');

  const counts = quotes.reduce<Record<AttributionStatus, number>>(
    (accumulator, quote) => {
      accumulator[quote.attribution] += 1;
      return accumulator;
    },
    { verified: 0, attributed: 0, disputed: 0, anonymous: 0 },
  );

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="About"
        title="A small library with its sources attached"
        description="LIN4CRE QUOTES is a quote discovery app built around one rule: never present a quotation as more certain than it is."
        actions={
          <>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface-2 px-4 text-sm font-medium text-ink transition hover:border-line-strong"
            >
              <GitHubIcon className="size-4" />
              Repository
            </a>
            <Link
              to="/settings"
              className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm text-muted transition hover:text-ink"
            >
              Settings
            </Link>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="space-y-5">
          <section className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-ink">What this is</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              A curated collection of {quotes.length} quotes across fifteen themes, with author
              pages, search, favourites, notes, custom collections, share images and a daily quote.
              It is a single-page application that runs entirely in your browser: there is no
              account, no database and no analytics.
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              The app grew out of a small page (
              <code className="rounded bg-surface-2 px-1 py-0.5 text-[11px]">g.html</code>) that
              fetched anonymous advice from a public API. That functionality survives on the{' '}
              <Link to="/advice" className="link-quiet">
                Live advice
              </Link>{' '}
              page, with stricter validation, duplicate prevention, timestamps and offline handling.
              It is deliberately kept separate from attributed quotations.
            </p>
          </section>

          <section
            className="rounded-3xl border border-line bg-surface p-5 sm:p-6"
            aria-labelledby="policy"
          >
            <h2 id="policy" className="flex items-center gap-2 text-lg font-semibold text-ink">
              <ShieldCheck className="size-5 text-accent" aria-hidden />
              Attribution policy
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Every quote carries a status. The label is not decoration: it changes how the quote is
              described when you copy it or generate an image.
            </p>

            <div className="mt-4 space-y-3">
              {statuses.map((status) => {
                const style = attributionStyles[status];
                return (
                  <div key={status} className="rounded-2xl border border-line bg-surface-2/60 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-medium ${style.className}`}
                      >
                        <span className="size-1.5 rounded-full bg-current opacity-80" aria-hidden />
                        {style.label}
                      </span>
                      <Badge>{counts[status]} quotes</Badge>
                    </div>
                    <p className="mt-2 text-[12px] leading-relaxed text-muted">
                      {style.description}
                    </p>
                    <p className="mt-2 border-l-2 border-line-strong pl-3 font-serif text-[12.5px] leading-relaxed text-subtle italic">
                      {examples[status]}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-[12px] leading-relaxed text-muted">
              Disputed lines are not deleted. Removing them would hide the fact that they circulate;
              labelling them makes the record more honest. If a quote cannot be traced, it says so.
            </p>
          </section>

          <section
            className="rounded-3xl border border-line bg-surface p-5 sm:p-6"
            aria-labelledby="sources"
          >
            <h2 id="sources" className="flex items-center gap-2 text-lg font-semibold text-ink">
              <BookOpenCheck className="size-5 text-accent" aria-hidden />
              Sources and data
            </h2>
            <ul className="mt-3 space-y-3 text-[12.5px] leading-relaxed text-muted">
              <li>
                <span className="font-medium text-ink">Quote library.</span> Curated offline content
                shipped with the application, not fetched from a third-party quote API. Each record
                names a work, speech or interview where one has been established.
              </li>
              <li>
                <span className="font-medium text-ink">Live advice.</span> The free Advice Slip API
                at{' '}
                <a
                  href="https://api.adviceslip.com/advice"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-quiet break-all"
                >
                  api.adviceslip.com/advice
                </a>
                . Responses are validated, network-only, and saved only when you ask for them. No
                API key is used.
              </li>
              <li>
                <span className="font-medium text-ink">Images and sharing.</span> Share images are
                drawn locally on a canvas. Text is shared through the Web Share API or copied
                directly. Nothing is uploaded to a server.
              </li>
              <li>
                <span className="font-medium text-ink">No invented quotes.</span> Where the origin
                of a line is unclear, the note says so. Where a wording is a translation, the source
                names the translation where possible.
              </li>
            </ul>
          </section>

          <section
            className="rounded-3xl border border-line bg-surface p-5 sm:p-6"
            aria-labelledby="privacy"
          >
            <h2 id="privacy" className="flex items-center gap-2 text-lg font-semibold text-ink">
              <Lock className="size-5 text-accent" aria-hidden />
              Privacy and storage
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-[13px] font-semibold text-ink">What is stored</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  Favourites, notes, collections, reading history, saved advice and your display
                  preferences. These live in local storage under names beginning{' '}
                  <code className="rounded bg-surface-2 px-1 py-0.5 text-[10.5px]">
                    lin4cre.quotes.
                  </code>
                </p>
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-ink">What is not collected</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  No names, email addresses, account data, analytics identifiers or advertising
                  cookies. The app sets no tracking cookies.
                </p>
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-ink">Sync</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  There is no cross-device sync. Use the JSON export and import in Settings to move
                  a library between browsers.
                </p>
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-ink">Clearing data</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  Clearing site data in your browser removes the library. Settings offers a safe
                  export before deletion.
                </p>
              </div>
            </div>
          </section>

          <section
            className="rounded-3xl border border-line bg-surface p-5 sm:p-6"
            aria-labelledby="accessibility"
          >
            <h2 id="accessibility" className="text-lg font-semibold text-ink">
              Accessibility and engineering
            </h2>
            <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-muted">
              <li>Semantic landmarks, a skip link, visible focus states and labelled controls.</li>
              <li>Dialogs trap focus, close with Escape and restore focus to the trigger.</li>
              <li>
                Colour tokens are defined for both themes; the accent is designed for contrast.
              </li>
              <li>
                Animations respect the operating system’s reduced-motion setting and an in-app
                toggle.
              </li>
              <li>
                Offline-first shell with a service worker, and saved content available without a
                network.
              </li>
              <li>
                Strict TypeScript, automated unit and component tests, and a production build in CI.
              </li>
            </ul>
          </section>

          <section
            className="rounded-3xl border border-line bg-surface p-5 sm:p-6"
            aria-labelledby="limitations"
          >
            <h2 id="limitations" className="text-lg font-semibold text-ink">
              Known limitations
            </h2>
            <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-muted">
              <li>
                The library is finite and maintained by hand; it is not a complete quotation
                archive.
              </li>
              <li>
                Attribution research is careful but not infallible. Disputed entries include an
                explanation, and corrections are welcome through the repository.
              </li>
              <li>
                Some translations are common English renderings rather than the original wording.
              </li>
              <li>Advice Slip is an external free service and can be slow or unavailable.</li>
              <li>Native sharing and image download depend on browser support.</li>
              <li>Local storage is per-browser; clearing site data removes the library.</li>
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="label-caps flex items-center gap-2">
              <ScrollText className="size-3.5" aria-hidden />
              Licence
            </h2>
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              The application code is released under the MIT licence. Quotations remain the property
              of their authors and rights holders; they are used here for reference and inspiration.
              Translations may carry separate rights.
            </p>
            <a
              href={`${REPO_URL}/blob/main/LICENSE`}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-block text-[11.5px] text-accent underline underline-offset-4"
            >
              Read the licence
            </a>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="label-caps">Version</h2>
            <p className="mt-2 text-[12px] text-muted">{APP_VERSION}</p>
            <p className="mt-1 text-[11px] text-subtle">
              Built with React, TypeScript, Vite, Tailwind CSS, Lucide icons and a Workbox service
              worker. Fonts are self-hosted so the app works offline.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="label-caps">Corrections</h2>
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              Found a misattribution or a typo? Open an issue or pull request on the repository — it
              is the most useful kind of contribution.
            </p>
            <a
              href={`${REPO_URL}/issues`}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-flex items-center gap-1 text-[11.5px] text-accent transition hover:underline"
            >
              Open an issue
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
