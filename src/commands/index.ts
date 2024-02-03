import * as vscode from 'vscode';

import { removeAllTopCommentBlocks } from '../operation/removeAllTopCommentBlocks';

export function registerCommands(context: vscode.ExtensionContext) {
  let removeTopCommentBlocksCommand = vscode.commands.registerCommand('auto-context.removeTopCommentBlocks', removeAllTopCommentBlocks);

  context.subscriptions.push(removeTopCommentBlocksCommand);
}
