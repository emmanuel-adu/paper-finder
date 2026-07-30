"use client";

import { useState, type FormEvent } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

export function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Vertical Federated Learning, diffusion models, ..."
        className="flex-1 rounded-lg border-2 border-ink bg-surface px-4 py-2.5 text-ink placeholder:text-ink/50 focus:outline-none focus:ring-2 focus:ring-coral"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg border-2 border-ink bg-coral px-5 py-2.5 font-medium text-white shadow-[3px_3px_0_var(--ink)] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-60"
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}