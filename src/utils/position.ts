import * as vscode from 'vscode';

import { regexFactory } from '.';

export function getTopCommentBlockPosition(): vscode.Position | undefined {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        return;
    }

    const {
        commentBlockRegex,
    } = regexFactory.getRegex(activeEditor.document.languageId);

    const commentBlockMatch = activeEditor.document.getText().match(commentBlockRegex);
    if (!commentBlockMatch) {
        return;
    }

    // 获取commentBlockMatch[0] 的长度，加上换行符数量来确定endPosition
    let commentBlockLength = 0;
    for (let i = 0; i < commentBlockMatch.length; i++) {
        commentBlockLength += commentBlockMatch[i].length + 1;
    }
    const endPosition = activeEditor.document.positionAt(commentBlockLength);
    return endPosition;
}
