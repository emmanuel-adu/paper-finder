"use client";

import { useRef, useState, type ReactNode } from "react";
import { SearchBar } from "@/components/SearchBar";
import { PaperCard } from "@/components/PaperCard";
import { OwlMascot } from "@/components/OwlMascot";
import { useSavedPapers } from "@/hooks/useSavedPapers";
import { toS2RecommendationId } from "@/lib/papers/semanticScholar";
import type { Paper, PaperSource, SearchResponse } from "@/lib/papers/types";

type Tab = "search" | "recommended" | "saved";
type SortMode = "relevance" | "year";

const SOURCE_LABELS: Record<PaperSource, string> = {
  arxiv: "arXiv",
  semanticscholar: "Semantic Scholar",
  crossref: "Crossref",
};

export default function Page() {
  const [tab, setTab] = useState<Tab>("search");
  const [query, setQuery] = useState("");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [relevancePapers, setRelevancePapers] = useState<Paper[] | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("year");
  const [reranking, setReranking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errors, setErrors] = useState<SearchResponse["sourceErrors"]>({});
  const searchTokenRef = useRef(0);

  const [recommended, setRecommended] = useState<Paper[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const [recFetched, setRecFetched] = useState(false);

  const savedPapers = useSavedPapers();

  async function handleSearch(q: string) {
    const token = ++searchTokenRef.current;

    setQuery(q);
    setLoading(true);
    setSearched(true);
    setTab("search");
    setSortMode("year");
    setRelevancePapers(null);

    let results: Paper[] = [];
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data: SearchResponse = await res.json();
      results = data.papers;
      setPapers(data.papers);
      setErrors(data.sourceErrors);
    } catch {
      setPapers([]);
      setErrors({});
    } finally {
      setLoading(false);
    }

    if (results.length === 0) return;

    // Re-rank by semantic relevance in the background, entirely client-side -
    // never blocks the initial (year-sorted) results from showing immediately.
    setReranking(true);
    try {
      const { rerankBySimilarity } = await import("@/lib/embeddings/rerank");
      const reranked = await rerankBySimilarity(q, results);
      if (searchTokenRef.current === token) {
        setRelevancePapers(reranked);
        setSortMode("relevance");
      }
    } catch {
      // Model unavailable (unsupported browser, blocked network, etc.) -
      // silently stay on year sort, no error shown to the user.
    } finally {
      if (searchTokenRef.current === token) setReranking(false);
    }
  }

  async function handleOpenRecommended() {
    setTab("recommended");
    if (savedPapers.saved.length === 0) return;

    setRecLoading(true);
    setRecError(null);
    try {
      const paperIds = savedPapers.saved
        .map(toS2RecommendationId)
        .filter((id): id is string => Boolean(id));

      if (paperIds.length === 0) {
        setRecommended([]);
        setRecError(
          "None of your saved papers could be matched for recommendations yet.",
        );
        return;
      }

      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperIds }),
      });
      const data = await res.json();
      setRecommended(data.papers ?? []);
    } catch {
      setRecError("Couldn't reach the recommendations service just now.");
    } finally {
      setRecLoading(false);
      setRecFetched(true);
    }
  }

  const errorEntries = Object.entries(errors) as [PaperSource, string][];
  const displayedPapers =
    sortMode === "relevance" && relevancePapers ? relevancePapers : papers;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <header className="mb-8 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <OwlMascot pose="mark" className="h-12 w-12" />
          <div>
            <h1 className="font-display text-3xl font-bold">Paper Finder</h1>
            <p className="text-sm text-ink/60">
              Search arXiv, Semantic Scholar, and Crossref at once. No login,
              ever.
            </p>
          </div>
        </div>
        <a
          href="https://github.com/emmanuel-adu/paper-finder"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg border-2 border-ink bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-[3px_3px_0_var(--ink)] transition hover:bg-cream"
        >
          View on GitHub ↗
        </a>
      </header>

      <SearchBar onSearch={handleSearch} loading={loading} />

      <nav className="my-6 flex gap-6 border-b-2 border-ink/10">
        <TabButton active={tab === "search"} onClick={() => setTab("search")}>
          Search{query ? ` (${papers.length})` : ""}
        </TabButton>
        <TabButton
          active={tab === "recommended"}
          onClick={handleOpenRecommended}
        >
          Recommended
        </TabButton>
        <TabButton active={tab === "saved"} onClick={() => setTab("saved")}>
          Saved ({savedPapers.hydrated ? savedPapers.saved.length : "..."})
        </TabButton>
      </nav>

      {tab === "search" && errorEntries.length > 0 && (
        <p className="mb-4 rounded-lg border-2 border-coral/40 bg-coral/10 px-4 py-2 text-sm">
          Couldn&apos;t reach{" "}
          {errorEntries.map(([s]) => SOURCE_LABELS[s]).join(", ")} just now -
          the other sources still came through.
        </p>
      )}

      {tab === "search" && !loading && papers.length > 0 && (
        <div className="mb-4 flex items-center gap-3 text-sm">
          <span className="text-ink/50">Sort by:</span>
          <div className="flex gap-2">
            <SortPill
              active={sortMode === "relevance"}
              disabled={!relevancePapers}
              onClick={() => relevancePapers && setSortMode("relevance")}
            >
              Relevance
            </SortPill>
            <SortPill
              active={sortMode === "year"}
              disabled={false}
              onClick={() => setSortMode("year")}
            >
              Year
            </SortPill>
          </div>
          {reranking && (
            <span className="text-ink/40">Improving ranking...</span>
          )}
        </div>
      )}

      <div className="space-y-4">
        {tab === "search" && (
          <>
            {loading && (
              <LoadingState text="Digging through arXiv, Semantic Scholar, and Crossref..." />
            )}
            {!loading &&
              displayedPapers.map((paper, i) => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  index={i}
                  savedPapers={savedPapers}
                />
              ))}
            {!loading && searched && papers.length === 0 && (
              <EmptyState text="Nothing turned up for that search - try a different phrase." />
            )}
            {!searched && !loading && (
              <EmptyState text="Type a topic above to get started." />
            )}
          </>
        )}

        {tab === "recommended" && (
          <>
            {recLoading && (
              <LoadingState text="Finding papers like the ones you've saved..." />
            )}
            {!recLoading &&
              savedPapers.hydrated &&
              savedPapers.saved.length === 0 && (
                <EmptyState text="Save a few papers you like to get recommendations." />
              )}
            {!recLoading && recError && <EmptyState text={recError} />}
            {!recLoading &&
              !recError &&
              recommended.map((paper, i) => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  index={i}
                  savedPapers={savedPapers}
                />
              ))}
            {!recLoading &&
              !recError &&
              recFetched &&
              recommended.length === 0 &&
              savedPapers.saved.length > 0 && (
                <EmptyState text="No recommendations came back this time - try saving a few more papers." />
              )}
          </>
        )}

        {tab === "saved" && (
          <>
            {savedPapers.hydrated && savedPapers.saved.length === 0 && (
              <EmptyState text="Nothing saved yet - go find something worth reading." />
            )}
            {savedPapers.saved.map((paper, i) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                index={i}
                savedPapers={savedPapers}
              />
            ))}
          </>
        )}
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-0.5 border-b-4 px-1 pb-3 text-sm font-medium transition ${
        active
          ? "border-coral text-ink"
          : "border-transparent text-ink/50 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function SortPill({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border-2 border-ink px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-coral text-white" : "bg-white text-ink hover:bg-cream"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <OwlMascot pose="shrug" className="h-20 w-20" />
      <p className="text-ink/60">{text}</p>
    </div>
  );
}

function LoadingState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <OwlMascot pose="searching" className="h-20 w-20" />
      <p className="text-ink/60">{text}</p>
    </div>
  );
}
