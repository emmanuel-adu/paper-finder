import { embedBatch } from "./embedder";
import type { Paper } from "../papers/types";

function dot(a: Float32Array, b: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

function paperText(paper: Paper): string {
  const abstractSnippet = (paper.abstract ?? "").slice(0, 500);
  return `${paper.title}. ${abstractSnippet}`;
}

// Generous enough for a slow first-time model download, but bounded so a
// stuck download or a wedged worker can't leave the UI waiting forever.
const RERANK_TIMEOUT_MS = 20000;

function timeoutAfter(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Re-rank timed out")), ms);
  });
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

    return papers
      .map((paper, i) => ({
        paper,
        score: dot(queryEmbedding, paperEmbeddings[i]),
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.paper);
  } catch {
    return papers;
  }
}
