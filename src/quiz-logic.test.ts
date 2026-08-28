import { describe, it, expect } from "vitest";
import { classify, ARCHETYPES, type QuizAnswers, type ArchetypeKey } from "./quiz-logic.ts";

function ans(partial: Partial<QuizAnswers>): QuizAnswers {
  return { genre: "mystery", shelf: "mystery_cozy", flavor: [], recent: "", nope: [], ...partial };
}

const ALL_KEYS: ArchetypeKey[] = [
  "mystery_cozy", "mystery_thriller", "romance_clean", "romance_spicy",
  "fantasy_adventure", "fantasy_existential", "nonfiction_fun", "nonfiction_sad",
];

describe("classify", () => {
  it("returns the chosen shelf unchanged when there are no hard-no's", () => {
    for (const key of ALL_KEYS) {
      expect(classify(ans({ shelf: key }))).toBe(key);
    }
  });

  it("'Heavy or sad endings' bumps thriller → cozy", () => {
    expect(classify(ans({ shelf: "mystery_thriller", nope: ["Heavy or sad endings"] }))).toBe("mystery_cozy");
  });
  it("'Heavy or sad endings' bumps existential → adventure", () => {
    expect(classify(ans({ shelf: "fantasy_existential", nope: ["Heavy or sad endings"] }))).toBe("fantasy_adventure");
  });
  it("'Heavy or sad endings' bumps sad → fun", () => {
    expect(classify(ans({ shelf: "nonfiction_sad", nope: ["Heavy or sad endings"] }))).toBe("nonfiction_fun");
  });
  it("does not bump spicy romance (not a heavy/sad shelf)", () => {
    expect(classify(ans({ shelf: "romance_spicy", nope: ["Heavy or sad endings"] }))).toBe("romance_spicy");
  });
  it("leaves already-light shelves untouched under the override", () => {
    expect(classify(ans({ shelf: "mystery_cozy", nope: ["Heavy or sad endings"] }))).toBe("mystery_cozy");
    expect(classify(ans({ shelf: "nonfiction_fun", nope: ["Heavy or sad endings"] }))).toBe("nonfiction_fun");
  });
  it("ignores other hard-no's for shelf selection", () => {
    expect(classify(ans({ shelf: "mystery_thriller", nope: ["Too much spice", "Cliffhangers"] }))).toBe("mystery_thriller");
  });
});

describe("ARCHETYPES", () => {
  it("has a complete entry for every shelf", () => {
    for (const k of ALL_KEYS) {
      expect(ARCHETYPES[k]).toBeDefined();
      expect(ARCHETYPES[k].name.length).toBeGreaterThan(0);
      expect(ARCHETYPES[k].shelf.length).toBeGreaterThan(0);
      expect(ARCHETYPES[k].blurb.length).toBeGreaterThan(0);
      expect(ARCHETYPES[k].genreLabel.length).toBeGreaterThan(0);
    }
  });
  it("uses Kayla's final archetype names", () => {
    expect(ARCHETYPES.mystery_cozy.name).toBe("The Slippered Sleuth");
    expect(ARCHETYPES.mystery_thriller.name).toBe("The Dogged Detective");
    expect(ARCHETYPES.romance_clean.name).toBe("The Rose-Tinted Romantic");
    expect(ARCHETYPES.romance_spicy.name).toBe("The Bawdy Bookworm");
    expect(ARCHETYPES.fantasy_adventure.name).toBe("The Swashbuckling Sidequester");
    expect(ARCHETYPES.fantasy_existential.name).toBe("The Paradox Pursuer");
    expect(ARCHETYPES.nonfiction_fun.name).toBe("The Rollicking Realist");
    expect(ARCHETYPES.nonfiction_sad.name).toBe("The Earnest Empath");
  });
});
