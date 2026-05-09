import React from 'react';
import {Box, Text} from 'ink';
import type {ExplorerEntry} from '../types.js';

type ListItemProperties = {
	item: ExplorerEntry;
	isSelected: boolean;
};

export function ListItem({item, isSelected}: ListItemProperties) {
	const marker = isSelected ? '>' : ' ';
	const label = item.type === 'folder' ? `${item.name}/` : item.name;
	const meta = item.type === 'folder' ? ` ${item.noteCount}` : ` ${item.note.filename}`;
	const content = `${marker} ${item.type === 'folder' ? 'dir ' : 'md  '} ${label}`;

	return (
		<Box>
			{isSelected ? (
				<Text color="black" backgroundColor="cyan">
					{content}
				</Text>
			) : (
				<Text>{content}</Text>
			)}
			<Text dimColor>{meta}</Text>
		</Box>
	);
}
