import assert from 'node:assert/strict';
import test from 'node:test';
import {extractWikiLinks} from '../../src/lib/wikiLinks.js';

test('extractWikiLinks parses basic links, aliases, paths, and headings', () => {
	const links = extractWikiLinks(
		'See [[Note Name]], [[Folder/Note Name]], [[Note Name|Alias]], and [[Note Name#Heading]].',
	);

	assert.deepEqual(links, [
		{raw: '[[Note Name]]', target: 'Note Name'},
		{raw: '[[Folder/Note Name]]', target: 'Folder/Note Name'},
		{raw: '[[Note Name|Alias]]', target: 'Note Name', alias: 'Alias'},
		{raw: '[[Note Name#Heading]]', target: 'Note Name#Heading'},
	]);
});

test('extractWikiLinks ignores empty or multiline wiki links', () => {
	const links = extractWikiLinks('Ignore [[]] and [[Broken\nLink]], keep [[Valid]].');

	assert.deepEqual(links, [{raw: '[[Valid]]', target: 'Valid'}]);
});
