import type {WikiLink} from '../types.js';

const wikiLinkPattern = /\[\[([^\]\n]+)\]\]/g;

export function extractWikiLinks(content: string): WikiLink[] {
	const links: WikiLink[] = [];

	for (const match of content.matchAll(wikiLinkPattern)) {
		const raw = match[0];
		const body = match[1]?.trim();

		if (!body) {
			continue;
		}

		const [targetPart, aliasPart] = body.split('|', 2);
		const target = targetPart?.trim();

		if (!target) {
			continue;
		}

		const alias = aliasPart?.trim();
		links.push({
			raw,
			target,
			...(alias ? {alias} : {}),
		});
	}

	return links;
}
