import type {NoteFile, SearchMatchType, SearchResult, VaultIndex} from '../types.js';

const maxResults = 20;
const snippetRadius = 40;

export function searchNotes(vaultIndex: VaultIndex, query: string): SearchResult[] {
	const normalizedQuery = normalize(query);

	if (!normalizedQuery) {
		return [];
	}

	const results: SearchResult[] = [];

	for (const note of vaultIndex.notes) {
		const result = searchNote(note, normalizedQuery);

		if (result) {
			results.push(result);
		}
	}

	return results
		.sort((left, right) => {
			if (left.score !== right.score) {
				return right.score - left.score;
			}

			return left.note.title.localeCompare(right.note.title);
		})
		.slice(0, maxResults);
}

function searchNote(note: NoteFile, query: string): SearchResult | undefined {
	const title = normalize(note.title);
	const filename = normalize(note.filename);
	const relativePath = normalize(note.relativePath);
	const tags = note.tags.map(normalize);
	const content = normalize(note.content);

	if (title === query) {
		return createResult(note, 'title', 100);
	}

	if (title.startsWith(query)) {
		return createResult(note, 'title', 90);
	}

	if (title.includes(query)) {
		return createResult(note, 'title', 80);
	}

	if (filename.includes(query)) {
		return createResult(note, 'filename', 70);
	}

	const matchingTag = tags.find((tag) => tag === query || tag.includes(query));

	if (matchingTag) {
		return createResult(note, 'tag', matchingTag === query ? 65 : 60, `#${matchingTag}`);
	}

	if (relativePath.includes(query)) {
		return createResult(note, 'path', 50);
	}

	const contentIndex = content.indexOf(query);

	if (contentIndex !== -1) {
		return createResult(note, 'content', 30, createContentSnippet(note.content, query));
	}

	return undefined;
}

function createResult(
	note: NoteFile,
	matchType: SearchMatchType,
	score: number,
	snippet?: string,
): SearchResult {
	return {
		note,
		matchType,
		score,
		...(snippet ? {snippet} : {}),
	};
}

function createContentSnippet(content: string, query: string): string {
	const compactContent = content.replace(/\s+/g, ' ').trim();
	const compactMatchIndex = compactContent.toLowerCase().indexOf(query);
	const matchIndex = compactMatchIndex === -1 ? 0 : compactMatchIndex;
	const start = Math.max(0, matchIndex - snippetRadius);
	const end = Math.min(compactContent.length, matchIndex + query.length + snippetRadius);
	const prefix = start > 0 ? '...' : '';
	const suffix = end < compactContent.length ? '...' : '';

	return `${prefix}${compactContent.slice(start, end)}${suffix}`;
}

function normalize(value: string): string {
	return value.trim().toLowerCase();
}
