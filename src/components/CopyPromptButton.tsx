"use client";

import { useState } from "react";
import type { Paper } from "@/lib/papers/types";
import { buildSummaryPrompt } from "@/lib/prompt";
import { copyToClipboard } from "@/lib/clipboard";

export function CopyPromptButton({ paper }: { paper: Paper }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const ok = await copyToClipboard(buildSummaryPrompt(paper));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleClick}
      className="rounded-lg border-2 border-ink bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-[3px_3px_0_var(--ink)] transition hover:bg-cream active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
    >
      {copied ? "Copied! ✓" : "Copy summarize prompt →"}
    </button>
  );
}
