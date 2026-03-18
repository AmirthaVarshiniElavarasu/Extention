# Installation & Setup Guide

## Prerequisites

- Node.js 16 or higher
- npm or yarn
- VS Code 1.85.0 or higher
- Git (for cloning)

## Step 1: Clone or Download

```bash
# Clone the repository
git clone https://github.com/your-username/email-to-gsheet.git
cd email-to-gsheet

# Or download and extract the ZIP file
```

## Step 2: Install Dependencies

```bash
# Install npm packages
npm install

# This will install:
# - VS Code API types
# - TypeScript compiler
# - ESBuild bundler
# - ESLint for code quality
# - googleapis library
# - imap and mailparser libraries
```

## Step 3: Build the Extension

### For Development
```bash
# One-time build
npm run compile

# Or watch mode (auto-rebuild on changes)
npm run watch
```

### For Production
```bash
# Optimized build with minification
npm run esbuild-base -- --minify
```

## Step 4: Launch & Test

### Using VS Code Debug
1. Open the project in VS Code
2. Press `F5` or go to Run → Start Debugging
3. An "Extension Development Host" window opens
4. The extension is now active

### Install as VSIX
```bash
# Package the extension
npx vsce package

# This creates: email-to-gsheet-1.0.0.vsix

# Install the VSIX
# File → Install from VSIX... in VS Code
```

## Step 5: Configure OAuth (Required for Gmail/Sheets)

### Get Gmail API Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable these APIs:
   - Gmail API
   - Google Sheets API
4. Create OAuth 2.0 Client ID:
   - Application type: Desktop app
   - Download credentials JSON
5. Set environment variables:
   ```bash
   export GMAIL_CLIENT_ID="your-client-id"
   export GMAIL_CLIENT_SECRET="your-client-secret"
   ```

### Get Google Sheets API Credentials
Same process as Gmail:
1. Enable Google Sheets API in Google Cloud Console
2. Create OAuth 2.0 Client ID
3. Set environment:
   ```bash
   export SHEETS_CLIENT_ID="your-sheets-id"
   export SHEETS_CLIENT_SECRET="your-sheets-secret"
   ```

### (Optional) Get Outlook API Credentials
1. Go to [Azure Portal](https://portal.azure.com/)
2. Create app registration
3. Add permissions for mail.read
4. Create client secret
5. Set environment:
   ```bash
   export OUTLOOK_CLIENT_ID="your-app-id"
   export OUTLOOK_CLIENT_SECRET="your-secret"
   ```

## Step 6: First Run

1. Open VS Code command palette: `Ctrl+Shift+P`
2. Run: `Email to Sheet: Open Settings`
3. Fill in your spreadsheet ID (from Google Sheets URL)
4. Click "Authorize Email Account" (Gmail, Outlook, or IMAP)
5. Click "Authorize Google Account" for Sheets
6. Configure sync settings:
   - Email provider
   - Sync interval
   - Maximum emails
   - Filter rules
7. Click "Save All Settings"

## Common Setup Issues

### Issue: "Extension not found"
**Solution:**
```bash
npm run compile
# Make sure no errors appear
```

### Issue: Authorization fails
**Solution:**
1. Check environment variables are set
2. Verify credentials are correct
3. Try regenerating OAuth tokens
4. Check browser cookies/cache

### Issue: Can't find Spreadsheet ID
**Solution:**
1. Open your Google Sheet
2. Copy from URL: `docs.google.com/spreadsheets/d/**{ID}**/`
3. Paste in "Spreadsheet ID" setting

### Issue: IMAP connection fails
**Solution:**
1. Verify IMAP is enabled in email account
2. Check port (usually 993 for secure IMAP)
3. Verify credentials are correct

## Configuration Files

### .env File (Optional for Development)
Create `.env` in project root:
```env
GMAIL_CLIENT_ID=xxx
GMAIL_CLIENT_SECRET=yyy
SHEETS_CLIENT_ID=aaa
SHEETS_CLIENT_SECRET=bbb
OUTLOOK_CLIENT_ID=ccc
OUTLOOK_CLIENT_SECRET=ddd
```

### VS Code Settings
Add to your `.vscode/settings.json`:
```json
{
  "[emailToSheet]": {
    "emailToSheet.emailProvider": "gmail",
    "emailToSheet.syncInterval": 15,
    "emailToSheet.autoSync": true
  }
}
```

## Verify Installation

Run these commands to verify:

```bash
# Check Node version
node --version  # Should be 16+

# Check npm
npm --version

# Check build succeeds
npm run compile

# Check no lint errors
npm run lint

# Check TypeScript compilation
npx tsc --noEmit
```

## Next Steps

After installation:
1. ✅ Authorize email account
2. ✅ Authorize Google account
3. ✅ Test connection (`Email to Sheet: Test Connection`)
4. ✅ Configure email filters (optional)
5. ✅ Set up column mapping (optional)
6. ✅ Enable auto-sync (optional)
7. ✅ Run first sync (`Email to Sheet: Sync Now`)

## Development Setup

For active development:

```bash
# Terminal 1: Watch mode
npm run watch

# Terminal 2: Launch debugger
# Press F5 in VS Code

# This setup:
# - Auto-compiles TypeScript
# - Hot-reloads extension
# - Allows breakpoint debugging
```

## Debugging Tips

1. **Open Developer Tools**: In Extension Host window, press `F12`
2. **Check Logs**: `Email to Sheet: View Logs`
3. **Test Commands**:
   ```
   Email to Sheet: Test Connection
   Email to Sheet: Sync Now
   Email to Sheet: View Logs
   ```
4. **Inspect State**: Use `get_debug_variables` when paused at breakpoint

## Troubleshooting

### Extension doesn't appear in sidebar
- Run: `Developer: Reload Window` (`Ctrl+R`)
- Check that manifest.json is correct
- Verify activation events in package.json

### Settings don't persist
- Check `.globalStoragePath` permissions
- Verify VS Code settings sync is enabled
- Look for errors in `Output` panel

### Sync shows "Error ✗"
- Check credentials are still valid
- Regenerate OAuth tokens
- Check sheet ID is correct
- Review logs for details

## Getting Help

1. Check README.md for features and commands
2. Look at EXAMPLE_CONFIG.json for configuration examples
3. Review logs: `Email to Sheet: View Logs`
4. Test connections: `Email to Sheet: Test Connection`

---

**Installation complete! Happy syncing! 🎉**
