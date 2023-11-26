import * as vscode from 'vscode';

export function insertContentFromAllTabs() {
    const allOpenDocuments = vscode.workspace.textDocuments;
    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor) {
        allOpenDocuments.forEach(document => {
            if (document.uri.scheme!=='file') {
                return;
            }

            const content = document.getText();
            activeEditor.edit(editBuilder => {
                const startOfDocument = activeEditor.document.positionAt(0);
                editBuilder.insert(startOfDocument, content + "\n"); // 添加换行符进行分隔
            });
        });
    }
}
