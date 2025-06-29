import * as vscode from 'vscode';
import * as path from 'path';
import { ExtensionConfig, OutputConfig, IConfigurationManager } from '../types/interfaces';

export class ConfigurationManager implements IConfigurationManager {
	public getConfiguration(): ExtensionConfig {
		const config = vscode.workspace.getConfiguration('autoContext');
		const workspacePath = vscode.workspace.rootPath || '';
		
		// Get the output list from configuration
		const configOutputList = config.get<OutputConfig[]>('outputList') || [];
		
		// If no output list is configured, create a default one
		const outputList = configOutputList.length > 0 ? configOutputList : [{
			path: path.join(workspacePath, 'context-output.txt'),
			format: '<Opened Files>\n<File Name>\n${fileName}\n</File Name>\n<File Content>\n${content}\n</File Content>\n</Opened Files>\n'
		}];

		// Ensure all paths are absolute
		outputList.forEach(output => {
			if (!path.isAbsolute(output.path)) {
				output.relativePath = output.path;
				output.path = path.join(workspacePath, output.path);
			}
		});
		
		return {
			outputList,
			shouldOutput: config.get<boolean>('shouldOutput') || false,
			ignorePinnedTabs: config.get<boolean>('ignorePinnedTabs') || false
		};
	}
} 
