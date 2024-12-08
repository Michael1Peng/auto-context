import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import ignore, { Ignore } from 'ignore';

// Types and interfaces
interface FileData {
	filePath: string;
	content: string;
}

interface ExtensionConfig {
	outputPath: string;
	outputFormat: string;
}

class ContextTracker {
	private readonly outputPath: string;
	private readonly outputFormat: string;
	private readonly disposables: vscode.Disposable[] = [];
	private readonly ignoreFilter: Ignore;

	constructor(config: ExtensionConfig) {
		this.outputPath = config.outputPath;
		this.outputFormat = config.outputFormat;
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
		try {
			const openFiles = this.getOpenFiles();
			this.writeOutput(openFiles);
		} catch (error) {
			this.handleError('Failed to process file change', error);
		}
	}

	private getOpenFiles(): FileData[] {
		return vscode.workspace.textDocuments
			.filter(doc => this.isValidDocument(doc))
			.map(doc => ({
				filePath: doc.fileName,
				content: doc.getText()
			}));
	}

	private isValidDocument(document: vscode.TextDocument): boolean {
		if (!document.isClosed && !document.isUntitled && !document.fileName.includes(this.outputPath)) {
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
			const formattedOutput = this.formatOutput(files);
			
			const outputDir = path.dirname(this.outputPath);
			if (!fs.existsSync(outputDir)) {
				fs.mkdirSync(outputDir, { recursive: true });
			}

			fs.writeFileSync(this.outputPath, formattedOutput, 'utf8');
		} catch (error) {
			this.handleError('Failed to write output file', error);
		}
	}

	private formatOutput(files: FileData[]): string {
		return files.map(file => 
			this.outputFormat
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
	
	return {
		outputPath: path.join(workspacePath, config.get<string>('outputPath') || 'context-output.txt'),
		outputFormat: config.get<string>('outputFormat') || 
			'<Opened Files>\n<File Name>\n${fileName}\n</File Name>\n<File Content>\n${content}\n</File Content>\n</Opened Files>\n'
	};
}
