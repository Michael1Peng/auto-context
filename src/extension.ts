import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import ignore from 'ignore';

interface FileData {
	fileName: string;
	content: string;
}

// TODO: 添加过滤 gitignore 匹配命中的文件
export function activate(context: vscode.ExtensionContext) {
	// Register configuration
	let config = vscode.workspace.getConfiguration('autoContext');
	let outputPath = config.get<string>('outputPath') || path.join(vscode.workspace.rootPath || '', 'context-output.txt');
	let outputFormat = config.get<string>('outputFormat') || '<Opened Files>\n<File Name>\n${fileName}\n</File Name>\n<File Content>\n${content}\n</File Content>\n</Opened Files>\n';

	// Function to get all open files and their contents
	const getAllOpenFiles = (): FileData[] => {
		const openFiles: FileData[] = [];
		vscode.workspace.textDocuments.forEach(document => {
			if (!document.isClosed &&
				!document.isUntitled &&
				!document.fileName.includes(outputPath)) {
				openFiles.push({
					fileName: document.fileName,
					content: document.getText()
				});
			}
		});
		return openFiles;
	};

	// Function to write files data to output file
	const writeToOutputFile = (files: FileData[]) => {
		let output = '';
		files.forEach(file => {
			let fileOutput = outputFormat
				.replace('${fileName}', file.fileName)
				.replace('${content}', file.content);
			output += fileOutput;
		});

		fs.writeFileSync(outputPath, output, 'utf8');
	};

	// Register file change event listener
	let fileChangeDisposable = vscode.window.onDidChangeActiveTextEditor(() => {
		const openFiles = getAllOpenFiles();
		writeToOutputFile(openFiles);
	});

	context.subscriptions.push(fileChangeDisposable);
}
