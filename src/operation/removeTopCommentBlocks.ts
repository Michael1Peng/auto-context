import * as vscode from 'vscode';

export const commentBlockRegex = /\/\/ CHUNK START[\s\S]*?\/\/ CHUNK END\n\n/g;


export async function removeTopCommentBlocks(document: vscode.TextDocument) {
  let config = vscode.workspace.getConfiguration('auto-context');
  let cleanCopilotContextCommentOnClose = config.get('cleanCopilotContextCommentOnClose');

  const fileUri = document.uri;

  if (fileUri.scheme !== 'file') {
    return;
  }

  // 读取文件内容
  const buffer = await vscode.workspace.fs.readFile(fileUri);
  let content = buffer.toString();

  // 移除特定格式的注释块
  content = content.replace(commentBlockRegex, '');

  // 写回文件
  const writeData = Buffer.from(content, 'utf8');
  await vscode.workspace.fs.writeFile(fileUri, writeData);
}
