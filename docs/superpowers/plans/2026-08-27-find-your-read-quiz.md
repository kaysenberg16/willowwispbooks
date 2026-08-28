# Find Your Read Quiz (Phase 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox syntax.

**Goal:** Add a dedicated `/quiz.html` page with the "Find Your Next Read" quiz (Kayla's real matching flow → 8 archetype shelves), a Blind Date explainer, and a Gifts section — with matchmaking + gift forms delivering to Kayla via Formspree.

**Architecture:** Pure quiz logic (`src/quiz-logic.ts`, Vitest-tested) maps genre + modifier answers to one of 8 archetype shelves. `src/quiz.ts` runs the quiz UI on `quiz.html` and renders the result + a pre-filled matchmaking form. Forms are plain HTML POST to Formspree (same pattern as `submissions.html`).

**Tech Stack:** Vite 8 multi-page, TypeScript (strict, erasableSyntaxOnly, verbatimModuleSyntax), Tailwind v4, Vitest.

## Global Constraints
- Same as Phase 1: `--legacy-peer-deps`; `import type` for types; no enums; literal Tailwind classes only; theme tokens only; feature branch, no push to main until approved.
- **Formspree endpoint (existing, working):** `https://formspree.io/f/maqaykbr`. Reused for match + gift forms with distinct `_subject` values. Centralize as a constant; Kayla can later create dedicated forms and swap.
- Honeypot: every Formspree form includes `<input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" />`.

## Archetypes (final)
| key | name | shelf | genre label |
|-----|------|-------|-------------|
| mystery_cozy | The Slippered Sleuth | Mystery — Cozy | Cozy Mystery |
| mystery_thriller | The Dogged Detective | Mystery — Thriller | Thriller |
| romance_clean | The Rose-Tinted Romantic | Romance — Clean | Clean Romance |
| romance_spicy | The Bawdy Bookworm | Romance — Spicy/Dark | Spicy / Dark Romance |
| fantasy_adventure | The Swashbuckling Sidequester | Fantasy/Sci-Fi — Adventure | Adventure Fantasy |
| fantasy_existential | The Paradox Pursuer | Fantasy/Sci-Fi — Existential | Existential Sci-Fi |
| nonfiction_fun | The Rollicking Realist | Nonfiction — Fun | Fun Nonfiction |
| nonfiction_sad | The Earnest Empath | Nonfiction — Sad | Profound Nonfiction |

## classify() mapping
Inputs: `genre` (mystery|romance|fantasy|nonfiction), `ride` (coaster|smooth), `spice` (spicy|clean), `dark` (dark|light), `nope` (string[]).
- mystery: (dark || coaster) → thriller else cozy
- romance: (spicy || dark) → spicy else clean
- fantasy: (dark || coaster) → existential else adventure
- nonfiction: (dark || coaster) → sad else fun
- Override: if nope includes "Heavy or sad endings" → thriller→cozy, existential→adventure, sad→fun.

## Tasks
1. **quiz-logic.ts + tests** — `type QuizAnswers`, `ARCHETYPES` record, `classify(a): ArchetypeKey`. Tests cover all 8 branches + override.
2. **quiz.html + vite input** — shared header/footer/nav (with "Find Your Read" active), Blind Date explainer (`#blinddate`), quiz shell mount, Gifts section (`#gifting`) with static Formspree gift form. Add `quiz: resolve(__dirname, "quiz.html")` to `vite.config.ts`.
3. **quiz.ts** — menu/fade snippet + quiz engine (6 questions: genre, recent[text], nope[multi], ride, spice, dark) + result render (archetype, shelf, blurb, wrapped blind date, matchmaking Formspree form prefilled with recent/nope/shelf). `npm run build` + dev-server manual verify.
4. **Nav links** — add "Find Your Read" → `/quiz.html` to desktop + mobile nav on index/events/reviews/submissions.
5. **Docs** — CLAUDE.md: new page/files, Formspree reuse + how to swap dedicated forms.

## Done criteria
- `npm test` + `npm run build` pass.
- Quiz completes → correct archetype per classify; matchmaking + gift forms POST to Formspree.
- "Find Your Read" reachable from every page's nav.
- On a feature branch, unpushed until approved.
