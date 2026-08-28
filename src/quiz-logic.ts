// Pure quiz logic for "Find Your Next Read".
// Branching flow: genre first, then a genre-specific decisive question that picks
// the shelf directly, plus a flavor question. "No heavy/sad endings" gently steers lighter.

export type Genre = "mystery" | "romance" | "fantasy" | "nonfiction";

export type ArchetypeKey =
  | "mystery_cozy" | "mystery_thriller"
  | "romance_clean" | "romance_spicy"
  | "fantasy_adventure" | "fantasy_existential"
  | "nonfiction_fun" | "nonfiction_sad";

export type QuizAnswers = {
  genre: Genre;
  shelf: ArchetypeKey; // chosen via the genre's decisive question
  flavor: string[];    // flavor answer(s): grit / angst / lean / topics
  recent: string;      // free text, optional
  nope: string[];      // hard-no selections
};

export type Archetype = {
  name: string;
  shelf: string;
  blurb: string;
  genreLabel: string;
};

export const ARCHETYPES: Record<ArchetypeKey, Archetype> = {
  mystery_cozy: {
    name: "The Slippered Sleuth",
    shelf: "Mystery — Cozy",
    genreLabel: "Cozy Mystery",
    blurb: "You want a puzzle and a warm mug, not a body count. Think small-town whodunits with cats, tea, and charm.",
  },
  mystery_thriller: {
    name: "The Dogged Detective",
    shelf: "Mystery — Thriller",
    genreLabel: "Thriller",
    blurb: "You like your heart in your throat. Twisty, propulsive, don't-trust-anyone reads that ruin your sleep schedule.",
  },
  romance_clean: {
    name: "The Rose-Tinted Romantic",
    shelf: "Romance — Clean",
    genreLabel: "Clean Romance",
    blurb: "You're here for the swoon, not the steam. Slow-burn longing, banter, and an earned happily-ever-after.",
  },
  romance_spicy: {
    name: "The Bawdy Bookworm",
    shelf: "Romance — Spicy / Dark",
    genreLabel: "Spicy / Dark Romance",
    blurb: "You want tension, teeth, and heat. Morally-gray love interests and a plot that doesn't behave.",
  },
  fantasy_adventure: {
    name: "The Swashbuckling Sidequester",
    shelf: "Fantasy / Sci-Fi — Adventure",
    genreLabel: "Adventure Fantasy",
    blurb: "You read to go somewhere. Maps, magic, found family, and a quest worth turning 500 pages for.",
  },
  fantasy_existential: {
    name: "The Paradox Pursuer",
    shelf: "Fantasy / Sci-Fi — Existential",
    genreLabel: "Existential Sci-Fi",
    blurb: "You like sci-fi/fantasy that quietly rearranges your brain. Big questions, aching wonder, maybe a good cry among the stars.",
  },
  nonfiction_fun: {
    name: "The Rollicking Realist",
    shelf: "Nonfiction — Fun",
    genreLabel: "Fun Nonfiction",
    blurb: "You love a delightful rabbit-hole. Witty, surprising, tell-your-friends-a-fact kind of nonfiction.",
  },
  nonfiction_sad: {
    name: "The Earnest Empath",
    shelf: "Nonfiction — Sad / Profound",
    genreLabel: "Profound Nonfiction",
    blurb: "You read to feel and understand. Memoir and true stories that sit in your chest for weeks.",
  },
};

// Hard-no "Heavy or sad endings" nudges these shelves to their lighter sibling.
const LIGHTER: Partial<Record<ArchetypeKey, ArchetypeKey>> = {
  mystery_thriller: "mystery_cozy",
  fantasy_existential: "fantasy_adventure",
  nonfiction_sad: "nonfiction_fun",
};

export const NO_HEAVY = "Heavy or sad endings";
export const NO_SPICE = "Too much spice";

// Hard-no's only change the reader type when they directly contradict the chosen
// shelf: "no heavy/sad" steers a heavy shelf lighter; "no spice" on a spicy pick
// flips to clean. All other hard-no's are captured as preferences, not type-changers.
export function classify(a: QuizAnswers): ArchetypeKey {
  let shelf = a.shelf;
  if (a.nope.includes(NO_HEAVY)) shelf = LIGHTER[shelf] ?? shelf;
  if (a.nope.includes(NO_SPICE) && shelf === "romance_spicy") shelf = "romance_clean";
  return shelf;
}
