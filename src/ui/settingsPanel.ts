import * as vscode from 'vscode';
import * as path from 'path';
import { Logger } from '../utils/logger';

export class SettingsPanel {
	private panel: vscode.WebviewPanel | undefined;
	private logger: Logger;
	private context: vscode.ExtensionContext;

	constructor(context: vscode.ExtensionContext, logger: Logger) {
		this.context = context;
		this.logger = logger;
	}

	show(): void {
		const columnToShowIn = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		if (this.panel) {
			this.panel.reveal(columnToShowIn);
		} else {
			this.panel = vscode.window.createWebviewPanel(
				'emailToSheetSettings',
				'Email to Sheet Settings',
				columnToShowIn || vscode.ViewColumn.One,
				{
					enableScripts: true,
					retainContextWhenHidden: true,
				}
			);

			this.panel.webview.html = this.getHtmlContent();
			this.panel.webview.onDidReceiveMessage(
				(message) => this.handleMessage(message),
				undefined,
				this.context.subscriptions
			);

			this.panel.onDidDispose(
				() => {
					this.panel = undefined;
				},
				undefined,
				this.context.subscriptions
			);
		}
	}

	private getHtmlContent(): string {
		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Email to Sheet Settings</title>
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		body {
			font-family: var(--vscode-font-family);
			color: var(--vscode-foreground);
			background: var(--vscode-editor-background);
			padding: 20px;
		}

		.container {
			max-width: 600px;
			margin: 0 auto;
		}

		h1 {
			font-size: 24px;
			margin-bottom: 20px;
		}

		h2 {
			font-size: 18px;
			margin-top: 25px;
			margin-bottom: 15px;
			border-bottom: 1px solid var(--vscode-foreground);
			padding-bottom: 10px;
		}

		.form-group {
			margin-bottom: 15px;
		}

		label {
			display: block;
			margin-bottom: 5px;
			font-weight: 500;
		}

		input[type="text"],
		input[type="number"],
		input[type="email"],
		input[type="password"],
		select,
		textarea {
			width: 100%;
			padding: 8px 12px;
			border: 1px solid var(--vscode-input-border);
			background: var(--vscode-input-background);
			color: var(--vscode-input-foreground);
			border-radius: 4px;
			font-family: inherit;
			font-size: 13px;
		}

		input[type="checkbox"] {
			margin-right: 8px;
		}

		.checkbox-group {
			display: flex;
			align-items: center;
		}

		.checkbox-group label {
			margin: 0;
		}

		button {
			padding: 8px 16px;
			margin-right: 10px;
			margin-top: 10px;
			background: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			border-radius: 4px;
			cursor: pointer;
			font-size: 13px;
		}

		button:hover {
			background: var(--vscode-button-hoverBackground);
		}

		button.secondary {
			background: var(--vscode-button-secondaryBackground);
			color: var(--vscode-button-secondaryForeground);
		}

		button.secondary:hover {
			background: var(--vscode-button-secondaryHoverBackground);
		}

		.info-box {
			padding: 10px;
			margin-bottom: 15px;
			background: var(--vscode-textBlockQuote-background);
			border-left: 4px solid var(--vscode-textBlockQuote-border);
			border-radius: 4px;
			font-size: 12px;
		}

		.success {
			color: #4ec9b0;
		}

		.error {
			color: #f48771;
		}

		.filter-list {
			margin-top: 10px;
		}

		.filter-item {
			padding: 10px;
			margin-bottom: 10px;
			background: var(--vscode-input-background);
			border: 1px solid var(--vscode-input-border);
			border-radius: 4px;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		.filter-item button {
			padding: 4px 8px;
			margin: 0;
			font-size: 11px;
		}

		.tabs {
			display: flex;
			gap: 10px;
			margin-bottom: 20px;
			border-bottom: 1px solid var(--vscode-input-border);
		}

		.tab-button {
			padding: 10px 15px;
			background: transparent;
			border: none;
			color: var(--vscode-foreground);
			cursor: pointer;
			border-bottom: 2px solid transparent;
		}

		.tab-button.active {
			border-bottom-color: var(--vscode-button-background);
			color: var(--vscode-button-background);
		}

		.tab-content {
			display: none;
		}

		.tab-content.active {
			display: block;
		}

		.status-indicator {
			display: inline-block;
			width: 10px;
			height: 10px;
			border-radius: 50%;
			margin-right: 5px;
			background: #999;
		}

		.status-indicator.online {
			background: #4ec9b0;
		}

		.status-indicator.offline {
			background: #f48771;
		}
	</style>
</head>
<body>
	<div class="container">
		<h1>⚙️ Email to Sheet Settings</h1>

		<div class="tabs">
			<button class="tab-button active" onclick="switchTab('general')">General</button>
			<button class="tab-button" onclick="switchTab('email')">Email</button>
			<button class="tab-button" onclick="switchTab('sheets')">Google Sheets</button>
			<button class="tab-button" onclick="switchTab('filters')">Filters</button>
			<button class="tab-button" onclick="switchTab('columns')">Columns</button>
		</div>

		<!-- General Tab -->
		<div id="general" class="tab-content active">
			<h2>General Settings</h2>
			
			<div class="form-group">
				<label for="syncInterval">Auto-Sync Interval (minutes)</label>
				<input type="number" id="syncInterval" min="1" max="1440" value="15">
				<div class="info-box">How often to automatically sync emails (1-1440 minutes)</div>
			</div>

			<div class="form-group">
				<label for="maxEmails">Maximum Emails per Sync</label>
				<input type="number" id="maxEmails" min="1" max="500" value="100">
				<div class="info-box">Maximum number of emails to fetch in each sync cycle</div>
			</div>

			<div class="form-group">
				<div class="checkbox-group">
					<input type="checkbox" id="autoSync">
					<label for="autoSync">Enable Auto-Sync</label>
				</div>
				<div class="info-box">Automatically sync emails at specified intervals</div>
			</div>

			<div class="form-group">
				<div class="checkbox-group">
					<input type="checkbox" id="enableNotifications" checked>
					<label for="enableNotifications">Enable Notifications</label>
				</div>
				<div class="info-box">Show notifications when sync completes</div>
			</div>

			<div class="form-group">
				<button onclick="testConnections()">🧪 Test Connections</button>
				<button class="secondary" onclick="viewStatusHistory()">📊 Sync Status</button>
			</div>
		</div>

		<!-- Email Tab -->
		<div id="email" class="tab-content">
			<h2>Email Configuration</h2>

			<div class="form-group">
				<label for="emailProvider">Email Provider</label>
				<select id="emailProvider">
					<option value="gmail">Gmail</option>
					<option value="outlook">Microsoft Outlook/Office365</option>
					<option value="imap">Generic IMAP</option>
				</select>
			</div>

			<div class="form-group">
				<button onclick="authorizeEmail()">🔐 Authorize Email Account</button>
				<button class="secondary" onclick="testEmailConnection()">✓ Test Email Connection</button>
			</div>

			<div class="info-box">
				<strong>Provider Notes:</strong><br>
				<strong>Gmail:</strong> Requires Google account authorization<br>
				<strong>Outlook:</strong> Works with Microsoft 365 and Outlook.com<br>
				<strong>IMAP:</strong> Generic IMAP server configuration
			</div>
		</div>

		<!-- Google Sheets Tab -->
		<div id="sheets" class="tab-content">
			<h2>Google Sheets</h2>

			<div class="form-group">
				<label for="spreadsheetId">Spreadsheet ID</label>
				<input type="text" id="spreadsheetId" placeholder="Enter Spreadsheet ID">
				<div class="info-box">Get this from the Google Sheets URL: /spreadsheets/d/<strong>SPREADSHEET_ID</strong>/</div>
			</div>

			<div class="form-group">
				<label for="sheetName">Sheet Name</label>
				<input type="text" id="sheetName" value="Emails" placeholder="Enter sheet name">
			</div>

			<div class="form-group">
				<div class="checkbox-group">
					<input type="checkbox" id="appendMode" checked>
					<label for="appendMode">Append Mode (add new rows)</label>
				</div>
				<div class="info-box">If unchecked, will replace existing data</div>
			</div>

			<div class="form-group">
				<div class="checkbox-group">
					<input type="checkbox" id="includeHeaders" checked>
					<label for="includeHeaders">Include Headers</label>
				</div>
			</div>

			<div class="form-group">
				<button onclick="authorizeSheets()">🔐 Authorize Google Account</button>
				<button class="secondary" onclick="createNewSheet()">➕ Create New Sheet</button>
				<button class="secondary" onclick="testSheetsConnection()">✓ Test Sheets Connection</button>
			</div>
		</div>

		<!-- Filters Tab -->
		<div id="filters" class="tab-content">
			<h2>Email Filters</h2>
			<div class="info-box">Add filters to sync specific emails only</div>

			<div class="form-group">
				<label for="filterType">Filter Type</label>
				<select id="filterType">
					<option value="sender">From (Sender)</option>
					<option value="subject">Subject</option>
					<option value="hasAttachment">Has Attachment</option>
					<option value="label">Gmail Label</option>
					<option value="folder">Folder</option>
					<option value="date">Date Range</option>
				</select>
			</div>

			<div class="form-group">
				<label for="filterValue">Filter Value</label>
				<input type="text" id="filterValue" placeholder="e.g., sender@example.com">
			</div>

			<div class="form-group">
				<label for="filterName">Filter Name (Optional)</label>
				<input type="text" id="filterName" placeholder="e.g., Important Emails">
			</div>

			<div class="form-group">
				<button onclick="addFilter()">➕ Add Filter</button>
			</div>

			<div id="filtersList" class="filter-list"></div>
		</div>

		<!-- Columns Tab -->
		<div id="columns" class="tab-content">
			<h2>Column Mapping</h2>
			<div class="info-box">Configure which email fields map to which Google Sheet columns</div>

			<div class="form-group">
				<label>Column Assignments</label>
				<div id="columnMapping" style="margin-top: 10px;"></div>
			</div>

			<button onclick="resetColumnMapping()" class="secondary">↺ Reset to Default</button>
		</div>

		<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--vscode-input-border);">
			<button onclick="saveSettings()" style="width: 100%; padding: 12px;">💾 Save All Settings</button>
		</div>
	</div>

	<script>
		const vscode = acquireVsCodeApi();

		function switchTab(tabName) {
			// Hide all tabs
			const tabs = document.querySelectorAll('.tab-content');
			tabs.forEach(tab => tab.classList.remove('active'));

			// Remove active from all buttons
			const buttons = document.querySelectorAll('.tab-button');
			buttons.forEach(btn => btn.classList.remove('active'));

			// Show selected tab
			document.getElementById(tabName).classList.add('active');

			// Add active to clicked button
			event.target.classList.add('active');
		}

		function saveSettings() {
			const settings = {
				emailProvider: document.getElementById('emailProvider').value,
				syncInterval: document.getElementById('syncInterval').value,
				maxEmails: document.getElementById('maxEmails').value,
				autoSync: document.getElementById('autoSync').checked,
				enableNotifications: document.getElementById('enableNotifications').checked,
				spreadsheetId: document.getElementById('spreadsheetId').value,
				sheetName: document.getElementById('sheetName').value,
				appendMode: document.getElementById('appendMode').checked,
				includeHeaders: document.getElementById('includeHeaders').checked,
			};

			vscode.postMessage({
				command: 'saveSettings',
				settings
			});
		}

		function authorizeEmail() {
			vscode.postMessage({ command: 'authorizeEmail' });
		}

		function authorizeSheets() {
			vscode.postMessage({ command: 'authorizeSheets' });
		}

		function testConnections() {
			vscode.postMessage({ command: 'testConnections' });
		}

		function testEmailConnection() {
			vscode.postMessage({ command: 'testEmailConnection' });
		}

		function testSheetsConnection() {
			vscode.postMessage({ command: 'testSheetsConnection' });
		}

		function createNewSheet() {
			vscode.postMessage({ command: 'createNewSheet' });
		}

		function addFilter() {
			const type = document.getElementById('filterType').value;
			const value = document.getElementById('filterValue').value;
			const name = document.getElementById('filterName').value;

			if (!value) {
				alert('Please enter a filter value');
				return;
			}

			vscode.postMessage({
				command: 'addFilter',
				filter: { type, value, name: name || type }
			});
		}

		function removeFilter(index) {
			vscode.postMessage({
				command: 'removeFilter',
				index
			});
		}

		function resetColumnMapping() {
			vscode.postMessage({ command: 'resetColumnMapping' });
		}

		function viewStatusHistory() {
			vscode.postMessage({ command: 'viewStatusHistory' });
		}

		// Load initial settings
		window.addEventListener('message', event => {
			const message = event.data;
			if (message.command === 'loadSettings') {
				const settings = message.settings;
				document.getElementById('emailProvider').value = settings.emailProvider || 'gmail';
				document.getElementById('syncInterval').value = settings.syncInterval || 15;
				document.getElementById('maxEmails').value = settings.maxEmails || 100;
				document.getElementById('autoSync').checked = settings.autoSync || false;
				document.getElementById('enableNotifications').checked = settings.enableNotifications !== false;
				document.getElementById('spreadsheetId').value = settings.spreadsheetId || '';
				document.getElementById('sheetName').value = settings.sheetName || 'Emails';
				document.getElementById('appendMode').checked = settings.appendMode !== false;
				document.getElementById('includeHeaders').checked = settings.includeHeaders !== false;
			}

			if (message.command === 'updateFiltersList') {
				const filtersList = document.getElementById('filtersList');
				filtersList.innerHTML = '';
				message.filters.forEach((filter, index) => {
					const div = document.createElement('div');
					div.className = 'filter-item';
					div.innerHTML = \`
						<div>
							<strong>\${filter.name || filter.type}</strong>
							<div style="font-size: 11px; color: var(--vscode-descriptionForeground);">\${filter.type}: \${filter.value}</div>
						</div>
						<button onclick="removeFilter(\${index})">Delete</button>
					\`;
					filtersList.appendChild(div);
				});
			}

			if (message.command === 'updateColumnMapping') {
				const mapping = message.columns;
				const container = document.getElementById('columnMapping');
				container.innerHTML = '';
				Object.entries(mapping).forEach(([field, column]) => {
					const div = document.createElement('div');
					div.className = 'form-group' ;
					div.innerHTML = \`
						<label>\${field.charAt(0).toUpperCase() + field.slice(1)}</label>
						<select onchange="updateColumn('\${field}', this.value)">
							<option value="A" \${column === 'A' ? 'selected' : ''}>Column A</option>
							<option value="B" \${column === 'B' ? 'selected' : ''}>Column B</option>
							<option value="C" \${column === 'C' ? 'selected' : ''}>Column C</option>
							<option value="D" \${column === 'D' ? 'selected' : ''}>Column D</option>
							<option value="E" \${column === 'E' ? 'selected' : ''}>Column E</option>
							<option value="F" \${column === 'F' ? 'selected' : ''}>Column F</option>
						</select>
					\`;
					container.appendChild(div);
				});
			}
		});

		function updateColumn(field, column) {
			vscode.postMessage({
				command: 'updateColumn',
				field,
				column
			});
		}
	</script>
</body>
</html>`;
	}

	private async handleMessage(message: any) {
		switch (message.command) {
			case 'saveSettings':
				await this.saveSettings(message.settings);
				break;
			case 'authorizeEmail':
				this.logger.info('Email authorization requested');
				break;
			case 'authorizeSheets':
				this.logger.info('Sheets authorization requested');
				break;
			// ... handle other commands
		}
	}

	private async saveSettings(settings: any) {
		const config = vscode.workspace.getConfiguration('emailToSheet');
		
		await config.update('emailProvider', settings.emailProvider);
		await config.update('syncInterval', settings.syncInterval);
		await config.update('maxEmails', settings.maxEmails);
		await config.update('autoSync', settings.autoSync);
		await config.update('enableNotifications', settings.enableNotifications);
		
		await config.update('sheetSettings', {
			spreadsheetId: settings.spreadsheetId,
			sheetName: settings.sheetName,
			appendMode: settings.appendMode,
			includeHeaders: settings.includeHeaders,
		});

		vscode.window.showInformationMessage('Settings saved successfully!');
		this.logger.info('Settings updated');
	}
}
