import path from 'node:path';
import type {ExplorerEntry, ExplorerFolderEntry, NoteFile} from '../types.js';

export function buildVaultTree(notes: NoteFile[]): {
	tree: ExplorerFolderEntry;
	foldersByPath: Map<string, ExplorerFolderEntry>;
} {
	const root: ExplorerFolderEntry = {
		type: 'folder',
		name: 'Vault',
		path: '',
		children: [],
		noteCount: 0,
	};
	const foldersByPath = new Map<string, ExplorerFolderEntry>([['', root]]);

	for (const note of notes) {
		const folder = ensureFolderPath(note.folderPath, foldersByPath, root);
		folder.children.push({
			type: 'note',
			name: note.title,
			path: note.relativePath,
			note,
		});
	}

	updateNoteCounts(root);
	sortFolder(root);

	return {tree: root, foldersByPath};
}

export function getParentFolderPath(folderPath: string): string {
	if (!folderPath) {
		return '';
	}

	const parentPath = path.posix.dirname(folderPath);
	return parentPath === '.' ? '' : parentPath;
}

function ensureFolderPath(
	folderPath: string,
	foldersByPath: Map<string, ExplorerFolderEntry>,
	root: ExplorerFolderEntry,
): ExplorerFolderEntry {
	if (!folderPath) {
		return root;
	}

	const segments = folderPath.split('/');
	let currentPath = '';
	let currentFolder = root;

	for (const segment of segments) {
		currentPath = currentPath ? `${currentPath}/${segment}` : segment;

		let nextFolder = foldersByPath.get(currentPath);

		if (!nextFolder) {
			nextFolder = {
				type: 'folder',
				name: segment,
				path: currentPath,
				children: [],
				noteCount: 0,
			};
			foldersByPath.set(currentPath, nextFolder);
			currentFolder.children.push(nextFolder);
		}

		currentFolder = nextFolder;
	}

	return currentFolder;
}

function updateNoteCounts(folder: ExplorerFolderEntry): number {
	let count = 0;

	for (const child of folder.children) {
		if (child.type === 'note') {
			count += 1;
		} else {
			count += updateNoteCounts(child);
		}
	}

	folder.noteCount = count;
	return count;
}

function sortFolder(folder: ExplorerFolderEntry): void {
	folder.children.sort(compareEntries);

	for (const child of folder.children) {
		if (child.type === 'folder') {
			sortFolder(child);
		}
	}
}

function compareEntries(left: ExplorerEntry, right: ExplorerEntry): number {
	if (left.type !== right.type) {
		return left.type === 'folder' ? -1 : 1;
	}

	return left.name.localeCompare(right.name);
}
