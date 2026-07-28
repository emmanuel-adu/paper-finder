import type { Paper } from "./types";

const CROSSREF_ENDPOINT = "https://api.crossref.org/works";

interface CrossrefItem {
  DOI: string;
  title?: string[];
  author?: { given?: string; family?: string }[];
  URL: string;
  abstract?: string;
  published?: { "date-parts"?: number[][] };
  issued?: { "date-parts"?: number[][] };
}

function stripJatsTags(s: string): string {
  return s.replace(/<[^>]+>/g, "").trim();
}

export async function searchCrossref(
  query: string,
  signal: AbortSignal,
): Promise<Paper[]> {
  const mailto = process.env.CROSSREF_MAILTO;
  const mailtoParam = mailto ? `&mailto=${encodeURIComponent(mailto)}` : "";
  const url = `${CROSSREF_ENDPOINT}?query=${encodeURIComponent(query)}&rows=20${mailtoParam}`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Crossref HTTP ${res.status}`);
  const data = await res.json();
  const items: CrossrefItem[] = data.message?.items ?? [];

  return items
    .filter((it) => it.title?.[0])
    .map((it): Paper => {
      const year =
        it.published?.["date-parts"]?.[0]?.[0] ??
        it.issued?.["date-parts"]?.[0]?.[0] ??
        null;
      return {
        id: `doi:${it.DOI.toLowerCase()}`,
        title: it.title![0],
        authors: (it.author ?? [])
          .map((a) => [a.given, a.family].filter(Boolean).join(" "))
          .filter(Boolean),
        year,
        abstract: it.abstract ? stripJatsTags(it.abstract) : null,
        source: "crossref",
        sourceUrl: it.URL,
        pdfUrl: null,
        doi: it.DOI,
        arxivId: null,
      };
    });
}
