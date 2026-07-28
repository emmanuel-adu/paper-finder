import { describe, expect, it } from "vitest";
import { buildSummaryPrompt } from "./prompt";
import type { Paper } from "./papers/types";

function makePaper(overrides: Partial<Paper> = {}): Paper {
  return {
    id: "id-1",
    title: "Attention Is All You Need",
    authors: ["Ashish Vaswani", "Noam Shazeer"],
    year: 2017,
    abstract: "We propose a new simple network architecture, the Transformer.",
    source: "arxiv",
    sourceUrl: "https://arxiv.org/abs/1706.03762",
    pdfUrl: null,
    doi: null,
    arxivId: "1706.03762",
    ...overrides,
  };
}

describe("buildSummaryPrompt", () => {
  it("includes title, authors, year, link, and abstract", () => {
    const prompt = buildSummaryPrompt(makePaper());

    expect(prompt).toContain("Title: Attention Is All You Need");
    expect(prompt).toContain("Authors: Ashish Vaswani, Noam Shazeer");
    expect(prompt).toContain("Year: 2017");
    expect(prompt).toContain("Link: https://arxiv.org/abs/1706.03762");
    expect(prompt).toContain(
      "We propose a new simple network architecture, the Transformer.",
    );
  });

  it("falls back gracefully when authors, year, and abstract are missing", () => {
    const prompt = buildSummaryPrompt(
      makePaper({ authors: [], year: null, abstract: null }),
    );

    expect(prompt).toContain("Authors: Unknown authors");
    expect(prompt).toContain("Year: Unknown year");
    expect(prompt).toContain("(No abstract available.)");
  });

  it("always asks for methodology, contributions, and results", () => {
    const prompt = buildSummaryPrompt(makePaper());

    expect(prompt).toContain("The core methodology used.");
    expect(prompt).toContain("The key contributions and novel claims.");
    expect(prompt).toContain("The main results and their significance.");
  });
});
