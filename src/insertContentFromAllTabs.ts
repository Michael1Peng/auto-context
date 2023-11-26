// src/insertContentFromAllTabs.ts

import * as vscode from 'vscode';

export function insertContentFromAllTabs() {
    const allOpenDocuments = vscode.workspace.textDocuments;
    const activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor) {
        return;
    }

    const activeDocumentUri = activeEditor.document.uri.toString();
    const existingCommentedFiles = parseExistingComments(activeEditor.document);

    allOpenDocuments.forEach(document => {
        if (document.uri.scheme !== 'file' || document.uri.toString() === activeDocumentUri || existingCommentedFiles.includes(document.uri.toString())) {
            return;
        }

        let content = document.getText();
        content = filterOutExistingComments(content);

        const formattedContent = formatContentAsComments(content, document.uri.toString());

        activeEditor.edit(editBuilder => {
            const startOfDocument = activeEditor.document.positionAt(0);
            editBuilder.insert(startOfDocument, formattedContent + "\n\n");
        });
    });
}

function filterOutExistingComments(content: string): string {
    const commentBlockRegex = /\/\/ CHUNK START[\s\S]*?\/\/ CHUNK END\n/g;
    return content.replace(commentBlockRegex, '');
}

function formatContentAsComments(content: string, fileUri: string): string {
    return `// CHUNK START\n// file: ${fileUri}\n${content.split('\n').map(line => '// ' + line).join('\n')}\n// CHUNK END`;
}

function parseExistingComments(document: vscode.TextDocument): string[] {
    const text = document.getText(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(10, 0))); // Read the first 10 lines
    const regex = /\/\/ file: (.+)/g;
    const matchedFiles = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
        matchedFiles.push(match[1]);
    }

    return matchedFiles;
}
