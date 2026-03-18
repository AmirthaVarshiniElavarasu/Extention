# Email to Google Sheets Chrome Extension

A powerful Chrome extension that automatically syncs emails from Gmail, Outlook, or IMAP to Google Sheets with advanced filtering and customization options.

## Features

- **Multi-Provider Support**: Sync emails from Gmail, Outlook, or custom IMAP servers
- **Automatic Syncing**: Schedule automatic email syncing at customizable intervals
- **Advanced Filtering**: Create complex filters based on sender, subject, labels, and dates
- **Flexible Column Mapping**: Map email fields to specific Google Sheets columns
- **Real-time Status**: View sync status and activity logs in the extension popup
- **Error Handling**: Comprehensive error handling with detailed activity logs
- **One-Click Authorization**: Easy OAuth2 authentication for Gmail and Outlook
- **Notifications**: Get notified when syncs complete
- **Persistent Storage**: All settings and sync history stored securely

## Installation

### From Source (Development)

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd email-to-gsheet-chrome
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

### From Chrome Web Store

The extension will be available on the Chrome Web Store (when published).

## Quick Start

### 1. Configure Email Provider
1. Click the extension icon in Chrome toolbar
2. Click **Settings** (⚙️)
3. Go to **Email** tab
4. Select your email provider (Gmail, Outlook, or IMAP)

### 2. Configure Google Sheets
1. In Settings, go to **Sheets** tab
2. Enter your Google Sheets Spreadsheet ID
3. Enter the sheet name (default: "Emails")

### 3. Test Connection
1. In the popup window, click **Test Connection**
2. Verify both Email and Sheets are connected ✓

### 4. Configure Sync
1. Go to **General** tab in Settings
2. Set sync interval (5 min - 7 days)
3. Set maximum emails per sync
4. Enable auto-sync if desired

### 5. Start Syncing
1. Click **Sync Now** in the popup
2. Monitor the activity log for sync status
3. Check your Google Sheet for synced emails

## Authorization


### Gmail

1. When you first configure Gmail, click **Authorize Email**
2. A popup will open requesting access
3. Sign in with your Google account
4. Grant the extension permission to read emails
5. You'll be redirected back to the extension

### Outlook

1. Click **Authorize Email** in the Email settings
2. Sign in with your Microsoft account
3. Grant the extension permission to read emails
4. You'll be redirected back

### Google Sheets

1. When configuring Sheets, click **Authorize Sheets**
2. Sign in with your Google account
3. Grant the extension permission to edit spreadsheets
4. Authorization will be saved for future syncs

## Settings Reference

### General Settings
- **Sync Interval**: How often to sync emails (5 min - 7 days)
- **Max Emails**: Maximum emails to fetch per sync (1-1000)
- **Auto-Sync**: Enable automatic syncing on schedule
- **Notifications**: Get notified when syncs complete

### Email Settings
- **Provider**: Gmail, Outlook, or IMAP
- **IMAP Only Settings**:
  - Host: IMAP server address
  - Port: IMAP port (usually 993)
  - Email: Your email address
  - Password: Email password or app-specific password

### Google Sheets Settings
- **Spreadsheet ID**: ID of target Google Sheet
- **Sheet Name**: Name of tab in the spreadsheet
- **Append Mode**: Add new rows (vs replace)
- **Include Headers**: Add column headers on first sync

### Filter Settings
- Create multiple filters to control which emails sync
- Email must match ALL enabled filters
- Filter types:
  - **Sender**: Filter by email address
  - **Subject**: Filter by subject text
  - **Label**: Filter by Gmail label
  - **Date**: Filter by date range

### Column Mapping
- Map email fields to spreadsheet columns A-G
- Customize exactly what data appears in your sheet
- Supports: From, To, CC, BCC, Subject, Date, Body, Attachments, Labels

## Usage Tips

### Best Practices

1. **Start with a test sheet** - Create a test spreadsheet first
2. **Use filters wisely** - Start with few filters, add as needed
3. **Monitor activity** - Check the activity log to understand sync behavior
4. **Regular backups** - Periodically backup your Google Sheets
5. **Security** - Don't share sensitive emails with unrestricted access

### Troubleshooting

**Authorization fails**
- Clear Chrome cookies for Google/Microsoft
- Try again with Incognito mode
- Ensure you have the correct permissions

**Emails not syncing**
- Check both email and sheets are "Connected" ✓
- Verify spreadsheet ID is correct
- Check sync interval isn't too long
- Look at activity log for error messages

**Too many/few emails**
- Adjust "Max Emails" setting
- Use filters to narrow results
- Check email provider hasn't changed

**Spreadsheet errors**
- Ensure sheet name is correct
- Check Google account has edit access
- Verify spreadsheet is not archived/deleted

## API Usage

### Supported Email Providers

#### Gmail API
- Reads unread emails
- Supports labels and custom filters
- OAuth2 authentication required
- Free tier: 1,000,000 requests/day

#### Microsoft Graph API (Outlook)
- Reads inbox messages
- Supports multiple Exchange folders
- OAuth2 authentication required
- Included with Microsoft 365

#### IMAP
- Works with any IMAP-compatible server
- Supports custom filtering
- Direct password authentication
- Requires backend service (advanced users only)

### Google Sheets API
- Appends or updates rows
- Supports formatting and styling
- OAuth2 authentication required
- Free tier limits apply

## Privacy & Security

- **No data collection**: The extension doesn't collect any user data
- **Local storage**: All settings stored locally on your machine
- **Secure authentication**: Uses OAuth2/OpenID Connect for authorization
- **No third-party tracking**: No analytics or tracking code
- **Open source**: Code is available for review

## Development

### Project Structure

```
email-to-gsheet-chrome/
├── src/
│   ├── popup/
│   │   ├── popup.html       # Popup UI
│   │   ├── popup.css        # Popup styling
│   │   └── popup.js         # Popup logic
│   ├── options/
│   │   ├── options.html     # Settings page
│   │   ├── options.css      # Settings styling
│   │   └── options.js       # Settings logic
│   ├── background/
│   │   └── background.js    # Service worker
│   ├── services/
│   │   ├── EmailService.js  # Email API integration
│   │   └── SheetsService.js # Sheets API integration
│   └── utils/
│       ├── helpers.js       # Utility functions
│       ├── types.js         # Type definitions
│       └── config.js        # Configuration constants
├── manifest.json            # Extension manifest
├── webpack.config.js        # Build configuration
├── .babelrc                 # Babel configuration
├── package.json             # Dependencies
└── README.md               # This file
```

### Building

```bash
# Development build with watch mode
npm run dev

# Production build (minified)
npm run build

# Run dev server
npm start

# Run linter
npm run lint

# Format code
npm run format
```

### Key Classes

#### PopupManager
Manages the extension popup UI and interactions.

```javascript
const popup = new PopupManager();
await popup.syncNow();
popup.showStatus('Message', 'success');
```

#### SettingsManager
Manages the options page and settings persistence.

```javascript
const settings = new SettingsManager();
await settings.saveSettings();
settings.loadColumnMapping();
```

#### EmailService
Handles email provider integration.

```javascript
const email = new EmailService('gmail');
await email.initialize(token);
const messages = await email.getEmails({ maxResults: 100 });
```

#### SheetsService
Handles Google Sheets integration.

```javascript
const sheets = new SheetsService(spreadsheetId);
await sheets.initialize(token, spreadsheetId);
await sheets.appendRows('Sheet1', rows);
```

## Limitations

- **Rate Limits**: API providers have rate limits (see documentation)
- **IMAP Support**: Limited without backend service integration
- **Chrome Sync**: Settings stored locally, not synced across devices
- **Large Spreadsheets**: Very large sheets may have performance issues

## Changelog

### v1.0.0 (2024)
- Initial release
- Support for Gmail, Outlook, and IMAP
- Google Sheets integration
- Advanced filtering and column mapping
- Automatic sync scheduling
- Activity logging and notifications

## Support & Contributing

- **Found a bug?** Open an issue on GitHub
- **Have a feature request?** Create a discussion
- **Want to contribute?** Submit a pull request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## FAQ

**Q: Is this extension safe?**
A: Yes, all data is stored locally and encrypted. We don't collect any personal information.

**Q: Can I use this with multiple email accounts?**
A: Currently supports one email account at a time. You can reconfigure to switch accounts.

**Q: How often can I sync?**
A: Minimum 5 minutes, maximum 7 days between syncs.

**Q: Does this work offline?**
A: No, email sync requires internet connection to email provider and Google servers.

**Q: What if I exceed API rate limits?**
A: Sync will fail with rate limit error. Try increasing sync interval.

**Q: Can I sync to multiple spreadsheets?**
A: Currently one spreadsheet per configuration. You can manually change and re-sync.

**Q: Is my password stored?**
A: IMAP passwords are stored encrypted in Chrome Storage. Gmail/Outlook use OAuth tokens instead.

## Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Microsoft Graph API Documentation](https://docs.microsoft.com/en-us/graph/)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Chrome Extension Developer Guide](https://developer.chrome.com/docs/extensions/mv3/)

---

**Built with ❤️ for email synchronization**
    {
      "name": "With Attachments",
      "type": "hasAttachment",
      "value": "true",
      "enabled": true
    }
  ]
}
```

### Column Mapping Example
```json
{
  "emailToSheet.columnMapping": {
    "from": "A",
    "subject": "B",
    "date": "C",
    "body": "D",
    "attachments": "E",
    "labels": "F"
  }
}
```

### Sheet Settings
```json
{
  "emailToSheet.sheetSettings": {
    "spreadsheetId": "YOUR_SHEET_ID",
    "sheetName": "Emails",
    "appendMode": true,
    "includeHeaders": true
  }
}
```

## Commands

| Command | Hotkey | Description |
|---------|--------|-------------|
| `emailToSheet.start` | - | Start sync wizard |
| `emailToSheet.syncNow` | `Ctrl+Shift+E` | Immediate sync |
| `emailToSheet.openSettings` | - | Open settings panel |
| `emailToSheet.authorize` | - | Authorize accounts |
| `emailToSheet.testConnection` | - | Test email/sheet connection |
| `emailToSheet.viewLogs` | - | View extension logs |

## Quick Start Examples

### Sync All Recent Emails
1. Open Settings: `Email to Sheet: Open Settings`
2. Ensure email & sheet are authorized
3. Run: `Email to Sheet: Sync Now` (or `Ctrl+Shift+E`)

### Auto-Sync Every 30 Minutes
1. Open Settings
2. Set "Sync Interval": 30
3. Enable "Auto-Sync"
4. Click "Save All Settings"

### Sync Only Important Emails
1. Open Settings → Filters tab
2. Add filter: Type="From", Value="important@example.com"
3. Add filter: Type="HasAttachment", Value="true"
4. Click "Sync Now"

### Create Custom Sheet Layout
1. Open Settings → Columns tab
2. Map fields to your preferred columns
3. Choose column headers in Google Sheets
4. Run sync to populate

## Environment Variables

For development, create a `.env` file:

```env
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_secret
SHEETS_CLIENT_ID=your_sheets_client_id
SHEETS_CLIENT_SECRET=your_sheets_secret
OUTLOOK_CLIENT_ID=your_outlook_id
OUTLOOK_CLIENT_SECRET=your_outlook_secret
```

## Troubleshooting

### Authorization Issues
- Clear stored credentials: Delete `~/.vscode` > Email to Sheet extension data
- Regenerate OAuth tokens
- Check environment variables are set

### Sync Failures
- Check "View Logs" for detailed error messages
- Verify sheet ID is correct
- Test connection: `Email to Sheet: Test Connection`
- Ensure Gmail/Outlook account permissions are granted

### No Emails Synced
- Check email filters - may be too restrictive
- Verify email account has emails matching filters
- Check sync interval isn't set to "Never"
- Review logs for errors

### Performance Issues
- Reduce "Max Emails per Sync"
- Increase sync interval
- Use more restrictive filters
- Check network connection

## Development

### Build from Source
```bash
npm install
npm run compile          # TypeScript compile
npm run esbuild         # Bundle with esbuild
npm run watch           # Watch mode
npm run esbuild-watch   # Watch + bundle
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Package VSIX
```bash
npx vsce package
```

## Architecture

```
src/
├── extension.ts           # Main entry point
├── managers/
│   ├── emailSyncManager.ts    # Email fetching logic
│   └── googleSheetsManager.ts # Sheet writing logic
├── ui/
│   ├── settingsPanel.ts   # Settings web view
│   └── syncExplorer.ts    # Sidebar explorer tree
└── utils/
    └── logger.ts          # Logging utility
```

## Privacy & Security

- 🔒 All credentials stored locally in VS Code extension storage
- 🛡️ OAuth2 authentication - no passwords stored
- 📝 Tokens encrypted by VS Code
- ✅ HTTPS only for all external APIs
- 🚫 No telemetry or data collection

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## Support

- 📖 [VS Code Extension Documentation](https://code.visualstudio.com/docs)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)

## License

MIT License - feel free to use this extension!

## Roadmap

- [ ] Support for additional email providers (Yahoo Mail, ProtonMail)
- [ ] Advanced scheduling (specific times, days)
- [ ] Email attachment download/sync
- [ ] Two-way sync (edit in sheet, update email)
- [ ] Webhook support for real-time sync
- [ ] CLI integration
- [ ] Custom email parsing rules
- [ ] Email template support in sheets

## Version History

### v1.0.0
- Initial release
- Gmail, Outlook, IMAP support
- Google Sheets integration
- Advanced filtering
- Column mapping
- Auto-sync capabilities

---

**Enjoy syncing your emails! 🚀**
