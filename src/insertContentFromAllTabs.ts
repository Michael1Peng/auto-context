import * as vscode from 'vscode';

const commentBlockRegex = /\/\/ CHUNK START[\s\S]*?\/\/ CHUNK END\n/g;
const blockCommentStartRegex = /\/\*/g;
const blockCommentEndRegex = /\*\//g;
const lineCommentRegex = /\/\/.*$/gm;
const copilotContextRegexGlobal = /\/\/ \[COPILOT CONTEXT\] Start([\s\S]*?)\/\/ \[COPILOT CONTEXT\] End/g;
const copilotContextRegex = /\/\/ \[COPILOT CONTEXT\] Start([\s\S]*?)\/\/ \[COPILOT CONTEXT\] End/;

const activeEditorLanguageIdList = ['javascript', 'typescript', 'typescriptreact', 'javascriptreact'];

export function insertContentFromAllTabs() {
    const allOpenDocuments = vscode.workspace.textDocuments;
    const activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor) {
        return;
    }

    const activeDocumentUri = activeEditor.document.uri.toString();
    if (!activeEditorLanguageIdList.includes(activeEditor.document.languageId)) {
        return;
    }

    let allFormattedContent = '';
    allOpenDocuments.forEach(document => {
        if (document.uri.scheme !== 'file' || document.uri.toString() === activeDocumentUri) {
            return;
        }

        let content = document.getText();
        content = filterContent(content);
        if (!content) {
            return;
        }

        const formattedContent = formatContentAsComments(content, document.uri.toString());
        allFormattedContent += formattedContent + "\n\n";
    });

    replaceEditorTopComment(activeEditor, allFormattedContent);
}

function filterContent(content: string): string {
    const filterCommentContent = content.replace(commentBlockRegex, '');

    const matches = filterCommentContent.match(copilotContextRegexGlobal);

    if (!matches) {
        return '';
    }

    // 将所有匹配的块拼接成一个字符串
    let filteredContent = '';
    matches.forEach(match => {
        // 从每个匹配项中提取Start和End标签之间的内容
        const matchContent = match.match(copilotContextRegex);
        if (matchContent && matchContent[1]) {
            filteredContent += matchContent[1].trim() + "\n\n";
        }
    });

    return filteredContent.replace(blockCommentStartRegex, '').replace(blockCommentEndRegex, '');
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
