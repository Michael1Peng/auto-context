import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import ignore, { Ignore } from 'ignore';

// Types and interfaces
interface OutputConfig {
	path: string;
	format: string;
	prependContent?: string;
}

interface FileData {
	filePath: string;
	content: string;
}

interface ExtensionConfig {
	outputList: OutputConfig[];
	shouldOutput: boolean;
	ignorePinnedTabs: boolean;
}

class ContextTracker {
	private readonly outputList: OutputConfig[];
	private readonly shouldOutput: boolean;
	private readonly ignorePinnedTabs: boolean;
	private readonly disposables: vscode.Disposable[] = [];
	private readonly ignoreFilter: Ignore;

	constructor(config: ExtensionConfig) {
		this.outputList = config.outputList;
		this.shouldOutput = config.shouldOutput;
		this.ignorePinnedTabs = config.ignorePinnedTabs;
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

	public initialize(): void {
		const fileChangeListener = vscode.window.onDidChangeActiveTextEditor(() => {
			this.handleFileChange();
		});
		this.disposables.push(fileChangeListener);
	}

	public dispose(): void {
		this.disposables.forEach(disposable => disposable.dispose());
	}

	private handleFileChange(): void {
		if (!this.shouldOutput) {
			return;
		}
		try {
			const openFiles = this.getOpenFiles();
			this.writeOutput(openFiles);
		} catch (error) {
			this.handleError('Failed to process file change', error);
		}
	}

	private getOpenFiles(): FileData[] {
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
			.filter(doc => this.isValidDocument(doc))
			.map(doc => {
				const workspacePath = vscode.workspace.rootPath;
				const relativePath = workspacePath ? path.relative(workspacePath, doc.fileName) : doc.fileName;
				return {
					filePath: relativePath,
					content: doc.getText()
				};
			});
	}

	private isValidDocument(document: vscode.TextDocument): boolean {
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

	private writeOutput(files: FileData[]): void {
		try {
			this.outputList.forEach(output => {
				const formattedOutput = this.formatOutput(files, output.format);
				const finalOutput = output.prependContent ? 
					`${output.prependContent}\n${formattedOutput}` : 
					formattedOutput;
				
				const outputDir = path.dirname(output.path);
				if (!fs.existsSync(outputDir)) {
					fs.mkdirSync(outputDir, { recursive: true });
				}

				fs.writeFileSync(output.path, finalOutput, 'utf8');
			});
		} catch (error) {
			this.handleError('Failed to write output files', error);
		}
	}

	private formatOutput(files: FileData[], format: string): string {
		return files.map(file => 
			format
				.replace('${fileName}', file.filePath)
				.replace('${content}', file.content)
		).join('');
	}

	private handleError(message: string, error: unknown): void {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		vscode.window.showErrorMessage(`${message}: ${errorMessage}`);
		console.error(message, error);
	}
}

export function activate(context: vscode.ExtensionContext): void {
	const config = loadConfiguration();
	const contextTracker = new ContextTracker(config);
	
	contextTracker.initialize();
	context.subscriptions.push({ dispose: () => contextTracker.dispose() });
}

function loadConfiguration(): ExtensionConfig {
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
			output.path = path.join(workspacePath, output.path);
		}
	});
	
	return {
		outputList,
		shouldOutput: config.get<boolean>('shouldOutput') || false,
		ignorePinnedTabs: config.get<boolean>('ignorePinnedTabs') || false
	};
}
