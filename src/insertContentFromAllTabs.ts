import * as vscode from 'vscode';

export function insertContentFromAllTabs() {
    const allOpenDocuments = vscode.workspace.textDocuments;
    const activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor) {
        return;
    }

    const activeDocumentUri = activeEditor.document.uri.toString();

    allOpenDocuments.forEach(document => {
        if (document.uri.scheme !== 'file' || document.uri.toString() === activeDocumentUri) {
            return;
        }

        const content = document.getText();
        const formattedContent = formatContentAsComments(content, activeEditor.document.languageId);

        activeEditor.edit(editBuilder => {
            const startOfDocument = activeEditor.document.positionAt(0);
            editBuilder.insert(startOfDocument, formattedContent + "\n\n");
        });
    });
}

function formatContentAsComments(content: string, languageId: string): string {
    const commentSyntax = getCommentSyntaxForLanguage(languageId);
    return content.split('\n').map(line => commentSyntax + line).join('\n');
}

function getCommentSyntaxForLanguage(languageId: string): string {
    // Map of language IDs to their respective comment syntax
    const commentSyntaxMap: { [id: string]: string } = {
        'javascript': '// ',
        'typescript': '// ',
        'python': '# ',
        // Add more languages as needed
    };

    return commentSyntaxMap[languageId] || '// '; // Default to '//' if language is not in the map
}
