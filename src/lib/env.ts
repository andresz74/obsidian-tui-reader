import {readFileSync} from 'node:fs';
import path from 'node:path';

export function readEnvValue(name: string, cwd = process.cwd()): string | undefined {
	const envPath = path.join(cwd, '.env');
	let fileContent: string;

	try {
		fileContent = readFileSync(envPath, 'utf8');
	} catch {
		return undefined;
	}

	for (const line of fileContent.split(/\r?\n/)) {
		const trimmedLine = line.trim();

		if (!trimmedLine || trimmedLine.startsWith('#')) {
			continue;
		}

		const separatorIndex = trimmedLine.indexOf('=');

		if (separatorIndex === -1) {
			continue;
		}

		const key = trimmedLine.slice(0, separatorIndex).trim();

		if (key !== name) {
			continue;
		}

		return stripWrappingQuotes(trimmedLine.slice(separatorIndex + 1).trim());
	}

	return undefined;
}

function stripWrappingQuotes(value: string): string {
	if (
		(value.startsWith('"') && value.endsWith('"')) ||
		(value.startsWith("'") && value.endsWith("'"))
	) {
		return value.slice(1, -1);
	}

	return value;
}
