import { embedBatch } from "./embedder";
import type { Paper } from "../papers/types";

function dot(a: Float32Array, b: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

function paperText(paper: Paper): string {
  const abstractSnippet = (paper.abstract ?? "").slice(0, 500);
  // Include authors so a query naming a specific author ("... by Jane Doe")
  // can actually match on that - the embedding model has no other signal
  // linking a name in the query to a paper's author list, since authors
  // aren't part of the title/abstract text otherwise.
  const authors = paper.authors.length > 0 ? paper.authors.join(", ") : "";
  return authors
    ? `${paper.title}. By ${authors}. ${abstractSnippet}`
    : `${paper.title}. ${abstractSnippet}`;
}

// Generous enough for a slow first-time model download, but bounded so a
// stuck download or a wedged worker can't leave the UI waiting forever.
const RERANK_TIMEOUT_MS = 20000;

function timeoutAfter(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Re-rank timed out")), ms);
  });
}

export function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// A general-purpose sentence embedding doesn't reliably weight a proper name
// against topically-dense competitors (verified: a broad "X: Benefits and
// Challenges" survey paper out-scored a narrow paper that was a genuine exact
// match, just because it shares more topic vocabulary with a long query).
// Detect an explicit author-name match and add a large, deterministic bonus
// on top of the embedding score - full-name substring match only (not just
// last name) to avoid false positives from a shared surname.
const AUTHOR_MATCH_BONUS = 2;

export function authorMatchBonus(normalizedQuery: string, paper: Paper): number {
  for (const author of paper.authors) {
    const normalizedAuthor = normalizeForMatch(author);
    if (normalizedAuthor.length > 3 && normalizedQuery.includes(normalizedAuthor)) {
      return AUTHOR_MATCH_BONUS;
    }
  }
  return 0;
}

/**
 * Re-ranks papers by semantic similarity to the query, using a small
 * client-side embedding model (no server round-trip). Never throws - falls
 * back to the original order on any failure or timeout (unsupported
 * browser, blocked network, model load error), so callers can await this
 * without a try/catch.
 */
export async function rerankBySimilarity(
  query: string,
  papers: Paper[],
): Promise<Paper[]> {
  if (papers.length === 0) return papers;

  try {
    const [queryEmbedding, ...paperEmbeddings] = await Promise.race([
      embedBatch([query, ...papers.map(paperText)]),
      timeoutAfter(RERANK_TIMEOUT_MS),
    ]);

    const normalizedQuery = normalizeForMatch(query);

    return papers
      .map((paper, i) => ({
        paper,
        score:
          dot(queryEmbedding, paperEmbeddings[i]) +
          authorMatchBonus(normalizedQuery, paper),
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.paper);
  } catch {
    return papers;
  }
}
