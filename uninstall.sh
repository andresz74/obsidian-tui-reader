#!/usr/bin/env sh
set -eu

if ! command -v npm >/dev/null 2>&1; then
	echo "npm is required to unlink obsidian-tui-reader."
	exit 1
fi

npm unlink -g obsidian-tui-reader
echo "Uninstalled global obsidian-tui-reader link."
