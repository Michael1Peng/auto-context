import * as vscode from "vscode";

import { FileCollector } from "./FileCollector";
import { FileFilter } from "../services/FileFilter";
import { OutputFormatter } from "../services/OutputFormatter";
import { OutputWriter } from "../services/OutputWriter";
import { ErrorHandler } from "../utils/ErrorHandler";
import {
  ExtensionConfig,
  IFileCollector,
  IConfigurationManager,
  IOutputWriter,
} from "../types/interfaces";

export class ContextTracker {
  private readonly fileCollector: IFileCollector;
  private readonly outputWriter: IOutputWriter;
  private readonly configManager: IConfigurationManager;
  private readonly disposables: vscode.Disposable[] = [];
  private config: ExtensionConfig;

  constructor(configManager: IConfigurationManager) {
    this.configManager = configManager;
    this.config = configManager.getConfiguration();

    // Create dependencies
    const outputFormatter = new OutputFormatter();
    this.outputWriter = new OutputWriter(outputFormatter);

    // Create file filter and file collector
    const fileFilter = new FileFilter(this.config.outputList);
    this.fileCollector = new FileCollector(
      fileFilter,
      this.config.ignorePinnedTabs
    );
  }

  public initialize(): void {
    const fileChangeListener = vscode.window.onDidChangeActiveTextEditor(() => {
      this.handleFileChange();
    });
    this.disposables.push(fileChangeListener);
  }

  public dispose(): void {
    // 清理输出文件
    try {
      this.outputWriter.cleanupOutputFiles();
    } catch (error) {
      ErrorHandler.handleError(
        "Failed to cleanup output files during dispose",
        error
      );
    }

    this.disposables.forEach((disposable) => disposable.dispose());
  }

  private handleFileChange(): void {
    if (!this.configManager.shouldOutput()) {
      return;
    }
    try {
      const openFiles = this.fileCollector.getOpenFiles();
      this.outputWriter.writeOutput(openFiles, this.config.outputList);
    } catch (error) {
      ErrorHandler.handleError("Failed to process file change", error);
    }
  }
}
