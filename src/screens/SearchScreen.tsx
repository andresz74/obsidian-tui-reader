import React from 'react';
import {Box, Text} from 'ink';
import type {SearchResult} from '../types.js';

type SearchScreenProperties = {
	query: string;
	results: SearchResult[];
	selectedIndex: number;
	visibleResultCount: number;
};

export function SearchScreen({
	query,
	results,
	selectedIndex,
	visibleResultCount,
}: SearchScreenProperties) {
	const firstVisibleIndex = getFirstVisibleIndex(
		results.length,
		selectedIndex,
		visibleResultCount,
	);
	const visibleResults = results.slice(firstVisibleIndex, firstVisibleIndex + visibleResultCount);

	return (
		<Box flexDirection="column">
			<Text bold>Search</Text>
			<Text>
				<Text dimColor>/ </Text>
				{query}
				<Text dimColor>{query ? '' : 'Type to search notes'}</Text>
			</Text>
			<Box marginTop={1} flexDirection="column">
				{renderResults(query, visibleResults, selectedIndex, firstVisibleIndex)}
			</Box>
		</Box>
	);
}

function renderResults(
	query: string,
	results: SearchResult[],
	selectedIndex: number,
	firstVisibleIndex: number,
) {
	if (!query) {
		return <Text dimColor>Type to search notes</Text>;
	}

	if (results.length === 0) {
		return <Text dimColor>No results</Text>;
	}

	return results.map((result, index) => (
		<SearchResultRow
			key={result.note.relativePath}
			result={result}
			isSelected={firstVisibleIndex + index === selectedIndex}
		/>
	));
}

function getFirstVisibleIndex(
	itemCount: number,
	selectedIndex: number,
	visibleResultCount: number,
): number {
	if (itemCount <= visibleResultCount) {
		return 0;
	}

	const halfWindow = Math.floor(visibleResultCount / 2);
	const centeredIndex = Math.max(0, selectedIndex - halfWindow);
	return Math.min(centeredIndex, itemCount - visibleResultCount);
}

type SearchResultRowProperties = {
	result: SearchResult;
	isSelected: boolean;
};

function SearchResultRow({result, isSelected}: SearchResultRowProperties) {
	const marker = isSelected ? '>' : ' ';
	const title = `${marker} ${result.note.title}`;

	return (
		<Box flexDirection="column">
			{isSelected ? (
				<Text color="black" backgroundColor="cyan">
					{title}
				</Text>
			) : (
				<Text>{title}</Text>
			)}
			<Text dimColor>
				{'  '}
				{result.note.relativePath} · {result.matchType}
			</Text>
			{result.snippet ? (
				<Text color="gray">
					{'  '}
					{result.snippet}
				</Text>
			) : null}
		</Box>
	);
}
