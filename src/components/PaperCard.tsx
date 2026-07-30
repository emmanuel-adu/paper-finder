"use client";

import { useState } from "react";
import type { Paper, PaperSource } from "@/lib/papers/types";
import type { useSavedPapers } from "@/hooks/useSavedPapers";
import { SaveButton } from "./SaveButton";
import { CopyPromptButton } from "./CopyPromptButton";
import { ExternalLinkIcon } from "./Icons";

const SOURCE_LABELS: Record<PaperSource, string> = {
  arxiv: "arXiv",
  semanticscholar: "Semantic Scholar",
  crossref: "Crossref",
};

const SOURCE_STYLES: Record<PaperSource, string> = {
  arxiv: "bg-coral/15 text-coral border-coral",
  semanticscholar: "bg-navy/15 text-navy border-navy",
  crossref: "bg-ink/10 text-ink border-ink",
};

interface PaperCardProps {
  paper: Paper;
  index: number;
  savedPapers: ReturnType<typeof useSavedPapers>;
}

export function PaperCard({ paper, index, savedPapers }: PaperCardProps) {
  const [expanded, setExpanded] = useState(false);
  const rotate = index % 2 === 0 ? "rotate-[-0.4deg]" : "rotate-[0.4deg]";
  const abstract = paper.abstract ?? "";
  const isLong = abstract.length > 280;
  const displayAbstract =
    !expanded && isLong ? abstract.slice(0, 280) + "..." : abstract;

  return (
    <div
      className={`${rotate} hover:-translate-y-1 hover:rotate-0 rounded-xl border-2 border-ink bg-surface p-5 shadow-[4px_4px_0_var(--ink)] transition hover:shadow-[6px_6px_0_var(--ink)]`}
    >
      <div className="flex items-start justify-between gap-3">
        <a
          href={paper.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-display text-lg font-semibold leading-snug hover:underline"
        >
          {paper.title}
        </a>
        <span
          className={`shrink-0 rounded-full border-2 px-2 py-0.5 text-xs font-medium ${SOURCE_STYLES[paper.source]}`}
        >
          {SOURCE_LABELS[paper.source]}
        </span>
      </div>

      <p className="mt-1 text-sm text-ink/70">
        {paper.authors.length > 0
          ? paper.authors.join(", ")
          : "Unknown authors"}
        {paper.year ? ` · ${paper.year}` : ""}
      </p>

      {abstract && (
        <p className="mt-3 text-sm leading-relaxed text-ink/90">
          {displayAbstract}
          {isLong && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="ml-1 font-medium text-navy hover:underline"
            >
              {expanded ? "show less" : "show more"}
            </button>
          )}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SaveButton
          isSaved={savedPapers.isSaved(paper.id)}
          onToggle={() => savedPapers.toggle(paper)}
        />
        <CopyPromptButton paper={paper} />
        {paper.pdfUrl && (
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-navy hover:underline"
          >
            PDF
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
