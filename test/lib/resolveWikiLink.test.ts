import assert from 'node:assert/strict';
import test from 'node:test';
import {resolveWikiLink} from '../../src/lib/resolveWikiLink.js';
import {createNote, createVaultIndex} from './helpers.js';

test('resolveWikiLink prefers exact relative path before filename and title', () => {
	const target = createNote({title: 'Different Title', relativePath: 'Folder/Note Name.md'});
	const filenameMatch = createNote({title: 'Other', relativePath: 'Other/Note Name.md'});
	const titleMatch = createNote({title: 'Folder/Note Name', relativePath: 'Title.md'});
	const vaultIndex = createVaultIndex([filenameMatch, titleMatch, target]);

	const resolved = resolveWikiLink({raw: '[[Folder/Note Name]]', target: 'Folder/Note Name'}, vaultIndex);

	assert.equal(resolved.isResolved, true);
	assert.equal(resolved.note, target);
	assert.equal(resolved.normalizedTarget, 'Folder/Note Name');
});

test('resolveWikiLink handles aliases and heading links without requiring heading support', () => {
	const note = createNote({title: 'Note Name', relativePath: 'Note Name.md'});
	const vaultIndex = createVaultIndex([note]);

	const resolved = resolveWikiLink(
		{raw: '[[Note Name#Heading|Alias]]', target: 'Note Name#Heading', alias: 'Alias'},
		vaultIndex,
	);

	assert.equal(resolved.isResolved, true);
	assert.equal(resolved.note, note);
	assert.equal(resolved.displayText, 'Alias');
	assert.equal(resolved.normalizedTarget, 'Note Name');
});

test('resolveWikiLink falls back case-insensitively and marks ambiguous matches', () => {
	const first = createNote({title: 'Project Plan', relativePath: 'Work/Project Plan.md'});
	const second = createNote({title: 'Other', relativePath: 'Archive/project plan.md'});
	const vaultIndex = createVaultIndex([first, second]);

	const resolved = resolveWikiLink({raw: '[[PROJECT PLAN]]', target: 'PROJECT PLAN'}, vaultIndex);

	assert.equal(resolved.isResolved, true);
	assert.equal(resolved.note, first);
	assert.equal(resolved.isAmbiguous, true);
	assert.equal(resolved.matchCount, 2);
});

test('resolveWikiLink returns unresolved metadata when no note matches', () => {
	const vaultIndex = createVaultIndex([createNote({title: 'Existing', relativePath: 'Existing.md'})]);

	const resolved = resolveWikiLink({raw: '[[Missing]]', target: 'Missing'}, vaultIndex);

	assert.equal(resolved.isResolved, false);
	assert.equal(resolved.note, undefined);
	assert.equal(resolved.isAmbiguous, false);
	assert.equal(resolved.matchCount, 0);
});
