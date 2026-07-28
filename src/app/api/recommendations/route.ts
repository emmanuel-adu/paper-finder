import { NextRequest, NextResponse } from "next/server";
import { mapSemanticScholarPaper, S2Paper } from "@/lib/papers/semanticScholar";
import type { Paper } from "@/lib/papers/types";

export const dynamic = "force-dynamic";

const S2_RECOMMENDATIONS_ENDPOINT =
  "https://api.semanticscholar.org/recommendations/v1/papers/";
const S2_FIELDS = "title,abstract,authors,year,externalIds,openAccessPdf,url";

interface RecommendationsRequestBody {
  paperIds: string[];
}

export async function POST(req: NextRequest) {
  let body: RecommendationsRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const paperIds = (body.paperIds ?? []).filter(Boolean);
  if (paperIds.length === 0) {
    return NextResponse.json({ papers: [] as Paper[] });
  }

  const url = `${S2_RECOMMENDATIONS_ENDPOINT}?fields=${S2_FIELDS}&limit=20`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ positivePaperIds: paperIds }),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Semantic Scholar recommendations HTTP ${res.status}` },
      { status: 502 },
    );
  }

  const data = await res.json();
  const recommended: S2Paper[] = data.recommendedPapers ?? [];
  const papers: Paper[] = recommended.map(mapSemanticScholarPaper);

  return NextResponse.json({ papers });
}
