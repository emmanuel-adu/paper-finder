import { XMLParser } from "fast-xml-parser";
import type { Paper } from "./types";

const ARXIV_ENDPOINT = "http://export.arxiv.org/api/query";

function clean(text: unknown): string {
  return String(text ?? "")
    // arXiv abstracts/titles often carry raw LaTeX markup, e.g. "{\em foo}" or
    // "\textbf{foo}" - unwrap the common emphasis commands to plain text.
    .replace(/\\text(it|bf)\{([^{}]*)\}/g, "$2")
    .replace(/\\(em|it|bf|itshape|bfseries)\b\s*/g, "")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function searchArxiv(
  query: string,
  signal: AbortSignal,
): Promise<Paper[]> {
  const url =
    `${ARXIV_ENDPOINT}?search_query=${encodeURIComponent(`all:${query}`)}` +
    `&start=0&max_results=20&sortBy=relevance&sortOrder=descending`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`arXiv HTTP ${res.status}`);
  const xml = await res.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  const parsed = parser.parse(xml);
  const feed = parsed.feed;
  if (!feed?.entry) return [];

  const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry];

  return entries.map((e: Record<string, unknown>): Paper => {
    const rawId = String(e.id);
    const arxivId = rawId.split("/abs/")[1]?.replace(/v\d+$/, "") ?? rawId;

    const authorsRaw = e.author
      ? Array.isArray(e.author)
        ? e.author
        : [e.author]
      : [];
    const links = e.link
      ? Array.isArray(e.link)
        ? e.link
        : [e.link]
      : [];
    const pdfLink = (
      links as Array<Record<string, string>>
    ).find((l) => l["@_title"] === "pdf");

    return {
      id: `arxiv:${arxivId}`,
      title: clean(e.title),
      authors: (authorsRaw as Array<{ name?: string }>)
        .map((a) => a?.name)
        .filter((n): n is string => Boolean(n)),
      year: e.published
        ? new Date(String(e.published)).getFullYear()
        : null,
      abstract: e.summary ? clean(e.summary) : null,
      source: "arxiv",
      sourceUrl: `https://arxiv.org/abs/${arxivId}`,
      pdfUrl: pdfLink?.["@_href"] ?? `https://arxiv.org/pdf/${arxivId}`,
      doi: typeof e["arxiv:doi"] === "string" ? e["arxiv:doi"] : null,
      arxivId,
    };
  });
}
