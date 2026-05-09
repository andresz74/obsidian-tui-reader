export type AnsiSegment = {
	text: string;
	color?: string;
	backgroundColor?: string;
	bold: boolean;
	italic: boolean;
	underline: boolean;
	dimColor: boolean;
};

type AnsiStyle = Omit<AnsiSegment, 'text'>;

const ansiPattern = /\u001B\[([0-9;]*)m/g;

const foregroundColors = new Map<number, string>([
	[30, 'black'],
	[31, 'red'],
	[32, 'green'],
	[33, 'yellow'],
	[34, 'blue'],
	[35, 'magenta'],
	[36, 'cyan'],
	[37, 'white'],
	[90, 'gray'],
	[91, 'redBright'],
	[92, 'greenBright'],
	[93, 'yellowBright'],
	[94, 'blueBright'],
	[95, 'magentaBright'],
	[96, 'cyanBright'],
	[97, 'whiteBright'],
]);

const backgroundColors = new Map<number, string>([
	[40, 'black'],
	[41, 'red'],
	[42, 'green'],
	[43, 'yellow'],
	[44, 'blue'],
	[45, 'magenta'],
	[46, 'cyan'],
	[47, 'white'],
	[100, 'gray'],
	[101, 'redBright'],
	[102, 'greenBright'],
	[103, 'yellowBright'],
	[104, 'blueBright'],
	[105, 'magentaBright'],
	[106, 'cyanBright'],
	[107, 'whiteBright'],
]);

export function parseAnsiLine(line: string): AnsiSegment[] {
	const segments: AnsiSegment[] = [];
	let style = createDefaultStyle();
	let lastIndex = 0;

	for (const match of line.matchAll(ansiPattern)) {
		const index = match.index ?? 0;

		if (index > lastIndex) {
			segments.push(createSegment(line.slice(lastIndex, index), style));
		}

		style = applySgrCodes(style, parseCodes(match[1] ?? '0'));
		lastIndex = index + match[0].length;
	}

	if (lastIndex < line.length) {
		segments.push(createSegment(line.slice(lastIndex), style));
	}

	return segments.length > 0 ? segments : [createSegment(line || ' ', style)];
}

function applySgrCodes(style: AnsiStyle, codes: number[]): AnsiStyle {
	let nextStyle = {...style};

	for (let index = 0; index < codes.length; index += 1) {
		const code = codes[index] ?? 0;

		if (code === 0) {
			nextStyle = createDefaultStyle();
			continue;
		}

		if (code === 1) {
			nextStyle.bold = true;
			continue;
		}

		if (code === 2) {
			nextStyle.dimColor = true;
			continue;
		}

		if (code === 3) {
			nextStyle.italic = true;
			continue;
		}

		if (code === 4) {
			nextStyle.underline = true;
			continue;
		}

		if (code === 22) {
			nextStyle.bold = false;
			nextStyle.dimColor = false;
			continue;
		}

		if (code === 23) {
			nextStyle.italic = false;
			continue;
		}

		if (code === 24) {
			nextStyle.underline = false;
			continue;
		}

		if (code === 39) {
			delete nextStyle.color;
			continue;
		}

		if (code === 49) {
			delete nextStyle.backgroundColor;
			continue;
		}

		const foregroundColor = foregroundColors.get(code);

		if (foregroundColor) {
			nextStyle.color = foregroundColor;
			continue;
		}

		const backgroundColor = backgroundColors.get(code);

		if (backgroundColor) {
			nextStyle.backgroundColor = backgroundColor;
			continue;
		}

		if (code === 38 || code === 48) {
			const colorKind = codes[index + 1];

			if (colorKind === 2) {
				const red = codes[index + 2];
				const green = codes[index + 3];
				const blue = codes[index + 4];

				if (isColorByte(red) && isColorByte(green) && isColorByte(blue)) {
					setExtendedColor(nextStyle, code, toHexColor(red, green, blue));
					index += 4;
				}

				continue;
			}

			if (colorKind === 5) {
				const colorIndex = codes[index + 2];

				if (typeof colorIndex === 'number') {
					setExtendedColor(nextStyle, code, String(colorIndex));
					index += 2;
				}
			}
		}
	}

	return nextStyle;
}

function parseCodes(rawCodes: string): number[] {
	if (!rawCodes) {
		return [0];
	}

	return rawCodes.split(';').map((code) => Number.parseInt(code || '0', 10));
}

function createDefaultStyle(): AnsiStyle {
	return {
		bold: false,
		italic: false,
		underline: false,
		dimColor: false,
	};
}

function createSegment(text: string, style: AnsiStyle): AnsiSegment {
	return {
		text,
		bold: style.bold,
		italic: style.italic,
		underline: style.underline,
		dimColor: style.dimColor,
		...(style.color ? {color: style.color} : {}),
		...(style.backgroundColor ? {backgroundColor: style.backgroundColor} : {}),
	};
}

function setExtendedColor(style: AnsiStyle, code: number, color: string): void {
	if (code === 38) {
		style.color = color;
		return;
	}

	style.backgroundColor = color;
}

function isColorByte(value: number | undefined): value is number {
	return typeof value === 'number' && value >= 0 && value <= 255;
}

function toHexColor(red: number, green: number, blue: number): string {
	return `#${toHexByte(red)}${toHexByte(green)}${toHexByte(blue)}`;
}

function toHexByte(value: number): string {
	return value.toString(16).padStart(2, '0');
}
