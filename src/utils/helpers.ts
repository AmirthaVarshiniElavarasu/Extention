import * as vscode from 'vscode';

/**
 * Utility helper functions for Email to Sheet extension
 */

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Validate Google Sheets spreadsheet ID
 */
export function isValidSpreadsheetId(id: string): boolean {
	return id && id.length > 0 && id.match(/^[a-zA-Z0-9-_]+$/);
}

/**
 * Convert column letter to number (A=0, B=1, Z=25, AA=26)
 */
export function columnLetterToNumber(letter: string): number {
	let num = 0;
	for (let i = 0; i < letter.length; i++) {
		num = num * 26 + (letter.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
	}
	return num - 1;
}

/**
 * Convert column number to letter (0=A, 1=B, 25=Z, 26=AA)
 */
export function columnNumberToLetter(num: number): string {
	let letter = '';
	while (num >= 0) {
		letter = String.fromCharCode((num % 26) + 'A'.charCodeAt(0)) + letter;
		num = Math.floor(num / 26) - 1;
	}
	return letter;
}

/**
 * Parse email address to extract local and domain parts
 */
export function parseEmailAddress(email: string): { local: string; domain: string } | null {
	const match = email.match(/^([^@]+)@([^@]+)$/);
	if (match) {
		return {
			local: match[1],
			domain: match[2],
		};
	}
	return null;
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
	if (text.length <= maxLength) {
		return text;
	}
	return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string | null): string {
	if (!date) {
		return 'Never';
	}

	const dateObj = typeof date === 'string' ? new Date(date) : date;
	if (isNaN(dateObj.getTime())) {
		return 'Invalid date';
	}

	return dateObj.toLocaleString();
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/**
 * Parse ISO date string
 */
export function parseISODate(dateString: string): Date | null {
	const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!match) {
		return null;
	}

	const [, year, month, day] = match;
	return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

/**
 * Delay execution (for retries, etc)
 */
export function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	maxAttempts: number = 3,
	initialDelay: number = 1000
): Promise<T> {
	let lastError: any;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;
			if (attempt < maxAttempts) {
				const delayMs = initialDelay * Math.pow(2, attempt - 1);
				await delay(delayMs);
			}
		}
	}

	throw lastError;
}

/**
 * Get configuration value with type safety
 */
export function getConfig<T>(key: string, defaultValue?: T): T {
	const config = vscode.workspace.getConfiguration('emailToSheet');
	return config.get<T>(key) ?? defaultValue;
}

/**
 * Update configuration value
 */
export async function updateConfig<T>(key: string, value: T): Promise<void> {
	const config = vscode.workspace.getConfiguration('emailToSheet');
	await config.update(key, value, vscode.ConfigurationTarget.Global);
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
	return filename
		.replace(/[^a-z0-9]/gi, '_')
		.toLowerCase()
		.substring(0, 255);
}

/**
 * Deep merge two objects
 */
export function deepMerge<T>(target: T, source: Partial<T>): T {
	const result = { ...target };

	for (const key in source) {
		if (Object.prototype.hasOwnProperty.call(source, key)) {
			const sourceValue = source[key];
			const targetValue = result[key];

			if (
				typeof sourceValue === 'object' &&
				sourceValue !== null &&
				!Array.isArray(sourceValue) &&
				typeof targetValue === 'object' &&
				targetValue !== null &&
				!Array.isArray(targetValue)
			) {
				result[key] = deepMerge(targetValue, sourceValue);
			} else {
				result[key] = sourceValue;
			}
		}
	}

	return result;
}

/**
 * Check if string matches glob pattern
 */
export function matchesGlob(str: string, pattern: string): boolean {
	const regexPattern = pattern
		.replace(/[.+^${}()|[\]\\]/g, '\\$&')
		.replace(/\*/g, '.*')
		.replace(/\?/g, '.');

	return new RegExp(`^${regexPattern}$`).test(str);
}

/**
 * Get unique items from array
 */
export function unique<T>(array: T[], key?: (item: T) => any): T[] {
	if (!key) {
		return [...new Set(array)];
	}

	const seen = new Set();
	return array.filter(item => {
		const k = key(item);
		if (seen.has(k)) {
			return false;
		}
		seen.add(k);
		return true;
	});
}

/**
 * Group array items by key
 */
export function groupBy<T>(array: T[], key: (item: T) => string): Map<string, T[]> {
	const map = new Map<string, T[]>();

	for (const item of array) {
		const k = key(item);
		if (!map.has(k)) {
			map.set(k, []);
		}
		map.get(k)!.push(item);
	}

	return map;
}

/**
 * Create a progress callback for logging
 */
export function createProgressLogger(logger: any, message: string) {
	return (current: number, total: number) => {
		const percentage = Math.round((current / total) * 100);
		logger.info(`${message}: ${percentage}%`);
	};
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, defaultValue: T | null = null): T | null {
	try {
		return JSON.parse(json) as T;
	} catch {
		return defaultValue;
	}
}

/**
 * Safe JSON stringify
 */
export function safeJsonStringify(obj: any, replacer?: any, space?: number): string {
	try {
		return JSON.stringify(obj, replacer, space);
	} catch {
		return '{}';
	}
}

/**
 * Extract domain from email address
 */
export function extractDomain(email: string): string | null {
	const match = email.match(/@([^@]+)$/);
	return match ? match[1] : null;
}

/**
 * Check if array is empty
 */
export function isEmpty<T>(array: T[]): boolean {
	return !array || array.length === 0;
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
}

/**
 * Flatten nested array
 */
export function flatten<T>(array: (T | T[])[]): T[] {
	return array.reduce((acc: T[], item) => {
		if (Array.isArray(item)) {
			return acc.concat(flatten(item));
		}
		return acc.concat(item);
	}, []);
}

export default {
	isValidEmail,
	isValidSpreadsheetId,
	columnLetterToNumber,
	columnNumberToLetter,
	parseEmailAddress,
	truncateText,
	formatDate,
	formatDateISO,
	parseISODate,
	delay,
	retryWithBackoff,
	getConfig,
	updateConfig,
	sanitizeFilename,
	deepMerge,
	matchesGlob,
	unique,
	groupBy,
	createProgressLogger,
	safeJsonParse,
	safeJsonStringify,
	extractDomain,
	isEmpty,
	chunk,
	flatten,
};
