import React from 'react';
import {Text} from 'ink';
import type {MarkdownInlineSegment, MarkdownLine as MarkdownLineType} from '../types.js';

type MarkdownLineProperties = {
	line: MarkdownLineType;
};

export function MarkdownLine({line}: MarkdownLineProperties) {
	if (line.type === 'blank') {
		return <Text> </Text>;
	}

	if (line.type === 'horizontalRule') {
		return <Text dimColor>────────────────────────────────────────</Text>;
	}

	if (line.type === 'code') {
		return (
			<Text backgroundColor="gray" color="white">
				{'  '}
				{line.text || ' '}
			</Text>
		);
	}

	if (line.type === 'heading') {
		return (
			<Text bold color={headingColor(line.level)}>
				{`${'#'.repeat(line.level)} `}
				<InlineSegments segments={line.segments} />
			</Text>
		);
	}

	if (line.type === 'blockquote') {
		return (
			<Text color="gray">
				│ <InlineSegments segments={line.segments} />
			</Text>
		);
	}

	if (line.type === 'bullet' || line.type === 'numbered') {
		return (
			<Text>
				<Text color="cyan">{line.prefix}</Text>
				<InlineSegments segments={line.segments} />
			</Text>
		);
	}

	if (line.type === 'paragraph') {
		return (
			<Text>
				<InlineSegments segments={line.segments} />
			</Text>
		);
	}

	return null;
}

type InlineSegmentsProperties = {
	segments: MarkdownInlineSegment[];
};

function InlineSegments({segments}: InlineSegmentsProperties) {
	return (
		<>
			{segments.map((segment, index) => (
				<InlineSegment key={`${segment.type}-${index}`} segment={segment} />
			))}
		</>
	);
}

type InlineSegmentProperties = {
	segment: MarkdownInlineSegment;
};

function InlineSegment({segment}: InlineSegmentProperties) {
	if (segment.type === 'inlineCode') {
		return (
			<Text color="yellow">
				`{segment.text}`
			</Text>
		);
	}

	if (segment.type === 'wikiLink') {
		return <Text color="magenta">{segment.text}</Text>;
	}

	return <Text>{segment.text}</Text>;
}

function headingColor(level: number): 'cyan' | 'blue' | 'white' {
	if (level === 1) {
		return 'cyan';
	}

	if (level === 2) {
		return 'blue';
	}

	return 'white';
}
