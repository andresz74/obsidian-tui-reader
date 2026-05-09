const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;
const titlePattern = /^title:\s*(.+?)\s*$/im;
const h1Pattern = /^#\s+(.+?)\s*$/m;

export function extractTitle(content: string, fallbackTitle: string): string {
	const frontmatterTitle = extractFrontmatterTitle(content);

	if (frontmatterTitle) {
		return frontmatterTitle;
	}

	const h1Title = extractFirstH1(content);

	if (h1Title) {
		return h1Title;
	}

	return fallbackTitle;
}

function extractFrontmatterTitle(content: string): string | undefined {
	const frontmatter = content.match(frontmatterPattern)?.[1];

	if (!frontmatter) {
		return undefined;
	}

	const rawTitle = frontmatter.match(titlePattern)?.[1]?.trim();

	if (!rawTitle) {
		return undefined;
	}

	return stripWrappingQuotes(rawTitle);
}

function extractFirstH1(content: string): string | undefined {
	const title = content.match(h1Pattern)?.[1]?.trim();
	return title || undefined;
}

function stripWrappingQuotes(value: string): string {
	if (
		(value.startsWith('"') && value.endsWith('"')) ||
		(value.startsWith("'") && value.endsWith("'"))
	) {
		return value.slice(1, -1).trim();
	}

	return value;
}
