import type {NoteFile, ResolvedWikiLink, VaultIndex, WikiLink} from '../types.js';

export function resolveWikiLink(link: WikiLink, vaultIndex: VaultIndex): ResolvedWikiLink {
	const normalizedTarget = normalizeLinkTarget(link.target);
	const match = findBestMatch(normalizedTarget, vaultIndex.notes);

	return {
		link,
		displayText: link.alias ?? normalizedTarget,
		normalizedTarget,
		...(match.note ? {note: match.note} : {}),
		isResolved: Boolean(match.note),
		isAmbiguous: match.matchCount > 1,
		matchCount: match.matchCount,
	};
}

export function resolveWikiLinks(
	links: WikiLink[],
	vaultIndex: VaultIndex,
): ResolvedWikiLink[] {
	return links.map((link) => resolveWikiLink(link, vaultIndex));
}

function findBestMatch(target: string, notes: NoteFile[]): {
	note: NoteFile | undefined;
	matchCount: number;
} {
	const targetWithoutExtension = stripMarkdownExtension(target);
	const exactRelativePathMatches = notes.filter(
		(note) => stripMarkdownExtension(note.relativePath) === targetWithoutExtension,
	);

	if (exactRelativePathMatches.length > 0) {
		return {
			note: exactRelativePathMatches[0],
			matchCount: exactRelativePathMatches.length,
		};
	}

	const exactFilenameMatches = notes.filter(
		(note) => stripMarkdownExtension(note.filename) === targetWithoutExtension,
	);

	if (exactFilenameMatches.length > 0) {
		return {
			note: exactFilenameMatches[0],
			matchCount: exactFilenameMatches.length,
		};
	}

	const exactTitleMatches = notes.filter((note) => note.title === targetWithoutExtension);

	if (exactTitleMatches.length > 0) {
		return {
			note: exactTitleMatches[0],
			matchCount: exactTitleMatches.length,
		};
	}

	const fallbackTarget = targetWithoutExtension.toLowerCase();
	const fallbackMatches = notes.filter((note) => {
		return (
			stripMarkdownExtension(note.relativePath).toLowerCase() === fallbackTarget ||
			stripMarkdownExtension(note.filename).toLowerCase() === fallbackTarget ||
			note.title.toLowerCase() === fallbackTarget
		);
	});

	return {
		note: fallbackMatches[0],
		matchCount: fallbackMatches.length,
	};
}

function normalizeLinkTarget(target: string): string {
	const withoutHeading = target.split('#', 1)[0]?.trim() ?? '';
	return stripMarkdownExtension(withoutHeading);
}

function stripMarkdownExtension(value: string): string {
	return value.replace(/\.md$/i, '');
}
