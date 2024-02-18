import * as vscode from 'vscode';
import { languageCommentMap, position, regexFactory } from '../utils';
import { marksConfig } from '../config';

export async function insertCurrentFilePath() {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        return;
    }

    const { commentBlockRegex } = regexFactory.getRegex(activeEditor.document.languageId);
    const { chunkStart, chunkEnd } = marksConfig.getMarksConfig();
    const { lineString } = languageCommentMap.getLanguageComment(activeEditor.document.languageId);
    const filePath = activeEditor.document.uri.fsPath;

    const topCommentBlockExists = activeEditor.document.getText().match(commentBlockRegex);
    if (!topCommentBlockExists) {
        return;
    }

    await activeEditor.edit(editBuilder => {
        const endPosition = position.getTopCommentBlockPosition();
        if (!endPosition) {
            return;
        }

        const insertionText = `${lineString} ${chunkStart}\n${lineString} Current File Path: ${filePath}\n${lineString} ${chunkEnd}\n\n`;
        editBuilder.insert(endPosition.translate(1, 0), insertionText);
    });
}
