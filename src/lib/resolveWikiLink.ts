import type {NoteFile, ResolvedWikiLink, VaultIndex, WikiLink} from '../types.js';

export function resolveWikiLink(link: WikiLink, vaultIndex: VaultIndex): ResolvedWikiLink {
	const normalizedTarget = normalizeLinkTarget(link.target);
	const note = findBestMatch(normalizedTarget, vaultIndex.notes);

	return {
		link,
		displayText: link.alias ?? normalizedTarget,
		normalizedTarget,
		...(note ? {note} : {}),
		isResolved: Boolean(note),
	};
}

export function resolveWikiLinks(
	links: WikiLink[],
	vaultIndex: VaultIndex,
): ResolvedWikiLink[] {
	return links.map((link) => resolveWikiLink(link, vaultIndex));
}

function findBestMatch(target: string, notes: NoteFile[]): NoteFile | undefined {
	const targetWithoutExtension = stripMarkdownExtension(target);
	const exactRelativePathMatch = notes.find(
		(note) => stripMarkdownExtension(note.relativePath) === targetWithoutExtension,
	);

	if (exactRelativePathMatch) {
		return exactRelativePathMatch;
	}

	const exactFilenameMatch = notes.find(
		(note) => stripMarkdownExtension(note.filename) === targetWithoutExtension,
	);

	if (exactFilenameMatch) {
		return exactFilenameMatch;
	}

	const exactTitleMatch = notes.find((note) => note.title === targetWithoutExtension);

	if (exactTitleMatch) {
		return exactTitleMatch;
	}

	const fallbackTarget = targetWithoutExtension.toLowerCase();
	return notes.find((note) => {
		return (
			stripMarkdownExtension(note.relativePath).toLowerCase() === fallbackTarget ||
			stripMarkdownExtension(note.filename).toLowerCase() === fallbackTarget ||
			note.title.toLowerCase() === fallbackTarget
		);
	});
}

function normalizeLinkTarget(target: string): string {
	const withoutHeading = target.split('#', 1)[0]?.trim() ?? '';
	return stripMarkdownExtension(withoutHeading);
}

function stripMarkdownExtension(value: string): string {
	return value.replace(/\.md$/i, '');
}
