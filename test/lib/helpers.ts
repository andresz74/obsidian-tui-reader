import {buildVaultTree} from '../../src/lib/tree.js';
import type {NoteFile, VaultIndex} from '../../src/types.js';

export function createNote(overrides: Partial<NoteFile> & Pick<NoteFile, 'title' | 'relativePath'>): NoteFile {
	const filename = overrides.relativePath.split('/').at(-1) ?? overrides.relativePath;
	const folderPath = overrides.relativePath.includes('/')
		? overrides.relativePath.slice(0, overrides.relativePath.lastIndexOf('/'))
		: '';

	return {
		title: overrides.title,
		filename,
		absolutePath: `/vault/${overrides.relativePath}`,
		relativePath: overrides.relativePath,
		folderPath,
		content: '',
		wikiLinks: [],
		tags: [],
		...overrides,
	};
}

export function createVaultIndex(notes: NoteFile[]): VaultIndex {
	const {tree, foldersByPath} = buildVaultTree(notes);

	return {
		rootPath: '/vault',
		notes,
		notesByRelativePath: new Map(notes.map((note) => [note.relativePath, note])),
		notesByTitle: notes.reduce<Map<string, NoteFile[]>>((map, note) => {
			const existing = map.get(note.title) ?? [];
			existing.push(note);
			map.set(note.title, existing);
			return map;
		}, new Map()),
		tree,
		foldersByPath,
		warnings: [],
	};
}
