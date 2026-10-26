# tekkendocs for promo videos

Where to look when scouting. Check live pages and data before you rely on anything here.

## Pages and features

- **URLs** come from the file names in `app/routes/`: `/<char>` is a character's Tekken 8 frame data, with `/guide`, `/meta` (cheat sheet), `/antistrat` and `/flashcard` as sub-pages. Site-wide pages are under `/t8/…` (`guides`, `framequiz`, `dailychallenge`, `search`, `movecompare`, …).
- **The site's own feature pitch** is on the home page ("Main features") and in `app/routes/_mainLayout.features.tsx`. Use them for captions and claims.
- **Frame data views** are set with `?viewMode=`: `simple` (dense, colour-coded block frames; best on a phone), `default` (wide notes column, tall rows at phone width), and `videoCards`, which embeds other people's YouTube videos, so leave it out of promos.
- A **move page** is `/<char>/<command>`. The ▶ icon next to a command opens the move video in a popup over the list.

## Data

- `GET /api/t8/characters` lists every character (use it for counts like "all 42 characters").
- `GET /api/t8/<char>/framedata` gives every move: command, block, hit, startup, and the video file name.
- **Guides**:
  - The files are `data/guides/<char>/<char>-guide[-<lang>].csv`.
  - Each guide's season and author are in `characterGuideAuthors` in `app/services/staticDataService.ts`. Prefer the current season.
  - Languages are chosen with `?lang=<code>`; the codes and native names are in `app/features/guideLanguage/guideLanguage.ts`. Urdu (`ur`) is right-to-left.

## Brand

- **Colours**: the dark theme's `--primary` in `app/tailwind.css` (a gold yellow). The engine's `--y` matches it. The site is dark-only.
- **Fonts**: Barlow Condensed for display text (heavy italic caps), Inter for body text. `setup.sh` copies both.
- **Logos**: `app/images/logo/`. The header uses `tekkendocs-logo-large-v2.svg`.
- **Character art**: `public/t8/avatars/<id>-brand-512.png` (gold background, matches the brand) and `<id>-512.png` (plain).
- **Social card**: `public/images/tekkendocs-og-image-v3.jpg`. It sets the brand voice: "Every move / Every frame", "Frame data / Guides / Quizzes".
- **Claims** the site makes about itself: free, no ads, no tracking cookies.
