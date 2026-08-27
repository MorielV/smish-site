# smish-site

Public website for the Smish mobile app: landing page (Hebrew + English),
Terms of Use, and Privacy Policy.

Deliberately separate from the app repo, which is private. These pages must be
readable **without an account** — Apple and Google both require the privacy
policy to be reachable by a reviewer who is not signed in, so they cannot live
inside the app itself.

Plain static HTML, no build step. Served by GitHub Pages from `main`.

| Path | Purpose |
|---|---|
| `index.html` | Hebrew landing page (RTL); doubles as the Play Console **support URL** |
| `en/index.html` | English landing page |
| `terms.html` | `EXPO_PUBLIC_TERMS_URL` |
| `privacy.html` | `EXPO_PUBLIC_PRIVACY_URL` |
| `404.html` | GitHub Pages error page |
| `assets/site.css` | Every page's styles; palette mirrors `packages/shared/src/theme/tokens.ts` |
| `assets/site.js` | The hero's firefly canvas and the scroll reveal — vanilla, no dependencies |
| `assets/fonts/` | Assistant (OFL), Hebrew + Latin subsets, self-hosted |
| `assets/mark.svg` | The firefly mark — favicon and masthead |
| `assets/og*.png` | Link-preview cards, 1200×630, one per language |
| `sitemap.xml`, `robots.txt`, `site.webmanifest` | Crawl + install metadata |

## Rules

- **Never move or rename `terms.html` / `privacy.html`.** Those exact URLs are
  baked into `apps/mobile/eas.json` for all three build profiles, and
  `app.config.ts` throws a production build if they are unset. A dead legal URL
  is what earns an Apple 3.1.2 rejection.
- Update the "Last updated" date on a legal page when the substance changes.
- The two languages are **separate pages**, not a JS toggle — real URLs, so
  each is crawlable and shareable, and there is no flash of the wrong language.
  `hreflang` links in both directions plus `x-default` → English.
- **No external requests.** No CDN, no analytics, nothing fetched at runtime.
  The typeface is Assistant, self-hosted from `assets/fonts/` in two subsets
  (`unicode-range` picks the right one), so the Hebrew and English pages share
  one family. `OFL.txt` ships beside it as the licence requires.
- **Nothing may depend on JavaScript to be readable.** `site.js` adds `.js` to
  the root element before anything else, and only then does CSS hide the
  `.reveal` blocks — if the script fails, every section stays visible. The
  firefly canvas and the reveal both stand down under `prefers-reduced-motion`.
- Keep claims honest. Store badges stay `aria-disabled` until the app is
  actually listed, and there is no `aggregateRating` in the structured data
  until there are real ratings to report.

## Regenerating the raster assets

`assets/*.png` are generated from the same geometry as `assets/mark.svg` by a
throwaway Pillow script (not committed — the repo stays build-free). If the
mark or the OG copy changes, re-render at 1200×630 for the cards and
180/192/512 for the icons, and keep the filenames stable so caches turn over
cleanly.
