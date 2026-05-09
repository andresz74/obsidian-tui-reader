#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import {App} from './App.js';
import {readEnvValue} from './lib/env.js';
import type {MarkdownRenderer} from './types.js';

const vaultPath = process.argv[2] ?? process.env.VAULT_PATH ?? readEnvValue('VAULT_PATH');
const markdownRenderer = parseMarkdownRenderer(
	process.env.MARKDOWN_RENDERER ?? readEnvValue('MARKDOWN_RENDERER'),
);

render(<App vaultPath={vaultPath} markdownRenderer={markdownRenderer} />);

function parseMarkdownRenderer(value: string | undefined): MarkdownRenderer {
	return value === 'glow' ? 'glow' : 'internal';
}
