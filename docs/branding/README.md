# Branding package

All artwork in this directory is original to the project and generated from source files in the repository. Screenshots are captures of the real application.

## Files

| File                           | Purpose                                     | Specification                              |
| ------------------------------ | ------------------------------------------- | ------------------------------------------ |
| `social-preview.png`           | GitHub repository social preview            | **1280 × 640**, PNG, 73 KB (limit is 1 MB) |
| `../../public/og-image.png`    | Open Graph/Twitter card served with the app | **1280 × 640**, PNG, 73 KB                 |
| `../../public/favicon.svg`     | Editable vector favicon                     | SVG, warm gold mark on charcoal            |
| `../../public/icons/*.png`     | PWA icons (192, 512, maskable)              | Pillow-generated                           |
| `../../docs/screenshots/*.png` | Real application screenshots                | 1440 × 1000 desktop, 390 × 844 mobile      |

## Editable sources

- `../../scripts/generate-social-preview.py` — social preview and Open Graph artwork. Colours, wording, type sizes and layout are constants at the top of the file.
- `../../scripts/generate-icons.py` — favicons, Apple touch icon and PWA icons.
- `../../public/favicon.svg` and `../../public/icons/icon-maskable.svg` — vector sources for the mark.

Regenerate after changing the copy, palette or mark:

```bash
python3 -m pip install --user Pillow
python3 scripts/generate-social-preview.py
npm run icons
```

The generated PNGs are committed, so a normal application build never needs Python.

## Palette

| Token      | Hex       | Usage                                     |
| ---------- | --------- | ----------------------------------------- |
| Ink        | `#08090b` | Dark background, wordmark                 |
| Surface    | `#0f1115` | Cards and panels                          |
| Gold       | `#e7b66b` | Accent, links, mark                       |
| Light gold | `#f8e2b6` | Display headline highlight                |
| Deep gold  | `#a96a16` | Borders, small accents                    |
| Paper      | `#f6f0e6` | Warm light-theme surface and display text |

Typography in the generated artwork uses DejaVu Serif/Sans, the closest metrics available in a clean build environment. The application itself uses Fraunces and Inter, self-hosted via Fontsource.

## Uploading the GitHub social preview

1. Open the repository on GitHub.
2. Go to **Settings → General → Social preview**.
3. Choose **Edit → Upload an image**.
4. Select `docs/branding/social-preview.png` (1280 × 640, 73 KB).
5. Save. GitHub may cache the old image; allow a few minutes and hard-refresh.

Do not upload a screenshot of a mock-up, a contact sheet or an image containing another project's branding. The supplied file is the real project identity and is under the 1 MB limit.

## Open Graph and Twitter

`public/og-image.png` is referenced with absolute URLs and `og:image:width`/`height` in `index.html` and the static route generator. If you replace it, keep the 1280 × 640 dimensions and update the check in `scripts/check-build.mjs` only if the specification intentionally changes.

## Screenshot rules

- Capture the real application, never a design mock-up.
- Use a clean profile with representative seeded data that contains no personal information.
- Keep the browser chrome out of the image.
- Check both themes for contrast before publishing.
- The files in `docs/screenshots/` were captured from the production build with headless Chromium; the README states the viewports used.
