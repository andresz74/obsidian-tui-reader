import React, {useMemo} from 'react';
import {Text} from 'ink';
import {parseAnsiLine} from '../lib/ansi.js';
import type {AnsiSegment} from '../lib/ansi.js';

type AnsiLineProperties = {
	line: string;
};

export function AnsiLine({line}: AnsiLineProperties) {
	const segments = useMemo(() => parseAnsiLine(line), [line]);

	return (
		<Text>
			{segments.map((segment, index) => (
				<AnsiText key={index} segment={segment} />
			))}
		</Text>
	);
}

type AnsiTextProperties = {
	segment: AnsiSegment;
};

function AnsiText({segment}: AnsiTextProperties) {
	const text = segment.text || ' ';

	if (segment.color && segment.backgroundColor) {
		return (
			<Text
				color={segment.color}
				backgroundColor={segment.backgroundColor}
				bold={segment.bold}
				italic={segment.italic}
				underline={segment.underline}
				dimColor={segment.dimColor}
			>
				{text}
			</Text>
		);
	}

	if (segment.color) {
		return (
			<Text
				color={segment.color}
				bold={segment.bold}
				italic={segment.italic}
				underline={segment.underline}
				dimColor={segment.dimColor}
			>
				{text}
			</Text>
		);
	}

	if (segment.backgroundColor) {
		return (
			<Text
				backgroundColor={segment.backgroundColor}
				bold={segment.bold}
				italic={segment.italic}
				underline={segment.underline}
				dimColor={segment.dimColor}
			>
				{text}
			</Text>
		);
	}

	return (
		<Text
			bold={segment.bold}
			italic={segment.italic}
			underline={segment.underline}
			dimColor={segment.dimColor}
		>
			{text}
		</Text>
	);
}
