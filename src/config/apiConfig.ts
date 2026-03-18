/**
 * API Configuration for Email to Google Sheet Extension
 * 
 * This file contains API endpoints and configuration constants
 */

export const API_CONFIG = {
	// Gmail API
	gmail: {
		apiVersion: 'v1',
		baseUrl: 'https://www.googleapis.com/gmail',
		scopes: [
			'https://www.googleapis.com/auth/gmail.readonly',
			'https://www.googleapis.com/auth/gmail.modify'
		],
		defaultQuery: 'newer_than:7d' // Last 7 days by default
	},

	// Google Sheets API
	sheets: {
		apiVersion: 'v4',
		baseUrl: 'https://www.googleapis.com/sheets',
		scopes: [
			'https://www.googleapis.com/auth/spreadsheets',
			'https://www.googleapis.com/auth/drive'
		]
	},

	// Microsoft Graph (Outlook)
	outlook: {
		apiVersion: 'v2.0',
		baseUrl: 'https://graph.microsoft.com',
		scopes: [
			'Mail.Read',
			'Calendars.Read'
		]
	},

	// OAuth Configuration
	oauth: {
		redirectPort: 3000,
		redirectPath: '/callback',
		tokenRefreshBuffer: 5 * 60 * 1000 // 5 minutes before expiry
	}
};

// Email Provider Configurations
export const EMAIL_PROVIDERS = {
	gmail: {
		name: 'Gmail',
		icon: 'mail',
		requiresApiKey: true,
		supportedFilters: ['sender', 'subject', 'hasAttachment', 'label', 'date'],
		defaultSyncDays: 7,
		maxEmailsPerRequest: 500
	},
	outlook: {
		name: 'Microsoft Outlook',
		icon: 'mail',
		requiresApiKey: true,
		supportedFilters: ['sender', 'subject', 'hasAttachment', 'folder', 'date'],
		defaultSyncDays: 7,
		maxEmailsPerRequest: 500
	},
	imap: {
		name: 'Generic IMAP',
		icon: 'mail',
		requiresServer: true,
		supportedFilters: ['sender', 'subject', 'hasAttachment', 'folder'],
		defaultSyncDays: 7,
		maxEmailsPerRequest: 100
	}
};

// Google Sheets Configuration
export const SHEETS_CONFIG = {
	maxRowsPerRequest: 1000,
	batchUpdateSize: 100,
	defaultCellFormat: {
		fontSize: 11,
		fontFamily: 'arial'
	},
	headerFormat: {
		backgroundColor: {
			red: 0.2,
			green: 0.2,
			blue: 0.2
		},
		textColor: {
			red: 1,
			green: 1,
			blue: 1
		},
		bold: true
	}
};

// Sync Configuration
export const SYNC_CONFIG = {
	minInterval: 1,           // minutes
	maxInterval: 1440,        // 24 hours
	defaultInterval: 15,      // minutes
	minEmails: 1,
	maxEmails: 500,
	defaultEmails: 100,
	retryAttempts: 3,
	retryDelay: 5000,         // 5 seconds
	timeoutDuration: 30000    // 30 seconds
};

// Filter Validation Rules
export const FILTER_RULES = {
	sender: {
		pattern: /^[^@]+@[^@]+\.[^@]+$/,
		description: 'Email address pattern'
	},
	subject: {
		pattern: /.{1,256}/,
		description: 'Text pattern (1-256 chars)'
	},
	label: {
		pattern: /.{1,100}/,
		description: 'Label name (1-100 chars)'
	},
	folder: {
		pattern: /.{1,100}/,
		description: 'Folder name (1-100 chars)'
	},
	date: {
		pattern: /^\d{4}-\d{2}-\d{2}$/,
		description: 'Date format (YYYY-MM-DD)'
	}
};

// Column Mapping Defaults
export const DEFAULT_COLUMN_MAPPING = {
	from: 'A',
	to: 'B',
	subject: 'C',
	date: 'D',
	body: 'E',
	attachments: 'F',
	labels: 'G'
};

// File Storage Paths
export const STORAGE_PATHS = {
	auth: 'email-auth.json',
	sheetsAuth: 'sheets-auth.json',
	syncHistory: 'sync-history.json',
	settings: 'settings.json',
	logs: 'logs/'
};

export default API_CONFIG;
