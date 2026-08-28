// Pure quiz logic for "Find Your Next Read".
// Mirrors Kayla's in-person flow: genre first, then modifiers, mapping to one of 8 shelves.

export type Genre = "mystery" | "romance" | "fantasy" | "nonfiction";

export type QuizAnswers = {
  genre: Genre;
  recent: string; // free text, optional
  nope: string[]; // hard-no selections
  ride: "coaster" | "smooth";
  spice: "spicy" | "clean";
  dark: "dark" | "light";
};

export type ArchetypeKey =
  | "mystery_cozy" | "mystery_thriller"
  | "romance_clean" | "romance_spicy"
  | "fantasy_adventure" | "fantasy_existential"
  | "nonfiction_fun" | "nonfiction_sad";

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

const LIGHTER: Partial<Record<ArchetypeKey, ArchetypeKey>> = {
  mystery_thriller: "mystery_cozy",
  fantasy_existential: "fantasy_adventure",
  nonfiction_sad: "nonfiction_fun",
};

function baseKey(a: QuizAnswers): ArchetypeKey {
  const heavy = a.dark === "dark" || a.ride === "coaster";
  switch (a.genre) {
    case "mystery":
      return heavy ? "mystery_thriller" : "mystery_cozy";
    case "romance":
      return (a.spice === "spicy" || a.dark === "dark") ? "romance_spicy" : "romance_clean";
    case "fantasy":
      return heavy ? "fantasy_existential" : "fantasy_adventure";
    case "nonfiction":
      return heavy ? "nonfiction_sad" : "nonfiction_fun";
  }
}

export function classify(a: QuizAnswers): ArchetypeKey {
  const key = baseKey(a);
  // "No heavy/sad endings" bumps toward the lighter shelf of that genre.
  if (a.nope.includes("Heavy or sad endings")) {
    return LIGHTER[key] ?? key;
  }
  return key;
}
