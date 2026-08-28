import type { Book } from "./books-logic.ts";
import type { ArchetypeKey } from "./quiz-logic.ts";

// MONTHLY ROTATING SET — one featured pick per shelf; swap them each month.
// Kayla's real picks are loaded below. Shelves marked EXAMPLE await her pick.
// Tags are BASELINE (genre + shelf) for now — Kayla adds descriptive + dealbreaker
// tags later (spicy · cliffhanger · slow-burn · gore · sad-ending · etc.) so hard-no's
// filter properly. Optional per book: `cover` (drop file in public/images first), `blurb`.
export const books: Book[] = [
  // Mystery — Cozy
  { title: "The Thursday Murder Club", author: "Richard Osman", shelf: "mystery_cozy", tags: ["mystery", "cozy"] },

  // Mystery — Thriller
  { title: "The Snowman", author: "Jo Nesbø", shelf: "mystery_thriller", tags: ["mystery", "thriller"] },

  // Romance — Clean
  { title: "Assistant to the Villain", author: "Hannah Nicole Maehrer", shelf: "romance_clean", tags: ["romance", "clean"] },

  // Romance — Spicy / Dark
  { title: "Bad Guys Need Love Too", author: "Isabel Jordan", shelf: "romance_spicy", tags: ["romance", "spicy"] },

  // Fantasy / Sci-Fi — Adventure
  { title: "Tress of the Emerald Sea", author: "Brandon Sanderson", shelf: "fantasy_adventure", tags: ["fantasy", "adventure"] },

  // Fantasy / Sci-Fi — Existential  (EXAMPLE — awaiting Kayla's pick)
  { title: "Project Hail Mary", author: "Andy Weir", shelf: "fantasy_existential", tags: ["scifi", "existential", "adventure", "hopeful"] },

  // Nonfiction — Fun
  { title: "Feral Self-Care", author: "Mandi Em", shelf: "nonfiction_fun", tags: ["nonfiction", "fun", "humor"] },

  // Nonfiction — Thoughtful
  { title: "White Trash: The 400-Year Untold History of Class in America", author: "Nancy Isenberg", shelf: "nonfiction_sad", tags: ["nonfiction", "thoughtful", "history"] },

  // ⭐ Wildcard — the "I'll read anything" surprise.
  // TODO: confirm shelf/genre for The Decomposition Book (parked on Mystery/Thriller).
  { title: "The Decomposition Book", author: "Sara van Os", shelf: "mystery_thriller", tags: [], wildcard: true, blurb: "The wildcard — for when you'll read anything." },
];

// Shelf-specific bonus suggestion shown under the matched book. E.g. spicy readers
// get nudged toward something extra-unhinged.
export const bonusSuggestions: Partial<Record<ArchetypeKey, { prompt: string; title: string; author: string }>> = {
  romance_spicy: { prompt: "Want something super unhinged?", title: "The Witchwood Boys", author: "C.M. Stunich" },
};

// "You might also enjoy…" — a few other authors suggested per shelf, shown under
// the matched book. More evergreen than the monthly picks; edit whenever.
export const alsoEnjoy: Record<ArchetypeKey, string[]> = {
  mystery_cozy: ["Deanna Raybourn", "Rachel Ekstrom Courage", "G.M. Malliet"],
  mystery_thriller: ["Eli Raphael", "Jordan Harper", "Tiffany Crum"],
  romance_clean: ["Gracie Ruth Mitchell", "Mhairi McFarlane", "Sophie Kinsella"],
  romance_spicy: ["Olivia Dade", "Joanna Lowell", "Elsie Silver"],
  fantasy_adventure: ["Andy Weir", "Cixin Liu", "Ursula K. Le Guin"],
  fantasy_existential: ["Becky Chambers", "N.K. Jemisin", "Ted Chiang"], // EXAMPLE — awaiting Kayla's authors
  nonfiction_fun: ["Carlyle Christoff", "Elisabeth Saake", "Caroline Moore", "Summer Jewel Keown"],
  nonfiction_sad: ["Jane McGonigal", "Gretchen Rubin", "Michael Pollan"],
};
