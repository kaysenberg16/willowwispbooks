# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Willow Wisp Books — a single-page marketing site for a roaming trailer/popup bookstore. Static site built with Vite, TypeScript, and Tailwind CSS v4.

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — Type-check with `tsc` then build for production via Vite
- `npm run preview` — Preview the production build locally

No test framework or linter is configured.

## Architecture

This is a single-page site with no framework or routing:

- **`index.html`** — The entire page structure lives here (header, hero, about, events, gallery, booking CTA, footer). All sections are defined with anchor IDs for in-page navigation.
- **`src/main.ts`** — All runtime JS: mobile menu toggle, scroll-triggered fade-in animations (IntersectionObserver), email signup form handler, and an Instagram gallery that fetches from the Graph API with a static image fallback. Also creates a lightbox modal dynamically.
- **`src/style.css`** — Tailwind v4 import (`@import "tailwindcss"`) plus custom `@theme` tokens and a few custom component styles (gallery tiles, fade-in animations, modal).
- **`public/images/`** — Static images served as-is (logo, gallery fallbacks, product photos).

## Key Details

- **Tailwind v4** with the Vite plugin (`@tailwindcss/vite`). Custom colors and fonts are defined via `@theme` in `style.css`, not a `tailwind.config` file.
- **Instagram integration**: `src/main.ts` reads `VITE_INSTAGRAM_TOKEN` env var at build time. When absent, the gallery falls back to static images from `public/images/gallery-*.jpg`.
- **No component library or templating** — HTML is hand-written in `index.html`; JS operates directly on DOM elements by ID.
- Fonts loaded from Google Fonts: Playfair Display (headings), Dancing Script (script accents), Lato (body).
