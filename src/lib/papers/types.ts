export type PaperSource = "arxiv" | "semanticscholar" | "crossref";

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  abstract: string | null;
  source: PaperSource;
  sourceUrl: string;
  pdfUrl: string | null;
  doi: string | null;
  arxivId: string | null;
}

export interface SearchResponse {
  papers: Paper[];
  sourcesQueried: PaperSource[];
  sourceErrors: Partial<Record<PaperSource, string>>;
}
