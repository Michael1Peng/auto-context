import * as vscode from 'vscode';

export class OutputChannelManager {
    private static channel: vscode.OutputChannel | null = null;

    static initialize(channelName: string) {
        this.channel = vscode.window.createOutputChannel(channelName);
    }

    static appendLine(message: string) {
        if (this.channel) {
            this.channel.appendLine(message);
        } else {
            console.error("Output channel not initialized.");
        }
    }

    static show(preserveFocus: boolean = true) {
        if (this.channel) {
            this.channel.show(preserveFocus);
        }
    }
}
