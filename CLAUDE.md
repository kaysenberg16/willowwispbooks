# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Willow Wisp Books — a multi-page marketing site for a roaming trailer/popup bookstore and maker's market vendor based in Maple Valley, WA, serving Western Washington. Built with Vite, TypeScript, and Tailwind CSS v4.

The business sells curated books, handbound journals, miniature book charms, fairy libraries & lanterns (all handmade by the owner Kayla), plus artisan goods from fellow small crafters (candles, pottery, bookmarks, stickers, 3D printed figures). The signature product is "Blind Date with a Book" — hand-wrapped packages designed by Kayla.

## Hosting & Deployment

- **GitHub Pages** via GitHub Actions (`.github/workflows/deploy.yml`)
- Pushes to `main` trigger build + deploy automatically
- Live at: `https://kaysenberg16.github.io/willowwispbooks/`
- The workflow uses `--legacy-peer-deps` for `npm ci` due to a Vite 8 / `@tailwindcss/vite` peer dependency mismatch
- Domain `willowwispbooks.com` is currently managed through Wix; DNS migration to point at GitHub Pages is pending

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — Type-check with `tsc` then build for production via Vite
- `npm run preview` — Preview the production build locally
- `npm test` — Run the Vitest unit tests (currently the events date logic)

Vitest is configured (`vitest.config.ts`, node environment). No linter is configured.

## Architecture

Multi-page static site with no framework. Vite is configured for multi-page build in `vite.config.ts` via `build.rollupOptions.input`.

### Pages

- **`index.html`** — Homepage: hero with trailer photo, photo collage, about section, "What You'll Find" (books + handmade goods), events preview, Instagram gallery, booking CTA, footer.
- **`events.html`** — Full events page with detailed cards (date, time, address, description), past events list, and booking CTA.
- **`reviews.html`** — Book reviews page with "Currently Reading", individual review cards, and "Kayla's Picks" grid. This page is a mockup with placeholder content.
- **`quiz.html`** — "Find Your Next Read" page: a Blind Date explainer, the interactive book-match quiz (Kayla's real flow → one of 8 archetype shelves), a pre-filled matchmaking request form, and a Gifts section (gift-matching + gift-wrap). Forms POST to Formspree.

### Scripts

- **`src/main.ts`** — Homepage JS: mobile menu toggle, scroll fade-in animations (IntersectionObserver), email signup form handler, Instagram gallery with Graph API fetch + static image fallback, lightbox modal.
- **`src/events.ts`** — Events page JS: mobile menu toggle, fade-in animations, email signup handler, and date-aware rendering of upcoming/past events from `src/events-data.ts` via the pure helpers in `src/events-logic.ts`.
- **`src/events-logic.ts`** — Pure, unit-tested date logic (`splitEvents`, `nextOccurrence`, formatters). Tested by `src/events-logic.test.ts` (Vitest).
- **`src/events-data.ts`** — The editable list of events (name, place, dates, optional photos). Kayla's source of truth for what shows on the events page.
- **`src/quiz.ts`** — Quiz page JS: mobile menu, the quiz engine (6 questions), and result rendering with a pre-filled matchmaking form. Imports the pure logic from `src/quiz-logic.ts`.
- **`src/quiz-logic.ts`** — Pure, unit-tested quiz logic: the 8 archetypes (`ARCHETYPES`) and `classify()` that maps answers → shelf (hard-no's "heavy/sad" and "too much spice" can steer the shelf). Archetype names/blurbs are edited here. Tested by `src/quiz-logic.test.ts`.
- **`src/books-logic.ts`** — Tag-based book matching: turns answers into wanted tags + dealbreaker tags and returns the single closest book (`bestMatch`). Tag vocabulary documented in `src/books-data.ts`. Tested by `src/books-logic.test.ts`.
- **`src/books-data.ts`** — The tagged book catalog the quiz recommends from. **Currently seeded with EXAMPLE books — Kayla replaces these with her curated favorites.** Each book: title, author, `shelf`, `tags`, optional `cover`/`blurb`.

### Styles

- **`src/style.css`** — Tailwind v4 import (`@import "tailwindcss"`) plus custom `@theme` tokens (colors, fonts) and custom component styles (gallery tiles, fade-in animations, modal, cozy dividers, hero gradient).

### Assets

- **`public/images/`** — All static images. Mix of product photos (journals, charms, fairy libraries, blind dates), setup/location photos at various venues, and branding (logo, banner). Filenames are a mix of descriptive names and camera IMGs.

## Key Details

- **Tailwind v4** with the Vite plugin (`@tailwindcss/vite`). Custom colors and fonts are defined via `@theme` in `style.css`, not a `tailwind.config` file.
- **Color palette**: navy, teal, cream, cream-dark, warm-white, blush, sage, charcoal, amber. Sections alternate backgrounds for visual rhythm.
- **Fonts**: Playfair Display (all headings via `font-display`), Dancing Script (hero accent only via `font-script`), Lato (body via `font-body`). Loaded from Google Fonts.
- **Instagram integration**: `src/main.ts` reads `VITE_INSTAGRAM_TOKEN` env var at build time. When absent (current state), the gallery falls back to static images defined in the `staticPosts` array.
- **No component library or templating** — HTML is hand-written; JS operates directly on DOM elements by ID.
- **Navigation**: Homepage uses anchor links for on-page sections (`#home`, `#find`, `#book`, `#about`) and regular links for separate pages (`/events.html`, `/reviews.html`). Secondary pages link back to homepage sections via `/#find`, `/#book`, etc.
- **Events are data-driven** — edit `src/events-data.ts`. Each event has a `dates` array of ISO `"YYYY-MM-DD"` strings; `src/events.ts` renders them and `src/events-logic.ts` auto-splits future dates into "Upcoming" and past dates into "Past Events" against today's date (no manual moving). For a past date with photos/credit, use the object form `{ date, photos, credit }`. Events intentionally have no RSVP/ticketing since her events are free and open.
- **Contact**: `mailto:kayla@willowwispbooks.com` on the "Get in Touch" button in the Book Me section.
- **Forms (Formspree)**: `submissions.html` (indie author), plus the quiz **matchmaking** form (`src/quiz.ts`) and the **gift** form (`quiz.html`) all POST to Formspree form `maqaykbr`, distinguished by a hidden `request_type` field (`matchmaking` / `gift`) and `_subject`. All include a `_gotcha` honeypot. To give matchmaking/gift their own inboxes, create dedicated Formspree forms and replace the endpoint in two places: `FORMSPREE_ENDPOINT` in `src/quiz.ts` (matchmaking) and the gift `<form action>` in `quiz.html`.
- **Comment moderation / discussion**: not yet built (Phase 3 — Cusdis).
