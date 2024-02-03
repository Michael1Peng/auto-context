import * as vscode from 'vscode';

import { regexFactory } from '../utils';

export async function removeTopCommentBlocks(document: vscode.TextDocument) {
  const { commentBlockRegexWithLineBreak } = regexFactory.getRegex(document.languageId);
  
  const fileUri = document.uri;

  if (fileUri.scheme !== 'file') {
    return;
  }

  // 读取文件内容
  const buffer = await vscode.workspace.fs.readFile(fileUri);
  let content = buffer.toString();

  // 移除特定格式的注释块
  content = content.replace(commentBlockRegexWithLineBreak, '');

  // 写回文件
  const writeData = Buffer.from(content, 'utf8');
  await vscode.workspace.fs.writeFile(fileUri, writeData);
}
