/**
 * Type Definitions and Interfaces
 * These document the data structures used throughout the extension
 */

/**
 * Email object - represents a single email message
 */
class EmailMessage {
    constructor(data = {}) {
        this.id = data.id || '';
        this.from = data.from || '';
        this.to = data.to || '';
        this.cc = data.cc || '';
        this.bcc = data.bcc || '';
        this.subject = data.subject || '';
        this.date = data.date || new Date().toISOString();
        this.body = data.body || '';
        this.attachments = data.attachments || 0;
        this.labels = data.labels || [];
        this.source = data.source || 'unknown'; // 'gmail' or 'outlook'
        this.internalDate = data.internalDate || null;
        this.synced = data.synced || false;
        this.syncedAt = data.syncedAt || null;
    }

    /**
     * Convert to spreadsheet row
     */
    toRow(columnMapping) {
        const row = new Array(6);
        const mapping = columnMapping || {
            from: 'A',
            to: 'B',
            subject: 'C',
            date: 'D',
            body: 'E',
            attachments: 'F'
        };

        Object.keys(mapping).forEach(field => {
            const colIndex = mapping[field].charCodeAt(0) - 65;
            row[colIndex] = this[field] || '';
        });

        return row.filter(item => item !== undefined);
    }
}

/**
 * Filter rule for emails
 */
class FilterRule {
    constructor(data = {}) {
        this.id = data.id || '';
        this.name = data.name || '';
        this.type = data.type || 'sender'; // 'sender', 'subject', 'label', 'date'
        this.value = data.value || '';
        this.enabled = data.enabled !== false;
        this.createdAt = data.createdAt || new Date().getTime();
    }

    /**
     * Apply filter to email
     */
    matches(email) {
        if (!this.enabled) return true;

        switch (this.type) {
            case 'sender':
                return email.from.includes(this.value);
            case 'subject':
                return email.subject.toLowerCase().includes(this.value.toLowerCase());
            case 'label':
                return email.labels.includes(this.value);
            case 'date':
                return new Date(email.date) >= new Date(this.value);
            default:
                return true;
        }
    }
}

/**
 * Sync status
 */
class SyncStatus {
    constructor(data = {}) {
        this.lastSyncTime = data.lastSyncTime || null;
        this.nextSyncTime = data.nextSyncTime || null;
        this.totalSynced = data.totalSynced || 0;
        this.lastStatus = data.lastStatus || 'idle'; // 'syncing', 'success', 'error', 'idle'
        this.lastError = data.lastError || null;
        this.emailConnected = data.emailConnected || false;
        this.sheetsConnected = data.sheetsConnected || false;
    }

    /**
     * Check if syncing is in progress
     */
    isSyncing() {
        return this.lastStatus === 'syncing';
    }

    /**
     * Format last sync time for display
     */
    getLastSyncDisplay() {
        if (!this.lastSyncTime) return 'Never';
        const date = new Date(this.lastSyncTime);
        return date.toLocaleString();
    }
}

/**
 * General settings
 */
class GeneralSettings {
    constructor(data = {}) {
        this.syncInterval = data.syncInterval || 15; // minutes
        this.maxEmails = data.maxEmails || 100;
        this.autoSync = data.autoSync || false;
        this.enableNotifications = data.enableNotifications !== false;
    }

    validate() {
        if (this.syncInterval < 1) {
            return { valid: false, error: 'Sync interval must be at least 1 minute' };
        }
        if (this.maxEmails < 1) {
            return { valid: false, error: 'Max emails must be at least 1' };
        }
        return { valid: true };
    }
}

/**
 * Email provider settings
 */
class EmailSettings {
    constructor(data = {}) {
        this.provider = data.provider || 'gmail'; // 'gmail', 'outlook', 'imap'
        this.imap = {
            host: data.imap?.host || '',
            port: data.imap?.port || 993,
            email: data.imap?.email || '',
            password: data.imap?.password || ''
        };
        this.authorized = data.authorized || false;
        this.lastAuthTime = data.lastAuthTime || null;
    }

    validate() {
        if (!this.provider) {
            return { valid: false, error: 'Email provider is required' };
        }

        if (this.provider === 'imap') {
            if (!this.imap.host) {
                return { valid: false, error: 'IMAP host is required' };
            }
            if (!this.imap.email) {
                return { valid: false, error: 'Email address is required' };
            }
            if (!this.imap.password) {
                return { valid: false, error: 'Password is required' };
            }
        }

        return { valid: true };
    }
}

/**
 * Google Sheets settings
 */
class SheetsSettings {
    constructor(data = {}) {
        this.spreadsheetId = data.spreadsheetId || '';
        this.sheetName = data.sheetName || 'Emails';
        this.appendMode = data.appendMode !== false;
        this.includeHeaders = data.includeHeaders !== false;
        this.authorized = data.authorized || false;
        this.lastAuthTime = data.lastAuthTime || null;
    }

    validate() {
        if (!this.spreadsheetId) {
            return { valid: false, error: 'Spreadsheet ID is required' };
        }
        if (!this.sheetName) {
            return { valid: false, error: 'Sheet name is required' };
        }
        return { valid: true };
    }
}

/**
 * Activity log entry
 */
class ActivityEntry {
    constructor(data = {}) {
        this.id = data.id || '';
        this.message = data.message || '';
        this.type = data.type || 'info'; // 'info', 'success', 'error', 'warning'
        this.timestamp = data.timestamp || new Date().getTime();
        this.details = data.details || {};
    }

    /**
     * Format for display
     */
    format() {
        const date = new Date(this.timestamp);
        const time = date.toLocaleTimeString();
        return `[${time}] ${this.message}`;
    }
}

/**
 * Complete extension settings
 */
class ExtensionSettings {
    constructor(data = {}) {
        this.general = new GeneralSettings(data.general);
        this.email = new EmailSettings(data.email);
        this.sheets = new SheetsSettings(data.sheets);
        this.filters = (data.filters || []).map(f => new FilterRule(f));
        this.columnMapping = data.columnMapping || {
            from: 'A',
            to: 'B',
            subject: 'C',
            date: 'D',
            body: 'E',
            attachments: 'F'
        };
        this.syncStatus = new SyncStatus(data.syncStatus);
    }

    /**
     * Validate all settings
     */
    validate() {
        const generalValidation = this.general.validate();
        if (!generalValidation.valid) return generalValidation;

        const emailValidation = this.email.validate();
        if (!emailValidation.valid) return emailValidation;

        const sheetsValidation = this.sheets.validate();
        if (!sheetsValidation.valid) return sheetsValidation;

        return { valid: true };
    }

    /**
     * Convert to JSON for storage
     */
    toJSON() {
        return {
            general: this.general,
            email: this.email,
            sheets: this.sheets,
            filters: this.filters,
            columnMapping: this.columnMapping,
            syncStatus: this.syncStatus
        };
    }
}

/**
 * Sync result
 */
class SyncResult {
    constructor(data = {}) {
        this.success = data.success || false;
        this.emailsProcessed = data.emailsProcessed || 0;
        this.emailsSync = data.emailsSync || 0;
        this.emailsFailed = data.emailsFailed || 0;
        this.startTime = data.startTime || new Date().getTime();
        this.endTime = data.endTime || null;
        this.error = data.error || null;
        this.warnings = data.warnings || [];
    }

    /**
     * Get duration in seconds
     */
    getDuration() {
        if (!this.endTime) return null;
        return (this.endTime - this.startTime) / 1000;
    }

    /**
     * Get success rate percentage
     */
    getSuccessRate() {
        if (this.emailsProcessed === 0) return 0;
        return Math.round((this.emailsSync / this.emailsProcessed) * 100);
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EmailMessage,
        FilterRule,
        SyncStatus,
        GeneralSettings,
        EmailSettings,
        SheetsSettings,
        ActivityEntry,
        ExtensionSettings,
        SyncResult
    };
}
