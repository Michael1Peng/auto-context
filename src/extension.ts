import * as vscode from 'vscode';

import { insertContentFromAllTabs } from './operation/insertContentFromAllTabs';
import { OutputChannelManager } from './outputChannelManager';
import { removeTopCommentBlocks } from './operation/removeTopCommentBlocks';
import { removeContextCommentTag } from './operation/removeContextCommentTag';
import { insertCurrentFilePath } from './operation/insertCurrentFilePath';
import { registerCommands } from './commands';

let isEdited = false;

export function activate(context: vscode.ExtensionContext) {
	OutputChannelManager.initialize("auto-context");
	OutputChannelManager.appendLine("auto-context activated.");

	registerCommands(context);

	let resetEditMarkListener = vscode.window.onDidChangeActiveTextEditor(() => {
		isEdited = false;
	});
	context.subscriptions.push(resetEditMarkListener);

	let removeTopCommentBlocksListener = vscode.workspace.onDidCloseTextDocument(async document => {
		await removeTopCommentBlocks(document);
		await removeContextCommentTag(document);
	});
	context.subscriptions.push(removeTopCommentBlocksListener);

	let fileOpenListener = vscode.workspace.onDidChangeTextDocument(async event => {
		if (isEdited) {
			return;
		}

		isEdited = true;
		if (event.document === vscode.window.activeTextEditor?.document) {
			await insertContentFromAllTabs();
			await insertCurrentFilePath();
		}
	});
	
	context.subscriptions.push(fileOpenListener);
}
