import * as vscode from 'vscode';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/logger';

export interface Email {
	from: string;
	to: string;
	subject: string;
	date: string;
	body: string;
	attachments: string[];
	labels?: string[];
	messageId?: string;
}

export class EmailSyncManager {
	private authFile: string;
	private gmail: any;
	private logger: Logger;
	private context: vscode.ExtensionContext;
	private auth: OAuth2Client | null = null;

	constructor(context: vscode.ExtensionContext, logger: Logger) {
		this.context = context;
		this.logger = logger;
		this.authFile = path.join(context.globalStoragePath, 'email-auth.json');
		this.ensureStoragePath();
	}

	private ensureStoragePath() {
		const storageDir = this.context.globalStoragePath;
		if (!fs.existsSync(storageDir)) {
			fs.mkdirSync(storageDir, { recursive: true });
		}
	}

	async authorizeGmail(): Promise<void> {
		const clientId = process.env.GMAIL_CLIENT_ID || 'YOUR_GMAIL_CLIENT_ID';
		const clientSecret = process.env.GMAIL_CLIENT_SECRET || 'YOUR_GMAIL_CLIENT_SECRET';
		const redirectUrl = 'http://localhost:3000/callback';

		this.auth = new OAuth2Client(clientId, clientSecret, redirectUrl);

		// Generate auth URL
		const authUrl = this.auth.generateAuthUrl({
			access_type: 'offline',
			scope: [
				'https://www.googleapis.com/auth/gmail.readonly',
			],
		});

		// Open browser for authorization
		await vscode.env.openExternal(vscode.Uri.parse(authUrl));

		// This would normally receive callback with auth code
		// For now, show instructions
		const code = await vscode.window.showInputBox({
			prompt: 'Enter the authorization code from the browser',
			ignoreFocusOut: true,
		});

		if (code) {
			const { tokens } = await this.auth.getToken(code);
			this.auth.setCredentials(tokens);
			this.saveAuthTokens(tokens);
			this.gmail = google.gmail({ version: 'v1', auth: this.auth });
		}
	}

	async authorizeOutlook(): Promise<void> {
		// Microsoft 365 / Outlook authorization
		const clientId = process.env.OUTLOOK_CLIENT_ID || 'YOUR_OUTLOOK_CLIENT_ID';
		const clientSecret = process.env.OUTLOOK_CLIENT_SECRET || 'YOUR_OUTLOOK_CLIENT_SECRET';
		
		// Simplified Outlook auth flow
		vscode.window.showInformationMessage('Outlook authorization coming soon');
		this.logger.info('Outlook authorization initiated');
	}

	async authorizeImap(): Promise<void> {
		// Generic IMAP setup
		const imapHost = await vscode.window.showInputBox({
			prompt: 'Enter IMAP server host (e.g., imap.gmail.com)',
		});

		const imapPort = await vscode.window.showInputBox({
			prompt: 'Enter IMAP server port (default: 993)',
			value: '993',
		});

		const email = await vscode.window.showInputBox({
			prompt: 'Enter email address',
		});

		const password = await vscode.window.showInputBox({
			prompt: 'Enter email password',
			password: true,
		});

		if (imapHost && email && password) {
			const credentials = {
				type: 'imap',
				host: imapHost,
				port: parseInt(imapPort || '993'),
				email,
				password,
			};
			this.saveAuthTokens(credentials);
		}
	}

	async fetchEmails(onProgress?: (increment: number) => void): Promise<Email[]> {
		const config = vscode.workspace.getConfiguration('emailToSheet');
		const maxEmails = config.get<number>('maxEmails') || 100;
		const provider = config.get<string>('emailProvider') || 'gmail';
		const filterRules = config.get<any[]>('filterRules') || [];

		let emails: Email[] = [];

		try {
			if (provider === 'gmail' && this.gmail) {
				emails = await this.fetchGmailEmails(maxEmails, filterRules);
			} else if (provider === 'imap') {
				emails = await this.fetchImapEmails(maxEmails, filterRules);
			}

			this.logger.info(`Fetched ${emails.length} emails`);
			return emails;
		} catch (error) {
			this.logger.error('Email fetch failed', error);
			throw error;
		}
	}

	private async fetchGmailEmails(maxEmails: number, filterRules: any[]): Promise<Email[]> {
		if (!this.gmail) {
			throw new Error('Gmail not authorized');
		}

		const emails: Email[] = [];
		
		try {
			// Build Gmail query from filter rules
			let query = 'newer_than:1d'; // Get emails from last day by default
			
			for (const rule of filterRules) {
				if (!rule.enabled) continue;
				
				if (rule.type === 'sender' && rule.value) {
					query += ` from:${rule.value}`;
				} else if (rule.type === 'subject' && rule.value) {
					query += ` subject:${rule.value}`;
				} else if (rule.type === 'hasAttachment' && rule.value === 'true') {
					query += ' has:attachment';
				}
			}

			const response = await this.gmail.users.messages.list({
				userId: 'me',
				q: query,
				maxResults: maxEmails,
			});

			const messages = response.data.messages || [];

			for (const message of messages) {
				try {
					const fullMessage = await this.gmail.users.messages.get({
						userId: 'me',
						id: message.id,
						format: 'full',
					});

					const email = this.parseGmailMessage(fullMessage.data);
					emails.push(email);
				} catch (error) {
					this.logger.error(`Failed to parse message ${message.id}`, error);
				}
			}

			return emails;
		} catch (error) {
			this.logger.error('Gmail fetch error', error);
			throw error;
		}
	}

	private async fetchImapEmails(maxEmails: number, filterRules: any[]): Promise<Email[]> {
		// IMAP implementation
		const emails: Email[] = [];
		this.logger.info('IMAP email fetch not yet fully implemented');
		return emails;
	}

	private parseGmailMessage(message: any): Email {
		const headers = message.payload.headers || [];
		const headerMap: { [key: string]: string } = {};
		
		headers.forEach((header: any) => {
			headerMap[header.name.toLowerCase()] = header.value;
		});

		const body = this.extractBody(message.payload);

		return {
			from: headerMap['from'] || 'Unknown',
			to: headerMap['to'] || 'Unknown',
			subject: headerMap['subject'] || '(No Subject)',
			date: headerMap['date'] || new Date().toISOString(),
			body: body,
			attachments: this.extractAttachments(message.payload),
			labels: message.labelIds || [],
			messageId: message.id,
		};
	}

	private extractBody(payload: any): string {
		if (payload.parts) {
			for (const part of payload.parts) {
				if (part.mimeType === 'text/plain') {
					return Buffer.from(part.body.data || '', 'base64').toString();
				}
			}
		}
		
		if (payload.body?.data) {
			return Buffer.from(payload.body.data, 'base64').toString();
		}

		return '';
	}

	private extractAttachments(payload: any): string[] {
		const attachments: string[] = [];

		if (payload.parts) {
			for (const part of payload.parts) {
				if (part.filename) {
					attachments.push(part.filename);
				}
			}
		}

		return attachments;
	}

	async isAuthorized(): Promise<boolean> {
		if (this.auth && this.auth.credentials) {
			return true;
		}

		// Check if tokens are saved
		if (fs.existsSync(this.authFile)) {
			try {
				const tokens = JSON.parse(fs.readFileSync(this.authFile, 'utf-8'));
				return !!tokens.access_token;
			} catch {
				return false;
			}
		}

		return false;
	}

	async testConnection(): Promise<boolean> {
		try {
			if (this.gmail) {
				const response = await this.gmail.users.getProfile({ userId: 'me' });
				return !!response.data.emailAddress;
			}
			return false;
		} catch {
			return false;
		}
	}

	private saveAuthTokens(tokens: any): void {
		fs.writeFileSync(this.authFile, JSON.stringify(tokens, null, 2));
		this.logger.info('Auth tokens saved');
	}
}
