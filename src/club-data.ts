// The Unhinged Book Club — online-only discussion club. Kayla sets a new pick each
// month and (optionally) a threadId so each month gets its own discussion.

export type ClubPick = {
  title: string;
  author: string;
  monthLabel: string; // e.g. "August 2026"
  blurb: string;      // why we're reading it / what to expect
  cover?: string;     // optional path under /images
  threadId: string;   // unique discussion id for this pick (e.g. "unhinged-2026-08")
};

// ⚠️ EXAMPLE current pick — Kayla replaces this each month.
export const currentPick: ClubPick = {
  title: "The Decomposition Book",
  author: "Sara van Os",
  monthLabel: "This Month",
  blurb: "Gothic, feral, and gloriously unhinged — exactly our vibe. Read it this month and bring your most deranged theories to the discussion below. No spoilers past the current chapter, you animals. 🕯️",
  threadId: "unhinged-decomposition-book",
};

// Optional archive of past reads (shown as a small list if non-empty).
export const pastPicks: ClubPick[] = [];

// ── Discussion (Cusdis) ────────────────────────────────────────────────────
// Paste your Cusdis App ID here to switch the comment box on. Until then the page
// shows a friendly "opening soon" placeholder. Get it free at https://cusdis.com
// (create a site → copy the App ID). This is safe to be public.
export const CUSDIS_APP_ID = "";
export const CUSDIS_HOST = "https://cusdis.com";
