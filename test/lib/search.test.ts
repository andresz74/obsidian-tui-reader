import assert from 'node:assert/strict';
import test from 'node:test';
import {searchNotes} from '../../src/lib/search.js';
import {createNote, createVaultIndex} from './helpers.js';

test('searchNotes ranks exact title, starts-with title, filename, tag, path, and content matches', () => {
	const vaultIndex = createVaultIndex([
		createNote({title: 'Project', relativePath: 'z-exact.md'}),
		createNote({title: 'Project Notes', relativePath: 'a-starts.md'}),
		createNote({title: 'Filename Match', relativePath: 'project-file.md'}),
		createNote({title: 'Tagged', relativePath: 'tagged.md', tags: ['project']}),
		createNote({title: 'Path Match', relativePath: 'project/path-match.md'}),
		createNote({title: 'Body Match', relativePath: 'body.md', content: 'This mentions project in the body.'}),
	]);

	const results = searchNotes(vaultIndex, 'project');

	assert.deepEqual(
		results.map((result) => result.note.title),
		['Project', 'Project Notes', 'Filename Match', 'Tagged', 'Path Match', 'Body Match'],
	);
	assert.deepEqual(
		results.map((result) => result.matchType),
		['title', 'title', 'filename', 'tag', 'path', 'content'],
	);
});

test('searchNotes returns content snippets and ignores empty queries', () => {
	const vaultIndex = createVaultIndex([
		createNote({
			title: 'Body Match',
			relativePath: 'body.md',
			content: 'Alpha beta gamma delta epsilon zeta eta theta project iota kappa lambda.',
		}),
	]);

	assert.deepEqual(searchNotes(vaultIndex, '   '), []);

	const [result] = searchNotes(vaultIndex, 'project');

	assert.equal(result?.matchType, 'content');
	assert.match(result?.snippet ?? '', /project/);
});

test('searchNotes limits results to the top twenty', () => {
	const notes = Array.from({length: 25}, (_, index) =>
		createNote({title: `Project ${String(index).padStart(2, '0')}`, relativePath: `note-${index}.md`}),
	);

	const results = searchNotes(createVaultIndex(notes), 'project');

	assert.equal(results.length, 20);
});
