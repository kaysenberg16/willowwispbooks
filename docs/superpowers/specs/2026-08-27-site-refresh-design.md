# Willow Wisp Books — Site Refresh Design

**Date:** 2026-08-27
**Status:** Approved in concept (validated via clickable mockup); pending final spec review
**Mockup:** https://claude.ai/code/artifact/a94b6269-1a4c-4f4c-ba6c-1515e27ca72a

## Goal

Turn the marketing site into something that (a) never shows stale event dates, and (b) captures the
people who take Kayla's card at events by recreating her in-person superpower online: helping the
right reader find the right book. Everything stays on the current stack — Vite + TypeScript +
Tailwind v4, static, deployed to GitHub Pages — with two small free third-party services for the
parts a static site can't do alone (form delivery and comments).

## Scope

Five pieces, buildable in phases:

1. **Date-aware events** — past dates drop out of "Upcoming" automatically.
2. **Blind Date explainer** — answer the question Kayla gets constantly.
3. **"Find Your Next Read" quiz + matchmaking form** — the star feature.
4. **Gifts section** — gift-matching for a reader in someone's life, plus gift-wrap offer.
5. **Bookshelf + on-site discussion** — a living shelf of what she's reading/selling, open for readers
   to comment (also home of the Unhinged Book Club).

Out of scope (explicitly not building): user logins, a custom backend/database, a real-time forum,
e-commerce/checkout, RSVP/ticketing (events remain free and open).

---

## Feature 1 — Date-aware events

### Problem
Events live as hand-written HTML `<article>` blocks in `events.html`. Individual market *dates* are
"chips" (e.g. `Aug 1`, `Sep 5`). When a date passes, Kayla must manually delete it or move the whole
event to Past Events — which is why, as of Aug 27 2026, the page still lists July/August dates as
"upcoming."

### Approach: data-driven events
Move events into a single typed data list (a `events` array in a new `src/events-data.ts`, imported
by `src/events.ts`). Each event is:

```ts
type WWEvent = {
  name: string;
  place: string;
  address?: string;
  time?: string;
  image?: string;      // path under /images
  dates: string[];     // ISO "YYYY-MM-DD", one per occurrence
  photos?: string[];   // optional past-event photos
  photoCredit?: { text: string; url: string };
};
```

On page load, `src/events.ts`:
- Parses each date, compares to **today** (real `new Date()` in production).
- Renders an **Upcoming** card for any event with ≥1 future date, showing only future dates, earliest
  first; the soonest date within 21 days gets a "next" highlight.
- Renders a **Past Events** entry (date + name + place, plus any photos) for every past date, newest
  first.
- If every date for an event is in the past, the whole event appears only under Past.
- Injects a **"Catch us next at…"** banner showing the single soonest upcoming date across all events.

### Editing model (for Kayla)
To add/edit events she edits the `events` list — add a date string to `dates`, done. No HTML copying,
no manual moving. This is *simpler* than today, not harder. Document this in `CLAUDE.md`.

### Notes
- Keep the existing visual design of the events page (cards, cozy dividers, Past Events list).
- "Today" uses the visitor's local date; no timezone service needed (day-granularity is fine).

---

## Feature 2 — Blind Date explainer

A new section (anchor `#blinddate`, nav link "Blind Dates") that explains the signature product,
because customers constantly ask. Kayla's framing (use her words):

> A Blind Date with a Book is wrapped so you can't see the cover or title — just a few hints about the
> vibe. **It gets you out of a reading rut and introduces you to your next favorite author.**

Includes a simple 1‑2‑3: **pick by vibe → unwrap at home → meet your new favorite author**, a photo of
wrapped Blind Dates, and a CTA into the quiz. Lives on the homepage and/or its own section; final
placement decided at build (recommend: homepage section + link from events/quiz).

---

## Feature 3 — "Find Your Next Read" quiz + matchmaking

### The quiz (mirrors Kayla's real in-person flow, in order)
1. **Genre** — Mystery / Romance / Fantasy & Sci-Fi / Nonfiction
2. **What have you read & loved lately?** (free text, optional) — echoed in the result and pre-filled
   into the matchmaking form
3. **Hard no's** (multi-select) — Cliffhangers / Too much spice / Heavy or sad endings / Slow burns /
   Gore & violence / Nothing—I'll try anything
4. **Emotional rollercoaster vs. smooth sailing**
5. **Spice — yes / no**
6. **Dark — yes / no**

Runs entirely client-side (no backend). New `src/quiz.ts`, mounted on a **dedicated `quiz.html`**
(decided) so the nav and event cards can deep-link card-takers straight to `willowwispbooks.com/quiz`.

### Result mapping → 8 shelves (Kayla's taxonomy)
| Genre | Light / smooth branch | Dark or rollercoaster branch |
|-------|----------------------|------------------------------|
| Mystery | Cozy | Thriller |
| Romance | Clean | Spicy / Dark *(spice OR dark)* |
| Fantasy/Sci-Fi | Adventure | Existential |
| Nonfiction | Fun | Sad |

Override rule: selecting **"Heavy or sad endings"** as a hard-no bumps Thriller→Cozy,
Existential→Adventure, Sad→Fun.

Each shelf has an **archetype name** (Kayla hand-picks — see `Archetypes` table below) and a set of
**recommended titles** (Kayla provides). Result screen shows: archetype name, the shelf, a short
blurb, a "your blind date" card labeled with the genre, and a CTA to the matchmaking form.

### Matchmaking form
Below the result: "Let Kayla match you." Fields: name, email, a book you loved lately (pre-filled from
quiz), reading vibe & hard-no's (pre-filled). Submits via **Formspree** (free tier) to
**kayla@willowwispbooks.com**. Includes the existing honeypot-style spam guard used on the
submissions form.

### Archetypes (FINAL — provided by Kayla 2026-08-27)
| Shelf | Archetype name | Recommended books |
|-------|----------------|-------------------|
| Mystery — Cozy | The Slippered Sleuth | _Kayla to provide_ |
| Mystery — Thriller | The Dogged Detective | _Kayla to provide_ |
| Romance — Clean | The Rose-Tinted Romantic | _Kayla to provide_ |
| Romance — Spicy/Dark | The Bawdy Bookworm | _Kayla to provide_ |
| Fantasy — Adventure | The Swashbuckling Sidequester | _Kayla to provide_ |
| Fantasy — Existential | The Paradox Pursuer | _Kayla to provide_ |
| Nonfiction — Fun | The Rollicking Realist | _Kayla to provide_ |
| Nonfiction — Sad | The Earnest Empath | _Kayla to provide_ |

The archetype names + book lists are content, not code — stored in a simple data list Kayla can edit.
Names are final; book recommendations per shelf can be added anytime (quiz works without them).

---

## Feature 4 — Gifts

A section (anchor `#gifting`, nav link "Gifts") pitching two services:
- **Gift matchmaking** — "Got a voracious reader in your life? Tell me a few of their favorites and I'll
  find something slightly off the beaten path they've probably never read." Captures the gift-buyer who
  may not read themselves.
- **Gift-wrapping** — "Like my wrap? I'll wrap yours." Hand-wrapped, gift-ready.

Includes a small gift form: name, email, their favorite books/authors, occasion (optional), and a
"gift-wrap it" checkbox. Submits via **Formspree** to **kayla@willowwispbooks.com** (can reuse one
Formspree form with a hidden "type: gift/match" field, or a second form — decide at build).

---

## Feature 5 — Bookshelf + on-site discussion

### Bookshelf
Rebuild the existing placeholder `reviews.html` into a living **Bookshelf**: what Kayla is currently
reading, what's on the trailer now, and her picks. Each book: cover/photo, status badge, Kayla's take.
Content stored in an editable data list. (Retire the "reviews" placeholder content.)

### Discussion widget (Option 1 — low friction, chosen)
Embed **Cusdis** (lightweight, privacy-friendly, no ads):
- Readers comment with just a **name** (no account/login).
- Each comment is **held for approval**; Kayla gets an email and approves before it appears.
- Placed under book entries and as the home of the **Unhinged Book Club** (current pick + discussion).

Setup tasks: create a free Cusdis account/app, add the embed snippet + per-page thread IDs, verify the
moderation email goes to Kayla. Document the "approve a comment" flow for Kayla in `CLAUDE.md`.

### Unhinged Book Club
A section (anchor `#club`) featuring the current pick (cover, Kayla's blurb, meeting date/place) with
the Cusdis discussion beneath it. Monthly pick is editable content.

---

## Cross-cutting

- **Navigation:** add links for Blind Dates, Find Your Read, Gifts, Bookshelf, Book Club across
  header + mobile menu on every page. Keep the existing logo-banner and nav styling.
- **Interactive polish:** extend the existing IntersectionObserver fade-ins to new sections; the
  self-updating "next event" banner; quiz interactivity. Respect `prefers-reduced-motion`.
- **Design system:** reuse existing `@theme` tokens and fonts in `src/style.css`. No new colors/fonts.
- **Vite multi-page:** register any new HTML entry points (`quiz.html`, etc.) in
  `vite.config.ts` `build.rollupOptions.input`.
- **Accessibility:** keyboard-operable quiz and forms, visible focus states, labeled inputs, alt text.

## Third-party services (both free tiers, Kayla confirms setup)
| Service | Purpose | Kayla's part |
|---------|---------|--------------|
| Formspree | Deliver matchmaking + gift + (optionally) email-signup form submissions | Confirm the form email / verify address |
| Cusdis | On-site book discussion with approve-before-publish moderation | Create free account, receive approval emails |

## Suggested build phases
1. **Phase 1 — Events (quick win).** Data-driven date-aware events. No third-party, ships value fast.
2. **Phase 2 — Quiz + Blind Date explainer + Gifts + Formspree.** The matchmaking star + gifting.
3. **Phase 3 — Bookshelf + Cusdis discussion + Book Club.** Community layer.

Each phase is independently shippable and gets its own implementation plan.

## Success criteria
- Events page never shows a past date as "upcoming" without any manual edits.
- A visitor can complete the quiz, land on a sensible shelf, and send Kayla a matchmaking request that
  arrives in her inbox.
- A gift-buyer can request a gift match + wrap.
- A reader can post a comment with just a name; it appears only after Kayla approves it.
- Nothing regresses on the existing homepage/events visual design; site still builds and deploys via
  the existing GitHub Actions workflow.
