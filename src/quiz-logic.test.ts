import { describe, it, expect } from "vitest";
import { classify, ARCHETYPES, type QuizAnswers } from "./quiz-logic.ts";

function answers(partial: Partial<QuizAnswers>): QuizAnswers {
  return {
    genre: "mystery",
    recent: "",
    nope: [],
    ride: "smooth",
    spice: "clean",
    dark: "light",
    ...partial,
  };
}

describe("classify", () => {
  it("mystery + smooth/light → cozy", () => {
    expect(classify(answers({ genre: "mystery" }))).toBe("mystery_cozy");
  });
  it("mystery + dark → thriller", () => {
    expect(classify(answers({ genre: "mystery", dark: "dark" }))).toBe("mystery_thriller");
  });
  it("mystery + rollercoaster → thriller", () => {
    expect(classify(answers({ genre: "mystery", ride: "coaster" }))).toBe("mystery_thriller");
  });
  it("romance + clean/light → clean", () => {
    expect(classify(answers({ genre: "romance" }))).toBe("romance_clean");
  });
  it("romance + spice → spicy", () => {
    expect(classify(answers({ genre: "romance", spice: "spicy" }))).toBe("romance_spicy");
  });
  it("romance + dark → spicy", () => {
    expect(classify(answers({ genre: "romance", dark: "dark" }))).toBe("romance_spicy");
  });
  it("fantasy + smooth/light → adventure", () => {
    expect(classify(answers({ genre: "fantasy" }))).toBe("fantasy_adventure");
  });
  it("fantasy + dark or coaster → existential", () => {
    expect(classify(answers({ genre: "fantasy", ride: "coaster" }))).toBe("fantasy_existential");
  });
  it("nonfiction + light → fun", () => {
    expect(classify(answers({ genre: "nonfiction" }))).toBe("nonfiction_fun");
  });
  it("nonfiction + dark → sad", () => {
    expect(classify(answers({ genre: "nonfiction", dark: "dark" }))).toBe("nonfiction_sad");
  });

  it("'Heavy or sad endings' hard-no bumps thriller → cozy", () => {
    expect(classify(answers({ genre: "mystery", dark: "dark", nope: ["Heavy or sad endings"] })))
      .toBe("mystery_cozy");
  });
  it("'Heavy or sad endings' hard-no bumps existential → adventure", () => {
    expect(classify(answers({ genre: "fantasy", ride: "coaster", nope: ["Heavy or sad endings"] })))
      .toBe("fantasy_adventure");
  });
  it("'Heavy or sad endings' hard-no bumps sad → fun", () => {
    expect(classify(answers({ genre: "nonfiction", dark: "dark", nope: ["Heavy or sad endings"] })))
      .toBe("nonfiction_fun");
  });
  it("does not bump spicy romance (not a sad shelf)", () => {
    expect(classify(answers({ genre: "romance", spice: "spicy", nope: ["Heavy or sad endings"] })))
      .toBe("romance_spicy");
  });
});

describe("ARCHETYPES", () => {
  it("has an entry for every classify output with a name, shelf, blurb, genreLabel", () => {
    const keys = [
      "mystery_cozy", "mystery_thriller", "romance_clean", "romance_spicy",
      "fantasy_adventure", "fantasy_existential", "nonfiction_fun", "nonfiction_sad",
    ] as const;
    for (const k of keys) {
      expect(ARCHETYPES[k]).toBeDefined();
      expect(ARCHETYPES[k].name.length).toBeGreaterThan(0);
      expect(ARCHETYPES[k].shelf.length).toBeGreaterThan(0);
      expect(ARCHETYPES[k].blurb.length).toBeGreaterThan(0);
      expect(ARCHETYPES[k].genreLabel.length).toBeGreaterThan(0);
    }
  });

  it("uses Kayla's final archetype names", () => {
    expect(ARCHETYPES.mystery_cozy.name).toBe("The Slippered Sleuth");
    expect(ARCHETYPES.romance_spicy.name).toBe("The Bawdy Bookworm");
    expect(ARCHETYPES.fantasy_adventure.name).toBe("The Swashbuckling Sidequester");
    expect(ARCHETYPES.nonfiction_sad.name).toBe("The Earnest Empath");
  });
});
