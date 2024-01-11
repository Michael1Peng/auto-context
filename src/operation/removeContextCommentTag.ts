import * as vscode from 'vscode';

const copilotContextStartRegex = /\/\/ \[COPILOT CONTEXT\] Start\n/;
const copilotContextEndRegex = /\/\/ \[COPILOT CONTEXT\] End here\n/;

let config = vscode.workspace.getConfiguration('auto-context');
let cleanCopilotContextCommentOnClose = config.get('cleanCopilotContextCommentOnClose');

export async function removeContextCommentTag(document: vscode.TextDocument) {
  const fileUri = document.uri;

  if (fileUri.scheme !== 'file') {
    return;
  }

  try {
    // 读取文件内容
    const buffer = await vscode.workspace.fs.readFile(fileUri);
    let content = buffer.toString();

    // 移除特定格式的注释块
    if (cleanCopilotContextCommentOnClose) {
      content = content.replace(copilotContextStartRegex, '');
      content = content.replace(copilotContextEndRegex, '');
    }

    // 写回文件
    const writeData = Buffer.from(content, 'utf8');
    await vscode.workspace.fs.writeFile(fileUri, writeData);
  } catch (error) {
    console.error(error);
  }
}
