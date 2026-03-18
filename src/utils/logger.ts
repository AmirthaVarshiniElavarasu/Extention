import * as vscode from 'vscode';

export class Logger {
	private outputChannel: vscode.OutputChannel;
	private context: vscode.ExtensionContext;

	constructor(context: vscode.ExtensionContext) {
		this.context = context;
		this.outputChannel = vscode.window.createOutputChannel('Email to Sheet');
	}

	info(message: string, data?: any): void {
		const timestamp = this.getTimestamp();
		const logMessage = data ? `[${timestamp}] ℹ️  ${message} - ${JSON.stringify(data)}` : `[${timestamp}] ℹ️  ${message}`;
		this.outputChannel.appendLine(logMessage);
	}

	error(message: string, error?: any): void {
		const timestamp = this.getTimestamp();
		let logMessage = `[${timestamp}] ❌ ${message}`;
		if (error) {
			if (error instanceof Error) {
				logMessage += ` - ${error.message}`;
				if (error.stack) {
					logMessage += `\n${error.stack}`;
				}
			} else {
				logMessage += ` - ${JSON.stringify(error)}`;
			}
		}
		this.outputChannel.appendLine(logMessage);
	}

	warn(message: string, data?: any): void {
		const timestamp = this.getTimestamp();
		const logMessage = data ? `[${timestamp}] ⚠️  ${message} - ${JSON.stringify(data)}` : `[${timestamp}] ⚠️  ${message}`;
		this.outputChannel.appendLine(logMessage);
	}

	debug(message: string, data?: any): void {
		if (process.env.DEBUG || vscode.workspace.getConfiguration('emailToSheet').get('debug')) {
			const timestamp = this.getTimestamp();
			const logMessage = data ? `[${timestamp}] 🐛 ${message} - ${JSON.stringify(data)}` : `[${timestamp}] 🐛 ${message}`;
			this.outputChannel.appendLine(logMessage);
		}
	}

	private getTimestamp(): string {
		const now = new Date();
		return now.toLocaleTimeString();
	}

	showOutputChannel(): void {
		this.outputChannel.show(true);
	}

	dispose(): void {
		this.outputChannel.dispose();
	}
}
