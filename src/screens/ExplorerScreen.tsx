import React from 'react';
import {Box, Text} from 'ink';
import {ListItem} from '../components/ListItem.js';
import type {ExplorerEntry, ExplorerFolderEntry, VaultIndex} from '../types.js';

type ExplorerScreenProperties = {
	vaultIndex: VaultIndex;
	currentFolder: ExplorerFolderEntry;
	selectedIndex: number;
	visibleItemCount: number;
};

export function ExplorerScreen({
	vaultIndex,
	currentFolder,
	selectedIndex,
	visibleItemCount,
}: ExplorerScreenProperties) {
	const visibleItems = getVisibleItems(currentFolder.children, selectedIndex, visibleItemCount);
	const firstVisibleIndex = getFirstVisibleIndex(
		currentFolder.children.length,
		selectedIndex,
		visibleItemCount,
	);
	const folderLabel = currentFolder.path || '/';

	return (
		<Box flexDirection="column" height="100%">
			<Text>
				<Text dimColor>Vault: </Text>
				{vaultIndex.rootPath}
			</Text>
			<Text>
				<Text dimColor>Folder: </Text>
				{folderLabel}
			</Text>
			<Text dimColor>
				{vaultIndex.notes.length} notes indexed · {currentFolder.noteCount} notes here
			</Text>
			{vaultIndex.warnings.length > 0 ? (
				<Box flexDirection="column">
					<Text color="yellow">
						{vaultIndex.warnings.length} item(s) could not be read; indexed readable notes.
					</Text>
					{vaultIndex.warnings.slice(0, 2).map((warning) => (
						<Text key={warning.path} dimColor>
							{warning.path}: {warning.message}
						</Text>
					))}
				</Box>
			) : null}
			<Box flexDirection="column" height={visibleItemCount} marginTop={1}>
				{vaultIndex.notes.length === 0 ? (
					<Text dimColor>No markdown files were found in this vault.</Text>
				) : currentFolder.children.length === 0 ? (
					<Text dimColor>This folder has no markdown notes.</Text>
				) : (
					visibleItems.map((item, visibleIndex) => {
						const itemIndex = firstVisibleIndex + visibleIndex;
						return (
							<ListItem
								key={item.path}
								item={item}
								isSelected={itemIndex === selectedIndex}
							/>
						);
					})
				)}
			</Box>
		</Box>
	);
}

function getVisibleItems(
	items: ExplorerEntry[],
	selectedIndex: number,
	visibleItemCount: number,
): ExplorerEntry[] {
	const firstVisibleIndex = getFirstVisibleIndex(
		items.length,
		selectedIndex,
		visibleItemCount,
	);
	return items.slice(firstVisibleIndex, firstVisibleIndex + visibleItemCount);
}

function getFirstVisibleIndex(
	itemCount: number,
	selectedIndex: number,
	visibleItemCount: number,
): number {
	if (itemCount <= visibleItemCount) {
		return 0;
	}

	const halfWindow = Math.floor(visibleItemCount / 2);
	const centeredIndex = Math.max(0, selectedIndex - halfWindow);
	return Math.min(centeredIndex, itemCount - visibleItemCount);
}
