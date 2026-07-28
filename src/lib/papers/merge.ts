import type { Paper } from "./types";

function normalizeTitle(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function keyFor(p: Paper): string | null {
  if (p.doi) return `doi:${p.doi.toLowerCase()}`;
  if (p.arxivId) return `arxiv:${p.arxivId}`;
  return null;
}

export function mergeResults(papers: Paper[]): Paper[] {
  const byKey = new Map<string, Paper>();
  const byTitleYear = new Map<string, Paper>();
  const output: Paper[] = [];

  for (const paper of papers) {
    const key = keyFor(paper);
    let existing: Paper | undefined;

    if (key && byKey.has(key)) {
      existing = byKey.get(key);
    } else {
      const titleKey = normalizeTitle(paper.title);
      const candidate = byTitleYear.get(titleKey);
      if (
        candidate &&
        paper.year != null &&
        candidate.year != null &&
        Math.abs(paper.year - candidate.year) <= 1
      ) {
        existing = candidate;
      }
    }

    if (existing) {
      existing.abstract ||= paper.abstract;
      existing.pdfUrl ||= paper.pdfUrl;
      existing.doi ||= paper.doi;
      existing.arxivId ||= paper.arxivId;
      if (
        existing.source === "semanticscholar" &&
        paper.source !== "semanticscholar"
      ) {
        existing.sourceUrl = paper.sourceUrl;
        existing.source = paper.source;
      }
    } else {
      const copy = { ...paper };
      output.push(copy);
      if (key) byKey.set(key, copy);
      byTitleYear.set(normalizeTitle(copy.title), copy);
    }
  }

  return output.sort((a, b) => {
    const yearDiff = (b.year ?? 0) - (a.year ?? 0);
    if (yearDiff !== 0) return yearDiff;
    return a.title.localeCompare(b.title);
  });
}
