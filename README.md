# Obsidian TUI Reader

A keyboard-first terminal reader for exploring Obsidian vaults.

Built with React, Ink, and TypeScript.

Obsidian TUI Reader is a fast, read-only-first terminal app for browsing folders, reading markdown notes, searching vault content, and following Obsidian-style wiki links. It is designed to feel useful over SSH and comfortable in a keyboard-driven terminal workflow.

![Obsidian TUI Reader screenshot](https://zenteno.org/public_assets/obsidian-tui-reader-001.png)

## What It Is

- A terminal-native reader for local Obsidian vaults.
- A read-only knowledge exploration tool.
- A React + Ink + TypeScript TUI with clean, small modules.
- A practical way to browse notes without opening a desktop app.

## What It Is Not

- Not a full Obsidian replacement.
- Not a WYSIWYG editor.
- Not an Obsidian plugin host.
- Not a graph view or sync tool.
- Not editing-focused, at least for the MVP.

## Features

- Browse vault folders and markdown files.
- Read notes in a full-terminal dashboard layout.
- Search note titles, filenames, relative paths, tags, and body content.
- Follow outgoing `[[wiki links]]` from the reader.
- Show unresolved and ambiguous wiki links without crashing.
- Ignore common system folders: `.obsidian`, `.git`, `node_modules`, `.trash`.
- Continue indexing readable notes when nested files or folders are unreadable.
- Optional Glow-backed markdown rendering with built-in fallback.
- Installable as a global CLI: `obsidian-tui-reader`.

## Installation

### Easy Install From GitHub

```bash
git clone https://github.com/andresz74/obsidian-tui-reader.git
cd obsidian-tui-reader
./install.sh
```

Then run it from anywhere:

```bash
obsidian-tui-reader /path/to/your/obsidian-vault
```

### One-Line Install

```bash
install_dir="${XDG_DATA_HOME:-$HOME/.local/share}/obsidian-tui-reader" && rm -rf "$install_dir" && git clone --depth 1 https://github.com/andresz74/obsidian-tui-reader.git "$install_dir" && sh "$install_dir/install.sh"
```

### npm From GitHub

```bash
npm install -g github:andresz74/obsidian-tui-reader
```

## Usage

Run with an explicit vault path:

```bash
obsidian-tui-reader ~/Documents/ObsidianVault
```

Or use `.env`:

```bash
VAULT_PATH=/path/to/your/obsidian-vault
MARKDOWN_RENDERER=internal
```

Then run:

```bash
obsidian-tui-reader
```

Path resolution order:

1. CLI argument
2. Shell environment variable `VAULT_PATH`
3. Project `.env` value `VAULT_PATH`

## Keyboard Shortcuts

- `↑` / `↓`: move selection or scroll
- `j` / `k`: scroll reader down/up
- `Enter`: open selected folder, note, search result, or focused wiki link
- `PageUp` / `PageDown`: scroll reader by larger steps
- `h` or `Backspace`: go back
- `/`: open search
- `Esc`: close search, links mode, or help
- `l`: focus outgoing links in the reader
- `Tab`: switch focus between navigation and content
- `?`: toggle help
- `q`: quit

## Supported Obsidian Features

- Local `.md` files.
- Frontmatter `title` extraction.
- First H1 title fallback.
- Basic `#tag` extraction.
- Wiki links:
  - `[[Note Name]]`
  - `[[Folder/Note Name]]`
  - `[[Note Name|Alias]]`
  - `[[Note Name#Heading]]`

Heading links resolve the note first, but heading scrolling is not implemented yet.

## Markdown Rendering

The built-in renderer prioritizes terminal readability and supports:

- headings
- paragraphs
- bullet lists
- numbered lists
- blockquotes
- fenced code blocks
- inline code
- horizontal rules
- highlighted wiki links

For prettier rendering, install [Glow](https://github.com/charmbracelet/glow#installation) and set:

```bash
MARKDOWN_RENDERER=glow
```

Glow uses the `tokyo-night` style by default. If Glow is missing or fails, the app falls back to the built-in renderer.

## Known Limitations

- Read-only: no editing, deleting, renaming, or moving notes.
- Built-in markdown rendering is intentionally incomplete.
- No table, image, embed, Mermaid, HTML, or Obsidian callout rendering in the built-in renderer.
- Wiki links do not jump to headings yet.
- Ambiguous wiki links choose the best match and mark ambiguity in the links panel.
- Search is simple ranked substring matching, not fuzzy search.
- No file watching or live refresh yet.

## Roadmap

- Better markdown rendering
- Backlinks
- Tags view
- Daily notes view
- Fuzzy search
- Command palette
- Note preview
- Git integration
- AI note summaries
- Optional editing mode later

## Development

Install dependencies:

```bash
npm install
```

Run in development:

```bash
npm run dev -- /path/to/your/obsidian-vault
```

Build and run compiled output:

```bash
npm run build
npm start -- /path/to/your/obsidian-vault
```

Required checks:

```bash
npm run typecheck
npm test
npm run build
```

## Architecture Notes

- `src/App.tsx`: app state, keyboard routing, and dashboard layout.
- `src/screens/`: Explorer, Reader, and Search screens.
- `src/components/`: reusable Ink UI components.
- `src/lib/`: core logic with no Ink imports: vault scanning, search, markdown parsing, wiki-link parsing/resolution, Glow rendering, and ANSI parsing.
- `test/lib/`: focused tests for pure core logic.
- `src/types.ts`: shared types.

Core logic should stay independent from Ink where practical. TUI components should remain focused on rendering and input state.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).
