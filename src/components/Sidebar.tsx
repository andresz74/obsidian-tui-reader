import React from 'react';
import {Box, Text} from 'ink';
import type {AppMode, FocusArea, NavigationItemId, NoteFile, VaultIndex} from '../types.js';

type SidebarProperties = {
	activeMode: AppMode;
	focusArea: FocusArea;
	items: NavigationItem[];
	selectedIndex: number;
	height: number;
	vaultIndex: VaultIndex | undefined;
	activeNote: NoteFile | undefined;
};

export type NavigationItem = {
	id: NavigationItemId;
	label: string;
	isEnabled: boolean;
};

export function Sidebar({
	activeMode,
	focusArea,
	items,
	selectedIndex,
	height,
	vaultIndex,
	activeNote,
}: SidebarProperties) {
	return (
		<Box
			borderStyle={focusArea === 'navigation' ? 'double' : 'single'}
			flexDirection="column"
			height={height}
			paddingX={1}
			width={28}
		>
			{focusArea === 'navigation' ? (
				<Text bold color="cyan">
					Navigation
				</Text>
			) : (
				<Text bold>Navigation</Text>
			)}
			<Box flexDirection="column" marginTop={1}>
				{items.map((item, index) => (
					<SidebarItem
						key={item.id}
						item={item}
						isActive={activeMode === item.id}
						isSelected={focusArea === 'navigation' && index === selectedIndex}
					/>
				))}
			</Box>
			<Box flexDirection="column" marginTop={1}>
				<Text dimColor>Vault</Text>
				<Text>{vaultIndex ? `${vaultIndex.notes.length} notes` : 'Not loaded'}</Text>
				{vaultIndex && vaultIndex.warnings.length > 0 ? (
					<Text color="yellow">{vaultIndex.warnings.length} warnings</Text>
				) : null}
			</Box>
			<Box flexDirection="column" marginTop={1}>
				<Text dimColor>Current</Text>
				<Text>{activeNote ? activeNote.title : activeMode}</Text>
			</Box>
		</Box>
	);
}

type SidebarItemProperties = {
	item: NavigationItem;
	isActive: boolean;
	isSelected: boolean;
};

function SidebarItem({item, isActive, isSelected}: SidebarItemProperties) {
	const marker = isSelected ? '>' : isActive ? '*' : ' ';
	const label = `${marker} ${item.label}`;

	if (!item.isEnabled) {
		return <Text dimColor>{label}</Text>;
	}

	if (isSelected) {
		return (
			<Text color="black" backgroundColor="cyan">
				{label}
			</Text>
		);
	}

	if (isActive) {
		return <Text color="cyan">{label}</Text>;
	}

	return <Text>{label}</Text>;
}
