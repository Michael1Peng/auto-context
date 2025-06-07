import * as vscode from "vscode";

// 文件数据接口
export interface FileData {
  filePath: string;
  content: string;
}

// 输出配置接口
export interface OutputConfig {
	path: string;
	relativePath?: string;
	format: string;
	prependContent?: string;
}

// 扩展配置接口
export interface ExtensionConfig {
  outputList: OutputConfig[];
  shouldOutput: boolean;
  ignorePinnedTabs: boolean;
}

// 文件收集器接口
export interface IFileCollector {
  getOpenFiles(): FileData[];
}

// 文件过滤器接口
export interface IFileFilter {
  isValidDocument(document: vscode.TextDocument): boolean;
}

// 输出格式化器接口
export interface IOutputFormatter {
  formatOutput(files: FileData[], format: string): string;
}

// 输出写入器接口
export interface IOutputWriter {
  writeOutput(files: FileData[], outputList: OutputConfig[]): void;
}

// 配置管理器接口
export interface IConfigurationManager {
  getConfiguration(): ExtensionConfig;
}
