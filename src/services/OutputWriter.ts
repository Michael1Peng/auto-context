import * as fs from "fs";
import * as path from "path";

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
      outputList.forEach((output) => {
        const formattedOutput = this.outputFormatter.formatOutput(
          files,
          output.format
        );
        const finalOutput = output.prependContent
          ? `${output.prependContent}\n${formattedOutput}`
          : formattedOutput;

        const outputDir = path.dirname(output.path);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(output.path, finalOutput, "utf8");
      });
    } catch (error) {
      ErrorHandler.handleError("Failed to write output files", error);
    }
  }
}
