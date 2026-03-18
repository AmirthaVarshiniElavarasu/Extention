/**
 * TypeScript Type Definitions for Email to Google Sheet Extension
 */

export interface SyncConfig {
	emailProvider: 'gmail' | 'outlook' | 'imap';
	syncInterval: number;
	maxEmails: number;
	autoSync: boolean;
	enableNotifications: boolean;
}

export interface EmailAccount {
	type: 'gmail' | 'outlook' | 'imap';
	email: string;
	authorized: boolean;
	authorizedAt?: Date;
	expiresAt?: Date;
}

export interface IMAPConfig {
	host: string;
	port: number;
	secure: boolean;
	email: string;
	password: string;
}

export interface FilterRule {
	id?: string;
	name: string;
	type: 'sender' | 'subject' | 'hasAttachment' | 'label' | 'folder' | 'date';
	value: string;
	operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith';
	enabled: boolean;
	createdAt?: Date;
}

export interface ColumnMapping {
	[key: string]: string; // field -> column letter (A, B, C, etc.)
}

export interface SheetSettings {
	spreadsheetId: string;
	sheetName: string;
	appendMode: boolean;
	includeHeaders: boolean;
	headerRow?: number;
}

export interface ExtensionSettings {
	emailProvider: string;
	syncInterval: number;
	maxEmails: number;
	autoSync: boolean;
	enableNotifications: boolean;
	filterRules: FilterRule[];
	columnMapping: ColumnMapping;
	sheetSettings: SheetSettings;
}

export interface SyncEvent {
	id: string;
	timestamp: Date;
	type: 'start' | 'complete' | 'error' | 'cancel';
	emailsCount?: number;
	error?: string;
	duration?: number; // milliseconds
}

export interface SyncHistory {
	sessionId: string;
	startTime: Date;
	endTime?: Date;
	status: 'in-progress' | 'success' | 'failed' | 'cancelled';
	emailsProcessed: number;
	emailsSynced: number;
	errors: string[];
	events: SyncEvent[];
}

export interface Email {
	id?: string;
	messageId?: string;
	from: string;
	to: string;
	cc?: string;
	bcc?: string;
	subject: string;
	date: string;
	body: string;
	htmlBody?: string;
	attachments: EmailAttachment[];
	labels?: string[];
	isRead?: boolean;
	isStarred?: boolean;
	providers?: {
		gmail?: {
			labelIds: string[];
			threadId: string;
		};
		outlook?: {
			categories: string[];
			conversationId: string;
		};
	};
}

export interface EmailAttachment {
	filename: string;
	mimeType: string;
	size: number;
	data?: Buffer;
	contentId?: string;
}

export interface SheetRow {
	[columnLetter: string]: string | number | boolean | Date;
}

export interface AuthToken {
	accessToken: string;
	refreshToken?: string;
	expiresIn?: number;
	expiresAt?: Date;
	tokenType?: string;
	scope?: string[];
}

export interface ExtensionError extends Error {
	code: string;
	details?: any;
	recoverable: boolean;
	suggestion?: string;
}

export interface SyncProgress {
	total: number;
	processed: number;
	synced: number;
	failed: number;
	percentage: number;
}

export interface ConnectionTestResult {
	email: {
		connected: boolean;
		provider: string;
		accountEmail?: string;
		error?: string;
	};
	sheets: {
		connected: boolean;
		spreadsheetTitle?: string;
		sheets?: string[];
		error?: string;
	};
}

export interface NotificationOptions {
	title: string;
	message: string;
	type: 'info' | 'success' | 'warning' | 'error';
	timeout?: number;
	actionItems?: Array<{
		label: string;
		action: () => void;
	}>;
}

export interface ScheduleConfig {
	enabled: boolean;
	frequency: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
	interval?: number;
	time?: string;
	daysOfWeek?: number[];
	nextRun?: Date;
}

export interface CacheConfig {
	enabled: boolean;
	ttl: number; // seconds
	maxSize: number; // bytes
}

export interface LogEntry {
	timestamp: Date;
	level: 'debug' | 'info' | 'warn' | 'error';
	message: string;
	data?: any;
	stack?: string;
}

