# Contributing

Thanks for helping improve Obsidian TUI Reader. This project is a read-only terminal UI for browsing and reading Obsidian vaults.

## Before You Start

- Use Node.js 20 or newer.
- Keep Stage 1 read-only. Do not add editing, deleting, renaming, or moving notes unless that scope is explicitly approved.
- Prefer small, focused pull requests.
- Avoid new dependencies unless they remove meaningful complexity or unlock a planned feature.

## Development Setup

```bash
npm install
npm run dev -- /path/to/your/obsidian-vault
```

For local `.env` configuration:

```bash
VAULT_PATH=/path/to/your/obsidian-vault
MARKDOWN_RENDERER=internal
```

## Code Guidelines

- Keep React/Ink UI in `src/components/` and `src/screens/`.
- Keep filesystem, parsing, search, and link resolution logic in `src/lib/`.
- Use strict TypeScript and ESM imports with explicit `.js` extensions for local runtime imports.
- Preserve the current tab indentation style.
- Keep terminal UI behavior keyboard-first and usable in small terminals.

## Required Checks

Run these before opening a pull request:

```bash
npm run typecheck
npm run build
```

CI runs the same checks for pull requests and pushes to `main`.

## Pull Requests

- Describe the user-facing change.
- Include screenshots or terminal recordings for layout changes when useful.
- Mention any keyboard shortcut changes.
- Update `README.md` when usage, installation, or configuration changes.
- Link related issues when applicable.

## Issues

For bugs, include your OS, terminal app, Node version, command used, and a short reproduction. For feature requests, describe the workflow and why it belongs in the TUI.
