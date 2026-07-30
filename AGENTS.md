# Agent Guide

Hey! If you're an AI coding agent helping someone contribute to Paper Finder, welcome - here's what you need to know to be useful fast. Human contributors will find this handy too; see [CONTRIBUTING.md](CONTRIBUTING.md) for the PR process.

## What this is

A free, no-login research paper finder - searches arXiv, Semantic Scholar, and Crossref at once, merges and dedupes the results, and never calls an LLM server-side (summarization is copy-a-prompt-into-your-own-LLM). Full pitch and feature list in [README.md](README.md). Live at https://paperfinder.dev.

## Commands

```bash
npm run dev     # local dev server
npm run lint    # eslint
npm test        # vitest (pure-logic unit tests, no network calls)
npm run build   # production build - run this before considering any change done
```

All four run in CI on every push/PR (`.github/workflows/ci.yml`). Run them locally before opening a PR.

## Pull requests and issue linking

When working on an existing GitHub issue, every pull request must link and close that issue from the PR description using a GitHub closing keyword:

```md
Closes #123
Fixes #123
Resolves #123
```

Use the issue number for the work being completed. Do not use only `Related to #123` when the PR fully resolves the issue, because that does not close the issue after merge.

Before opening a PR:

1. Confirm the correct issue number.
2. Add `Closes #<issue-number>` to the PR description.
3. Include a concise summary and testing notes.
4. Confirm the PR targets the default branch.

For work that intentionally has no issue, write `Issue: N/A` and explain why in the PR description.

## Where things live

- `src/lib/papers/types.ts` - the shared `Paper` shape every source normalizes into.
- `src/lib/papers/{arxiv,semanticScholar,crossref}.ts` - one adapter per upstream API. Each exports `search<Source>(query, signal): Promise<Paper[]>`.
- `src/lib/papers/merge.ts` - dedup (DOI → arXiv ID → normalized title) and ranking.
- `src/lib/papers/fetchWithRetry.ts` + `errors.ts` - shared retry-on-429 fetch wrapper and typed upstream errors.
- `src/app/api/search/route.ts` - fans the three adapters out in parallel (`Promise.allSettled`, per-source timeout).
- `src/app/api/recommendations/route.ts` - forwards saved-paper IDs to Semantic Scholar's Recommendations API.
- `src/hooks/useSavedPapers.ts` - `localStorage`-backed saved list (`useSyncExternalStore`, no accounts, no backend).
- `src/lib/embeddings/{embedder,rerank}.ts` - client-side sentence-embedding model that re-ranks search results by relevance; dynamically imported so it never touches the initial page bundle.
- `src/components/` - plain Tailwind, no component library. `OwlMascot.tsx` is the mascot (poses: `searching`, `shrug`, `happy`, `mark`).

## Conventions worth following

- **Adding a data source**: mirror `crossref.ts` - a `search<Source>(query, signal)` function returning `Paper[]`, wired into the `Promise.allSettled` fan-out in `route.ts`. Use `fetchWithRetry` for the actual fetch.
- **Tests**: Vitest, pure functions only (`merge.test.ts`, `prompt.test.ts`, `arxiv.test.ts` are the examples). No mocked servers or live network calls in tests - if something needs a network call to test, extract the pure part first (see how `arxiv.ts` separates `parseArxivFeed` from `searchArxiv`).
- **Design tokens**: colors (`cream`/`ink`/`coral`/`navy`) and fonts are defined once in `src/app/globals.css`'s `@theme` block (Tailwind v4, CSS-first config - there is no `tailwind.config.ts`). Don't hardcode hex values in components.
- **No accounts, no server-side LLM calls, no database** - these are load-bearing product decisions, not oversights. Features should work within that constraint (see README's "Why this exists").
- Keep PRs scoped - several small ones beat one large one.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->