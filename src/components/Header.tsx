import React from 'react';
import {Box, Text} from 'ink';
import type {AppMode, FocusArea} from '../types.js';

type HeaderProperties = {
	mode: AppMode;
	focusArea: FocusArea;
};

export function Header({mode, focusArea}: HeaderProperties) {
	return (
		<Box borderStyle="single" height={3} justifyContent="space-between" paddingX={1}>
			<Text bold>Obsidian TUI Reader</Text>
			<Text>
				<Text dimColor>Mode </Text>
				<Text color="cyan">{formatMode(mode)}</Text>
				<Text dimColor> · Focus </Text>
				<Text color="cyan">{focusArea === 'navigation' ? 'Navigation' : 'Content'}</Text>
			</Text>
		</Box>
	);
}

function formatMode(mode: AppMode): string {
	if (mode === 'explorer') {
		return 'Explorer';
	}

	if (mode === 'reader') {
		return 'Reader';
	}

	if (mode === 'search') {
		return 'Search';
	}

	if (mode === 'error') {
		return 'Error';
	}

	return 'Loading';
}
