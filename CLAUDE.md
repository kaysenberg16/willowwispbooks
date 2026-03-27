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

No test framework or linter is configured.

## Architecture

Multi-page static site with no framework. Vite is configured for multi-page build in `vite.config.ts` via `build.rollupOptions.input`.

### Pages

- **`index.html`** — Homepage: hero with trailer photo, photo collage, about section, "What You'll Find" (books + handmade goods), events preview, Instagram gallery, booking CTA, footer.
- **`events.html`** — Full events page with detailed cards (date, time, address, description), past events list, and booking CTA.
- **`reviews.html`** — Book reviews page with "Currently Reading", individual review cards, and "Kayla's Picks" grid. This page is a mockup with placeholder content.

### Scripts

- **`src/main.ts`** — Homepage JS: mobile menu toggle, scroll fade-in animations (IntersectionObserver), email signup form handler, Instagram gallery with Graph API fetch + static image fallback, lightbox modal.
- **`src/events.ts`** — Shared JS for secondary pages: mobile menu toggle, fade-in animations, email signup handler. No gallery/modal code.

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
- **Events are managed in HTML** — no external platform. Kayla updates event `<article>` blocks directly. Events intentionally have no RSVP/ticketing since her events are free and open.
- **Contact**: `mailto:kayla@willowwispbooks.com` on the "Get in Touch" button in the Book Me section.
