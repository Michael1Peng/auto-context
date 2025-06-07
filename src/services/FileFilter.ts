import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import ignore, { Ignore } from 'ignore';
import { IFileFilter, OutputConfig } from '../types/interfaces';

export class FileFilter implements IFileFilter {
	private readonly ignoreFilter: Ignore;
	private readonly outputList: OutputConfig[];

	constructor(outputList: OutputConfig[]) {
		this.outputList = outputList;
		this.ignoreFilter = ignore();
		
		// Initialize gitignore if it exists
		const workspacePath = vscode.workspace.rootPath;
		if (workspacePath) {
			const gitignorePath = path.join(workspacePath, '.gitignore');
			if (fs.existsSync(gitignorePath)) {
				const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
				this.ignoreFilter.add(gitignoreContent);
			}
		}
	}

	public isValidDocument(document: vscode.TextDocument): boolean {
		if (!document.isClosed && !document.isUntitled && 
			!this.outputList.some(output => document.fileName.includes(output.path)) && 
			(document.uri.scheme === 'file' || document.uri.scheme === 'search-editor')) {
			// Get relative path from workspace root for gitignore checking
			const workspacePath = vscode.workspace.rootPath;
			if (workspacePath) {
				const relativePath = path.relative(workspacePath, document.fileName);
				// Only check gitignore for files within workspace
				if (!relativePath.startsWith('..') && !path.isAbsolute(relativePath)) {
					return !this.ignoreFilter.ignores(relativePath);
				}
			}
			return true;
		}
		return false;
	}
} 
