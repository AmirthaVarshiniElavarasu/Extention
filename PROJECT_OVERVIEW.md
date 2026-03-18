# Email to Google Sheet Extension - Project Overview

## 🎯 Project Goal

Create a powerful VS Code extension that seamlessly syncs emails from multiple providers (Gmail, Outlook, IMAP) to Google Sheets with advanced customization options, filtering, and automation capabilities.

## 📦 What's Included

### Core Files
- **extension.ts** - Main entry point and command coordination
- **emailSyncManager.ts** - Email fetching and provider integration
- **googleSheetsManager.ts** - Google Sheets API integration
- **settingsPanel.ts** - Rich settings UI with webview
- **syncExplorer.ts** - Sidebar tree view for status and actions
- **logger.ts** - Comprehensive logging system
- **helpers.ts** - Utility functions
- **errorHandler.ts** - Error handling and custom exceptions
- **apiConfig.ts** - API configuration and constants
- **types/index.ts** - TypeScript type definitions

### Documentation
- **README.md** - Feature overview and usage guide
- **INSTALLATION.md** - Step-by-step installation guide
- **CONTRIBUTING.md** - Contribution guidelines
- **CHANGELOG.md** - Version history and roadmap
- **EXAMPLE_CONFIG.json** - Configuration examples

### Configuration
- **package.json** - npm configuration and dependencies
- **tsconfig.json** - TypeScript configuration
- **.eslintrc.json** - Code quality rules
- **.vscode/settings.json** - Dev environment settings
- **.vscode/launch.json** - Debugger configuration
- **.gitignore** - Git ignore patterns

## 🏗️ Architecture

```
Extension Entry Point (extension.ts)
    ↓
    ├── Email Sync Manager
    │   ├── Gmail Integration
    │   ├── Outlook Integration
    │   └── IMAP Integration
    │
    ├── Google Sheets Manager
    │   ├── OAuth Authentication
    │   └── Spreadsheet Operations
    │
    ├── UI Layer
    │   ├── Settings Panel (Webview)
    │   └── Sync Explorer (Tree View)
    │
    └── Utilities
        ├── Logger
        ├── Error Handler
        └── Helper Functions
```

## 🚀 Key Features

### Email Support
- ✅ Gmail with OAuth2
- ✅ Microsoft Outlook/Office365
- ✅ Generic IMAP servers
- 🔄 Easy provider switching

### Sync Capabilities
- ✅ Manual sync on-demand
- ✅ Auto-sync with intervals
- ✅ Background processing
- ✅ Sync history tracking

### Filtering
- ✅ Filter by sender
- ✅ Filter by subject
- ✅ Filter by attachments
- ✅ Filter by labels/folders
- ✅ Filter by date range
- ✅ Multiple filters support

### Customization
- ✅ Column mapping
- ✅ Header configuration
- ✅ Append/replace modes
- ✅ Notification control
- ✅ Sync frequency
- ✅ Email limits

### User Experience
- ✅ Settings panel with tabs
- ✅ Sidebar explorer view
- ✅ Connection testing
- ✅ Detailed logging
- ✅ Progress indication
- ✅ Error messages

## 📋 File Organization

```
email-to-gsheet/
│
├── src/                          # Source code
│   ├── extension.ts              # Main extension
│   ├── managers/                 # Business logic
│   │   ├── emailSyncManager.ts
│   │   └── googleSheetsManager.ts
│   ├── ui/                       # User interfaces
│   │   ├── settingsPanel.ts
│   │   └── syncExplorer.ts
│   ├── config/                   # Configuration
│   │   └── apiConfig.ts
│   ├── types/                    # Type definitions
│   │   └── index.ts
│   └── utils/                    # Utilities
│       ├── logger.ts
│       ├── helpers.ts
│       └── errorHandler.ts
│
├── dist/                         # Compiled output (generated)
├── out/                          # TypeScript output (generated)
│
├── .vscode/                      # VS Code config
│   ├── settings.json
│   └── launch.json
│
├── package.json                  # npm configuration
├── tsconfig.json                 # TypeScript config
├── .eslintrc.json               # Lint rules
├── .gitignore                   # Git ignore
│
├── README.md                    # Main documentation
├── INSTALLATION.md              # Installation guide
├── CONTRIBUTING.md              # Contribution guide
├── CHANGELOG.md                 # Version history
└── EXAMPLE_CONFIG.json          # Config examples
```

## 🔧 Development Commands

```bash
# Installation
npm install

# Building
npm run compile          # Compile TypeScript
npm run esbuild        # Bundle with esbuild
npm run watch          # Watch mode
npm run esbuild-watch  # Watch + bundle

# Code Quality
npm run lint           # Run linter
npm test              # Run tests

# Packaging
npx vsce package      # Create VSIX file

# Debugging
# Press F5 in VS Code to debug
```

## 📚 Quick Start for Developers

### 1. Clone and Setup
```bash
git clone <repo>
cd email-to-gsheet
npm install
```

### 2. Configure OAuth (Optional)
Create `.env` file with API credentials:
```env
GMAIL_CLIENT_ID=your_id
GMAIL_CLIENT_SECRET=your_secret
SHEETS_CLIENT_ID=your_id
SHEETS_CLIENT_SECRET=your_secret
```

### 3. Run in Development
```bash
npm run watch     # Terminal 1
# Press F5 in VS Code to debug
```

### 4. Test Features
1. Open Extension Host window (via F5)
2. Open command palette: `Ctrl+Shift+P`
3. Run: `Email to Sheet: Open Settings`
4. Configure and test

### 5. Build Release
```bash
npm run esbuild-base -- --minify
npx vsce package
```

## 🔐 Security Considerations

- OAuth2 for all authentication
- No password storage
- Credentials stored in VS Code secure storage
- HTTPS for all API calls
- No telemetry or data collection

## 🎯 Common Development Tasks

### Adding Email Provider
1. Add config in `apiConfig.ts`
2. Implement in `emailSyncManager.ts`
3. Update UI in `settingsPanel.ts`

### Adding Filter Type
1. Update types in `types/index.ts`
2. Add rules in `apiConfig.ts`
3. Implement logic in managers
4. Update UI

### Adding Setting
1. Add to `package.json` contribution
2. Add type definition
3. Handle in settings panel
4. Add default in config

## 📊 Data Flow

```
User Command
    ↓
Extension Command Handler
    ↓
Email Manager (Fetch)
    ↓
Filter & Transform
    ↓
Sheets Manager (Write)
    ↓
Google Sheets Update
    ↓
Status & History
```

## 🧪 Testing Strategy

- Unit tests for helpers
- Integration tests for managers
- E2E tests for sync flow
- Manual testing with real accounts

## 📈 Performance Targets

- Sync 100 emails in < 30 seconds
- Settings panel loads in < 2 seconds
- UI response time < 500ms
- Support 500+ emails with filtering

## 🐛 Debugging Tips

1. **Logs**: `Email to Sheet: View Logs`
2. **DevTools**: Press `F12` in Extension Host
3. **Breakpoints**: Set in VS Code while debugging
4. **Variables**: Inspect in debug console

## 📝 Common Patterns

### Error Handling
```typescript
try {
  // Operation
} catch (error) {
  this.logger.error('Context', error);
  throw new SyncError('Message', { error });
}
```

### Configuration
```typescript
const config = vscode.workspace.getConfiguration('emailToSheet');
const value = config.get<Type>('key');
```

### Async Operations
```typescript
const progress = vscode.window.withProgress(
  { location: vscode.ProgressLocation.Notification },
  async (progress, token) => {
    // Long operation
  }
);
```

## 🚀 Deployment

1. Create release branch
2. Update version in `package.json`
3. Update `CHANGELOG.md`
4. Run `npm run esbuild-base -- --minify`
5. Package: `npx vsce package`
6. Publish to VS Code Marketplace

## 📞 Support Resources

- VS Code API: https://code.visualstudio.com/docs
- Google APIs: https://developers.google.com
- TypeScript: https://www.typescriptlang.org

## 🎓 Learning Resources

- Study the extension.ts entry point first
- Review type definitions for data structures
- Examine manager classes for business logic
- Check UI components for user interactions

---

**Total LOC**: ~2000+ lines of well-structured TypeScript
**File Count**: 14 core files + documentation
**Dependencies**: googleapis, imap, mailparser
**Target Users**: Email power users, data analysts, business users

**Happy developing! 🚀**
