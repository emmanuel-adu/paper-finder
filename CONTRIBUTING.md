# Contributing

Thanks for considering a contribution to Paper Finder.

## Setup

```bash
git clone https://github.com/emmanuel-adu/paper-finder.git
cd paper-finder
npm install
cp .env.example .env.local   # fill in CROSSREF_MAILTO at minimum
npm run dev
```

## Before opening a PR

Run these locally and make sure they all pass - the same checks run in CI on every PR:

```bash
npm run lint
npm test
npm run build
```

When a PR completes an existing issue, include a GitHub closing keyword in the PR description so the issue is linked and automatically closed after merge:

```md
Closes #123
```

`Fixes #123` and `Resolves #123` also work. If the change intentionally has no issue, use `Issue: N/A` and briefly explain why.

## Guidelines

- Keep changes scoped - prefer several small PRs over one large one.
- Match the existing patterns: source adapters live in `src/lib/papers/`, each normalizing into the shared `Paper` type in `src/lib/papers/types.ts`; UI components are plain Tailwind, no component library.
- Add or update tests for anything in `src/lib/` that has non-trivial logic (see `src/lib/papers/merge.test.ts` for an example).
- If you're adding a new upstream data source, follow the pattern in `src/lib/papers/crossref.ts` or `arxiv.ts`: a `search<Source>(query, signal)` function returning `Paper[]`, wired into `src/app/api/search/route.ts`'s `Promise.allSettled` fan-out.

## Reporting issues

Open a GitHub issue with steps to reproduce. If it's a search-quality issue (bad dedup, missing results), include the query you used.

Be respectful and constructive - this is a small personal/portfolio project, not a company, but the same courtesy applies.