# Date-Aware Events Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the events page date-aware so past dates automatically drop out of "Upcoming" and appear under "Past Events," driven by an editable data list instead of hand-written HTML.

**Architecture:** Extract event data into `src/events-data.ts` and pure date logic into `src/events-logic.ts` (unit-tested with Vitest). `src/events.ts` imports both, computes upcoming/past against today's date, and renders into empty mount points in `events.html`. No backend; all filtering happens client-side at page load.

**Tech Stack:** Vite 8 (multi-page), TypeScript (strict), Tailwind CSS v4 (`@theme` tokens), Vitest (new, for the pure logic).

## Global Constraints

- **Peer deps:** all `npm install` / `npm ci` use `--legacy-peer-deps` (Vite 8 / `@tailwindcss/vite` peer mismatch).
- **TS config:** `strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` (use `import type` / inline `type` for type-only imports), `erasableSyntaxOnly` (NO enums, NO parameter properties — plain types only), `allowImportingTsExtensions` (import local modules WITH the `.ts` extension), `noFallthroughCasesInSwitch`.
- **Tailwind v4:** classes are auto-scanned from source incl. `.ts` files. Only use **static, literal** class strings — never interpolate class names (e.g. `grid-cols-${n}`), or Tailwind won't generate them. Colors/fonts come from `@theme` in `src/style.css` (navy, teal, cream, cream-dark, warm-white, blush, sage, charcoal, amber, amber-light; `font-display`, `font-script`, `font-body`). Add no new colors/fonts.
- **Visual design:** keep the existing events page look (cards, cozy dividers, Past Events list). Reuse the exact utility classes already in `events.html`.
- **Deploy:** pushing to `main` auto-deploys via GitHub Actions. Do all work on a feature branch; do NOT push to `main` — merging is a separate, user-approved step.
- **Image paths:** live under `/images/...`; filenames with spaces/apostrophes are used as-is in `src` (already works today).

---

### Task 1: Feature branch + Vitest tooling + first date helper

**Files:**
- Modify: `package.json` (add devDependency + scripts)
- Create: `vitest.config.ts`
- Create: `src/events-logic.ts`
- Test: `src/events-logic.test.ts`

**Interfaces:**
- Produces: `parseEventDate(iso: string): Date`, `startOfToday(now: Date): Date` in `src/events-logic.ts`.

- [ ] **Step 1: Create the feature branch**

```bash
cd "$HOME/OneDrive/Desktop/site/willowwisp"
git checkout -b feature/date-aware-events
```

- [ ] **Step 2: Install Vitest**

Run:
```bash
npm install -D vitest --legacy-peer-deps
```
Expected: adds `vitest` to `devDependencies`, exits 0.

- [ ] **Step 3: Add test scripts to `package.json`**

In the `"scripts"` block, add `test` and `test:watch` so it reads:

```json
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 5: Write the failing test**

Create `src/events-logic.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parseEventDate, startOfToday } from "./events-logic.ts";

describe("parseEventDate", () => {
  it("parses an ISO date into a local midnight Date", () => {
    const d = parseEventDate("2026-09-05");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(8); // September is month 8
    expect(d.getDate()).toBe(5);
    expect(d.getHours()).toBe(0);
  });
});

describe("startOfToday", () => {
  it("strips the time off a Date", () => {
    const d = startOfToday(new Date(2026, 7, 27, 14, 30, 5));
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(27);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./events-logic.ts` (module does not exist yet).

- [ ] **Step 7: Create `src/events-logic.ts` with the two helpers**

```ts
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function parseEventDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfToday(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export { MONTHS };
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test`
Expected: PASS (2 tests).

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/events-logic.ts src/events-logic.test.ts
git commit -m "chore: add Vitest and date parsing helpers for events

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Event splitting, next-occurrence, and formatters

**Files:**
- Modify: `src/events-logic.ts`
- Test: `src/events-logic.test.ts`

**Interfaces:**
- Consumes: `parseEventDate`, `startOfToday`, `MONTHS` from Task 1.
- Produces (all exported from `src/events-logic.ts`):
  - Types: `EventDateEntry`, `WWEvent`, `Occurrence`, `UpcomingEvent`, `PastOccurrence`
  - `splitEvents(events: WWEvent[], today: Date): { upcoming: UpcomingEvent[]; past: PastOccurrence[] }`
  - `nextOccurrence(events: WWEvent[], today: Date): { event: WWEvent; date: Date } | null`
  - `formatChip(d: Date): string` → e.g. `"Sep 5"`
  - `formatFull(d: Date): string` → e.g. `"Sep 5, 2026"`
  - `isWithinDays(d: Date, today: Date, days: number): boolean`

  Type shapes:
  ```ts
  type EventDateEntry = string | { date: string; photos?: string[]; credit?: { text: string; url: string } };
  type WWEvent = { name: string; place: string; address?: string; time?: string; image?: string; dates: EventDateEntry[] };
  type Occurrence = { date: Date; photos?: string[]; credit?: { text: string; url: string } };
  type UpcomingEvent = { event: WWEvent; futureDates: Date[] };
  type PastOccurrence = { event: WWEvent; occurrence: Occurrence };
  ```

- [ ] **Step 1: Write the failing tests**

Append to `src/events-logic.test.ts`:

```ts
import {
  splitEvents, nextOccurrence, formatChip, formatFull, isWithinDays,
  type WWEvent,
} from "./events-logic.ts";

const TODAY = new Date(2026, 7, 27); // Aug 27, 2026

const sample: WWEvent[] = [
  { name: "Farmers Market", place: "Maple Valley, WA",
    dates: ["2026-05-02", "2026-08-01", "2026-09-05", "2026-10-03"] },
  { name: "NW Metaphysical", place: "Tacoma, WA",
    dates: ["2026-07-25", "2026-08-22"] },
  { name: "Bees in the Burbs", place: "Maple Valley, WA",
    dates: [{ date: "2026-04-04", photos: ["/images/Bees.jpeg"] }] },
];

describe("splitEvents", () => {
  const { upcoming, past } = splitEvents(sample, TODAY);

  it("keeps only events with a future date in upcoming", () => {
    expect(upcoming.map((u) => u.event.name)).toEqual(["Farmers Market"]);
  });

  it("keeps only the future dates within an upcoming event, sorted ascending", () => {
    const chips = upcoming[0].futureDates.map(formatChip);
    expect(chips).toEqual(["Sep 5", "Oct 3"]);
  });

  it("lists every past date as its own past occurrence, newest first", () => {
    expect(past.map((p) => formatFull(p.occurrence.date))).toEqual([
      "Aug 22, 2026", "Aug 1, 2026", "Jul 25, 2026", "May 2, 2026", "Apr 4, 2026",
    ]);
  });

  it("preserves photos on a past occurrence", () => {
    const bees = past.find((p) => p.event.name === "Bees in the Burbs");
    expect(bees?.occurrence.photos).toEqual(["/images/Bees.jpeg"]);
  });
});

describe("nextOccurrence", () => {
  it("returns the single soonest future occurrence", () => {
    const n = nextOccurrence(sample, TODAY);
    expect(n?.event.name).toBe("Farmers Market");
    expect(formatFull(n!.date)).toBe("Sep 5, 2026");
  });

  it("returns null when nothing is upcoming", () => {
    expect(nextOccurrence([sample[1], sample[2]], TODAY)).toBeNull();
  });
});

describe("formatters", () => {
  it("formatChip omits the year", () => {
    expect(formatChip(new Date(2026, 8, 5))).toBe("Sep 5");
  });
  it("formatFull includes the year", () => {
    expect(formatFull(new Date(2026, 8, 5))).toBe("Sep 5, 2026");
  });
  it("isWithinDays is true for a near future date and false for a far one", () => {
    expect(isWithinDays(new Date(2026, 8, 5), TODAY, 21)).toBe(true);
    expect(isWithinDays(new Date(2026, 9, 30), TODAY, 21)).toBe(false);
    expect(isWithinDays(new Date(2026, 7, 20), TODAY, 21)).toBe(false); // past
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `splitEvents`, `nextOccurrence`, `formatChip`, `formatFull`, `isWithinDays` not exported.

- [ ] **Step 3: Implement the logic**

Append to `src/events-logic.ts` (above the existing `export { MONTHS }` line is fine; keep a single `export { MONTHS }`):

```ts
export type EventDateEntry =
  | string
  | { date: string; photos?: string[]; credit?: { text: string; url: string } };

export type WWEvent = {
  name: string;
  place: string;
  address?: string;
  time?: string;
  image?: string;
  dates: EventDateEntry[];
};

export type Occurrence = {
  date: Date;
  photos?: string[];
  credit?: { text: string; url: string };
};

export type UpcomingEvent = { event: WWEvent; futureDates: Date[] };
export type PastOccurrence = { event: WWEvent; occurrence: Occurrence };

function normalize(entry: EventDateEntry): Occurrence {
  if (typeof entry === "string") return { date: parseEventDate(entry) };
  return { date: parseEventDate(entry.date), photos: entry.photos, credit: entry.credit };
}

export function splitEvents(
  events: WWEvent[],
  today: Date,
): { upcoming: UpcomingEvent[]; past: PastOccurrence[] } {
  const upcoming: UpcomingEvent[] = [];
  const past: PastOccurrence[] = [];

  for (const event of events) {
    const occ = event.dates.map(normalize);
    const future = occ
      .filter((o) => o.date >= today)
      .map((o) => o.date)
      .sort((a, b) => a.getTime() - b.getTime());
    const gone = occ
      .filter((o) => o.date < today)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    if (future.length) upcoming.push({ event, futureDates: future });
    for (const o of gone) past.push({ event, occurrence: o });
  }

  upcoming.sort((a, b) => a.futureDates[0].getTime() - b.futureDates[0].getTime());
  past.sort((a, b) => b.occurrence.date.getTime() - a.occurrence.date.getTime());
  return { upcoming, past };
}

export function nextOccurrence(
  events: WWEvent[],
  today: Date,
): { event: WWEvent; date: Date } | null {
  let best: { event: WWEvent; date: Date } | null = null;
  for (const event of events) {
    for (const entry of event.dates) {
      const d = normalize(entry).date;
      if (d >= today && (best === null || d < best.date)) best = { event, date: d };
    }
  }
  return best;
}

export function formatChip(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function formatFull(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function isWithinDays(d: Date, today: Date, days: number): boolean {
  const diff = (d.getTime() - today.getTime()) / 86400000;
  return diff >= 0 && diff <= days;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (all tests green).

- [ ] **Step 5: Commit**

```bash
git add src/events-logic.ts src/events-logic.test.ts
git commit -m "feat: split events into upcoming/past by date with formatters

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Seed real event data

**Files:**
- Create: `src/events-data.ts`
- Test: `src/events-data.test.ts`

**Interfaces:**
- Consumes: `WWEvent` type from `src/events-logic.ts`.
- Produces: `export const events: WWEvent[]` in `src/events-data.ts`.

- [ ] **Step 1: Write the failing test**

Create `src/events-data.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { events } from "./events-data.ts";
import { splitEvents } from "./events-logic.ts";

describe("events data", () => {
  it("has at least one event", () => {
    expect(events.length).toBeGreaterThan(0);
  });

  it("every date string is valid ISO YYYY-MM-DD", () => {
    for (const ev of events) {
      for (const entry of ev.dates) {
        const iso = typeof entry === "string" ? entry : entry.date;
        expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("splits without throwing against a fixed date", () => {
    const { upcoming, past } = splitEvents(events, new Date(2026, 7, 27));
    expect(Array.isArray(upcoming)).toBe(true);
    expect(Array.isArray(past)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./events-data.ts`.

- [ ] **Step 3: Create `src/events-data.ts`**

```ts
import type { WWEvent } from "./events-logic.ts";

// Kayla edits this list. To add a market date, add an ISO "YYYY-MM-DD" string to
// that event's `dates` array. Past dates move to "Past Events" automatically.
// For a past date with photos, use the object form (see the NW Metaphysical example).
export const events: WWEvent[] = [
  {
    name: "Maple Valley Farmers Market",
    place: "Maple Valley, WA",
    address: "25719 Maple Valley Black Diamond Rd SE, Maple Valley, WA 98038",
    time: "Saturdays, 9:00 AM – 2:00 PM",
    image: "/images/Maple Valley Farmer's Market.png",
    dates: ["2026-09-05", "2026-10-03", "2026-10-17", "2026-10-31", "2026-08-01", "2026-05-02"],
  },
  {
    name: "NW Metaphysical Market",
    place: "Tacoma, WA",
    image: "/images/NW Metaphysical MarketMe.jpg",
    dates: [
      "2026-08-22",
      "2026-07-25",
      "2026-04-25",
      {
        date: "2026-04-11",
        photos: ["/images/NW Metaphysical MarketMe.jpg"],
        credit: { text: "@wayfarerwellspring", url: "https://www.instagram.com/wayfarerwellspring/" },
      },
    ],
  },
  {
    name: "Bees in the Burbs",
    place: "Maple Valley, WA",
    dates: [{ date: "2026-04-04", photos: ["/images/Bees.jpeg", "/images/bees2.jpeg", "/images/bees3.jpeg"] }],
  },
  {
    name: "CCB Community Shopping Event",
    place: "Maple Valley, WA",
    dates: [{ date: "2026-03-22", photos: ["/images/CCB 3.22 (2).jpeg", "/images/CCB 3.22 (3).jpeg", "/images/CCB 3.22.jpeg"] }],
  },
  {
    name: "Eastside Alchemy Market",
    place: "Bellevue, WA",
    dates: [{ date: "2026-03-07", photos: ["/images/Eastside Alchemy Market.jpeg", "/images/IMG_0424.jpeg", "/images/blind dates.jpg"] }],
  },
  {
    name: "Holiday Night Market",
    place: "Benbow Room, West Seattle",
    dates: [{ date: "2025-12-17", photos: ["/images/Benbow4.jpeg", "/images/IMG_0680.jpeg", "/images/Benbow3.jpeg"] }],
  },
  {
    name: "Northwest Christmas Market",
    place: "Enumclaw Expo Center, Enumclaw, WA",
    dates: [{ date: "2025-12-05", photos: ["/images/Enumclaw Xmas.jpeg", "/images/Enumclaw Xmas (2).jpeg", "/images/blind-date-book.jpg"] }],
  },
];
```

> Note: the Northwest Christmas Market ran Dec 5–27, 2025; multi-day ranges collapse to a single representative date in this phase (acceptable for a past event). A `dateLabel` override can be added later if needed.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/events-data.ts src/events-data.test.ts
git commit -m "feat: seed events data list with current and past events

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Render into the events page

**Files:**
- Modify: `events.html` (replace the hardcoded events list + past events markup with mount points)
- Modify: `src/events.ts` (add rendering; keep existing menu + fade code)

**Interfaces:**
- Consumes: `events` from `src/events-data.ts`; `splitEvents`, `nextOccurrence`, `startOfToday`, `formatChip`, `formatFull`, `isWithinDays`, and types `UpcomingEvent`, `PastOccurrence` from `src/events-logic.ts`.
- Produces: DOM rendered into `#events-next`, `#events-upcoming`, `#events-empty`, `#events-past`.

- [ ] **Step 1: Replace the EVENTS LIST section in `events.html`**

Find the `<!-- ===== EVENTS LIST ===== -->` section (the `<section class="bg-cream">` block containing the two hardcoded `<article>` cards and the "No more events message") and replace the ENTIRE section with:

```html
    <!-- ===== EVENTS LIST ===== -->
    <section class="bg-cream">
      <div class="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <div id="events-next"></div>
        <div id="events-upcoming"></div>

        <!-- Shown only when there are no upcoming events -->
        <div id="events-empty" class="hidden text-center mt-10 py-8 border-t border-amber/20">
          <p class="text-sm text-charcoal/50 mb-4">More events are always in the works!</p>
        </div>

        <div class="text-center mt-10 py-8 border-t border-amber/20">
          <p class="text-xs text-charcoal/40 leading-relaxed">
            Follow on
            <a href="https://www.instagram.com/willowwispbooks/" target="_blank" rel="noopener noreferrer" class="text-teal hover:text-teal-dark font-semibold transition-colors">Instagram</a>
            or
            <a href="https://www.facebook.com/willowwispbooks" target="_blank" rel="noopener noreferrer" class="text-teal hover:text-teal-dark font-semibold transition-colors">Facebook</a>
            to hear about new dates first.
          </p>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Replace the PAST EVENTS section in `events.html`**

Find the `<!-- ===== PAST EVENTS ===== -->` section (the `<section class="bg-cream-dark">` block with the `<div class="space-y-10">` of hardcoded past `<article>`s) and replace the ENTIRE section with:

```html
    <!-- ===== PAST EVENTS ===== -->
    <section class="bg-cream-dark">
      <div class="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <h2 class="font-display text-2xl text-navy text-center mb-3 uppercase tracking-wide">Past Events</h2>
        <hr class="cozy-divider mb-10" />
        <div class="space-y-10" id="events-past"></div>
      </div>
    </section>
```

- [ ] **Step 3: Add rendering to `src/events.ts`**

Keep the existing file contents (the `import "./style.css";`, mobile menu toggle, and fade-in observer). Change the top import line and append the rendering block.

Change the first line from `import "./style.css";` to:

```ts
import "./style.css";
import { events } from "./events-data.ts";
import {
  splitEvents, nextOccurrence, startOfToday,
  formatChip, formatFull, isWithinDays,
  type UpcomingEvent, type PastOccurrence,
} from "./events-logic.ts";
```

Then append to the END of `src/events.ts`:

```ts
// --- Date-aware events rendering ---
const today = startOfToday(new Date());
const { upcoming, past } = splitEvents(events, today);

function upcomingCard(u: UpcomingEvent): string {
  const ev = u.event;
  const poster = ev.image
    ? `<div class="sm:w-48 flex-shrink-0"><img src="${ev.image}" alt="${ev.name}" class="w-full h-48 sm:h-full object-cover" /></div>`
    : "";
  const time = ev.time
    ? `<p class="flex items-start gap-2"><svg class="w-4 h-4 text-charcoal/40 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" /></svg><span>${ev.time}</span></p>`
    : "";
  const locationText = ev.address ? ev.address : ev.place;
  const location = `<p class="flex items-start gap-2"><svg class="w-4 h-4 text-charcoal/40 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg><span>${locationText}</span></p>`;
  const chips = u.futureDates.map((d, i) => {
    const soon = i === 0 && isWithinDays(d, today, 21);
    return soon
      ? `<span class="bg-sage text-white text-xs px-3 py-1 rounded-full">${formatChip(d)} • next</span>`
      : `<span class="bg-cream-dark text-charcoal/70 text-xs px-3 py-1 rounded-full">${formatChip(d)}</span>`;
  }).join("");
  return `<article class="bg-warm-white rounded-2xl shadow-sm overflow-hidden mb-6"><div class="flex flex-col sm:flex-row">${poster}<div class="p-6 flex-1"><h2 class="font-display text-xl text-navy font-semibold mb-2">${ev.name}</h2><div class="flex flex-col gap-1 mb-3 text-sm text-charcoal/70">${time}${location}</div><p class="text-xs text-charcoal/40 uppercase tracking-wider mb-3">Upcoming dates:</p><div class="flex flex-wrap gap-2">${chips}</div></div></div></article>`;
}

function pastEntry(p: PastOccurrence): string {
  const ev = p.event;
  const o = p.occurrence;
  let photos = "";
  if (o.photos && o.photos.length) {
    const cols = o.photos.length === 1 ? "grid-cols-1" : o.photos.length === 2 ? "grid-cols-2" : "grid-cols-3";
    const maxW = o.photos.length === 1 ? " max-w-md" : "";
    const tiles = o.photos.map((src) =>
      `<div class="aspect-[4/3] overflow-hidden"><img src="${src}" alt="${ev.name}" class="w-full h-full object-cover" loading="lazy" /></div>`
    ).join("");
    photos = `<div class="grid ${cols} gap-2 rounded-xl overflow-hidden${maxW}">${tiles}</div>`;
  }
  const credit = o.credit
    ? `<p class="text-xs text-charcoal/40 mt-2">Photo by <a href="${o.credit.url}" target="_blank" rel="noopener noreferrer" class="text-teal hover:text-teal-dark transition-colors">${o.credit.text}</a></p>`
    : "";
  return `<article><div class="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 mb-3"><p class="text-xs text-charcoal/40 uppercase tracking-wider sm:w-40 flex-shrink-0">${formatFull(o.date)}</p><h3 class="font-display text-lg text-navy font-semibold">${ev.name} &mdash; <span class="font-normal">${ev.place}</span></h3></div>${photos}${credit}</article>`;
}

function nextBanner(): string {
  const n = nextOccurrence(events, today);
  if (n === null) return "";
  return `<div class="bg-navy text-white rounded-2xl shadow-md px-6 py-5 mb-8 flex items-center gap-4 flex-wrap"><span class="w-2.5 h-2.5 rounded-full bg-sage flex-shrink-0"></span><div><p class="text-xs uppercase tracking-widest text-amber-light">Catch us next at</p><p class="font-display text-lg">${n.event.name}</p><p class="text-sm text-white/70">${formatFull(n.date)} &middot; ${n.event.place}</p></div></div>`;
}

const nextEl = document.getElementById("events-next");
const upEl = document.getElementById("events-upcoming");
const pastEl = document.getElementById("events-past");
const emptyEl = document.getElementById("events-empty");

if (nextEl) nextEl.innerHTML = nextBanner();
if (upEl) upEl.innerHTML = upcoming.map(upcomingCard).join("");
if (pastEl) pastEl.innerHTML = past.map(pastEntry).join("");
if (emptyEl && upcoming.length === 0) emptyEl.classList.remove("hidden");
```

- [ ] **Step 4: Type-check and build**

Run: `npm run build`
Expected: PASS — `tsc` reports no errors and `vite build` completes writing to `dist/`.

- [ ] **Step 5: Manual verification in the dev server**

Run: `npm run dev`, then open the events page (`http://localhost:5173/events.html`). Confirm:
- The "Catch us next at" banner shows **Maple Valley Farmers Market · Sep 5, 2026** (the soonest future date, given today is after Aug 27, 2026).
- Under Upcoming, the Farmers Market card shows only **Sep 5 / Oct 3 / Oct 17 / Oct 31** (Aug 1 and earlier are gone), with the first chip styled `bg-sage` only if within 21 days of today.
- NW Metaphysical Market does NOT appear under Upcoming (all its dates are past).
- Past Events lists occurrences newest-first, with the Bees / CCB / Eastside / Benbow / Enumclaw photos and the `@wayfarerwellspring` photo credit on the Apr 11 NW Metaphysical entry.
- Cards look visually identical to the previous hand-built cards (fonts, colors, rounded corners, dividers intact).

Stop the dev server when done (Ctrl+C).

- [ ] **Step 6: Commit**

```bash
git add events.html src/events.ts
git commit -m "feat: render events from data with auto upcoming/past split

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Update project docs

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:** none (documentation only).

- [ ] **Step 1: Update the events management docs**

In `CLAUDE.md`, under the "Key Details" list, replace the bullet that begins **"Events are managed in HTML"** with:

```markdown
- **Events are data-driven** — edit `src/events-data.ts`. Each event has a `dates` array of ISO `"YYYY-MM-DD"` strings; `src/events.ts` renders them and `src/events-logic.ts` auto-splits future dates into "Upcoming" and past dates into "Past Events" against today's date (no manual moving). For a past date with photos/credit, use the object form `{ date, photos, credit }`. Events remain free with no RSVP/ticketing.
```

Also update the "### Scripts" section entry for `src/events.ts` to:

```markdown
- **`src/events.ts`** — Events page JS: mobile menu toggle, fade-in animations, email signup handler, and date-aware rendering of upcoming/past events from `src/events-data.ts` via the pure helpers in `src/events-logic.ts`.
```

And add under "### Scripts":

```markdown
- **`src/events-logic.ts`** — Pure, unit-tested date logic (`splitEvents`, `nextOccurrence`, formatters). Tested by `src/events-logic.test.ts` (Vitest).
- **`src/events-data.ts`** — The editable list of events (name, place, dates, optional photos). Kayla's source of truth for what shows on the events page.
```

Add a line to the "## Commands" section:

```markdown
- `npm test` — Run the Vitest unit tests (currently the events date logic)
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document data-driven events workflow

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Done criteria (Phase 1)

- `npm test` passes; `npm run build` passes.
- The events page shows no past date as "upcoming," with zero manual HTML edits — verified in the dev server.
- The past-events photos, credit, and existing visual design are preserved.
- All work is on `feature/date-aware-events`, unpushed; merging to `main` (which deploys) is a separate, user-approved step.

## Not in this plan (later phases)

- Phase 2: `quiz.html` (own page), Blind Date explainer, Gifts, Formspree wiring.
- Phase 3: Bookshelf rebuild, Cusdis discussion, Unhinged Book Club.
- Nav links for the new pages are added in their respective phases.
