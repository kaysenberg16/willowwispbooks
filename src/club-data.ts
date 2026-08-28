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

// Kayla sets a new pick each month.
export const currentPick: ClubPick = {
  title: "Murder Your Employer: The McMasters Guide to Homicide",
  author: "Rupert Holmes",
  monthLabel: "This Month",
  blurb: "A genteel how-to for offing your worst boss, delivered with martini-dry wit and a body count. Deliciously, deliriously unhinged. Read along and bring your most (hypothetical!) devious theories to the discussion — no spoilers past where the group's at, you fiends. 🔪",
  threadId: "unhinged-murder-your-employer",
};

// Optional archive of past reads (shown as a small list if non-empty).
export const pastPicks: ClubPick[] = [];

// ── Discussion (Cusdis) ────────────────────────────────────────────────────
// Paste your Cusdis App ID here to switch the comment box on. Until then the page
// shows a friendly "opening soon" placeholder. Get it free at https://cusdis.com
// (create a site → copy the App ID). This is safe to be public.
export const CUSDIS_APP_ID = "";
export const CUSDIS_HOST = "https://cusdis.com";
