import * as vscode from 'vscode';

import { removeTopCommentBlocks } from './removeTopCommentBlocks';

export function removeAllTopCommentBlocks() {
  const allOpenDocuments = vscode.workspace.textDocuments;

  allOpenDocuments.forEach(document => {
    if (document.uri.scheme !== 'file') {
      return;
    }

    removeTopCommentBlocks(document);
  });
}
