import { describe, expect, it } from "vitest";
import { authorMatchBonus, normalizeForMatch } from "./rerank";
import type { Paper } from "../papers/types";

function makePaper(overrides: Partial<Paper> = {}): Paper {
  return {
    id: "id-1",
    title: "Some Paper Title",
    authors: ["Emmanuel Adu"],
    year: 2024,
    abstract: null,
    source: "arxiv",
    sourceUrl: "https://arxiv.org/abs/1234.5678",
    pdfUrl: null,
    doi: null,
    arxivId: null,
    ...overrides,
  };
}

describe("authorMatchBonus", () => {
  it("awards the bonus when the query contains the full author name", () => {
    const query = normalizeForMatch(
      "evaluating regenerative nuclear thermal propulsion by Emmanuel Adu",
    );
    expect(authorMatchBonus(query, makePaper())).toBeGreaterThan(0);
  });

  it("does not award the bonus for a last-name-only match (avoids false positives on a shared surname)", () => {
    const query = normalizeForMatch("papers by Adu on propulsion");
    expect(authorMatchBonus(query, makePaper())).toBe(0);
  });

  it("does not award the bonus when no author is mentioned", () => {
    const query = normalizeForMatch("nuclear thermal propulsion cooling channels");
    expect(authorMatchBonus(query, makePaper())).toBe(0);
  });

  it("matches against any author in a multi-author paper", () => {
    const paper = makePaper({
      authors: ["Jane Smith", "Emmanuel Adu", "Alex Lee"],
    });
    const query = normalizeForMatch("something by Emmanuel Adu");
    expect(authorMatchBonus(query, paper)).toBeGreaterThan(0);
  });

  it("is case- and punctuation-insensitive", () => {
    const query = normalizeForMatch("work from EMMANUEL, ADU!!");
    expect(authorMatchBonus(query, makePaper())).toBeGreaterThan(0);
  });
});
