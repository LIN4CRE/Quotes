#!/usr/bin/env node
/**
 * Verifies the production artefacts that unit tests cannot see: the generated
 * manifest, the service worker, PNG dimensions and SPA metadata in index.html.
 *
 * Run after `npm run build` (and in CI after the build step).
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const failures = [];
const checks = [];

function check(name, condition, detail = '') {
  checks.push({ name, ok: Boolean(condition), detail });
  if (!condition) failures.push(detail ? `${name}: ${detail}` : name);
}

function pngSize(file) {
  const buffer = readFileSync(file);
  const signature = buffer.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

check('dist directory exists', existsSync(dist), dist);
if (!existsSync(dist)) {
  console.error(failures.join('\n'));
  process.exit(1);
}

const indexPath = join(dist, 'index.html');
check('index.html exists', existsSync(indexPath));
const indexHtml = readFileSync(indexPath, 'utf8');

check('index.html references the manifest', indexHtml.includes('rel="manifest"'));
check('index.html has a production bundle', /src="\/assets\/[^"]+\.js"/.test(indexHtml));
check('index.html contains no source entry point', !indexHtml.includes('/src/main.tsx'));
check('index.html declares the Open Graph card', indexHtml.includes('/og-image.png'));
check('index.html declares an icon', /rel="icon"/.test(indexHtml));
check('index.html declares a theme colour', /name="theme-color"/.test(indexHtml));

const ogPath = join(dist, 'og-image.png');
if (existsSync(ogPath)) {
  const size = pngSize(ogPath);
  check(
    'Open Graph image is 1280x640',
    size?.width === 1280 && size?.height === 640,
    JSON.stringify(size),
  );
  check(
    'Open Graph image is under 1 MB',
    statSync(ogPath).size < 1_000_000,
    String(statSync(ogPath).size),
  );
}
const socialPreviewPath = join(root, 'docs', 'branding', 'social-preview.png');
check('GitHub social preview exists', existsSync(socialPreviewPath));
if (existsSync(socialPreviewPath)) {
  const size = pngSize(socialPreviewPath);
  check(
    'GitHub social preview is 1280x640 and under 1 MB',
    size?.width === 1280 && size?.height === 640 && statSync(socialPreviewPath).size < 1_000_000,
    JSON.stringify({ ...size, bytes: statSync(socialPreviewPath).size }),
  );
}
check(
  'social preview has an editable generator',
  existsSync(join(root, 'scripts', 'generate-social-preview.py')),
);

const manifestPath = join(dist, 'manifest.webmanifest');
check('manifest.webmanifest exists', existsSync(manifestPath));

if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  check('manifest name', manifest.name === 'LIN4CRE QUOTES', manifest.name);
  check('manifest short_name', manifest.short_name === 'Quotes', manifest.short_name);
  check('manifest start_url', manifest.start_url === '/', manifest.start_url);
  check('manifest scope', manifest.scope === '/', manifest.scope);
  check('manifest display', manifest.display === 'standalone', manifest.display);
  check('manifest theme colour', manifest.theme_color === '#08090b', manifest.theme_color);
  check('manifest background colour', manifest.background_color === '#08090b');
  check('manifest language', manifest.lang === 'en-GB', manifest.lang);
  check(
    'manifest has 192px icon',
    manifest.icons?.some((icon) => icon.sizes === '192x192'),
  );
  check(
    'manifest has 512px icon',
    manifest.icons?.some((icon) => icon.sizes === '512x512'),
  );
  check(
    'manifest has a maskable icon',
    manifest.icons?.some((icon) => icon.purpose === 'maskable'),
  );
  check('manifest has app shortcuts', (manifest.shortcuts?.length ?? 0) >= 2);
}

const requiredImages = [
  ['favicon-32.png', 32, 32],
  ['apple-touch-icon.png', 180, 180],
  ['og-image.png', 1280, 640],
  ['icons/icon-192.png', 192, 192],
  ['icons/icon-512.png', 512, 512],
  ['icons/icon-maskable-512.png', 512, 512],
];

for (const [file, width, height] of requiredImages) {
  const path = join(dist, file);
  if (!existsSync(path)) {
    check(`${file} exists`, false);
    continue;
  }
  const size = pngSize(path);
  check(
    `${file} is ${width}×${height}`,
    size?.width === width && size?.height === height,
    size ? `${size.width}×${size.height}` : 'not a PNG',
  );
}

check('favicon.ico exists', existsSync(join(dist, 'favicon.ico')));
check('favicon.svg exists', existsSync(join(dist, 'favicon.svg')));
check('robots.txt exists', existsSync(join(dist, 'robots.txt')));

const swPath = join(dist, 'sw.js');
check('service worker exists', existsSync(swPath));
if (existsSync(swPath)) {
  const sw = readFileSync(swPath, 'utf8');
  check('service worker is non-trivial', sw.length > 1000, `${sw.length} bytes`);
  check('service worker precaches assets', /precacheAndRoute|__WB_MANIFEST/.test(sw));
  check('service worker handles navigation fallback', sw.includes('index.html'));
}

const assets = join(dist, 'assets');
const assetFiles = existsSync(assets)
  ? (readFileSync(join(dist, 'index.html'), 'utf8').match(/\/assets\/[^"]+/g) ?? [])
  : [];
check('hashed assets are referenced', assetFiles.length > 0);
for (const asset of assetFiles) {
  if (asset.endsWith('.js') || asset.endsWith('.css')) {
    check(`asset ${asset} exists`, existsSync(join(dist, asset.slice(1))));
  }
}

// Vercel configuration sanity: SPA fallback plus a real CSP.
const vercelPath = join(root, 'vercel.json');
check('vercel.json exists', existsSync(vercelPath));
if (existsSync(vercelPath)) {
  const vercel = JSON.parse(readFileSync(vercelPath, 'utf8'));
  check('vercel output directory is dist', vercel.outputDirectory === 'dist');
  check('vercel framework is vite', vercel.framework === 'vite');
  check(
    'vercel has SPA rewrite',
    vercel.rewrites?.some((rewrite) => rewrite.destination === '/index.html'),
  );
  const headers = (vercel.headers ?? []).flatMap((entry) => entry.headers ?? []);
  check(
    'vercel sets a Content-Security-Policy',
    headers.some((header) => header.key === 'Content-Security-Policy'),
  );
  check(
    'CSP allows the Advice Slip API',
    headers.some(
      (header) =>
        header.key === 'Content-Security-Policy' &&
        header.value.includes('https://api.adviceslip.com'),
    ),
  );
  check(
    'CSP forbids framing by other sites',
    headers.some(
      (header) =>
        header.key === 'Content-Security-Policy' && header.value.includes("frame-ancestors 'self'"),
    ),
  );
}

// ——— SEO and static-generation artefacts ————————————————————————————————
const SITE_URL = 'https://lin4cre-quotes.vercel.app';
const sitemapPath = join(dist, 'sitemap.xml');
const robotsPath = join(dist, 'robots.txt');
const aboutPath = join(dist, 'about.html');
const quotePath = join(dist, 'quote', 'aurelius-be-one.html');

check('sitemap.xml exists', existsSync(sitemapPath));
check('robots.txt exists', existsSync(robotsPath));
check('about.html is pre-rendered', existsSync(aboutPath));
check('a quote page is pre-rendered', existsSync(quotePath));

if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  check('sitemap is XML, not the SPA shell', sitemap.trimStart().startsWith('<?xml'));
  check(
    'sitemap declares the URL set namespace',
    sitemap.includes('http://www.sitemaps.org/schemas/sitemap/0.9'),
  );
  check('sitemap is not HTML', !/<!doctype html>/i.test(sitemap));
  check(
    'sitemap contains at least 490 public URLs',
    locations.length >= 490,
    String(locations.length),
  );
  check(
    'sitemap URLs all use the production origin',
    locations.every((location) => location.startsWith(`${SITE_URL}/`)),
  );
  check(
    'sitemap excludes private views',
    !locations.some((location) =>
      /\/(favourites|collections|history|reflections|settings|random|search)(\/|$)/.test(location),
    ),
  );
  check(
    'sitemap covers the home, about, explore, advice, theme, author and quote routes',
    locations.includes(`${SITE_URL}/`) &&
      locations.includes(`${SITE_URL}/about`) &&
      locations.includes(`${SITE_URL}/explore`) &&
      locations.includes(`${SITE_URL}/advice`) &&
      locations.some((location) => location.includes('/category/')) &&
      locations.some((location) => location.includes('/author/')) &&
      locations.some((location) => location.includes('/quote/')),
  );
  check('sitemap has no duplicate URLs', new Set(locations).size === locations.length);
}

if (existsSync(robotsPath)) {
  const robots = readFileSync(robotsPath, 'utf8');
  check('robots.txt points at the sitemap', robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
  check('robots.txt disallows private views', (robots.match(/^Disallow:/gm) ?? []).length >= 7);
}

function checkStaticPage(file, label) {
  const html = readFileSync(file, 'utf8');
  check(`${label} has a page-specific title`, /<title>[^<]*LIN4CRE QUOTES<\/title>/.test(html));
  check(`${label} has a canonical URL`, html.includes('rel="canonical"'));
  check(`${label} has Open Graph metadata`, html.includes('property="og:title"'));
  check(`${label} is indexable`, html.includes('content="index,follow'));
  check(
    `${label} has real static content`,
    html.includes('prerender-shell') && html.includes('<h1'),
  );
  check(`${label} contains no empty React root`, !/<div id="root"><\/div>/.test(html));
}

if (existsSync(aboutPath)) checkStaticPage(aboutPath, 'about.html');
if (existsSync(indexPath)) {
  const homeHtml = readFileSync(indexPath, 'utf8');
  check(
    'home page includes WebSite JSON-LD',
    homeHtml.includes('application/ld+json') && homeHtml.includes('"@type":"WebSite"'),
  );
  check(
    'home page has one JSON-LD block',
    (homeHtml.match(/application\/ld\+json/g) ?? []).length === 1,
  );
}
if (existsSync(quotePath)) {
  checkStaticPage(quotePath, 'quote/aurelius-be-one.html');
  const quoteHtml = readFileSync(quotePath, 'utf8');
  check(
    'quote page exposes Quotation structured data',
    quoteHtml.includes('itemtype="https://schema.org/Quotation"'),
  );
  check('quote page includes the quotation text', quoteHtml.includes('<blockquote'));
  check('quote page states its attribution status', quoteHtml.includes('Attribution status:'));
  check(
    'quote page links back to the interactive route',
    quoteHtml.includes('href="/quote/aurelius-be-one"'),
  );
}

const vercelConfig = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
check(
  'Vercel build runs the full verification gate',
  vercelConfig.buildCommand === 'npm run verify:production',
  vercelConfig.buildCommand,
);
check('verify:production script exists', Boolean(packageJson.scripts?.['verify:production']));
check('Vercel enables clean URLs', vercelConfig.cleanUrls === true);
check(
  'SPA rewrite excludes static resource paths',
  vercelConfig.rewrites?.[0]?.source === '/((?!assets/|icons/|.*\\.[a-zA-Z0-9]+$).*)',
  vercelConfig.rewrites?.[0]?.source,
);

const builtBytes = statSync(swPath).size;
console.log(`Checked ${checks.length} production-artefact conditions.`);
console.log(`Service worker: ${builtBytes} bytes.`);
for (const entry of checks) {
  if (!entry.ok) console.error(`FAIL  ${entry.name}${entry.detail ? ` (${entry.detail})` : ''}`);
}

if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed.`);
  process.exit(1);
}

console.log('All production-artefact checks passed.');
