import {readdir, readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {extractTitle} from './markdown.js';
import {extractTags} from './tags.js';
import {buildVaultTree} from './tree.js';
import {extractWikiLinks} from './wikiLinks.js';
import type {
	NoteFile,
	VaultIndex,
	VaultLoadError,
	VaultLoadErrorCode,
	VaultWarning,
} from '../types.js';

const ignoredFolderNames = new Set(['.obsidian', '.git', 'node_modules', '.trash']);

export class VaultIndexError extends Error {
	readonly code: VaultLoadErrorCode;

	constructor(code: VaultLoadErrorCode, message: string) {
		super(message);
		this.name = 'VaultIndexError';
		this.code = code;
	}

	toLoadError(): VaultLoadError {
		return {
			code: this.code,
			message: this.message,
		};
	}
}

export async function loadVaultIndex(vaultPath: string | undefined): Promise<VaultIndex> {
	if (!vaultPath) {
		throw new VaultIndexError('missing-path', 'A vault path is required.');
	}

	const rootPath = path.resolve(vaultPath);
	const rootStats = await getPathStats(rootPath);

	if (!rootStats) {
		throw new VaultIndexError('not-found', `Vault path does not exist: ${rootPath}`);
	}

	if (!rootStats.isDirectory()) {
		throw new VaultIndexError('not-directory', `Vault path must be a folder: ${rootPath}`);
	}

	const warnings: VaultWarning[] = [];
	const notes = await scanMarkdownFiles(rootPath, rootPath, warnings);
	notes.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
	const {tree, foldersByPath} = buildVaultTree(notes);

	return {
		rootPath,
		notes,
		notesByRelativePath: new Map(notes.map((note) => [note.relativePath, note])),
		notesByTitle: buildNotesByTitle(notes),
		tree,
		foldersByPath,
		warnings,
	};
}

async function scanMarkdownFiles(
	rootPath: string,
	folderPath: string,
	warnings: VaultWarning[],
): Promise<NoteFile[]> {
	let entries;

	try {
		entries = await readdir(folderPath, {withFileTypes: true});
	} catch (error) {
		warnings.push({
			path: folderPath,
			message: `Could not read folder${formatCause(error)}`,
		});
		return [];
	}

	const notes: NoteFile[] = [];

	for (const entry of entries) {
		const absolutePath = path.join(folderPath, entry.name);

		if (entry.isDirectory()) {
			if (!ignoredFolderNames.has(entry.name)) {
				notes.push(...(await scanMarkdownFiles(rootPath, absolutePath, warnings)));
			}

			continue;
		}

		if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
			const note = await readNoteFile(rootPath, absolutePath, warnings);

			if (note) {
				notes.push(note);
			}
		}
	}

	return notes;
}

async function readNoteFile(
	rootPath: string,
	absolutePath: string,
	warnings: VaultWarning[],
): Promise<NoteFile | undefined> {
	let content;

	try {
		content = await readFile(absolutePath, 'utf8');
	} catch (error) {
		warnings.push({
			path: absolutePath,
			message: `Could not read markdown file${formatCause(error)}`,
		});
		return undefined;
	}

	const filename = path.basename(absolutePath);
	const fallbackTitle = filename.replace(/\.md$/i, '');
	const relativePath = toVaultRelativePath(rootPath, absolutePath);
	const folderPath = toVaultFolderPath(path.dirname(relativePath));

	return {
		title: extractTitle(content, fallbackTitle),
		filename,
		absolutePath,
		relativePath,
		folderPath,
		content,
		wikiLinks: extractWikiLinks(content),
		tags: extractTags(content),
	};
}

async function getPathStats(targetPath: string) {
	try {
		return await stat(targetPath);
	} catch (error) {
		if (isNodeError(error) && error.code === 'ENOENT') {
			return undefined;
		}

		throw new VaultIndexError(
			'read-failed',
			`Could not inspect vault path: ${targetPath}${formatCause(error)}`,
		);
	}
}

function buildNotesByTitle(notes: NoteFile[]): Map<string, NoteFile[]> {
	const notesByTitle = new Map<string, NoteFile[]>();

	for (const note of notes) {
		const key = normalizeTitle(note.title);
		const existingNotes = notesByTitle.get(key);

		if (existingNotes) {
			existingNotes.push(note);
		} else {
			notesByTitle.set(key, [note]);
		}
	}

	return notesByTitle;
}

function normalizeTitle(title: string): string {
	return title.trim().toLowerCase();
}

function toVaultRelativePath(rootPath: string, absolutePath: string): string {
	return path.relative(rootPath, absolutePath).split(path.sep).join('/');
}

function toVaultFolderPath(folderPath: string): string {
	return folderPath === '.' ? '' : folderPath.split(path.sep).join('/');
}

function formatCause(error: unknown): string {
	if (error instanceof Error && error.message) {
		return ` (${error.message})`;
	}

	return '';
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
	return error instanceof Error && 'code' in error;
}
