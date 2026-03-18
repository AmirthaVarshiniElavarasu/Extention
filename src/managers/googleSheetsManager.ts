import * as vscode from 'vscode';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/logger';
import { Email } from './emailSyncManager';

export class GoogleSheetsManager {
	private authFile: string;
	private sheets: any;
	private logger: Logger;
	private context: vscode.ExtensionContext;
	private auth: OAuth2Client | null = null;

	constructor(context: vscode.ExtensionContext, logger: Logger) {
		this.context = context;
		this.logger = logger;
		this.authFile = path.join(context.globalStoragePath, 'sheets-auth.json');
	}

	async authorize(): Promise<void> {
		const clientId = process.env.SHEETS_CLIENT_ID || 'YOUR_SHEETS_CLIENT_ID';
		const clientSecret = process.env.SHEETS_CLIENT_SECRET || 'YOUR_SHEETS_CLIENT_SECRET';
		const redirectUrl = 'http://localhost:3000/sheets-callback';

		this.auth = new OAuth2Client(clientId, clientSecret, redirectUrl);

		const authUrl = this.auth.generateAuthUrl({
			access_type: 'offline',
			scope: [
				'https://www.googleapis.com/auth/spreadsheets',
			],
		});

		await vscode.env.openExternal(vscode.Uri.parse(authUrl));

		const code = await vscode.window.showInputBox({
			prompt: 'Enter the authorization code from the browser',
			ignoreFocusOut: true,
		});

		if (code) {
			const { tokens } = await this.auth.getToken(code);
			this.auth.setCredentials(tokens);
			this.saveAuthTokens(tokens);
			this.sheets = google.sheets({ version: 'v4', auth: this.auth });
		}
	}

	async appendEmails(emails: Email[]): Promise<void> {
		const config = vscode.workspace.getConfiguration('emailToSheet');
		const spreadsheetId = config.get<any>('sheetSettings')?.spreadsheetId;
		const sheetName = config.get<any>('sheetSettings')?.sheetName || 'Emails';
		const columnMapping = config.get<any>('columnMapping') || {
			from: 'A',
			subject: 'B',
			date: 'C',
			body: 'D',
		};

		if (!spreadsheetId) {
			throw new Error('Spreadsheet ID not configured');
		}

		if (!this.sheets) {
			throw new Error('Google Sheets not authorized');
		}

		try {
			// Prepare rows
			const rows = this.emailsToRows(emails, columnMapping);

			// Get current sheet info
			const sheet = await this.getOrCreateSheet(spreadsheetId, sheetName);

			// Append data
			const range = `${sheetName}!A1`;
			await this.sheets.spreadsheets.values.append({
				spreadsheetId,
				range,
				valueInputOption: 'USER_ENTERED',
				requestBody: {
					values: rows,
				},
			});

			this.logger.info(`Appended ${emails.length} emails to sheet`);
		} catch (error) {
			this.logger.error('Failed to append emails', error);
			throw error;
		}
	}

	async getOrCreateSheet(spreadsheetId: string, sheetName: string): Promise<any> {
		try {
			const spreadsheet = await this.sheets.spreadsheets.get({
				spreadsheetId,
			});

			// Check if sheet exists
			const existingSheet = spreadsheet.data.sheets?.find(
				(s: any) => s.properties.title === sheetName
			);

			if (existingSheet) {
				return existingSheet;
			}

			// Create new sheet
			const response = await this.sheets.spreadsheets.batchUpdate({
				spreadsheetId,
				requestBody: {
					requests: [
						{
							addSheet: {
								properties: {
									title: sheetName,
									gridProperties: {
										rowCount: 1000,
										columnCount: 26,
									},
								},
							},
						},
					],
				},
			});

			return response.data.replies[0].addSheet;
		} catch (error) {
			this.logger.error('Failed to get or create sheet', error);
			throw error;
		}
	}

	private emailsToRows(emails: Email[], columnMapping: any): any[][] {
		const rows: any[][] = [];

		// Add headers if configured
		const config = vscode.workspace.getConfiguration('emailToSheet');
		const includeHeaders = config.get<any>('sheetSettings')?.includeHeaders !== false;

		if (includeHeaders && rows.length === 0) {
			const header: any[] = new Array(26);
			Object.entries(columnMapping).forEach(([field, column]: [string, any]) => {
				const colIndex = column.charCodeAt(0) - 'A'.charCodeAt(0);
				header[colIndex] = this.capitalizeField(field);
			});
			rows.push(header.filter(x => x !== undefined));
		}

		// Add email data
		for (const email of emails) {
			const row: any[] = new Array(26);

			Object.entries(columnMapping).forEach(([field, column]: [string, any]) => {
				const colIndex = column.charCodeAt(0) - 'A'.charCodeAt(0);
				row[colIndex] = this.getEmailField(email, field);
			});

			rows.push(row.filter(x => x !== undefined));
		}

		return rows;
	}

	private capitalizeField(field: string): string {
		return field.charAt(0).toUpperCase() + field.slice(1);
	}

	private getEmailField(email: Email, field: string): string {
		switch (field) {
			case 'from':
				return email.from;
			case 'to':
				return email.to;
			case 'subject':
				return email.subject;
			case 'date':
				return email.date;
			case 'body':
				return email.body.substring(0, 500); // Limit body length
			case 'attachments':
				return email.attachments.join(', ');
			case 'labels':
				return email.labels?.join(', ') || '';
			default:
				return '';
		}
	}

	async testConnection(): Promise<boolean> {
		try {
			if (!this.sheets) {
				return false;
			}

			const spreadsheetId = vscode.workspace.getConfiguration('emailToSheet')
				.get<any>('sheetSettings')?.spreadsheetId;

			if (!spreadsheetId) {
				return false;
			}

			const response = await this.sheets.spreadsheets.get({
				spreadsheetId,
			});

			return !!response.data.spreadsheetId;
		} catch {
			return false;
		}
	}

	async createNewSheet(): Promise<string> {
		if (!this.sheets) {
			throw new Error('Google Sheets not authorized');
		}

		try {
			const response = await this.sheets.spreadsheets.create({
				requestBody: {
					properties: {
						title: `Email Sync - ${new Date().toLocaleDateString()}`,
					},
					sheets: [
						{
							properties: {
								title: 'Emails',
								gridProperties: {
									rowCount: 1000,
									columnCount: 6,
								},
							},
						},
					],
				},
			});

			const spreadsheetId = response.data.spreadsheetId;
			this.logger.info(`Created new spreadsheet: ${spreadsheetId}`);
			return spreadsheetId;
		} catch (error) {
			this.logger.error('Failed to create new sheet', error);
			throw error;
		}
	}

	private saveAuthTokens(tokens: any): void {
		fs.writeFileSync(this.authFile, JSON.stringify(tokens, null, 2));
		this.logger.info('Sheets auth tokens saved');
	}
}
