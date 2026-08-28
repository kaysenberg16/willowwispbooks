import { describe, it, expect } from "vitest";
import { wantedTags, dealbreakerTags, bestMatch, surprisePick, type Book } from "./books-logic.ts";
import { type QuizAnswers, type ArchetypeKey } from "./quiz-logic.ts";
import { books, alsoEnjoy } from "./books-data.ts";

function ans(partial: Partial<QuizAnswers>): QuizAnswers {
  return { genre: "romance", shelf: "romance_clean", flavor: [], recent: "", nope: [], ...partial };
}

describe("wantedTags", () => {
  it("includes the genre and the shelf tag", () => {
    const tags = wantedTags(ans({ genre: "romance", shelf: "romance_clean" }));
    expect(tags).toContain("romance");
    expect(tags).toContain("clean");
  });
  it("maps flavor answers to concise tags", () => {
    const tags = wantedTags(ans({ genre: "romance", shelf: "romance_clean", flavor: ["cozy comfort"] }));
    expect(tags).toContain("comfort");
  });
  it("reflects the classified (overridden) shelf, not the raw pick", () => {
    // spicy pick + 'too much spice' → clean shelf tag
    const tags = wantedTags(ans({ shelf: "romance_spicy", nope: ["Too much spice"] }));
    expect(tags).toContain("clean");
    expect(tags).not.toContain("spicy");
  });
});

describe("dealbreakerTags", () => {
  it("maps hard-no labels to exclusion tags", () => {
    expect(dealbreakerTags(["Cliffhangers", "Gore & violence"])).toEqual(["cliffhanger", "gore"]);
  });
  it("ignores 'Nothing — I'll try anything' and unknown labels", () => {
    expect(dealbreakerTags(["Nothing — I'll try anything"])).toEqual([]);
  });
});

describe("bestMatch", () => {
  const catalog: Book[] = [
    { title: "Clean Pick", author: "A", shelf: "romance_clean", tags: ["romance", "clean", "comfort"] },
    { title: "Spicy Pick", author: "B", shelf: "romance_spicy", tags: ["romance", "spicy", "comfort"] },
    { title: "Cozy Mystery", author: "C", shelf: "mystery_cozy", tags: ["mystery", "cozy"] },
  ];

  it("returns a book on the matched shelf", () => {
    const m = bestMatch(catalog, ans({ genre: "romance", shelf: "romance_clean" }));
    expect(m?.title).toBe("Clean Pick");
  });

  it("excludes books carrying a dealbreaker tag", () => {
    // spicy reader, but 'too much spice' is a hard-no → flips to clean and never returns a spicy book
    const m = bestMatch(catalog, ans({ shelf: "romance_spicy", nope: ["Too much spice"] }));
    expect(m?.title).toBe("Clean Pick");
  });

  it("returns null when nothing is relevant", () => {
    const onlyMystery: Book[] = [{ title: "X", author: "Y", shelf: "mystery_thriller", tags: ["mystery", "thriller"] }];
    // a nonfiction-fun reader with no overlap
    const m = bestMatch(onlyMystery, ans({ genre: "nonfiction", shelf: "nonfiction_fun" }));
    expect(m).toBeNull();
  });
});

describe("surprisePick (I'll read anything)", () => {
  const cat: Book[] = [
    { title: "Plain", author: "a", shelf: "mystery_cozy", tags: ["mystery", "cozy"] },
    { title: "Wild", author: "b", shelf: "fantasy_adventure", tags: ["fantasy"], wildcard: true },
  ];
  it("prefers the wildcard-flagged book", () => {
    expect(surprisePick(cat, [])?.title).toBe("Wild");
  });
  it("skips books excluded by a hard-no, falling back to the first that's allowed", () => {
    const cat2: Book[] = [
      { title: "Spicy", author: "c", shelf: "romance_spicy", tags: ["romance", "spicy"], wildcard: true },
      { title: "Clean", author: "d", shelf: "romance_clean", tags: ["romance", "clean"] },
    ];
    expect(surprisePick(cat2, ["Too much spice"])?.title).toBe("Clean");
  });
  it("returns null when every book is excluded", () => {
    const cat3: Book[] = [{ title: "S", author: "x", shelf: "romance_spicy", tags: ["spicy"] }];
    expect(surprisePick(cat3, ["Too much spice"])).toBeNull();
  });
});

describe("seed catalog is matchable", () => {
  const shelves = [
    "mystery_cozy", "mystery_thriller", "romance_clean", "romance_spicy",
    "fantasy_adventure", "fantasy_existential", "nonfiction_fun", "nonfiction_sad",
  ] as const;

  it("returns a same-shelf match for every shelf with no hard-no's", () => {
    for (const shelf of shelves) {
      const genre = shelf.startsWith("mystery") ? "mystery"
        : shelf.startsWith("romance") ? "romance"
        : shelf.startsWith("fantasy") ? "fantasy" : "nonfiction";
      const m = bestMatch(books, ans({ genre, shelf, nope: [] }));
      expect(m, `shelf ${shelf}`).not.toBeNull();
      expect(m?.shelf, `shelf ${shelf}`).toBe(shelf);
    }
  });

  it("has 'you might also enjoy' authors for every shelf", () => {
    for (const shelf of shelves as readonly ArchetypeKey[]) {
      expect(alsoEnjoy[shelf], `shelf ${shelf}`).toBeDefined();
      expect(alsoEnjoy[shelf].length, `shelf ${shelf}`).toBeGreaterThan(0);
    }
  });
});
