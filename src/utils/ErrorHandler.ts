import * as vscode from 'vscode';

export class ErrorHandler {
	public static handleError(message: string, error: unknown): void {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		vscode.window.showErrorMessage(`${message}: ${errorMessage}`);
		console.error(message, error);
	}
} 
