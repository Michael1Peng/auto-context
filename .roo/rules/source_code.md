This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
4. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: src/**/*
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

## Additional Info

# Directory Structure
```
src/
  test/
    suite/
      extension.test.ts
      index.ts
    runTest.ts
  extension.ts
```

# Files

## File: src/test/suite/extension.test.ts
```typescript
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});
```

## File: src/test/suite/index.ts
```typescript
import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

export async function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true
	});

	const testsRoot = path.resolve(__dirname, '..');
	const files = await glob('**/**.test.js', { cwd: testsRoot });

	// Add files to the test suite
	files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

	try {
		return new Promise<void>((c, e) => {
			// Run the mocha test
			mocha.run(failures => {
				if (failures > 0) {
					e(new Error(`${failures} tests failed.`));
				} else {
					c();
				}
			});
		});
	} catch (err) {
		console.error(err);
	}
}
```

## File: src/test/runTest.ts
```typescript
import * as path from 'path';

import { runTests } from '@vscode/test-electron';

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		// Download VS Code, unzip it and run the integration test
		await runTests({ extensionDevelopmentPath, extensionTestsPath });
	} catch (err) {
		console.error('Failed to run tests', err);
		process.exit(1);
	}
}

main();
```

## File: src/extension.ts
```typescript
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
	shouldOutput: boolean;
	ignorePinnedTabs: boolean;
}

class ContextTracker {
	private readonly outputPath: string;
	private readonly outputFormat: string;
	private readonly shouldOutput: boolean;
	private readonly ignorePinnedTabs: boolean;
	private readonly disposables: vscode.Disposable[] = [];
	private readonly ignoreFilter: Ignore;

	constructor(config: ExtensionConfig) {
		this.outputPath = config.outputPath;
		this.outputFormat = config.outputFormat;
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
		if (!document.isClosed && !document.isUntitled && !document.fileName.includes(this.outputPath) && (document.uri.scheme === 'file' || document.uri.scheme === 'search-editor')) {
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
			'<Opened Files>\n<File Name>\n${fileName}\n</File Name>\n<File Content>\n${content}\n</File Content>\n</Opened Files>\n',
		shouldOutput: config.get<boolean>('shouldOutput') || false,
		ignorePinnedTabs: config.get<boolean>('ignorePinnedTabs') || false
	};
}
```
