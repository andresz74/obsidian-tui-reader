import type {MarkdownInlineSegment, MarkdownLine} from '../types.js';

const headingPattern = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const bulletPattern = /^(\s*)[-*+]\s+(.+)$/;
const numberedPattern = /^(\s*)\d+[.)]\s+(.+)$/;
const blockquotePattern = /^>\s?(.*)$/;
const horizontalRulePattern = /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/;
const frontmatterDelimiterPattern = /^---\s*$/;
const fencedCodePattern = /^```/;
const inlinePattern = /(`[^`\n]+`|\[\[[^\]\n]+\]\])/g;

export function renderMarkdownToLines(content: string): MarkdownLine[] {
	const sourceLines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
	const renderedLines: MarkdownLine[] = [];
	let inCodeBlock = false;
	let inFrontmatter = sourceLines[0] ? frontmatterDelimiterPattern.test(sourceLines[0]) : false;

	for (let index = 0; index < sourceLines.length; index += 1) {
		const line = sourceLines[index] ?? '';

		if (inFrontmatter) {
			if (index > 0 && frontmatterDelimiterPattern.test(line)) {
				inFrontmatter = false;
				renderedLines.push({type: 'horizontalRule'});
			}

			continue;
		}

		if (fencedCodePattern.test(line.trim())) {
			inCodeBlock = !inCodeBlock;
			renderedLines.push({type: 'code', text: line});
			continue;
		}

		if (inCodeBlock) {
			renderedLines.push({type: 'code', text: line});
			continue;
		}

		if (line.trim() === '') {
			renderedLines.push({type: 'blank'});
			continue;
		}

		if (horizontalRulePattern.test(line)) {
			renderedLines.push({type: 'horizontalRule'});
			continue;
		}

		const headingMatch = line.match(headingPattern);

		if (headingMatch) {
			renderedLines.push({
				type: 'heading',
				level: headingMatch[1]?.length ?? 1,
				segments: renderInlineSegments(headingMatch[2] ?? ''),
			});
			continue;
		}

		const blockquoteMatch = line.match(blockquotePattern);

		if (blockquoteMatch) {
			renderedLines.push({
				type: 'blockquote',
				segments: renderInlineSegments(blockquoteMatch[1] ?? ''),
			});
			continue;
		}

		const bulletMatch = line.match(bulletPattern);

		if (bulletMatch) {
			const indent = bulletMatch[1] ?? '';
			renderedLines.push({
				type: 'bullet',
				prefix: `${indent}- `,
				segments: renderInlineSegments(bulletMatch[2] ?? ''),
			});
			continue;
		}

		const numberedMatch = line.match(numberedPattern);

		if (numberedMatch) {
			const indent = numberedMatch[1] ?? '';
			const marker = line.trimStart().split(/\s+/, 1)[0] ?? '1.';
			renderedLines.push({
				type: 'numbered',
				prefix: `${indent}${marker} `,
				segments: renderInlineSegments(numberedMatch[2] ?? ''),
			});
			continue;
		}

		renderedLines.push({
			type: 'paragraph',
			segments: renderInlineSegments(line),
		});
	}

	return trimTrailingBlankLines(renderedLines);
}

function renderInlineSegments(text: string): MarkdownInlineSegment[] {
	const segments: MarkdownInlineSegment[] = [];
	let lastIndex = 0;

	for (const match of text.matchAll(inlinePattern)) {
		const matchedText = match[0];
		const index = match.index ?? 0;

		if (index > lastIndex) {
			segments.push({
				type: 'text',
				text: text.slice(lastIndex, index),
			});
		}

		if (matchedText.startsWith('`')) {
			segments.push({
				type: 'inlineCode',
				text: matchedText.slice(1, -1),
			});
		} else {
			segments.push({
				type: 'wikiLink',
				text: matchedText,
			});
		}

		lastIndex = index + matchedText.length;
	}

	if (lastIndex < text.length) {
		segments.push({
			type: 'text',
			text: text.slice(lastIndex),
		});
	}

	return segments.length > 0 ? segments : [{type: 'text', text}];
}

function trimTrailingBlankLines(lines: MarkdownLine[]): MarkdownLine[] {
	let endIndex = lines.length;

	while (endIndex > 0 && lines[endIndex - 1]?.type === 'blank') {
		endIndex -= 1;
	}

	return lines.slice(0, endIndex);
}
