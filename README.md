# smish-site

Public website for the Smish mobile app: landing page, Terms of Use, and Privacy Policy.

Deliberately separate from the app repo, which is private. These pages must be
readable **without an account** — Apple and Google both require the privacy
policy to be reachable by a reviewer who is not signed in, so they cannot live
inside the app itself.

Plain static HTML, no build step. Served by GitHub Pages from `main`.

| Page | Purpose |
|---|---|
| `index.html` | Landing page; doubles as the Play Console **support URL** |
| `terms.html` | `EXPO_PUBLIC_TERMS_URL` |
| `privacy.html` | `EXPO_PUBLIC_PRIVACY_URL` |

Editing either legal page changes what the app links to — update the "Last
updated" date when the substance changes.
