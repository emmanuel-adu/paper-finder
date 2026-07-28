"use client";

interface SaveButtonProps {
  isSaved: boolean;
  onToggle: () => void;
}

export function SaveButton({ isSaved, onToggle }: SaveButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`rounded-lg border-2 border-ink px-3 py-1.5 text-sm font-medium shadow-[3px_3px_0_var(--ink)] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${
        isSaved ? "bg-coral text-white" : "bg-white text-ink hover:bg-cream"
      }`}
    >
      {isSaved ? "♥ Saved" : "♡ Save"}
    </button>
  );
}
