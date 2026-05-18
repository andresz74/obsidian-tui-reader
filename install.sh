#!/usr/bin/env sh
set -eu

command_exists() {
	command -v "$1" >/dev/null 2>&1
}

if ! command_exists node; then
	echo "Node.js 20 or newer is required: https://nodejs.org/"
	exit 1
fi

if ! command_exists npm; then
	echo "npm is required and usually ships with Node.js: https://nodejs.org/"
	exit 1
fi

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$script_dir"

echo "Installing Obsidian TUI Reader..."
npm install
npm run build
npm link

echo
echo "Installed: obsidian-tui-reader"
echo "Run: obsidian-tui-reader /path/to/your/obsidian-vault"
