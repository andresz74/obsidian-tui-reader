import React, {useEffect, useState} from 'react';
import {Box, Text, useApp, useInput, useStdout} from 'ink';
import {Footer} from './components/Footer.js';
import {Header} from './components/Header.js';
import {HelpPanel} from './components/HelpPanel.js';
import {Sidebar} from './components/Sidebar.js';
import {resolveWikiLinks} from './lib/resolveWikiLink.js';
import {searchNotes} from './lib/search.js';
import {getParentFolderPath} from './lib/tree.js';
import {loadVaultIndex, VaultIndexError} from './lib/vault.js';
import {ExplorerScreen} from './screens/ExplorerScreen.js';
import {getReaderMaxScrollOffset, ReaderScreen} from './screens/ReaderScreen.js';
import {SearchScreen} from './screens/SearchScreen.js';
import type {
	AppMode,
	FocusArea,
	MarkdownRenderer,
	NavigationItemId,
	NoteFile,
	SearchResult,
	SearchReturnMode,
	VaultIndex,
	VaultLoadError,
} from './types.js';

type AppProperties = {
	vaultPath: string | undefined;
	markdownRenderer: MarkdownRenderer;
};

export function App({vaultPath, markdownRenderer}: AppProperties) {
	const {exit} = useApp();
	const {stdout} = useStdout();
	const [mode, setMode] = useState<AppMode>('loading');
	const [focusArea, setFocusArea] = useState<FocusArea>('content');
	const [navigationSelectedIndex, setNavigationSelectedIndex] = useState(0);
	const [showHelp, setShowHelp] = useState(false);
	const [vaultIndex, setVaultIndex] = useState<VaultIndex | undefined>();
	const [loadError, setLoadError] = useState<VaultLoadError | undefined>();
	const [currentFolderPath, setCurrentFolderPath] = useState('');
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [activeNote, setActiveNote] = useState<NoteFile | undefined>();
	const [noteHistory, setNoteHistory] = useState<NoteFile[]>([]);
	const [readerScrollOffset, setReaderScrollOffset] = useState(0);
	const [readerRenderedLineCount, setReaderRenderedLineCount] = useState(0);
	const [linksFocused, setLinksFocused] = useState(false);
	const [selectedLinkIndex, setSelectedLinkIndex] = useState(0);
	const [searchReturnMode, setSearchReturnMode] = useState<SearchReturnMode>('explorer');
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);

	useEffect(() => {
		let isCurrent = true;

		async function loadVault() {
			setMode('loading');
			setVaultIndex(undefined);
			setLoadError(undefined);

			try {
				const index = await loadVaultIndex(vaultPath);

				if (!isCurrent) {
					return;
				}

				setVaultIndex(index);
				setCurrentFolderPath('');
				setSelectedIndex(0);
				setActiveNote(undefined);
				setNoteHistory([]);
				setReaderScrollOffset(0);
				setReaderRenderedLineCount(0);
				setLinksFocused(false);
				setSelectedLinkIndex(0);
				setSearchQuery('');
				setSearchResults([]);
				setSearchSelectedIndex(0);
				setMode('explorer');
			} catch (error) {
				if (!isCurrent) {
					return;
				}

				setLoadError(toLoadError(error));
				setMode('error');
			}
		}

		void loadVault();

		return () => {
			isCurrent = false;
		};
	}, [vaultPath]);

	useInput((input, key) => {
		if (input === 'q') {
			exit();
			return;
		}

		if (input === '?') {
			setShowHelp((currentValue) => !currentValue);
			return;
		}

		if (key.tab) {
			setFocusArea((currentFocusArea) =>
				currentFocusArea === 'navigation' ? 'content' : 'navigation',
			);
			return;
		}

		if (!vaultIndex || showHelp) {
			return;
		}

		const navigationItems = getNavigationItems(activeNote);

		if (focusArea === 'navigation') {
			if (key.upArrow) {
				setNavigationSelectedIndex((currentIndex) => Math.max(0, currentIndex - 1));
				return;
			}

			if (key.downArrow) {
				setNavigationSelectedIndex((currentIndex) =>
					Math.min(navigationItems.length - 1, currentIndex + 1),
				);
				return;
			}

			if (key.return) {
				const selectedItem = navigationItems[navigationSelectedIndex];

				if (selectedItem?.isEnabled) {
					if (selectedItem.id === 'explorer') {
						setMode('explorer');
					}

					if (selectedItem.id === 'reader') {
						setMode('reader');
					}

					if (selectedItem.id === 'search') {
						setSearchReturnMode(mode === 'reader' ? 'reader' : 'explorer');
						setSearchQuery('');
						setSearchResults([]);
						setSearchSelectedIndex(0);
						setMode('search');
					}

					setFocusArea('content');
				}

				return;
			}

			return;
		}

		if (input === '/' && (mode === 'explorer' || mode === 'reader')) {
			setSearchReturnMode(mode);
			setSearchQuery('');
			setSearchResults([]);
			setSearchSelectedIndex(0);
			setMode('search');
			return;
		}

		if (mode === 'search') {
			if (key.escape) {
				setMode(searchReturnMode);
				return;
			}

			if (key.upArrow) {
				setSearchSelectedIndex((currentIndex) => Math.max(0, currentIndex - 1));
				return;
			}

			if (key.downArrow) {
				setSearchSelectedIndex((currentIndex) =>
					searchResults.length === 0
						? 0
						: Math.min(searchResults.length - 1, currentIndex + 1),
				);
				return;
			}

			if (key.return) {
				const selectedResult = searchResults[searchSelectedIndex];

				if (selectedResult) {
					if (searchReturnMode === 'reader' && activeNote) {
						setNoteHistory((currentHistory) => [...currentHistory, activeNote]);
					} else {
						setNoteHistory([]);
					}

					setActiveNote(selectedResult.note);
					setReaderScrollOffset(0);
					setReaderRenderedLineCount(0);
					setLinksFocused(false);
					setSelectedLinkIndex(0);
					setFocusArea('content');
					setMode('reader');
				}

				return;
			}

			if (key.backspace || key.delete) {
				setSearchQuery((currentQuery) => {
					const nextQuery = currentQuery.slice(0, -1);
					const nextResults = searchNotes(vaultIndex, nextQuery);
					setSearchResults(nextResults);
					setSearchSelectedIndex(0);
					return nextQuery;
				});
				return;
			}

			if (isSearchTextInput(input)) {
				setSearchQuery((currentQuery) => {
					const nextQuery = currentQuery + input;
					const nextResults = searchNotes(vaultIndex, nextQuery);
					setSearchResults(nextResults);
					setSearchSelectedIndex(0);
					return nextQuery;
				});
			}

			return;
		}

		if (mode === 'explorer') {
			const currentFolder = vaultIndex.foldersByPath.get(currentFolderPath) ?? vaultIndex.tree;
			const childCount = currentFolder.children.length;

			if (key.upArrow) {
				setSelectedIndex((currentIndex) => Math.max(0, currentIndex - 1));
				return;
			}

			if (key.downArrow) {
				setSelectedIndex((currentIndex) =>
					childCount === 0 ? 0 : Math.min(childCount - 1, currentIndex + 1),
				);
				return;
			}

			if (key.return) {
				const selectedItem = currentFolder.children[selectedIndex];

				if (!selectedItem) {
					return;
				}

				if (selectedItem.type === 'folder') {
					setCurrentFolderPath(selectedItem.path);
					setSelectedIndex(0);
				} else {
					setActiveNote(selectedItem.note);
					setNoteHistory([]);
					setReaderScrollOffset(0);
					setReaderRenderedLineCount(0);
					setLinksFocused(false);
					setSelectedLinkIndex(0);
					setFocusArea('content');
					setMode('reader');
				}

				return;
			}

			if (input === 'h' || key.backspace || key.delete) {
				if (!currentFolderPath) {
					return;
				}

				setCurrentFolderPath(getParentFolderPath(currentFolderPath));
				setSelectedIndex(0);
				return;
			}
		}

		if (mode === 'reader') {
			if (input === 'h' || key.backspace || key.delete) {
				const previousNote = noteHistory.at(-1);

				if (previousNote) {
					setActiveNote(previousNote);
					setNoteHistory((currentHistory) => currentHistory.slice(0, -1));
					setReaderScrollOffset(0);
					setReaderRenderedLineCount(0);
					setLinksFocused(false);
					setSelectedLinkIndex(0);
				} else {
					setMode('explorer');
					setActiveNote(undefined);
					setReaderScrollOffset(0);
					setReaderRenderedLineCount(0);
					setLinksFocused(false);
					setSelectedLinkIndex(0);
				}

				return;
			}

			if (!activeNote) {
				return;
			}

			const resolvedLinks = resolveWikiLinks(activeNote.wikiLinks, vaultIndex);

			if (key.escape && linksFocused) {
				setLinksFocused(false);
				return;
			}

			if (input === 'l' && resolvedLinks.length > 0) {
				setLinksFocused(true);
				setSelectedLinkIndex((currentIndex) =>
					Math.min(currentIndex, resolvedLinks.length - 1),
				);
				return;
			}

			if (linksFocused) {
				if (key.upArrow) {
					setSelectedLinkIndex((currentIndex) => Math.max(0, currentIndex - 1));
					return;
				}

				if (key.downArrow) {
					setSelectedLinkIndex((currentIndex) =>
						Math.min(resolvedLinks.length - 1, currentIndex + 1),
					);
					return;
				}

				if (key.return) {
					const selectedLink = resolvedLinks[selectedLinkIndex];

					if (selectedLink?.note) {
						setNoteHistory((currentHistory) => [...currentHistory, activeNote]);
						setActiveNote(selectedLink.note);
						setReaderScrollOffset(0);
						setReaderRenderedLineCount(0);
						setLinksFocused(false);
						setSelectedLinkIndex(0);
						setFocusArea('content');
					}

					return;
				}

				return;
			}

			const maxScrollOffset = Math.max(
				getReaderMaxScrollOffset(
					activeNote.content,
					getReaderVisibleLineCount(getDashboardBodyHeight(stdout.rows)),
				),
				readerRenderedLineCount - getReaderVisibleLineCount(getDashboardBodyHeight(stdout.rows)),
				0,
			);

			if (key.upArrow || input === 'k') {
				setReaderScrollOffset((currentOffset) => Math.max(0, currentOffset - 1));
				return;
			}

			if (key.downArrow || input === 'j') {
				setReaderScrollOffset((currentOffset) =>
					Math.min(maxScrollOffset, currentOffset + 1),
				);
				return;
			}

			if (key.pageUp) {
				setReaderScrollOffset((currentOffset) => Math.max(0, currentOffset - 10));
				return;
			}

			if (key.pageDown) {
				setReaderScrollOffset((currentOffset) =>
					Math.min(maxScrollOffset, currentOffset + 10),
				);
			}
		}
	});

	const currentFolder = vaultIndex?.foldersByPath.get(currentFolderPath) ?? vaultIndex?.tree;
	const terminalRows = stdout.rows;
	const terminalColumns = stdout.columns;
	const dashboardBodyHeight = getDashboardBodyHeight(terminalRows);
	const contentWidth = getContentWidth(terminalColumns);
	const explorerVisibleItemCount = getExplorerVisibleItemCount(dashboardBodyHeight);
	const readerVisibleLineCount = getReaderVisibleLineCount(dashboardBodyHeight);
	const searchVisibleResultCount = getSearchVisibleResultCount(dashboardBodyHeight);
	const navigationItems = getNavigationItems(activeNote);

	return (
		<Box flexDirection="column" height={terminalRows} width={terminalColumns}>
			<Header mode={mode} focusArea={focusArea} />
			<Box flexDirection="row" height={dashboardBodyHeight}>
				<Sidebar
					activeMode={mode}
					focusArea={focusArea}
					items={navigationItems}
					selectedIndex={navigationSelectedIndex}
					height={dashboardBodyHeight}
					vaultIndex={vaultIndex}
					activeNote={activeNote}
				/>
				<Box
					borderStyle={focusArea === 'content' ? 'double' : 'single'}
					flexDirection="column"
					flexGrow={1}
					height={dashboardBodyHeight}
					paddingX={1}
				>
					{mode === 'loading' ? <LoadingState vaultPath={vaultPath} /> : null}
					{mode === 'error' && loadError ? <ErrorState error={loadError} /> : null}
					{mode === 'explorer' && vaultIndex && currentFolder ? (
						<ExplorerScreen
							vaultIndex={vaultIndex}
							currentFolder={currentFolder}
							selectedIndex={selectedIndex}
							visibleItemCount={explorerVisibleItemCount}
						/>
					) : null}
					{mode === 'reader' && activeNote && vaultIndex ? (
						<ReaderScreen
							note={activeNote}
							vaultIndex={vaultIndex}
							scrollOffset={readerScrollOffset}
							linksFocused={linksFocused}
							selectedLinkIndex={selectedLinkIndex}
							visibleBodyLineCount={readerVisibleLineCount}
							renderer={markdownRenderer}
							renderWidth={contentWidth}
							onRenderedLineCountChange={setReaderRenderedLineCount}
						/>
					) : null}
					{mode === 'search' ? (
						<SearchScreen
							query={searchQuery}
							results={searchResults}
							selectedIndex={searchSelectedIndex}
							visibleResultCount={searchVisibleResultCount}
						/>
					) : null}
					{showHelp ? <HelpPanel /> : null}
				</Box>
			</Box>
			<Footer mode={mode} focusArea={focusArea} />
		</Box>
	);
}

function getNavigationItems(activeNote: NoteFile | undefined): Array<{
	id: NavigationItemId;
	label: string;
	isEnabled: boolean;
}> {
	return [
		{id: 'explorer', label: 'Explorer', isEnabled: true},
		{id: 'reader', label: 'Reader', isEnabled: Boolean(activeNote)},
		{id: 'search', label: 'Search', isEnabled: true},
	];
}

function getDashboardBodyHeight(rows: number): number {
	return Math.max(1, rows - 4);
}

function getContentWidth(columns: number): number {
	return Math.max(20, columns - 34);
}

function getExplorerVisibleItemCount(bodyHeight: number): number {
	return Math.max(1, bodyHeight - 8);
}

function getReaderVisibleLineCount(bodyHeight: number): number {
	return Math.max(4, bodyHeight - 11);
}

function getSearchVisibleResultCount(bodyHeight: number): number {
	return Math.max(1, Math.min(20, Math.floor((bodyHeight - 4) / 3)));
}

type LoadingStateProperties = {
	vaultPath: string | undefined;
};

function LoadingState({vaultPath}: LoadingStateProperties) {
	return (
		<Box flexDirection="column">
			<Text>Loading vault...</Text>
			{vaultPath ? <Text dimColor>{vaultPath}</Text> : null}
		</Box>
	);
}

type ErrorStateProperties = {
	error: VaultLoadError;
};

function ErrorState({error}: ErrorStateProperties) {
	return (
		<Box flexDirection="column">
			<Text color="red">Could not load vault</Text>
			<Text>{error.message}</Text>
			{error.code === 'missing-path' ? (
				<Text dimColor>Usage: obsidian-tui-reader /path/to/vault</Text>
			) : null}
		</Box>
	);
}

function isSearchTextInput(input: string): boolean {
	return input.length === 1 && input >= ' ' && input !== '\u007F';
}

function toLoadError(error: unknown): VaultLoadError {
	if (error instanceof VaultIndexError) {
		return error.toLoadError();
	}

	if (error instanceof Error) {
		return {
			code: 'read-failed',
			message: error.message,
		};
	}

	return {
		code: 'read-failed',
		message: 'An unknown error occurred while loading the vault.',
	};
}
