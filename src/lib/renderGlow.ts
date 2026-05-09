import {spawn} from 'node:child_process';

export const glowInstallUrl = 'https://github.com/charmbracelet/glow#installation';
export const defaultGlowStyle = 'tokyo-night';

export type GlowRenderResult =
	| {
			status: 'success';
			lines: string[];
	  }
	| {
			status: 'missing';
			message: string;
	  }
	| {
			status: 'error';
			message: string;
	  };

export function renderMarkdownWithGlow(
	content: string,
	width: number,
): Promise<GlowRenderResult> {
	return new Promise((resolve) => {
		const args = ['-s', defaultGlowStyle, '-w', String(Math.max(20, width)), '-'];
		const childEnvironment: NodeJS.ProcessEnv = {
			...process.env,
			CLICOLOR_FORCE: '1',
			COLORTERM: process.env.COLORTERM || 'truecolor',
			FORCE_COLOR: process.env.FORCE_COLOR || '3',
			TERM:
				!process.env.TERM || process.env.TERM === 'dumb'
					? 'xterm-256color'
					: process.env.TERM,
		};
		delete childEnvironment.NO_COLOR;

		const child = spawn('glow', args, {
			env: childEnvironment,
			stdio: ['pipe', 'pipe', 'pipe'],
		});
		const stdoutChunks: Buffer[] = [];
		const stderrChunks: Buffer[] = [];
		let settled = false;

		child.stdout.on('data', (chunk: Buffer) => {
			stdoutChunks.push(chunk);
		});

		child.stderr.on('data', (chunk: Buffer) => {
			stderrChunks.push(chunk);
		});

		child.on('error', (error: NodeJS.ErrnoException) => {
			if (settled) {
				return;
			}

			settled = true;

			if (error.code === 'ENOENT') {
				resolve({
					status: 'missing',
					message: `Glow is not installed. Install it from ${glowInstallUrl}.`,
				});
				return;
			}

			resolve({
				status: 'error',
				message: `Glow failed to start: ${error.message}`,
			});
		});

		child.on('close', (code) => {
			if (settled) {
				return;
			}

			settled = true;

			if (code === 0) {
				resolve({
					status: 'success',
					lines: Buffer.concat(stdoutChunks).toString('utf8').split(/\r?\n/),
				});
				return;
			}

			const stderr = Buffer.concat(stderrChunks).toString('utf8').trim();
			resolve({
				status: 'error',
				message: stderr || `Glow exited with code ${code ?? 'unknown'}.`,
			});
		});

		child.stdin.end(content);
	});
}
