import type { Paper } from "./types";

const S2_SEARCH_ENDPOINT = "https://api.semanticscholar.org/graph/v1/paper/search";
const S2_FIELDS = "title,abstract,authors,year,externalIds,openAccessPdf,url";

export interface S2Paper {
  paperId: string;
  title: string;
  abstract: string | null;
  year: number | null;
  authors: { name: string }[];
  externalIds?: { DOI?: string; ArXiv?: string };
  openAccessPdf?: { url: string } | null;
  url: string;
}

export function mapSemanticScholarPaper(p: S2Paper): Paper {
  const doi = p.externalIds?.DOI ?? null;
  const arxivId = p.externalIds?.ArXiv ?? null;
  return {
    id: doi
      ? `doi:${doi.toLowerCase()}`
      : arxivId
        ? `arxiv:${arxivId}`
        : `s2:${p.paperId}`,
    title: p.title,
    authors: (p.authors ?? []).map((a) => a.name),
    year: p.year ?? null,
    abstract: p.abstract ?? null,
    source: "semanticscholar",
    sourceUrl: p.url ?? `https://www.semanticscholar.org/paper/${p.paperId}`,
    pdfUrl: p.openAccessPdf?.url || null,
    doi,
    arxivId,
  };
}

export function toS2RecommendationId(paper: Paper): string | null {
  if (paper.source === "semanticscholar" && paper.id.startsWith("s2:")) {
    return paper.id.slice("s2:".length);
  }
  if (paper.doi) return `DOI:${paper.doi}`;
  if (paper.arxivId) return `ARXIV:${paper.arxivId}`;
  return null;
}

export async function searchSemanticScholar(
  query: string,
  signal: AbortSignal,
): Promise<Paper[]> {
  const url = `${S2_SEARCH_ENDPOINT}?query=${encodeURIComponent(query)}&fields=${S2_FIELDS}&limit=20`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Semantic Scholar HTTP ${res.status}`);
  const data = await res.json();
  const papers: S2Paper[] = data.data ?? [];
  return papers.map(mapSemanticScholarPaper);
}
