import * as vscode from 'vscode';
import { EmailSyncManager } from './managers/emailSyncManager';
import { GoogleSheetsManager } from './managers/googleSheetsManager';
import { SettingsPanel } from './ui/settingsPanel';
import { SyncExplorer } from './ui/syncExplorer';
import { Logger } from './utils/logger';

let emailSyncManager: EmailSyncManager;
let googleSheetsManager: GoogleSheetsManager;
let settingsPanel: SettingsPanel;
let syncExplorer: SyncExplorer;
let logger: Logger;

export async function activate(context: vscode.ExtensionContext) {
	logger = new Logger(context);
	logger.info('Email to Google Sheet extension activated');

	// Initialize managers
	emailSyncManager = new EmailSyncManager(context, logger);
	googleSheetsManager = new GoogleSheetsManager(context, logger);
	syncExplorer = new SyncExplorer(context, logger);
	settingsPanel = new SettingsPanel(context, logger);

	// Register commands
	context.subscriptions.push(
		vscode.commands.registerCommand('emailToSheet.start', async () => {
			await startSync();
		}),
		vscode.commands.registerCommand('emailToSheet.openSettings', async () => {
			settingsPanel.show();
		}),
		vscode.commands.registerCommand('emailToSheet.authorize', async () => {
			await authorizeAccounts();
		}),
		vscode.commands.registerCommand('emailToSheet.testConnection', async () => {
			await testConnection();
		}),
		vscode.commands.registerCommand('emailToSheet.syncNow', async () => {
			await syncNow();
		}),
		vscode.commands.registerCommand('emailToSheet.viewLogs', () => {
			logger.showOutputChannel();
		})
	);

	// Register tree view
	vscode.window.registerTreeDataProvider('emailSheetExplorer', syncExplorer);

	// Auto-sync setup
	setupAutoSync(context);

	logger.info('Email to Google Sheet extension ready');
}

async function startSync() {
	try {
		vscode.window.showInformationMessage('Starting Email to Google Sheets sync...');
		
		const isAuthorized = await emailSyncManager.isAuthorized();
		if (!isAuthorized) {
			const result = await vscode.window.showWarningMessage(
				'Email account not authorized. Authorize now?',
				'Yes',
				'No'
			);
			if (result === 'Yes') {
				await authorizeAccounts();
			}
			return;
		}

		await syncNow();
	} catch (error) {
		logger.error('Start sync failed', error);
		vscode.window.showErrorMessage('Failed to start sync');
	}
}

async function authorizeAccounts() {
	try {
		vscode.window.showInformationMessage('Opening authorization window...');
		
		const provider = vscode.workspace.getConfiguration('emailToSheet').get<string>('emailProvider') || 'gmail';
		
		if (provider === 'gmail') {
			await emailSyncManager.authorizeGmail();
		} else if (provider === 'outlook') {
			await emailSyncManager.authorizeOutlook();
		} else {
			await emailSyncManager.authorizeImap();
		}

		await googleSheetsManager.authorize();
		vscode.window.showInformationMessage('Authorization successful!');
	} catch (error) {
		logger.error('Authorization failed', error);
		vscode.window.showErrorMessage('Authorization failed. Please try again.');
	}
}

async function testConnection() {
	try {
		vscode.window.showInformationMessage('Testing connections...');
		
		const emailOk = await emailSyncManager.testConnection();
		const sheetOk = await googleSheetsManager.testConnection();

		const message = `Email: ${emailOk ? '✓' : '✗'} | Sheet: ${sheetOk ? '✓' : '✗'}`;
		
		if (emailOk && sheetOk) {
			vscode.window.showInformationMessage(`Connection test passed! ${message}`);
		} else {
			vscode.window.showWarningMessage(`Connection test failed: ${message}`);
		}
	} catch (error) {
		logger.error('Connection test failed', error);
		vscode.window.showErrorMessage('Connection test failed');
	}
}

async function syncNow() {
	try {
		const progress = await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: 'Syncing emails to Google Sheet...',
				cancellable: true,
			},
			async (progress, token) => {
				return await emailSyncManager.fetchEmails(
					(increment) => progress.report({ increment })
				);
			}
		);

		if (progress && progress.length > 0) {
			await googleSheetsManager.appendEmails(progress);
			vscode.window.showInformationMessage(`Synced ${progress.length} emails to Google Sheet`);
		} else {
			vscode.window.showInformationMessage('No new emails to sync');
		}

		await syncExplorer.refresh();
	} catch (error) {
		logger.error('Sync failed', error);
		vscode.window.showErrorMessage('Sync failed. Check logs for details.');
	}
}

function setupAutoSync(context: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration('emailToSheet');
	const autoSync = config.get<boolean>('autoSync');
	const interval = config.get<number>('syncInterval') || 15;

	if (autoSync) {
		const syncInterval = setInterval(syncNow, interval * 60 * 1000);
		context.subscriptions.push({
			dispose: () => clearInterval(syncInterval),
		});
		logger.info(`Auto-sync enabled with ${interval} minute intervals`);
	}

	// Watch for configuration changes
	vscode.workspace.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration('emailToSheet.autoSync') ||
			event.affectsConfiguration('emailToSheet.syncInterval')) {
			// Restart auto-sync with new settings
			logger.info('Auto-sync configuration changed');
		}
	});
}

export function deactivate() {
	logger.info('Email to Google Sheet extension deactivated');
}
