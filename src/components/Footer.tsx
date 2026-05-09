import React from 'react';
import {Box, Text} from 'ink';
import type {AppMode, FocusArea} from '../types.js';

type FooterProperties = {
	mode: AppMode;
	focusArea: FocusArea;
};

export function Footer({mode, focusArea}: FooterProperties) {
	return (
		<Box height={1}>
			<Text dimColor>{shortcutsForMode(mode, focusArea)}</Text>
		</Box>
	);
}

function shortcutsForMode(mode: AppMode, focusArea: FocusArea): string {
	if (focusArea === 'navigation') {
		return 'tab content · ↑/↓ select view · enter switch · q quit · ? help';
	}

	if (mode === 'reader') {
		return 'tab nav · ↑/↓ or j/k scroll · PgUp/PgDn jump · / search · l links · h/back back · q quit · ? help';
	}

	if (mode === 'search') {
		return 'tab nav · type search · ↑/↓ select · enter open · esc close · q quit · ? help';
	}

	if (mode === 'explorer') {
		return 'tab nav · ↑/↓ select · enter open · / search · h/back parent · q quit · ? help';
	}

	return 'q quit · ? help';
}
