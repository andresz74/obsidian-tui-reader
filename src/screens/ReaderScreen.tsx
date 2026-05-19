import React, {useEffect, useMemo, useState} from 'react';
import {Box, Text} from 'ink';
import {AnsiLine} from '../components/AnsiLine.js';
import {MarkdownLine} from '../components/MarkdownLine.js';
import {glowInstallUrl, renderMarkdownWithGlow} from '../lib/renderGlow.js';
import {resolveWikiLinks} from '../lib/resolveWikiLink.js';
import {renderMarkdownToLines} from '../lib/renderMarkdown.js';
import type {MarkdownRenderer, NoteFile, ResolvedWikiLink, VaultIndex} from '../types.js';

const defaultVisibleBodyLines = 16;

type ReaderScreenProperties = {
	note: NoteFile;
	vaultIndex: VaultIndex;
	scrollOffset: number;
	linksFocused: boolean;
	selectedLinkIndex: number;
	visibleBodyLineCount: number;
	renderer: MarkdownRenderer;
	renderWidth: number;
	onRenderedLineCountChange: (lineCount: number) => void;
};

export function ReaderScreen({
	note,
	vaultIndex,
	scrollOffset,
	linksFocused,
	selectedLinkIndex,
	visibleBodyLineCount,
	renderer,
	renderWidth,
	onRenderedLineCountChange,
}: ReaderScreenProperties) {
	const lines = useMemo(() => renderMarkdownToLines(note.content), [note.content]);
	const [glowState, setGlowState] = useState<GlowState>({status: 'idle'});
	const links = useMemo(
		() => resolveWikiLinks(note.wikiLinks, vaultIndex),
		[note.wikiLinks, vaultIndex],
	);
	const renderedLineCount =
		renderer === 'glow' && glowState.status === 'success'
			? glowState.lines.length
			: lines.length;
	const safeScrollOffset = Math.min(scrollOffset, Math.max(0, renderedLineCount - 1));
	const visibleInternalLines = lines.slice(
		safeScrollOffset,
		safeScrollOffset + visibleBodyLineCount,
	);
	const visibleGlowLines =
		glowState.status === 'success'
			? glowState.lines.slice(safeScrollOffset, safeScrollOffset + visibleBodyLineCount)
			: [];
	const endLine = Math.min(
		renderedLineCount,
		safeScrollOffset +
			(renderer === 'glow' && glowState.status === 'success'
				? visibleGlowLines.length
				: visibleInternalLines.length),
	);

	useEffect(() => {
		onRenderedLineCountChange(renderedLineCount);
	}, [onRenderedLineCountChange, renderedLineCount]);

	useEffect(() => {
		let isCurrent = true;

		if (renderer !== 'glow') {
			setGlowState({status: 'idle'});
			return () => {
				isCurrent = false;
			};
		}

		setGlowState({status: 'loading'});

		void renderMarkdownWithGlow(note.content, renderWidth).then((result) => {
			if (!isCurrent) {
				return;
			}

			setGlowState(result);
		});

		return () => {
			isCurrent = false;
		};
	}, [note.content, renderWidth, renderer]);

	return (
		<Box flexDirection="column" height="100%">
			<Text bold>{note.title}</Text>
			<Text dimColor>{note.relativePath}</Text>
			<Text dimColor>
				Line {renderedLineCount === 0 ? 0 : safeScrollOffset + 1}-{endLine} of{' '}
				{renderedLineCount}
			</Text>
			<GlowNotice renderer={renderer} glowState={glowState} />
			<Box flexDirection="column" height={visibleBodyLineCount} marginTop={1}>
				{renderer === 'glow' && glowState.status === 'success' ? (
					visibleGlowLines.map((line, index) => (
						<AnsiLine key={`${safeScrollOffset + index}-glow`} line={line} />
					))
				) : visibleInternalLines.length === 0 ? (
					<Text dimColor>This note is empty.</Text>
				) : (
					visibleInternalLines.map((line, index) => (
						<MarkdownLine key={`${safeScrollOffset + index}-${line.type}`} line={line} />
					))
				)}
			</Box>
			<LinksPanel
				links={links}
				isFocused={linksFocused}
				selectedIndex={selectedLinkIndex}
			/>
		</Box>
	);
}

type GlowState =
	| {status: 'idle' | 'loading'}
	| {status: 'success'; lines: string[]}
	| {status: 'missing' | 'error'; message: string};

type GlowNoticeProperties = {
	renderer: MarkdownRenderer;
	glowState: GlowState;
};

function GlowNotice({renderer, glowState}: GlowNoticeProperties) {
	if (renderer !== 'glow') {
		return null;
	}

	if (glowState.status === 'loading') {
		return <Text dimColor>Rendering with Glow...</Text>;
	}

	if (glowState.status === 'missing') {
		return (
			<Text color="yellow">
				Glow is not installed. Using built-in renderer. Install Glow from {glowInstallUrl}
			</Text>
		);
	}

	if (glowState.status === 'error') {
		return (
			<Text color="yellow">
				Glow render failed. Using built-in renderer. {glowState.message}
			</Text>
		);
	}

	return <Text dimColor>Rendered with Glow</Text>;
}

export function getReaderMaxScrollOffset(
	content: string,
	visibleBodyLineCount = defaultVisibleBodyLines,
): number {
	const lines = renderMarkdownToLines(content);
	return Math.max(0, lines.length - visibleBodyLineCount);
}

type LinksPanelProperties = {
	links: ResolvedWikiLink[];
	isFocused: boolean;
	selectedIndex: number;
};

function LinksPanel({links, isFocused, selectedIndex}: LinksPanelProperties) {
	return (
		<Box marginTop={1} flexDirection="column">
			{isFocused ? (
				<Text bold color="cyan">
					Links {links.length > 0 ? `(${links.length})` : ''}
					{links.length > 0 ? ' · Enter opens selected link · Esc exits links' : ''}
				</Text>
			) : (
				<Text bold>
					Links {links.length > 0 ? `(${links.length})` : ''}
					{links.length > 0 ? ' · press l to focus' : ''}
				</Text>
			)}
			{links.length === 0 ? <Text dimColor>No wiki links in this note.</Text> : null}
			{links.slice(0, 8).map((link, index) => (
				<LinkRow
					key={`${link.link.raw}-${index}`}
					link={link}
					isSelected={isFocused && index === selectedIndex}
				/>
			))}
			{links.length > 8 ? <Text dimColor>...{links.length - 8} more</Text> : null}
		</Box>
	);
}

type LinkRowProperties = {
	link: ResolvedWikiLink;
	isSelected: boolean;
};

function LinkRow({link, isSelected}: LinkRowProperties) {
	const marker = isSelected ? '>' : ' ';
	const status = formatLinkStatus(link);
	const rowText = `${marker} ${link.link.raw}`;

	return (
		<Box>
			{isSelected ? (
				<Text color="black" backgroundColor="cyan">
					{rowText}
				</Text>
			) : (
				<Text color={link.isResolved ? 'magenta' : 'red'}>{rowText}</Text>
			)}
			<Text dimColor> {status}</Text>
		</Box>
	);
}

function formatLinkStatus(link: ResolvedWikiLink): string {
	if (!link.isResolved) {
		return 'unresolved';
	}

	if (link.isAmbiguous) {
		return `${link.note?.relativePath} · ambiguous (${link.matchCount})`;
	}

	return link.note?.relativePath ?? 'resolved';
}
