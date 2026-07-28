import { UpstreamHttpError } from "./errors";

// Semantic Scholar's authenticated tier caps at 1 request/second cumulative
// across all endpoints - wait slightly over a second so a retry reliably
// lands in the next window rather than racing the boundary.
const RETRY_DELAY_MS = 1100;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches a URL, retrying once (after a short delay) specifically on a 429
 * response - a shared unauthenticated rate-limit pool can succeed on a
 * near-immediate retry even though the first attempt was rejected.
 * Throws UpstreamHttpError on any non-ok response after retries are exhausted.
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  sourceLabel: string,
): Promise<Response> {
  let res = await fetch(url, init);

  if (res.status === 429) {
    await sleep(RETRY_DELAY_MS);
    res = await fetch(url, init);
  }

  if (!res.ok) {
    throw new UpstreamHttpError(res.status, `${sourceLabel} HTTP ${res.status}`);
  }

  return res;
}
