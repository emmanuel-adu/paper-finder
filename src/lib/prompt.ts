import type { Paper } from "./papers/types";

export function buildSummaryPrompt(paper: Paper): string {
  const authorsLine =
    paper.authors.length > 0 ? paper.authors.join(", ") : "Unknown authors";
  const yearLine = paper.year ?? "Unknown year";
  const abstractLine = paper.abstract?.trim() || "(No abstract available.)";

  return [
    "Please summarize the following research paper. Include:",
    "1. The core methodology used.",
    "2. The key contributions and novel claims.",
    "3. The main results and their significance.",
    "",
    `Title: ${paper.title}`,
    `Authors: ${authorsLine}`,
    `Year: ${yearLine}`,
    `Link: ${paper.sourceUrl}`,
    "",
    "Abstract:",
    abstractLine,
  ].join("\n");
}
