import React from 'react';
import {Box, Text} from 'ink';

export function HelpPanel() {
	return (
		<Box borderStyle="round" flexDirection="column" marginTop={1} paddingX={1}>
			<Text bold>Help</Text>
			<Text>up/down: move selection or scroll</Text>
			<Text>page up/down: scroll reader</Text>
			<Text>enter: open folder or note</Text>
			<Text>backspace/h: go back</Text>
			<Text>/: search notes</Text>
			<Text>esc: close search</Text>
			<Text>l: focus reader links</Text>
			<Text>q: quit</Text>
			<Text>?: toggle help</Text>
		</Box>
	);
}
