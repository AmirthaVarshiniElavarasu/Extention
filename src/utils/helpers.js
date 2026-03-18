// Utility Helpers

class Logger {
    constructor(context = 'Extension') {
        this.context = context;
    }

    log(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${this.context}] ${message}`, data || '');
    }

    info(message, data = null) {
        const timestamp = new Date().toISOString();
        console.info(`[${timestamp}] [${this.context}] ℹ ${message}`, data || '');
    }

    warn(message, data = null) {
        const timestamp = new Date().toISOString();
        console.warn(`[${timestamp}] [${this.context}] ⚠ ${message}`, data || '');
    }

    error(message, error = null) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [${this.context}] ✗ ${message}`, error || '');
    }

    success(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${this.context}] ✓ ${message}`, data || '');
    }

    time(label) {
        console.time(`[${this.context}] ${label}`);
    }

    timeEnd(label) {
        console.timeEnd(`[${this.context}] ${label}`);
    }
}

class ErrorHandler {
    static handle(error, context = 'Unknown') {
        const logger = new Logger(context);

        if (error instanceof TypeError) {
            logger.error(`Type Error: ${error.message}`);
            return { code: 'TYPE_ERROR', message: error.message };
        } else if (error instanceof ReferenceError) {
            logger.error(`Reference Error: ${error.message}`);
            return { code: 'REFERENCE_ERROR', message: error.message };
        } else if (error.message.includes('API error')) {
            logger.error(`API Error: ${error.message}`);
            return { code: 'API_ERROR', message: error.message };
        } else if (error.message.includes('authorization')) {
            logger.warn(`Authorization Error: ${error.message}`);
            return { code: 'AUTH_ERROR', message: 'Authorization failed. Please re-authenticate.' };
        } else {
            logger.error(`Unexpected error: ${error.message}`);
            return { code: 'UNKNOWN_ERROR', message: error.message };
        }
    }

    static formatError(errorData) {
        return `${errorData.code}: ${errorData.message}`;
    }
}

class StorageHelper {
    static async get(key) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get([key], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result[key]);
                }
            });
        });
    }

    static async set(key, value) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set({ [key]: value }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(true);
                }
            });
        });
    }

    static async getLocal(key) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get([key], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result[key]);
                }
            });
        });
    }

    static async setLocal(key, value) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({ [key]: value }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(true);
                }
            });
        });
    }

    static async clear() {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.clear(() => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(true);
                }
            });
        });
    }
}

class DateHelper {
    static formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static formatRelativeTime(timestamp) {
        const now = new Date().getTime();
        const diff = now - timestamp;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        if (days < 30) return `${Math.floor(days / 7)}w ago`;
        return `${Math.floor(days / 30)}mo ago`;
    }

    static getTime(timeString) {
        return new Date(timeString).getTime();
    }

    static isToday(timestamp) {
        const date = new Date(timestamp);
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }
}

class ValidationHelper {
    static isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    static isValidSpreadsheetId(id) {
        // Google Sheets IDs are long alphanumeric strings
        return id && id.length > 20 && /^[a-zA-Z0-9-_]+$/.test(id);
    }

    static sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input.replace(/[<>\"']/g, '');
    }

    static validateSettings(settings) {
        const errors = [];

        if (!settings.general?.syncInterval || settings.general.syncInterval < 1) {
            errors.push('Sync interval must be at least 1 minute');
        }

        if (!settings.email?.provider) {
            errors.push('Email provider is required');
        }

        if (!settings.sheets?.spreadsheetId) {
            errors.push('Google Sheets ID is required');
        }

        if (!ValidationHelper.isValidSpreadsheetId(settings.sheets?.spreadsheetId)) {
            errors.push('Invalid Google Sheets ID format');
        }

        return errors;
    }
}

class StringHelper {
    static truncate(str, length) {
        return str.length > length ? str.substring(0, length) + '...' : str;
    }

    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    static camelToTitle(str) {
        return str.replace(/([A-Z])/g, ' $1').replace(/^./, str[0].toUpperCase());
    }

    static escape(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    static unescape(str) {
        const div = document.createElement('div');
        div.innerHTML = str;
        return div.textContent;
    }

    static generateId() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
}

class ArrayHelper {
    static unique(arr) {
        return [...new Set(arr)];
    }

    static flatten(arr) {
        return arr.reduce((flat, item) => {
            return flat.concat(Array.isArray(item) ? ArrayHelper.flatten(item) : item);
        }, []);
    }

    static chunk(arr, size) {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    }

    static groupBy(arr, key) {
        return arr.reduce((groups, item) => {
            const value = item[key];
            if (!groups[value]) {
                groups[value] = [];
            }
            groups[value].push(item);
            return groups;
        }, {});
    }

    static sortBy(arr, key) {
        return [...arr].sort((a, b) => {
            if (a[key] < b[key]) return -1;
            if (a[key] > b[key]) return 1;
            return 0;
        });
    }
}

class ObjectHelper {
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => ObjectHelper.deepClone(item));

        const cloed = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloed[key] = ObjectHelper.deepClone(obj[key]);
            }
        }
        return cloed;
    }

    static merge(target, source) {
        const output = ObjectHelper.deepClone(target);
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                output[key] = source[key];
            }
        }
        return output;
    }

    static pick(obj, keys) {
        const result = {};
        keys.forEach(key => {
            if (obj.hasOwnProperty(key)) {
                result[key] = obj[key];
            }
        });
        return result;
    }

    static omit(obj, keys) {
        const result = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && !keys.includes(key)) {
                result[key] = obj[key];
            }
        }
        return result;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Logger,
        ErrorHandler,
        StorageHelper,
        DateHelper,
        ValidationHelper,
        StringHelper,
        ArrayHelper,
        ObjectHelper
    };
}
