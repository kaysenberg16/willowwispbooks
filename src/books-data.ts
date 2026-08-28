import type { Book } from "./books-logic.ts";

// ⚠️ EXAMPLE CATALOG — Kayla replaces these with her curated favorites.
// Each book needs: title, author, `shelf` (one of the 8 keys), and `tags`.
// Optional: `cover` (a path like "/images/Book Cover Images/xyz.jpg" — drop the
// file into public/images first) and a one-line `blurb`.
//
// Tag vocabulary used by the quiz for matching:
//   genres:  mystery · romance · fantasy · scifi · nonfiction
//   shelves: cozy · thriller · clean · spicy · adventure · existential · fun · sad
//   flavor:  clever · gritty · comfort · angst · memoir · history · science ·
//            true-crime · nature · culture
//   extras:  humor · twist · dark · quest · found-family · banter · literary ·
//            hopeful · sports
//   dealbreaker tags (hard-no's exclude a book):
//            cliffhanger · spicy · sad-ending · slow-burn · gore
export const books: Book[] = [
  // Mystery — Cozy
  { title: "The Thursday Murder Club", author: "Richard Osman", shelf: "mystery_cozy", tags: ["mystery", "cozy", "clever", "humor"] },
  { title: "Vera Wong's Unsolicited Advice for Murderers", author: "Jesse Q. Sutanto", shelf: "mystery_cozy", tags: ["mystery", "cozy", "humor", "clever"] },

  // Mystery — Thriller
  { title: "The Silent Patient", author: "Alex Michaelides", shelf: "mystery_thriller", tags: ["mystery", "thriller", "twist", "gritty", "cliffhanger"] },
  { title: "Gone Girl", author: "Gillian Flynn", shelf: "mystery_thriller", tags: ["mystery", "thriller", "dark", "gritty", "twist"] },

  // Romance — Clean
  { title: "The Hating Game", author: "Sally Thorne", shelf: "romance_clean", tags: ["romance", "clean", "comfort", "banter"] },
  { title: "Every Summer After", author: "Carley Fortune", shelf: "romance_clean", tags: ["romance", "clean", "angst", "slow-burn"] },

  // Romance — Spicy / Dark
  { title: "Icebreaker", author: "Hannah Grace", shelf: "romance_spicy", tags: ["romance", "spicy", "comfort", "sports"] },
  { title: "A Court of Mist and Fury", author: "Sarah J. Maas", shelf: "romance_spicy", tags: ["romance", "spicy", "fantasy", "dark", "angst"] },

  // Fantasy / Sci-Fi — Adventure
  { title: "The Hobbit", author: "J.R.R. Tolkien", shelf: "fantasy_adventure", tags: ["fantasy", "adventure", "quest", "found-family"] },
  { title: "The Lightning Thief", author: "Rick Riordan", shelf: "fantasy_adventure", tags: ["fantasy", "adventure", "quest", "humor"] },

  // Fantasy / Sci-Fi — Existential
  { title: "Circe", author: "Madeline Miller", shelf: "fantasy_existential", tags: ["fantasy", "existential", "literary", "angst"] },
  { title: "Project Hail Mary", author: "Andy Weir", shelf: "fantasy_existential", tags: ["scifi", "existential", "adventure", "hopeful"] },

  // Nonfiction — Fun
  { title: "Born a Crime", author: "Trevor Noah", shelf: "nonfiction_fun", tags: ["nonfiction", "memoir", "fun", "humor"] },
  { title: "A Short History of Nearly Everything", author: "Bill Bryson", shelf: "nonfiction_fun", tags: ["nonfiction", "science", "fun", "history"] },

  // Nonfiction — Sad / Profound
  { title: "Educated", author: "Tara Westover", shelf: "nonfiction_sad", tags: ["nonfiction", "memoir", "sad", "heavy"] },
  { title: "When Breath Becomes Air", author: "Paul Kalanithi", shelf: "nonfiction_sad", tags: ["nonfiction", "memoir", "sad", "heavy", "sad-ending"] },
];
