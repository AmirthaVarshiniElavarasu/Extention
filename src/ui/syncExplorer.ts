import * as vscode from 'vscode';
import { Logger } from '../utils/logger';

export class SyncItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command,
		public readonly description?: string,
		public readonly icon?: string
	) {
		super(label, collapsibleState);
		this.description = description;
	}

	get tooltip(): string {
		return `${this.label}`;
	}

	iconPath = new vscode.ThemeIcon(this.icon || 'sync');
	contextValue = 'syncItem';
}

export class SyncExplorer implements vscode.TreeDataProvider<SyncItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<SyncItem | undefined | null | void> =
		new vscode.EventEmitter<SyncItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<SyncItem | undefined | null | void> =
		this._onDidChangeTreeData.event;

	private context: vscode.ExtensionContext;
	private logger: Logger;
	private syncStatus: any = {
		lastSync: null,
		nextSync: null,
		totalSynced: 0,
		status: 'idle', // idle, syncing, success, error
	};

	constructor(context: vscode.ExtensionContext, logger: Logger) {
		this.context = context;
		this.logger = logger;
		this.loadSyncStatus();
	}

	getTreeItem(element: SyncItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: SyncItem): Thenable<SyncItem[]> {
		if (!element) {
			// Root level items
			return Promise.resolve(this.getRootItems());
		} else {
			// Child items
			return Promise.resolve(this.getChildItems(element.label));
		}
	}

	private getRootItems(): SyncItem[] {
		const items: SyncItem[] = [];

		// Status item
		const statusLabel = `Status: ${this.getStatusLabel()}`;
		items.push(
			new SyncItem(
				statusLabel,
				vscode.TreeItemCollapsibleState.Collapsed,
				{
					command: 'emailToSheet.syncNow',
					title: 'Sync Now',
					arguments: [],
				},
				this.syncStatus.status,
				this.getStatusIcon()
			)
		);

		// Sync history
		items.push(
			new SyncItem(
				'📊 Sync History',
				vscode.TreeItemCollapsibleState.Collapsed,
				undefined,
				'View latest syncs'
			)
		);

		// Configuration
		items.push(
			new SyncItem(
				'⚙️ Configuration',
				vscode.TreeItemCollapsibleState.Collapsed,
				undefined,
				'Email & Sheet settings'
			)
		);

		// Actions
		items.push(
			new SyncItem(
				'🔧 Actions',
				vscode.TreeItemCollapsibleState.Collapsed,
				undefined,
				'Sync and management actions'
			)
		);

		// Statistics
		items.push(
			new SyncItem(
				'📈 Statistics',
				vscode.TreeItemCollapsibleState.Collapsed,
				undefined,
				`Total synced: ${this.syncStatus.totalSynced}`
			)
		);

		return items;
	}

	private getChildItems(parentLabel: string): SyncItem[] {
		const items: SyncItem[] = [];

		if (parentLabel.includes('Status')) {
			items.push(
				new SyncItem(
					`Last Sync: ${this.formatDate(this.syncStatus.lastSync)}`,
					vscode.TreeItemCollapsibleState.None,
					undefined,
					undefined,
					'clock'
				)
			);
			items.push(
				new SyncItem(
					`Next Sync: ${this.formatDate(this.syncStatus.nextSync)}`,
					vscode.TreeItemCollapsibleState.None,
					undefined,
					undefined,
					'history'
				)
			);
			items.push(
				new SyncItem(
					'Sync Now',
					vscode.TreeItemCollapsibleState.None,
					{
						command: 'emailToSheet.syncNow',
						title: 'Sync Now',
					},
					undefined,
					'refresh'
				)
			);
		} else if (parentLabel.includes('Sync History')) {
			const history = this.loadSyncHistory();
			history.forEach((entry, index) => {
				items.push(
					new SyncItem(
						`${entry.date} - ${entry.count} emails`,
						vscode.TreeItemCollapsibleState.None,
						undefined,
						entry.status,
						entry.status === 'success' ? 'pass' : 'error'
					)
				);
			});
		} else if (parentLabel.includes('Configuration')) {
			items.push(
				new SyncItem(
					'Edit Settings',
					vscode.TreeItemCollapsibleState.None,
					{
						command: 'emailToSheet.openSettings',
						title: 'Open Settings',
					},
					undefined,
					'edit'
				)
			);
			items.push(
				new SyncItem(
					'Test Connections',
					vscode.TreeItemCollapsibleState.None,
					{
						command: 'emailToSheet.testConnection',
						title: 'Test Connection',
					},
					undefined,
					'debug-alt'
				)
			);
			items.push(
				new SyncItem(
					'Authorize Accounts',
					vscode.TreeItemCollapsibleState.None,
					{
						command: 'emailToSheet.authorize',
						title: 'Authorize',
					},
					undefined,
					'lock'
				)
			);
		} else if (parentLabel.includes('Actions')) {
			items.push(
				new SyncItem(
					'Sync Now',
					vscode.TreeItemCollapsibleState.None,
					{
						command: 'emailToSheet.syncNow',
						title: 'Sync Now',
					},
					undefined,
					'refresh'
				)
			);
			items.push(
				new SyncItem(
					'View Logs',
					vscode.TreeItemCollapsibleState.None,
					{
						command: 'emailToSheet.viewLogs',
						title: 'View Logs',
					},
					undefined,
					'output'
				)
			);
			items.push(
				new SyncItem(
					'Open Documentation',
					vscode.TreeItemCollapsibleState.None,
					undefined,
					'Help & docs',
					'question'
				)
			);
		} else if (parentLabel.includes('Statistics')) {
			const stats = this.getStatistics();
			items.push(
				new SyncItem(
					`Total Emails Synced: ${stats.totalEmails}`,
					vscode.TreeItemCollapsibleState.None,
					undefined,
					undefined,
					'mail'
				)
			);
			items.push(
				new SyncItem(
					`Successful Syncs: ${stats.successfulSyncs}`,
					vscode.TreeItemCollapsibleState.None,
					undefined,
					undefined,
					'pass'
				)
			);
			items.push(
				new SyncItem(
					`Failed Syncs: ${stats.failedSyncs}`,
					vscode.TreeItemCollapsibleState.None,
					undefined,
					undefined,
					'error'
				)
			);
		}

		return items;
	}

	private getStatusLabel(): string {
		switch (this.syncStatus.status) {
			case 'syncing':
				return 'Syncing...';
			case 'success':
				return 'Success ✓';
			case 'error':
				return 'Error ✗';
			default:
				return 'Idle';
		}
	}

	private getStatusIcon(): string {
		switch (this.syncStatus.status) {
			case 'syncing':
				return 'sync~spin';
			case 'success':
				return 'pass';
			case 'error':
				return 'error';
			default:
				return 'circle-outline';
		}
	}

	private formatDate(date: Date | null): string {
		if (!date) {
			return 'Never';
		}
		return date.toLocaleString();
	}

	private loadSyncHistory(): Array<{ date: string; count: number; status: string }> {
		// Load from global state
		const history = this.context.globalState.get('syncHistory', []) as any[];
		return history.slice(-5); // Return last 5 syncs
	}

	private loadSyncStatus(): void {
		const saved = this.context.globalState.get('syncStatus', null) as any;
		if (saved) {
			this.syncStatus = saved;
		}
	}

	private getStatistics() {
		const history = this.context.globalState.get('syncHistory', []) as any[];
		const totalEmails = history.reduce((sum, h) => sum + (h.count || 0), 0);
		const successfulSyncs = history.filter(h => h.status === 'success').length;
		const failedSyncs = history.filter(h => h.status === 'error').length;

		return {
			totalEmails,
			successfulSyncs,
			failedSyncs,
		};
	}

	async refresh(): Promise<void> {
		this._onDidChangeTreeData.fire();
	}

	updateSyncStatus(status: string, count?: number): void {
		this.syncStatus.status = status;
		this.syncStatus.lastSync = new Date();

		// Update history
		const history = this.context.globalState.get('syncHistory', []) as any[];
		history.push({
			date: new Date().toLocaleString(),
			count: count || 0,
			status: status === 'success' ? 'success' : 'error',
		});

		this.context.globalState.update('syncStatus', this.syncStatus);
		this.context.globalState.update('syncHistory', history);

		this.refresh();
	}
}
