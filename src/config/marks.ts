import * as vscode from 'vscode';

interface MarksConfig {
  copilotContext: string;
  chunkStart: string;
  chunkEnd: string;
}

export function getMarksConfig(): MarksConfig {
  const config = vscode.workspace.getConfiguration('auto-context');
  const marksConfigMap: MarksConfig = config.get('marksConfig') as MarksConfig;

  return marksConfigMap;
}
