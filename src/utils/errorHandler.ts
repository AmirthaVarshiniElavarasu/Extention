/**
 * Error handling and custom error types
 */

export class ExtensionError extends Error {
	constructor(
		public code: string,
		message: string,
		public recoverable: boolean = true,
		public details?: any,
		public suggestion?: string
	) {
		super(message);
		this.name = 'ExtensionError';
	}

	toJSON() {
		return {
			code: this.code,
			message: this.message,
			recoverable: this.recoverable,
			details: this.details,
			suggestion: this.suggestion,
		};
	}
}

export class AuthenticationError extends ExtensionError {
	constructor(provider: string, details?: any) {
		super(
			'AUTH_ERROR',
			`Authentication failed for ${provider}`,
			true,
			details,
			`Please re-authorize your ${provider} account`
		);
		this.name = 'AuthenticationError';
	}
}

export class ConfigurationError extends ExtensionError {
	constructor(setting: string, details?: any) {
		super(
			'CONFIG_ERROR',
			`Configuration error: ${setting}`,
			true,
			details,
			`Check your settings in Email to Sheet configuration`
		);
		this.name = 'ConfigurationError';
	}
}

export class SyncError extends ExtensionError {
	constructor(message: string, details?: any, recoverable: boolean = true) {
		super(
			'SYNC_ERROR',
			message,
			recoverable,
			details,
			'Check logs for more details'
		);
		this.name = 'SyncError';
	}
}

export class SheetError extends ExtensionError {
	constructor(action: string, details?: any) {
		super(
			'SHEET_ERROR',
			`Failed to ${action} Google Sheet`,
			true,
			details,
			`Verify spreadsheet ID and permissions`
		);
		this.name = 'SheetError';
	}
}

export class EmailError extends ExtensionError {
	constructor(action: string, provider: string, details?: any) {
		super(
			'EMAIL_ERROR',
			`Failed to ${action} email from ${provider}`,
			true,
			details,
			`Check email account authorization and settings`
		);
		this.name = 'EmailError';
	}
}

export class ValidationError extends ExtensionError {
	constructor(field: string, reason: string, details?: any) {
		super(
			'VALIDATION_ERROR',
			`Validation failed for ${field}: ${reason}`,
			true,
			details,
			`Correct the value and try again`
		);
		this.name = 'ValidationError';
	}
}

export class NetworkError extends ExtensionError {
	constructor(message: string, details?: any) {
		super(
			'NETWORK_ERROR',
			message,
			true,
			details,
			'Check your internet connection and try again'
		);
		this.name = 'NetworkError';
	}
}

/**
 * Error handler with logging and user notifications
 */
export class ErrorHandler {
	constructor(private logger: any, private showMessage: (msg: string) => void) {}

	handle(error: any, context: string = 'Operation'): void {
		if (error instanceof ExtensionError) {
			this.handleExtensionError(error, context);
		} else if (error instanceof Error) {
			this.handleStandardError(error, context);
		} else {
			this.handleUnknownError(error, context);
		}
	}

	private handleExtensionError(error: ExtensionError, context: string): void {
		this.logger.error(
			`${context}: ${error.message}`,
			{
				code: error.code,
				recoverable: error.recoverable,
				details: error.details,
			}
		);

		const userMessage = `${error.message}. ${error.suggestion || ''}`;
		this.showMessage(userMessage);
	}

	private handleStandardError(error: Error, context: string): void {
		this.logger.error(`${context}: ${error.message}`, {
			stack: error.stack,
		});

		this.showMessage(`${context} failed: ${error.message}`);
	}

	private handleUnknownError(error: any, context: string): void {
		this.logger.error(`${context}: Unknown error`, error);
		this.showMessage(`${context} failed: Unknown error`);
	}

	/**
	 * Validate required fields in an object
	 */
	validateRequired(obj: any, requiredFields: string[], context: string = ''): void {
		const missing = requiredFields.filter(field => !obj[field]);

		if (missing.length > 0) {
			throw new ValidationError(
				`${context} ${missing.join(', ')}`,
				'Required fields are missing',
				{ missing }
			);
		}
	}

	/**
	 * Validate email addresses
	 */
	validateEmail(email: string, context: string = 'Email'): void {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			throw new ValidationError(context, 'Invalid email format', { email });
		}
	}

	/**
	 * Validate spreadsheet ID
	 */
	validateSpreadsheetId(id: string, context: string = 'Spreadsheet ID'): void {
		if (!id || !id.match(/^[a-zA-Z0-9-_]+$/)) {
			throw new ValidationError(context, 'Invalid spreadsheet ID format', { id });
		}
	}

	/**
	 * Validate URL
	 */
	validateUrl(url: string, context: string = 'URL'): void {
		try {
			new URL(url);
		} catch {
			throw new ValidationError(context, 'Invalid URL format', { url });
		}
	}
}

/**
 * Try-catch wrapper for async functions
 */
export async function asyncTry<T>(
	fn: () => Promise<T>,
	errorContext: string = 'Operation'
): Promise<[T | null, ExtensionError | null]> {
	try {
		return [await fn(), null];
	} catch (error) {
		if (error instanceof ExtensionError) {
			return [null, error];
		}

		if (error instanceof Error) {
			return [
				null,
				new ExtensionError(
					'UNKNOWN_ERROR',
					`${errorContext}: ${error.message}`,
					true,
					{ originalError: error.message }
				),
			];
		}

		return [
			null,
			new ExtensionError(
				'UNKNOWN_ERROR',
				`${errorContext}: Unknown error`,
				true,
				{ error }
			),
		];
	}
}

/**
 * Assertion helper
 */
export function assert(condition: boolean, message: string): asserts condition {
	if (!condition) {
		throw new ExtensionError('ASSERTION_ERROR', message, false);
	}
}

/**
 * Null check helper
 */
export function assertNotNull<T>(value: T | null | undefined, message: string): T {
	if (value === null || value === undefined) {
		throw new ExtensionError('NULL_ERROR', message, false);
	}
	return value;
}

export default {
	ExtensionError,
	AuthenticationError,
	ConfigurationError,
	SyncError,
	SheetError,
	EmailError,
	ValidationError,
	NetworkError,
	ErrorHandler,
	asyncTry,
	assert,
	assertNotNull,
};
