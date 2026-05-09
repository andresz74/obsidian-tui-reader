# Obsidian TUI Reader

A read-only terminal app for browsing, searching, and reading an Obsidian vault.

The app is built with Node.js, TypeScript, React, Ink, ESM, and npm. Stage 1 is intentionally read-only: it indexes markdown files, renders notes in the terminal, supports basic search, and lets you follow simple Obsidian wiki links.

## Features

- Open a local Obsidian vault folder.
- Recursively index markdown notes.
- Ignore `.obsidian`, `.git`, `node_modules`, and `.trash`.
- Browse folders and markdown notes.
- Read markdown notes in a terminal-friendly reader.
- Search title, filename, relative path, tags, and content.
- Highlight and open outgoing `[[wiki links]]`.
- Dashboard layout with header, left navigation, main content panel, and footer.
- `Tab` focus switching between navigation and content.
- Optional Glow-backed markdown rendering.
- Load a default vault from `.env`.
- Skip unreadable nested files/folders and continue indexing readable notes.

## Installation

Install dependencies:

```bash
npm install
```

## Running In Development

Run with an explicit vault path:

```bash
npm run dev -- /path/to/your/obsidian-vault
```

Or create a local `.env` file:

```bash
VAULT_PATH=/path/to/your/obsidian-vault
MARKDOWN_RENDERER=internal
```

Then run:

```bash
npm run dev
```

## Running After Build

Build the project:

```bash
npm run build
```

Run the compiled app:

```bash
npm start -- /path/to/your/obsidian-vault
```

If `VAULT_PATH` is set in `.env`, this also works:

```bash
npm start
```

## CLI Usage

The CLI executable is named `obsidian-tui-reader`.

```bash
obsidian-tui-reader /path/to/your/obsidian-vault
```

Path resolution order:

1. CLI argument
2. Shell environment variable `VAULT_PATH`
3. Project `.env` value `VAULT_PATH`

## Optional Glow Renderer

The built-in markdown renderer is used by default. To render notes with Glow, install Glow by following the official README:

```txt
https://github.com/charmbracelet/glow#installation
```

Then set:

```bash
MARKDOWN_RENDERER=glow
```

The app uses Glow's `tokyo-night` style by default. If Glow is not installed or fails to render, the app shows a warning in the Reader and falls back to the built-in renderer.

## Keyboard Shortcuts

- `Tab`: switch focus between left navigation and main content
- `↑` / `↓`: move selection or scroll reader
- `j` / `k`: scroll reader down/up
- `Enter`: open selected folder, note, search result, or focused wiki link
- `PageUp` / `PageDown`: scroll reader by larger steps
- `h` or `Backspace`: go back, up a folder, or return from reader
- `/`: open search from explorer or reader
- `Esc`: close search or exit link focus mode
- `l`: focus outgoing links in reader
- `?`: toggle help
- `q`: quit

## Supported Obsidian Markdown Features

- Markdown files ending in `.md`
- Frontmatter `title` extraction
- First H1 title fallback
- Headings
- Paragraphs
- Bullet lists
- Numbered lists
- Blockquotes
- Fenced code blocks
- Inline code spans
- Horizontal rules
- Basic `#tag` extraction
- Wiki links:
  - `[[Note Name]]`
  - `[[Folder/Note Name]]`
  - `[[Note Name|Alias]]`
  - `[[Note Name#Heading]]`, with the heading ignored for now

## Known Limitations

- Read-only; no editing, file creation, rename, delete, or move.
- Markdown rendering is intentionally simple and not full CommonMark.
- Tables, images, embeds, HTML, Mermaid, task checkboxes, and Obsidian callouts are not rendered specially by the built-in renderer.
- Wiki link heading jumps are not implemented.
- Ambiguous wiki links pick the first best match.
- Search is simple substring matching, not fuzzy search.
- No file watching or live refresh yet.

## Roadmap

- Better markdown rendering
- Backlinks
- Tags view
- Daily notes view
- Fuzzy search
- Note preview
- AI summaries
- Editing mode
- Git integration
