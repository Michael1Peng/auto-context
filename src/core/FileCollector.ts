import * as vscode from 'vscode';
import * as path from 'path';

import { FileData, IFileCollector, IFileFilter } from '../types/interfaces';

export class FileCollector implements IFileCollector {
	private readonly fileFilter: IFileFilter;
	private readonly ignorePinnedTabs: boolean;

	constructor(fileFilter: IFileFilter, ignorePinnedTabs: boolean) {
		this.fileFilter = fileFilter;
		this.ignorePinnedTabs = ignorePinnedTabs;
	}

	public getOpenFiles(): FileData[] {
		const openTabs: vscode.TextDocument[] = [];
		
		// Get all tab groups and their tabs
		vscode.window.tabGroups.all.forEach(group => {
			group.tabs.forEach(tab => {
				if (this.ignorePinnedTabs && tab.isPinned) {
					return;
				}
				
				if (tab.input instanceof vscode.TabInputText) {
					const doc = vscode.workspace.textDocuments.find(
						doc => doc.uri.toString() === (tab?.input as vscode.TabInputText)?.uri.toString()
					);
					if (doc) {
						openTabs.push(doc);
					}
				}
				
				vscode.workspace.textDocuments.forEach(doc => {
					if (doc.uri.scheme === 'search-editor' && !openTabs.some(existingDoc => existingDoc.uri.toString() === doc.uri.toString())) {
						openTabs.push(doc);
					}
				});
			});
		});

		return openTabs
			.filter(doc => this.fileFilter.isValidDocument(doc))
			.map(doc => {
				const workspacePath = vscode.workspace.rootPath;
				const relativePath = workspacePath ? path.relative(workspacePath, doc.fileName) : doc.fileName;
				return {
					filePath: relativePath,
					content: doc.getText()
				};
			});
	}
} 
