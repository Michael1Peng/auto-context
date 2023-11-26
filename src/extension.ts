import * as vscode from 'vscode';

import { insertContentFromAllTabs } from './insertContentFromAllTabs';
import { OutputChannelManager } from './outputChannelManager';

export function activate(context: vscode.ExtensionContext) {
	OutputChannelManager.initialize("auto-context");
	OutputChannelManager.appendLine("auto-context activated.");
	OutputChannelManager.show();

	let fileOpenListener = vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			insertContentFromAllTabs();
		}
	});

	context.subscriptions.push(fileOpenListener);
}

// This method is called when your extension is deactivated
export function deactivate() { }
