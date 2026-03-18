# Development Guide

This document provides comprehensive development guidelines for the Email to Google Sheets Chrome Extension.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Project Architecture](#project-architecture)
3. [Development Workflow](#development-workflow)
4. [Building & Testing](#building--testing)
5. [Chrome Extension APIs](#chrome-extension-apis)
6. [Code Style & Standards](#code-style--standards)
7. [Adding Features](#adding-features)
8. [Debugging](#debugging)

## Environment Setup

### Prerequisites

- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **Chrome**: Latest version
- **Git**: For version control

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-username/email-to-gsheet-chrome.git
cd email-to-gsheet-chrome

# Install dependencies
npm install

# Build the extension
npm run build

# Load in Chrome for development
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the dist/ folder
```

## Project Architecture

### Directory Structure

```
src/
├── popup/              # Extension popup (380px wide)
│   ├── popup.html     # UI markup
│   ├── popup.css      # Material Design styling
│   └── popup.js       # PopupManager class
├── options/            # Settings page
│   ├── options.html   # Settings UI with 5 tabs
│   ├── options.css    # Settings styling
│   └── options.js     # SettingsManager class
├── background/         # Service worker
│   └── background.js  # Sync logic & API integrations
├── services/           # API integrations
│   ├── EmailService.js    # Gmail, Outlook, IMAP
│   └── SheetsService.js   #  Google Sheets
└── utils/              # Utilities & helpers
    ├── helpers.js      # Logger, ErrorHandler, Storage utilities
    ├── types.js        # Type definitions & classes
    └── config.js       # Constants & configuration
```

### Key Components

#### 1. Popup (popup.js + popup.html)
- **Purpose**: Quick sync and status display
- **Size**: 380x600px (standard Chrome popup)
- **Features**:
  - Sync Now button
  - Test Connection
  - Activity log
  - Quick settings access
- **Communication**: chrome.runtime.sendMessage() to background

#### 2. Options Page (options.js + options.html)
- **Purpose**: Full settings configuration
- **Tabs**: General, Email, Sheets, Filters, Columns
- **Features**:
  - Form validation
  - Settings persistence
  - Authorization buttons
  - Filter management
- **Storage**: chrome.storage.sync for cross-device sync

#### 3. Background Service Worker (background.js)
- **Purpose**: Core sync engine
- **Features**:
  - Email fetching (Gmail, Outlook, IMAP)
  - Sheets writing
  - Auto-sync scheduling
  - Message routing
  - Error handling
- **Lifecycle**: Starts when needed, stops after idle

#### 4. Services
- **EmailService**: Abstracts email provider APIs
  - getEmails()
  - markAsRead()
  - testConnection()
- **SheetsService**: Abstracts Google Sheets API
  - appendRows()
  - createSpreadsheet()
  - testConnection()

#### 5. Utilities
- **Logger**: Structured logging with timestamps
- **ErrorHandler**: Centralized error handling
- **StorageHelper**: Promise-based storage wrapper
- **ValidationHelper**: Input validation utilities
- **DateHelper**: Date formatting and manipulation

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/my-feature
```

### 2. Development Loop

```bash
# Terminal 1: Watch for changes
npm run dev

# In another terminal: Run dev server (optional)
npm start
```

### 3. Test in Chrome

```bash
# Open chrome://extensions/
# Toggle "Developer mode" ON
# Click "Update" button (or reload icon)
# Check Console for errors (right-click extension > Inspect)
```

### 4. Commit Changes

```bash
npm run format    # Format code
npm run lint      # Check for errors
git add .
git commit -m "feat: describe your feature"
```

## Building & Testing

### Available Scripts

```bash
# Development
npm run dev       # Watch + rebuild on changes
npm start         # Dev server with hot reload

# Production
npm run build     # Minified production build

# Code Quality
npm run lint      # Run ESLint
npm run format    # Format with Prettier
npm run test      # Run tests (when configured)
```

### Production Build Checklist

Before publishing to Chrome Web Store:

- [ ] `npm run build` completes without errors
- [ ] All console errors cleared in extension
- [ ] `npm run lint` passes
- [ ] Test all UI interactions
- [ ] Test all email providers (Gmail, Outlook)
- [ ] Test spreadsheet creation and writing
- [ ] Test filters and column mapping
- [ ] Check manifest version is incremented

## Chrome Extension APIs

### Key APIs Used

#### chrome.runtime
- `onMessage` - Listen for messages from popup/options
- `sendMessage()` - Send messages from popup/options to background

#### chrome.storage
- `sync.get()` / `sync.set()` - Settings (synced across devices)
- `local.get()` / `local.set()` - Activity log, tokens (device-only)

#### chrome.identity
- `getAuthToken()` - OAuth2 authentication
- `launchWebAuthFlow()` - Custom OAuth flow

#### chrome.alarms
- `create()` / `clear()` - Schedule periodic sync

#### chrome.notifications
- `create()` - Show desktop notifications

### Message Format

```javascript
// Send message from popup
chrome.runtime.sendMessage(
    { action: 'syncNow' },
    (response) => console.log(response)
);

// Receive message in background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'syncNow') {
        syncEmails().then(result => sendResponse(result));
        return true; // Indicates async response
    }
});
```

## Code Style & Standards

### JavaScript Standards

```javascript
// ✅ DO: Use async/await
async function fetchEmails() {
    const token = await chrome.storage.sync.get('emailToken');
    return await EmailService.getEmails(token);
}

// ❌ DON'T: Use callbacks
function fetchEmails(callback) {
    chrome.storage.sync.get('emailToken', (result) => {
        // callback hell
    });
}
```

### Class Structure

```javascript
class MyService {
    constructor(config = {}) {
        this.config = config;
        this.logger = new Logger('MyService');
    }

    async initialize() {
        this.logger.info('Initializing service');
        // initialization logic
    }

    /**
     * Fetch data from API
     * @param {string} id - Resource ID
     * @returns {Promise<Object>} Resource data
     */
    async fetchData(id) {
        try {
            const response = await fetch(`/api/data/${id}`);
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            this.logger.error(`Failed to fetch data: ${error.message}`);
            throw error;
        }
    }
}
```

### Error Handling

```javascript
try {
    const result = await operation();
    logger.success('Operation completed');
    return { success: true, data: result };
} catch (error) {
    const errorData = ErrorHandler.handle(error, 'OperationName');
    logger.error(ErrorHandler.formatError(errorData));
    return { success: false, error: errorData };
}
```

## Adding Features

### Example: Add New Email Provider

1. **Update EmailService**
   ```javascript
   async getEmails(options = {}) {
       if (this.provider === 'newProvider') {
           return this.getNewProviderEmails(options);
       }
   }

   async getNewProviderEmails(options) {
       // Implementation
   }
   ```

2. **Update config.js**
   ```javascript
   const EMAIL_PROVIDERS = [
       { label: 'Gmail', value: 'gmail', icon: '📧' },
       { label: 'Outlook', value: 'outlook', icon: '📨' },
       { label: 'New Provider', value: 'newProvider', icon: '📩' }
   ];
   ```

3. **Update options.html**
   ```html
   <select id="emailProvider">
       <option value="gmail">Gmail</option>
       <option value="outlook">Outlook</option>
       <option value="newProvider">New Provider</option>
   </select>
   ```

4. **Test thoroughly**
   - Test authorization flow
   - Test email fetching
   - Test filter application
   - Check error handling

### Example: Add New Setting

1. **Add to types.js**
   ```javascript
   class MySettings {
       constructor(data = {}) {
           this.newSetting = data.newSetting || 'default';
       }
   }
   ```

2. **Add UI in options.html**
   ```html
   <label for="newSetting">New Setting:</label>
   <input type="text" id="newSetting" />
   ```

3. **Add handler in options.js**
   ```javascript
   this.newSetting = document.getElementById('newSetting');

   async saveSettings() {
       const settings = {
           newSetting: this.newSetting.value
       };
       await chrome.storage.sync.set(settings);
   }
   ```

## Debugging

### Viewing Logs

```javascript
// In background service worker
const logger = new Logger('BackgroundService');
logger.log('Message', data);
logger.error('Error message', error);

// View in:
// 1. Right-click extension > Inspect
// 2. Console tab shows all logs
```

### Testing Methods

```javascript
// In browser console (popup)
chrome.runtime.sendMessage({ action: 'syncNow' }, console.log);

// In background console
chrome.storage.sync.get(null, console.log);

// Test fetch
fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json()).then(console.log);
```

### Common Issues

**Background service stops after inactivity**
- Service workers are unloaded after ~5 minutes of inactivity
- Use `chrome.alarms` for scheduled tasks

**Message passing errors**
- Always return `true` in `onMessage` for async responses
- Check for `chrome.runtime.lastError` after async calls

**Storage sync issues**
- `chrome.storage.sync` has 100KB limit per item
- Use `chrome.storage.local` for large data
- Account for quota usage

### Performance Tips

- Cache tokens and settings locally
- Batch API requests when possible
- Use `chrome.alarms` instead of setInterval
- Clean up old activity logs regularly
- Minimize extensions of background worker lifetime

## Resources

- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/reference/)
- [Service Workers Guide](https://developer.chrome.com/docs/extensions/mv3/service_workers/)
- [Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Gmail API](https://developers.google.com/gmail/api/)
- [Google Sheets API](https://developers.google.com/sheets/api/)

---

Happy coding! 🚀
