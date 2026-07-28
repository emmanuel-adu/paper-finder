"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Paper } from "@/lib/papers/types";

const STORAGE_KEY = "paperfinder:saved:v1";
const EMPTY_SNAPSHOT: Paper[] = [];

let cached: Paper[] | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): Paper[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Paper[]) : [];
  } catch {
    return [];
  }
}

function getSnapshot(): Paper[] {
  if (cached === null) {
    cached = readFromStorage();
  }
  return cached;
}

function getServerSnapshot(): Paper[] {
  return EMPTY_SNAPSHOT;
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function writeSaved(papers: Paper[]): void {
  cached = papers;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
  } catch {
    // storage full or disabled (e.g. private mode) - in-memory cache still
    // updates for this session, just doesn't survive a reload
  }
  listeners.forEach((listener) => listener());
}

export function useSavedPapers() {
  const saved = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const hydrated = saved !== EMPTY_SNAPSHOT;

  const isSaved = useCallback(
    (id: string) => saved.some((p) => p.id === id),
    [saved],
  );

  const save = useCallback(
    (paper: Paper) => {
      writeSaved([paper, ...saved.filter((p) => p.id !== paper.id)]);
    },
    [saved],
  );

  const unsave = useCallback(
    (id: string) => {
      writeSaved(saved.filter((p) => p.id !== id));
    },
    [saved],
  );

  const toggle = useCallback(
    (paper: Paper) => {
      if (isSaved(paper.id)) {
        unsave(paper.id);
      } else {
        save(paper);
      }
    },
    [isSaved, save, unsave],
  );

  return { saved, hydrated, isSaved, save, unsave, toggle };
}
