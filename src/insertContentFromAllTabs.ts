import * as vscode from 'vscode';

const commentBlockRegex = /\/\/ CHUNK START[\s\S]*?\/\/ CHUNK END\n/g;
const blockCommentRegex = /\/\*[\s\S]*?\*\//g;
const lineCommentRegex = /\/\/.*$/gm;

export function insertContentFromAllTabs() {
    const allOpenDocuments = vscode.workspace.textDocuments;
    const activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor) {
        return;
    }

    const activeDocumentUri = activeEditor.document.uri.toString();

    let allFormattedContent = '';
    allOpenDocuments.forEach(document => {
        if (document.uri.scheme !== 'file' || document.uri.toString() === activeDocumentUri) {
            return;
        }

        let content = document.getText();
        content = filterOutExistingComments(content);

        const formattedContent = formatContentAsComments(content, document.uri.toString());
        allFormattedContent += formattedContent + "\n\n";
    });

    if (!allFormattedContent) {
        return;
    }

    replaceEditorTopComment(activeEditor, allFormattedContent);
}

function filterOutExistingComments(content: string): string {

    return content.replace(commentBlockRegex, '').replace(blockCommentRegex, '').replace(lineCommentRegex, '')
}

function formatContentAsComments(content: string, fileUri: string): string {
    return `// CHUNK START\n// file: ${fileUri}\n/**\n${content}\n*/\n// CHUNK END`;
}

function replaceEditorTopComment(activeEditor: vscode.TextEditor, formattedContent: string) {
    activeEditor.edit(editBuilder => {
        const commentBlockMatch = activeEditor.document.getText().match(commentBlockRegex);
        if (commentBlockMatch) {
            const startPosition = activeEditor.document.positionAt(0);

            // 获取commentBlockMatch[0] 的长度，加上换行符数量来确定endPosition
            const endPosition = activeEditor.document.positionAt(0 + commentBlockMatch[0].length + 1);

            const range = new vscode.Range(startPosition, endPosition);
            editBuilder.replace(range, formattedContent);
        } else {
            const startOfDocument = activeEditor.document.positionAt(0);
            editBuilder.insert(startOfDocument, formattedContent);
        }
    });
}
