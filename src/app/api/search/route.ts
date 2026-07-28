import { NextRequest, NextResponse } from "next/server";
import { searchArxiv } from "@/lib/papers/arxiv";
import { searchSemanticScholar } from "@/lib/papers/semanticScholar";
import { searchCrossref } from "@/lib/papers/crossref";
import { mergeResults } from "@/lib/papers/merge";
import { simplifyQuery } from "@/lib/papers/simplifyQuery";
import { UpstreamHttpError } from "@/lib/papers/errors";
import type { Paper, PaperSource, SearchResponse } from "@/lib/papers/types";

export const dynamic = "force-dynamic";

const TIMEOUT_MS = 8000;

function withTimeout<T>(
  run: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return run(controller.signal).finally(() => clearTimeout(timer));
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json(
      { error: "Missing query parameter 'q'" },
      { status: 400 },
    );
  }

  // arXiv/Semantic Scholar/Crossref do keyword matching, not semantic search -
  // strip filler words so a loosely-described paper ("a model that only uses
  // attention, no recurrence, for sequence transduction") matches on its
  // actual content terms instead of being diluted by "a", "that", "for", etc.
  // The original `q` (unsimplified) is still what the client re-ranks against.
  const simplifiedQ = simplifyQuery(q);

  const sources: { name: PaperSource; run: () => Promise<Paper[]> }[] = [
    { name: "arxiv", run: () => withTimeout((s) => searchArxiv(simplifiedQ, s)) },
    {
      name: "semanticscholar",
      run: () => withTimeout((s) => searchSemanticScholar(simplifiedQ, s)),
    },
    {
      name: "crossref",
      run: () => withTimeout((s) => searchCrossref(simplifiedQ, s)),
    },
  ];

  const settled = await Promise.allSettled(sources.map((s) => s.run()));

  const allPapers: Paper[] = [];
  const sourceErrors: Partial<Record<PaperSource, string>> = {};

  settled.forEach((result, i) => {
    const name = sources[i].name;
    if (result.status === "fulfilled") {
      allPapers.push(...result.value);
    } else if (
      result.reason instanceof UpstreamHttpError &&
      result.reason.status === 429
    ) {
      // Rate-limited on a free/unauthenticated tier - expected under load,
      // not a noteworthy outage. Degrade silently rather than alarming the
      // user; the other sources' results still come through.
    } else {
      sourceErrors[name] =
        result.reason instanceof Error
          ? result.reason.message
          : "Unknown error";
    }
  });

  const body: SearchResponse = {
    papers: mergeResults(allPapers),
    sourcesQueried: sources.map((s) => s.name),
    sourceErrors,
  };

  return NextResponse.json(body);
}
