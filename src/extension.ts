import * as vscode from 'vscode';

import { ContextTracker } from './core/ContextTracker';
import { ConfigurationManager } from './services/ConfigurationManager';

export function activate(context: vscode.ExtensionContext): void {
	const configManager = new ConfigurationManager();
	const contextTracker = new ContextTracker(configManager);
	
	contextTracker.initialize();
	context.subscriptions.push({ dispose: () => contextTracker.dispose() });
}
