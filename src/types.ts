export type AppMode = 'loading' | 'explorer' | 'reader' | 'search' | 'error';
export type SearchReturnMode = 'explorer' | 'reader';
export type FocusArea = 'navigation' | 'content';
export type NavigationItemId = 'explorer' | 'reader' | 'search';
export type MarkdownRenderer = 'internal' | 'glow';

export type WikiLink = {
	raw: string;
	target: string;
	alias?: string;
};

export type ResolvedWikiLink = {
	link: WikiLink;
	displayText: string;
	normalizedTarget: string;
	note?: NoteFile;
	isResolved: boolean;
	isAmbiguous: boolean;
	matchCount: number;
};

export type NoteFile = {
	title: string;
	filename: string;
	absolutePath: string;
	relativePath: string;
	folderPath: string;
	content: string;
	wikiLinks: WikiLink[];
	tags: string[];
};

export type ExplorerNoteEntry = {
	type: 'note';
	name: string;
	path: string;
	note: NoteFile;
};

export type ExplorerFolderEntry = {
	type: 'folder';
	name: string;
	path: string;
	children: ExplorerEntry[];
	noteCount: number;
};

export type ExplorerEntry = ExplorerFolderEntry | ExplorerNoteEntry;

export type MarkdownInlineSegment = {
	text: string;
	type: 'text' | 'inlineCode' | 'wikiLink';
};

export type MarkdownLine =
	| {
			type: 'blank' | 'horizontalRule';
	  }
	| {
			type: 'heading';
			level: number;
			segments: MarkdownInlineSegment[];
	  }
	| {
			type: 'paragraph' | 'blockquote' | 'bullet' | 'numbered';
			segments: MarkdownInlineSegment[];
			prefix?: string;
	  }
	| {
			type: 'code';
			text: string;
	  };

export type SearchMatchType = 'title' | 'filename' | 'tag' | 'path' | 'content';

export type SearchResult = {
	note: NoteFile;
	matchType: SearchMatchType;
	score: number;
	snippet?: string;
};

export type VaultIndex = {
	rootPath: string;
	notes: NoteFile[];
	notesByRelativePath: Map<string, NoteFile>;
	notesByTitle: Map<string, NoteFile[]>;
	tree: ExplorerFolderEntry;
	foldersByPath: Map<string, ExplorerFolderEntry>;
	warnings: VaultWarning[];
};

export type VaultWarning = {
	path: string;
	message: string;
};

export type VaultLoadErrorCode = 'missing-path' | 'not-found' | 'not-directory' | 'read-failed';

export type VaultLoadError = {
	code: VaultLoadErrorCode;
	message: string;
};
