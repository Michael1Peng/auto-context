import * as vscode from 'vscode';

export const commentBlockRegex = /\/\/ CHUNK START[\s\S]*?\/\/ CHUNK END\n\n/g;

export function removeTopCommentBlocks(document: vscode.TextDocument) {
  const fileUri = document.uri;

  // 读取文件内容
  vscode.workspace.fs.readFile(fileUri).then((buffer) => {
    let content = buffer.toString();

    // 移除特定格式的注释块
    content = content.replace(commentBlockRegex, '');

    // 写回文件
    const writeData = Buffer.from(content, 'utf8');
    vscode.workspace.fs.writeFile(fileUri, writeData);
  });
}