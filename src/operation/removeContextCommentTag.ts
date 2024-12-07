import * as vscode from 'vscode';

import { switchConfig } from '../config';
import { regexFactory } from '../utils';

export async function removeContextCommentTag(document: vscode.TextDocument) {
  const { copilotContextRegex, copilotContextAllRegex } = regexFactory.getRegex(document.languageId);
  
  const fileUri = document.uri;

  if (fileUri.scheme !== 'file') {
    return;
  }

  try {
    // 读取文件内容
    const buffer = await vscode.workspace.fs.readFile(fileUri);
    let content = buffer.toString();

    // 移除特定格式的注释块
    if (switchConfig.getSwitch().cleanCopilotContextCommentOnClose) {
      content = content.replaceAll(copilotContextRegex, '');
      content = content.replaceAll(copilotContextAllRegex, '');
    }

    // 写回文件
    const writeData = Buffer.from(content, 'utf8');
    await vscode.workspace.fs.writeFile(fileUri, writeData);
  } catch (error) {
    console.error(error);
  }
}
