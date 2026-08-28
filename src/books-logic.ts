// Tag-based book matching. The quiz answers become a set of "wanted" tags plus
// "dealbreaker" tags (from hard-no's); each book is scored, dealbreakers are
// excluded, and the single closest book is returned.

import { classify, type QuizAnswers, type Genre, type ArchetypeKey } from "./quiz-logic.ts";

export type Book = {
  title: string;
  author: string;
  shelf: ArchetypeKey; // its home shelf (one of the 8)
  tags: string[];      // lowercase descriptive tags used for matching
  cover?: string;      // optional path under /images
  blurb?: string;      // optional one-liner
  wildcard?: boolean;  // Kayla's "if you'll read anything, read THIS" pick
};

const GENRE_TAG: Record<Genre, string> = {
  mystery: "mystery",
  romance: "romance",
  fantasy: "fantasy",
  nonfiction: "nonfiction",
};

const SHELF_TAG: Record<ArchetypeKey, string> = {
  mystery_cozy: "cozy",
  mystery_thriller: "thriller",
  romance_clean: "clean",
  romance_spicy: "spicy",
  fantasy_adventure: "adventure",
  fantasy_existential: "existential",
  nonfiction_fun: "fun",
  nonfiction_sad: "thoughtful",
};

// Flavor answers (lowercased) → a concise tag.
const FLAVOR_TAG: Record<string, string> = {
  "clever & bloodless": "clever",
  "dark & gritty": "gritty",
  "cozy comfort": "comfort",
  "make-me-ache angst": "angst",
  "fantasy-leaning": "fantasy",
  "sci-fi-leaning": "scifi",
  "memoir": "memoir",
  "history": "history",
  "science": "science",
  "true crime": "true-crime",
  "nature": "nature",
  "culture & society": "culture",
};

// Hard-no label → the book tag it excludes.
const DEALBREAKER_TAG: Record<string, string> = {
  "Cliffhangers": "cliffhanger",
  "Too much spice": "spicy",
  "Heavy or sad endings": "sad-ending",
  "Slow burns": "slow-burn",
  "Gore & violence": "gore",
};

export function wantedTags(a: QuizAnswers): string[] {
  const shelf = classify(a);
  const tags = new Set<string>();
  tags.add(GENRE_TAG[a.genre]);
  tags.add(SHELF_TAG[shelf]);
  for (const f of a.flavor) {
    const t = FLAVOR_TAG[f.toLowerCase()];
    if (t) tags.add(t);
  }
  return [...tags];
}

export function dealbreakerTags(nope: string[]): string[] {
  const out: string[] = [];
  for (const n of nope) {
    const t = DEALBREAKER_TAG[n];
    if (t) out.push(t);
  }
  return out;
}

// Closest non-excluded book, with a strong bonus for being on the matched shelf.
// Returns null when nothing has any overlap (caller falls back to a hand-pick CTA).
export function bestMatch(books: Book[], a: QuizAnswers): Book | null {
  const wanted = wantedTags(a);
  const bad = dealbreakerTags(a.nope);
  const shelf = classify(a);

  let best: Book | null = null;
  let bestScore = 0; // require at least 1 point of relevance
  for (const book of books) {
    if (bad.some((d) => book.tags.includes(d))) continue;
    let s = 0;
    for (const w of wanted) if (book.tags.includes(w)) s += 1;
    if (book.shelf === shelf) s += 3;
    if (s > bestScore) {
      bestScore = s;
      best = book;
    }
  }
  return best;
}

// For "I'll read anything": prefer the flagged wildcard, else the first book that
// isn't excluded by a hard-no. Returns null only if every book is excluded.
export function surprisePick(books: Book[], nope: string[]): Book | null {
  const bad = dealbreakerTags(nope);
  const ok = books.filter((b) => !bad.some((d) => b.tags.includes(d)));
  if (ok.length === 0) return null;
  return ok.find((b) => b.wildcard) ?? ok[0];
}
