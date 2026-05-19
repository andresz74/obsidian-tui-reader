import assert from 'node:assert/strict';
import test from 'node:test';
import {buildVaultTree, getParentFolderPath} from '../../src/lib/tree.js';
import {createNote} from './helpers.js';

test('buildVaultTree creates sorted folders before notes with recursive note counts', () => {
	const rootNote = createNote({title: 'Root Note', relativePath: 'root.md'});
	const betaNote = createNote({title: 'Beta Note', relativePath: 'Beta/beta.md'});
	const alphaNote = createNote({title: 'Alpha Note', relativePath: 'Alpha/alpha.md'});
	const nestedNote = createNote({title: 'Nested Note', relativePath: 'Alpha/Nested/nested.md'});

	const {tree, foldersByPath} = buildVaultTree([rootNote, betaNote, alphaNote, nestedNote]);

	assert.equal(tree.noteCount, 4);
	assert.deepEqual(
		tree.children.map((child) => child.name),
		['Alpha', 'Beta', 'Root Note'],
	);

	const alpha = foldersByPath.get('Alpha');
	assert.equal(alpha?.noteCount, 2);
	assert.deepEqual(
		alpha?.children.map((child) => child.name),
		['Nested', 'Alpha Note'],
	);
	assert.equal(foldersByPath.get('Alpha/Nested')?.noteCount, 1);
});

test('getParentFolderPath returns parent folder paths and keeps root stable', () => {
	assert.equal(getParentFolderPath(''), '');
	assert.equal(getParentFolderPath('Alpha'), '');
	assert.equal(getParentFolderPath('Alpha/Nested'), 'Alpha');
	assert.equal(getParentFolderPath('Alpha/Nested/Deep'), 'Alpha/Nested');
});
