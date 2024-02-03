import * as vscode from 'vscode';

interface Config {
    cleanCopilotContextCommentOnClose: boolean;
}

export function getSwitch(): Config {
    const config = vscode.workspace.getConfiguration('auto-context');
    const cleanCopilotContextCommentOnClose = config.get('cleanCopilotContextCommentOnClose') as boolean;

    return {
        cleanCopilotContextCommentOnClose,
    };
}
