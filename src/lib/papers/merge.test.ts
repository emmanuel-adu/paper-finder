import { describe, expect, it } from "vitest";
import { mergeResults } from "./merge";
import type { Paper } from "./types";

function makePaper(overrides: Partial<Paper> = {}): Paper {
  return {
    id: "id-1",
    title: "A Paper Title",
    authors: ["Jane Doe"],
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

describe("mergeResults", () => {
  it("dedups papers with a matching DOI regardless of case", () => {
    const a = makePaper({
      id: "a",
      title: "Same Paper",
      doi: "10.1234/ABC",
      source: "crossref",
    });
    const b = makePaper({
      id: "b",
      title: "Same Paper (via S2)",
      doi: "10.1234/abc",
      source: "semanticscholar",
    });

    const result = mergeResults([a, b]);
    expect(result).toHaveLength(1);
  });

  it("dedups papers with a matching arXiv ID", () => {
    const a = makePaper({ id: "a", arxivId: "2301.00001", source: "arxiv" });
    const b = makePaper({
      id: "b",
      title: "Different-looking title",
      arxivId: "2301.00001",
      source: "semanticscholar",
    });

    const result = mergeResults([a, b]);
    expect(result).toHaveLength(1);
  });

  it("dedups by normalized title when years are within 1 and no shared identifier exists", () => {
    const a = makePaper({
      id: "a",
      title: "Vertical Federated Learning: A Survey!",
      year: 2024,
    });
    const b = makePaper({
      id: "b",
      title: "vertical federated learning a survey",
      year: 2025,
    });

    const result = mergeResults([a, b]);
    expect(result).toHaveLength(1);
  });

  it("does not merge distinct papers with different titles and no shared identifier", () => {
    const a = makePaper({ id: "a", title: "Paper One" });
    const b = makePaper({ id: "b", title: "Paper Two" });

    const result = mergeResults([a, b]);
    expect(result).toHaveLength(2);
  });

  it("keeps the richest fields when merging duplicates", () => {
    const sparse = makePaper({
      id: "a",
      doi: "10.1/x",
      abstract: null,
      pdfUrl: null,
      source: "crossref",
    });
    const rich = makePaper({
      id: "b",
      doi: "10.1/x",
      abstract: "A detailed abstract.",
      pdfUrl: "https://arxiv.org/pdf/1234",
      source: "arxiv",
    });

    const [merged] = mergeResults([sparse, rich]);
    expect(merged.abstract).toBe("A detailed abstract.");
    expect(merged.pdfUrl).toBe("https://arxiv.org/pdf/1234");
  });

  it("prefers a non-semanticscholar sourceUrl when merging with a semanticscholar duplicate", () => {
    const s2First = makePaper({
      id: "a",
      arxivId: "2301.00001",
      source: "semanticscholar",
      sourceUrl: "https://www.semanticscholar.org/paper/abc",
    });
    const arxivSecond = makePaper({
      id: "b",
      arxivId: "2301.00001",
      source: "arxiv",
      sourceUrl: "https://arxiv.org/abs/2301.00001",
    });

    const [merged] = mergeResults([s2First, arxivSecond]);
    expect(merged.source).toBe("arxiv");
    expect(merged.sourceUrl).toBe("https://arxiv.org/abs/2301.00001");
  });

  it("sorts by year descending, then title ascending", () => {
    const older = makePaper({ id: "a", title: "Zeta Paper", year: 2020 });
    const newer = makePaper({ id: "b", title: "Alpha Paper", year: 2024 });
    const sameYearA = makePaper({ id: "c", title: "Beta Paper", year: 2024 });

    const result = mergeResults([older, newer, sameYearA]);
    expect(result.map((p) => p.title)).toEqual([
      "Alpha Paper",
      "Beta Paper",
      "Zeta Paper",
    ]);
  });
});
