import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import {
  FileData,
  OutputConfig,
  IOutputWriter,
  IOutputFormatter,
} from "../types/interfaces";
import { ErrorHandler } from "../utils/ErrorHandler";

export class OutputWriter implements IOutputWriter {
  private readonly outputFormatter: IOutputFormatter;

  constructor(outputFormatter: IOutputFormatter) {
    this.outputFormatter = outputFormatter;
  }

  public writeOutput(files: FileData[], outputList: OutputConfig[]): void {
    try {
      // 检测多工作区环境
      const workspaceFolders = vscode.workspace.workspaceFolders || [];
      const isMultiWorkspace = workspaceFolders.length > 1;

      if (isMultiWorkspace) {
        this.writeToMultipleWorkspaces(files, outputList, workspaceFolders);
      } else {
        this.writeToSingleWorkspace(files, outputList);
      }
    } catch (error) {
      ErrorHandler.handleError("Failed to write output files", error);
    }
  }

  private writeToMultipleWorkspaces(
    files: FileData[],
    outputList: OutputConfig[],
    workspaceFolders: readonly vscode.WorkspaceFolder[]
  ): void {
    outputList.forEach((output) => {
      const formattedOutput = this.outputFormatter.formatOutput(
        files,
        output.format
      );
      const finalOutput = output.prependContent
        ? `${output.prependContent}\n${formattedOutput}`
        : formattedOutput;

      // 为每个工作区目录输出文件
      workspaceFolders.forEach((folder) => {

        if (!output.relativePath) {
          return;
        }

        try {
          const outputPath = path.join(folder.uri.fsPath, output.relativePath);
          this.writeToFile(outputPath, finalOutput);
        } catch (error) {
          // 错误隔离：单个工作区失败不影响其他工作区
          ErrorHandler.handleError(
            `Failed to write output to workspace ${folder.name}`,
            error
          );
        }
      });
    });
  }

  private writeToSingleWorkspace(
    files: FileData[],
    outputList: OutputConfig[]
  ): void {
    outputList.forEach((output) => {
      const formattedOutput = this.outputFormatter.formatOutput(
        files,
        output.format
      );
      const finalOutput = output.prependContent
        ? `${output.prependContent}\n${formattedOutput}`
        : formattedOutput;

      this.writeToFile(output.path, finalOutput);
    });
  }

  private writeToFile(outputPath: string, content: string): void {
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, content, "utf8");
  }
}
