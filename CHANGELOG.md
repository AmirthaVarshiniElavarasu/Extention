# Changelog

All notable changes to the Email to Google Sheet extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Two-way sync (edit in sheet, update email)
- Additional email providers (Yahoo Mail, ProtonMail)
- Advanced scheduling (specific times, days)
- Email attachment download/sync
- Webhook support for real-time sync
- CLI integration
- Custom email parsing rules
- Email template support in sheets

## [1.0.0] - 2024-01-15

### Added
- Initial release of Email to Google Sheet extension
- Gmail integration with OAuth2 authentication
- Microsoft Outlook/Office365 support
- Generic IMAP server support
- Google Sheets integration
- Advanced email filtering:
  - Filter by sender/from address
  - Filter by subject keywords
  - Filter by attachments
  - Filter by Gmail labels
  - Filter by email folder
  - Filter by date range
- Dynamic column mapping to Google Sheets
- Auto-sync capabilities with configurable intervals
- Manual sync on-demand
- Sync history and statistics tracking
- Settings panel with tabbed interface:
  - General settings
  - Email configuration
  - Google Sheets configuration
  - Filter management
  - Column mapping
- Sidebar explorer view showing:
  - Current sync status
  - Sync history
  - Configuration options
  - Quick actions
  - Statistics dashboard
- Keyboard shortcut for quick sync (Ctrl+Shift+E)
- Comprehensive logging and debugging
- Settings persistence
- Connection testing
- Email body preview (first 500 chars)
- Attachment name tracking
- Multiple email field support (from, to, subject, date, body, attachments, labels)
- Header row configuration
- Append vs. replace mode selection
- Notification control
- Extension output channel for logs

### Features
- ✨ Multi-provider email support
- 📊 Automatic and manual sync
- 🔄 Configurable auto-sync intervals
- 🎯 Advanced filtering system
- 🗂️ Custom column mapping
- 📈 Sync history and stats
- 🔐 OAuth2 authentication
- 🚀 Background sync support
- ⚙️ Extensive customization
- 📝 Detailed logging
- 🧪 Connection testing

### Technical
- Built with TypeScript and VS Code Extension API
- Supports Google APIs (gmail, sheets)
- IMAP protocol support
- Proper error handling and recovery
- Async/await pattern for operations
- Tree view implementation for sidebar
- Webview for settings panel
- Global state persistence
- Environment variable support for API keys

## [0.9.0] - 2024-01-10 [Pre-release]

### Added
- Alpha version for testing
- Core Gmail and Sheets integration
- Basic filter support
- Settings UI

---

## Version Guidelines

### Versions
- **MAJOR**: Breaking changes (e.g., removing a feature)
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes and improvements

### Examples
- **1.0.0** → Initial feature release
- **1.1.0** → New provider support
- **1.1.1** → Bug fix
- **2.0.0** → Major restructure or breaking changes

## Future Roadmap

### Phase 2 (v1.1.0)
- [ ] Yahoo Mail support
- [ ] ProtonMail integration
- [ ] Advanced scheduling UI
- [ ] Email categorization

### Phase 3 (v1.2.0)
- [ ] Attachment synchronization
- [ ] Email search interface
- [ ] Bulk operations
- [ ] Custom templates

### Phase 4 (v2.0.0)
- [ ] Two-way sync
- [ ] Real-time sync via webhooks
- [ ] Database backend support
- [ ] API for external integrations

---

## How to Report Issues

1. Check if issue already exists
2. Provide:
   - VS Code version
   - Extension version
   - Email provider used
   - Steps to reproduce
   - Screenshots if applicable
   - Log output

## How to Suggest Features

1. Check roadmap
2. Describe use case
3. Explain expected behavior
4. Provide examples if possible

---

**Last Updated**: January 15, 2024
