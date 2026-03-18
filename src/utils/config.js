/**
 * API Configuration and Constants
 */

const API_CONFIG = {
    // Gmail API
    GMAIL: {
        API_BASE: 'https://www.googleapis.com/gmail/v1',
        SCOPES: [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.modify'
        ],
        ENDPOINTS: {
            PROFILE: '/users/me/profile',
            MESSAGES: '/users/me/messages',
            MESSAGE: '/users/me/messages/{id}',
            LABELS: '/users/me/labels'
        }
    },

    // Microsoft Graph API (Outlook)
    OUTLOOK: {
        API_BASE: 'https://graph.microsoft.com/v1.0',
        SCOPES: [
            'https://graph.microsoft.com/Mail.Read',
            'https://graph.microsoft.com/Mail.ReadWrite'
        ],
        ENDPOINTS: {
            PROFILE: '/me',
            MESSAGES: '/me/mailFolders/inbox/messages',
            MESSAGE: '/me/messages/{id}',
            MAIL_FOLDERS: '/me/mailFolders'
        }
    },

    // Google Sheets API
    SHEETS: {
        API_BASE: 'https://sheets.googleapis.com/v4/spreadsheets',
        SCOPES: [
            'https://www.googleapis.com/auth/spreadsheets'
        ],
        ENDPOINTS: {
            SPREADSHEET: '/{id}',
            VALUES: '/{id}/values/{range}',
            APPEND: '/{id}/values/{range}:append',
            UPDATE: '/{id}/values/{range}',
            BATCH_UPDATE: '/{id}:batchUpdate'
        }
    },

    // Google Drive API
    DRIVE: {
        API_BASE: 'https://www.googleapis.com/drive/v3',
        SCOPES: [
            'https://www.googleapis.com/auth/drive'
        ],
        ENDPOINTS: {
            FILES: '/files',
            PERMISSIONS: '/files/{id}/permissions'
        }
    }
};

const DEFAULT_SETTINGS = {
    general: {
        syncInterval: 15, // minutes
        maxEmails: 100,
        autoSync: false,
        enableNotifications: true
    },
    email: {
        provider: 'gmail',
        imap: {
            host: '',
            port: 993,
            email: '',
            password: ''
        },
        authorized: false
    },
    sheets: {
        spreadsheetId: '',
        sheetName: 'Emails',
        appendMode: true,
        includeHeaders: true,
        authorized: false
    },
    filters: [],
    columnMapping: {
        from: 'A',
        to: 'B',
        subject: 'C',
        date: 'D',
        body: 'E',
        attachments: 'F'
    }
};

const SYNC_INTERVALS = [
    { label: '5 minutes', value: 5 },
    { label: '10 minutes', value: 10 },
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: '4 hours', value: 240 },
    { label: 'Daily', value: 1440 }
];

const EMAIL_PROVIDERS = [
    { label: 'Gmail', value: 'gmail', icon: '📧' },
    { label: 'Outlook', value: 'outlook', icon: '📨' },
    { label: 'IMAP', value: 'imap', icon: '🔧' }
];

const FILTER_TYPES = [
    { label: 'From (Sender)', value: 'sender' },
    { label: 'Subject', value: 'subject' },
    { label: 'Label', value: 'label' },
    { label: 'Date', value: 'date' }
];

const EMAIL_FIELDS = [
    { name: 'from', label: 'From', type: 'text' },
    { name: 'to', label: 'To', type: 'text' },
    { name: 'cc', label: 'CC', type: 'text' },
    { name: 'bcc', label: 'BCC', type: 'text' },
    { name: 'subject', label: 'Subject', type: 'text' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'body', label: 'Body', type: 'textarea' },
    { name: 'attachments', label: 'Attachments', type: 'number' },
    { name: 'labels', label: 'Labels', type: 'array' }
];

const SHEET_COLUMNS = Array.from({ length: 26 }, (_, i) => ({
    letter: String.fromCharCode(65 + i),
    index: i
}));

const ACTIVITY_TYPES = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
};

const SYNC_STATUS = {
    IDLE: 'idle',
    SYNCING: 'syncing',
    SUCCESS: 'success',
    ERROR: 'error',
    PAUSED: 'paused'
};

const MESSAGES = {
    // Success messages
    SYNC_SUCCESS: 'Emails synced successfully!',
    SETTINGS_SAVED: 'Settings saved successfully!',
    AUTH_SUCCESS: 'Authorization successful!',
    SHEET_CREATED: 'New spreadsheet created!',

    // Error messages
    SYNC_FAILED: 'Sync failed. Please check your settings.',
    AUTH_FAILED: 'Authorization failed. Please try again.',
    INVALID_SETTINGS: 'Invalid settings. Please check and try again.',
    NO_EMAILS: 'No new emails to sync.',
    CONNECTION_ERROR: 'Connection error. Please check your internet.',
    API_ERROR: 'API error. Please try again later.',

    // Warning messages
    NO_CONFIGURATION: 'Please configure email and sheets settings first.',
    LOW_INTERVAL: 'Sync interval is very low. This may use more resources.',

    // Info messages
    SYNCING: 'Syncing emails...',
    CHECKING_CONNECTION: 'Checking connection...',
    AUTHORIZING: 'Redirecting to authorization page...'
};

const IMAP_PORTS = {
    STANDARD: 143,
    SECURE: 993
};

const OAUTH_REDIRECT_URL = 'https://nniclockpqppcdidamh.chromiumapp.org/';

const CHROME_EXTENSION_ID = chrome.runtime.id;

const VERSION = chrome.runtime.getManifest().version;

const STORAGE_KEYS = {
    GENERAL: 'general',
    EMAIL: 'email',
    SHEETS: 'sheets',
    FILTERS: 'filters',
    COLUMN_MAPPING: 'columnMapping',
    LAST_SYNC: 'lastSyncTime',
    TOTAL_SYNCED: 'totalSynced',
    ACTIVITY_LOG: 'activityLog',
    EMAIL_TOKEN: 'emailToken',
    SHEETS_TOKEN: 'sheetsToken',
    SYNC_STATUS: 'syncStatus'
};

const LIMITS = {
    MAX_ACTIVITY_LOG_ENTRIES: 50,
    MAX_FILTERS: 100,
    MAX_EMAIL_BATCH_SIZE: 10,
    MIN_SYNC_INTERVAL: 1, // minutes
    MAX_SYNC_INTERVAL: 10080, // 7 days
    MAX_EMAILS_PER_SYNC: 1000
};

const TIME_UNITS = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000
};

// Export all constants
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_CONFIG,
        DEFAULT_SETTINGS,
        SYNC_INTERVALS,
        EMAIL_PROVIDERS,
        FILTER_TYPES,
        EMAIL_FIELDS,
        SHEET_COLUMNS,
        ACTIVITY_TYPES,
        SYNC_STATUS,
        MESSAGES,
        IMAP_PORTS,
        OAUTH_REDIRECT_URL,
        CHROME_EXTENSION_ID,
        VERSION,
        STORAGE_KEYS,
        LIMITS,
        TIME_UNITS
    };
}
