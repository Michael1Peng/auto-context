import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { FileCollector } from './FileCollector';
import { FileFilter } from '../services/FileFilter';
import { OutputFormatter } from '../services/OutputFormatter';
import { ErrorHandler } from '../utils/ErrorHandler';
import { ExtensionConfig, IFileCollector, IConfigurationManager, IOutputFormatter } from '../types/interfaces';

export class ContextTracker {
	private readonly fileCollector: IFileCollector;
	private readonly outputFormatter: IOutputFormatter;
	private readonly configManager: IConfigurationManager;
	private readonly disposables: vscode.Disposable[] = [];
	private config: ExtensionConfig;

	constructor(configManager: IConfigurationManager) {
		this.configManager = configManager;
		this.config = configManager.getConfiguration();
		this.outputFormatter = new OutputFormatter();
		
		// Create file filter and file collector
		const fileFilter = new FileFilter(this.config.outputList);
		this.fileCollector = new FileCollector(fileFilter, this.config.ignorePinnedTabs);
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
		if (!this.config.shouldOutput) {
			return;
		}
		try {
			const openFiles = this.fileCollector.getOpenFiles();
			this.writeOutput(openFiles);
		} catch (error) {
			ErrorHandler.handleError('Failed to process file change', error);
		}
	}

	private writeOutput(files: any[]): void {
		try {
			this.config.outputList.forEach(output => {
				const formattedOutput = this.outputFormatter.formatOutput(files, output.format);
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
			ErrorHandler.handleError('Failed to write output files', error);
		}
	}
} 
