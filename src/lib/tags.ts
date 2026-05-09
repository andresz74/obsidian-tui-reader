const tagPattern = /(^|[\s([{"'])#([A-Za-z0-9][A-Za-z0-9/_-]*)/g;

export function extractTags(content: string): string[] {
	const tags = new Set<string>();

	for (const match of content.matchAll(tagPattern)) {
		const tag = match[2];

		if (tag) {
			tags.add(tag);
		}
	}

	return [...tags].sort((left, right) => left.localeCompare(right));
}
