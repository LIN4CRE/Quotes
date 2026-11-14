# Security policy

## Supported versions

The deployed application at [lin4cre-quotes.vercel.app](https://lin4cre-quotes.vercel.app) is the supported version. Fixes are applied to `main` and deployed from there. There are no long-lived release branches for older versions.

## Reporting a vulnerability

Please report security issues privately using GitHub's [private vulnerability reporting](https://github.com/LIN4CRE/Quotes/security/advisories/new). Do not open a public issue, and do not include personal data, exported libraries or credentials in a report.

A useful report includes:

- the affected URL or component;
- clear reproduction steps;
- the browser and version;
- the impact you believe it has;
- any suggested mitigation.

You can expect an acknowledgement within a reasonable best-effort timeframe. This is a personal open-source project, not a staffed security operation, so no formal SLA is offered. Please allow time for a fix and deployment before public disclosure.

## Scope

**In scope**

- Cross-site scripting or HTML injection through quote data, search terms, notes, reflections, collection names or an imported backup.
- Content-Security-Policy bypasses or header regressions in `vercel.json`.
- Service-worker or cache poisoning that could persist malicious content.
- Leakage of locally stored favourites, notes, reflections or history to a third party.
- Dependency vulnerabilities that are exploitable in the shipped build.
- Open redirects or unsafe handling of external source URLs.

**Out of scope**

- Denial of service against the static host.
- Missing email authentication, DMARC or unrelated DNS configuration.
- Reports that require physical access to an unlocked device.
- Social engineering of maintainers.
- Automated scanner output without a demonstrated impact.
- The accuracy of a quotation's attribution — use the attribution correction form instead.

## Security model

- **Static only.** There is no backend, database, authentication, payment flow or server-side secret. The PayPal link is an ordinary external anchor; no payment SDK or key is present.
- **Local-first data.** Favourites, notes, collections, reflections, history and settings live in this browser's `localStorage`. They are not uploaded and do not sync between devices. Anyone with access to the browser profile or its developer tools can read them; the app does not claim otherwise.
- **Imported files are untrusted.** Backups are size-limited, parsed as JSON, schema-checked, field-limited and normalised. Unknown quote ids and malformed records are dropped. Imports merge into local data only after a preview.
- **Strict CSP.** Only self-hosted scripts and styles are allowed (`style-src` permits inline styles for React's style attributes), images are limited to self/data/blob, connections to self and the free Advice Slip API, and framing by other origins is blocked. See `vercel.json`.
- **No tracking.** No analytics, advertising, fingerprinting, third-party fonts or tracking parameters on outbound links.
- **Advice is external and separate.** Advice Slip is fetched only on request with a timeout and payload validation. It is never presented as an attributed quotation.

## Handling a vulnerability

If a fix is needed, it will be made on a branch, verified with `npm run verify:production` and the browser checks, deployed through the normal Vercel production flow, and noted in `CHANGELOG.md` without disclosing exploit details before users have had a reasonable chance to update.
