# Repository Guidelines

## Project Structure & Module Organization

This is a Node.js, TypeScript, React, and Ink terminal app using ESM.

- `src/cli.tsx`: CLI entrypoint and environment option parsing.
- `src/App.tsx`: top-level app state, keyboard routing, and dashboard layout.
- `src/components/`: reusable Ink UI components such as header, footer, sidebar, and line renderers.
- `src/screens/`: full-screen views: Explorer, Reader, and Search.
- `src/lib/`: non-React logic for vault indexing, markdown parsing, search, wiki-link resolution, Glow rendering, and ANSI parsing.
- `src/types.ts`: shared application types.
- No test directory exists yet. Add tests under `src/**/*.test.ts` or a future `test/` directory.

## Build, Test, and Development Commands

- `npm install`: install dependencies.
- `npm run dev`: run the Ink app from TypeScript using `tsx`.
- `npm run dev -- /path/to/vault`: run with an explicit Obsidian vault path.
- `npm run build`: compile TypeScript into `dist/`.
- `npm start`: run the compiled CLI from `dist/cli.js`.
- `npm run typecheck`: run TypeScript without emitting files.

There is no `npm test` command yet.

## Coding Style & Naming Conventions

Use strict TypeScript and ESM imports with explicit `.js` extensions for local runtime imports. Keep React/Ink rendering in `components/` and `screens/`; keep filesystem, parsing, and indexing logic in `lib/`.

Use tabs for indentation, matching the existing source. Prefer named exports. Components use `PascalCase` filenames, for example `ReaderScreen.tsx`; library modules use `camelCase`, for example `resolveWikiLink.ts`.

## Testing Guidelines

No test framework is configured. For now, validate changes with:

```bash
npm run typecheck
npm run build
```

When adding tests, prioritize pure functions in `src/lib/`, especially `search`, `tree`, `wikiLinks`, `resolveWikiLink`, and markdown rendering behavior.

## Commit & Pull Request Guidelines

This directory is not currently a Git repository, so no project history convention exists. Use concise imperative commit messages, such as `Add Glow renderer fallback` or `Fix explorer viewport height`.

Pull requests should include a short summary, verification commands run, screenshots or terminal captures for UI changes, and notes for any changed keyboard behavior.

## Configuration Tips

Use `.env` for local settings:

```bash
VAULT_PATH=/path/to/your/obsidian-vault
MARKDOWN_RENDERER=glow
```

Do not commit `.env`. Glow is optional; if unavailable, the Reader falls back to the built-in renderer.
