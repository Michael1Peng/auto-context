import * as vscode from 'vscode';

import { languageCommentMap, regexFactory, position } from '../utils';
import { marksConfig } from '../config';

export async function insertContentFromAllTabs() {
    const allOpenDocuments = vscode.workspace.textDocuments;
    const activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor) {
        return;
    }

    const activeDocumentUri = activeEditor.document.uri.toString();

    let allFormattedContent = '';
    const addedFileUris: string[] = [];
    allOpenDocuments.forEach(document => {
        if (document.uri.scheme !== 'file' || document.uri.toString() === activeDocumentUri || addedFileUris.includes(document.uri.toString())) {
            return;
        }

        let content = document.getText();
        content = filterContent(content, document.languageId);
        if (!content) {
            return;
        }

        const formattedContent = formatContentAsComments(content, document.uri.toString(), document.languageId);
        allFormattedContent += formattedContent + "\n\n";

        addedFileUris.push(document.uri.toString());
    });
    await replaceEditorTopComment(activeEditor, allFormattedContent);
}

function filterContent(content: string, languageId: string): string {
    const {
        commentBlockRegex,
        blockCommentStartRegex,
        blockCommentEndRegex,
        copilotContextAllRegex,
    } = regexFactory.getRegex(languageId);

    const filterCommentContent = content.replace(commentBlockRegex, '');

    // 将所有匹配的块拼接成一个字符串
    let filteredContent = '';

    filteredContent = findByAllRegex(filterCommentContent, languageId);

    if (!filteredContent) {
        filteredContent = findByGlobalRegex(filterCommentContent, languageId);
    }

    return filteredContent.replace(blockCommentStartRegex, '').replace(blockCommentEndRegex, '').replace(copilotContextAllRegex, '');
}

function findByAllRegex(content: string, languageId: string): string {
    const {
        copilotContextAllRegex,
    } = regexFactory.getRegex(languageId);

    const matches = content.match(copilotContextAllRegex);

    if (matches) {
        return content;
    }
    return '';
}

function findByGlobalRegex(content: string, languageId: string): string {
    const {
        copilotContextRegexGlobal,
        copilotContextBlockRegex,
    } = regexFactory.getRegex(languageId);

    const matches = content.match(copilotContextRegexGlobal);

    if (!matches) {
        return '';
    }

    // 将所有匹配的块拼接成一个字符串
    let filteredContent = '';
    matches.forEach(match => {
        // 从每个匹配项中提取Start和End标签之间的内容
        const matchContent = match.match(copilotContextBlockRegex);
        if (matchContent && matchContent[1]) {
            filteredContent += matchContent[1].trim() + "\n\n";
        }
    });

    return filteredContent;
}

function formatContentAsComments(content: string, fileUri: string, languageId: string): string {
    const { chunkStart, chunkEnd } = marksConfig.getMarksConfig();
    const { lineString, blockStartString, blockEndString } = languageCommentMap.getLanguageComment(languageId);

    return `${lineString} ${chunkStart}\n${lineString} file: ${fileUri}\n${blockStartString}\n${content}\n${blockEndString}\n${lineString} ${chunkEnd}`;
}

async function replaceEditorTopComment(activeEditor: vscode.TextEditor, formattedContent: string) {
    await activeEditor.edit(editBuilder => {
        const endPosition = position.getTopCommentBlockPosition();
        if (endPosition) {
            const range = new vscode.Range(new vscode.Position(0, 0), endPosition);
            editBuilder.replace(range, formattedContent);
        } else {
            const startOfDocument = activeEditor.document.positionAt(0);
            editBuilder.insert(startOfDocument, formattedContent);
        }
    });
}
