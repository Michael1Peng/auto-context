import { FileData, IOutputFormatter } from '../types/interfaces';

export class OutputFormatter implements IOutputFormatter {
	public formatOutput(files: FileData[], format: string): string {
		return files.map(file => 
			format
				.replace('${fileName}', file.filePath)
				.replace('${content}', file.content)
		).join('');
	}
} 
