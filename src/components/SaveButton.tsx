"use client";

import { useEffect, useRef, useState } from "react";

interface SaveButtonProps {
  isSaved: boolean;
  onToggle: () => void;
}

export function SaveButton({ isSaved, onToggle }: SaveButtonProps) {
  const [popping, setPopping] = useState(false);
  const wasSaved = useRef(isSaved);

  useEffect(() => {
    if (isSaved && !wasSaved.current) {
      setPopping(true);
      const timer = setTimeout(() => setPopping(false), 300);
      wasSaved.current = isSaved;
      return () => clearTimeout(timer);
    }
    wasSaved.current = isSaved;
  }, [isSaved]);

  return (
    <button
      onClick={onToggle}
      className={`rounded-lg border-2 border-ink px-3 py-1.5 text-sm font-medium shadow-[3px_3px_0_var(--ink)] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${
        isSaved ? "bg-coral text-white" : "bg-surface text-ink hover:bg-surface-hover"
      } ${popping ? "animate-pop" : ""}`}
    >
      {isSaved ? "♥ Saved" : "♡ Save"}
    </button>
  );
}