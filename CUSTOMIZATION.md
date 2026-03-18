# Customization Guide

This guide covers all the customization options available in the Email to Google Sheet extension.

## 📋 Table of Customizations

1. [Email Provider Configuration](#email-provider-configuration)
2. [Sync Settings](#sync-settings)
3. [Email Filtering](#email-filtering)
4. [Column Mapping](#column-mapping)
5. [Google Sheets Configuration](#google-sheets-configuration)
6. [Advanced Settings](#advanced-settings)
7. [Notification Preferences](#notification-preferences)

---

## Email Provider Configuration

### Gmail Setup
```json
{
  "emailToSheet.emailProvider": "gmail",
  "emailToSheet.gmailScopes": [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify"
  ]
}
```

**Features:**
- OAuth2 authentication
- Full Gmail filter support
- Label support
- Thread management

### Outlook Setup
```json
{
  "emailToSheet.emailProvider": "outlook",
  "emailToSheet.outlookScopes": [
    "Mail.Read",
    "Calendars.Read"
  ]
}
```

**Features:**
- Microsoft Graph API
- Folder support
- Category support

### IMAP Setup
```json
{
  "emailToSheet.emailProvider": "imap",
  "emailToSheet.imapConfig": {
    "host": "imap.gmail.com",
    "port": 993,
    "secure": true,
    "email": "your-email@gmail.com",
    "password": "your-app-password"
  }
}
```

**Features:**
- Works with any IMAP server
- Standard folder support
- Password-based auth

---

## Sync Settings

### Sync Interval
```json
{
  "emailToSheet.syncInterval": 15
}
```

| Value | Description |
|-------|-------------|
| 1 | Every minute (not recommended) |
| 5 | Every 5 minutes |
| 15 | Every 15 minutes (default) |
| 30 | Every 30 minutes |
| 60 | Every hour |
| 720 | Every 12 hours |
| 1440 | Once daily |

### Maximum Emails per Sync
```json
{
  "emailToSheet.maxEmails": 100
}
```

| Value | Use Case |
|-------|----------|
| 10 | Test/demo purposes |
| 50 | Small folders |
| 100 | Standard usage (default) |
| 250 | Large folders |
| 500 | Maximum recommended |

### Auto-Sync Toggle
```json
{
  "emailToSheet.autoSync": true,
  "emailToSheet.autoSyncSchedule": {
    "frequency": "interval",
    "interval": 15,
    "startTime": "09:00",
    "endTime": "17:00"
  }
}
```

---

## Email Filtering

### Filter by Sender
```json
{
  "emailToSheet.filterRules": [
    {
      "name": "Company Emails",
      "type": "sender",
      "value": "@company.com",
      "operator": "contains",
      "enabled": true
    }
  ]
}
```

**Examples:**
- Single email: `john@company.com`
- Domain: `@company.com`
- Multiple: Multiple rules for OR logic

### Filter by Subject
```json
{
  "type": "subject",
  "value": "Invoice|Receipt",
  "operator": "contains"
}
```

**Operators:**
- `contains` - Text anywhere in subject
- `equals` - Exact match
- `startsWith` - Begins with text
- `endsWith` - Ends with text

### Filter by Attachments
```json
{
  "type": "hasAttachment",
  "value": "true"
}
```

### Filter by Labels (Gmail)
```json
{
  "type": "label",
  "value": "Important,Work"
}
```

### Filter by Folder
```json
{
  "type": "folder",
  "value": "Inbox,Archive"
}
```

### Filter by Date Range
```json
{
  "type": "date",
  "value": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### Complex Filter Example
```json
{
  "emailToSheet.filterRules": [
    {
      "name": "Important Work Emails",
      "type": "sender",
      "value": "@company.com",
      "enabled": true
    },
    {
      "name": "With Attachments",
      "type": "hasAttachment",
      "value": "true",
      "enabled": true
    },
    {
      "name": "Invoice Related",
      "type": "subject",
      "value": "Invoice|Quote",
      "operator": "contains",
      "enabled": true
    },
    {
      "name": "Recent",
      "type": "date",
      "value": "2024-01-01",
      "enabled": true
    }
  ]
}
```

---

## Column Mapping

### Basic Mapping
```json
{
  "emailToSheet.columnMapping": {
    "from": "A",
    "to": "B",
    "subject": "C",
    "date": "D",
    "body": "E",
    "attachments": "F",
    "labels": "G"
  }
}
```

### Available Fields
| Field | Description | Max Length |
|-------|-------------|-----------|
| `from` | Sender email address | N/A |
| `to` | Recipient email(s) | N/A |
| `cc` | Carbon copy recipients | N/A |
| `subject` | Email subject | N/A |
| `date` | Email date/time | N/A |
| `body` | Email body text | 500 chars |
| `attachments` | Attachment filenames | N/A |
| `labels` | Email labels/tags | N/A |

### Custom Column Layout

**Sales Template:**
```json
{
  "from": "A",
  "subject": "B",
  "date": "C",
  "body": "D"
}
```

**Support Tickets:**
```json
{
  "from": "A",
  "subject": "B",
  "date": "C",
  "cc": "D",
  "attachments": "E"
}
```

**CRM Integration:**
```json
{
  "from": "A",
  "to": "B",
  "subject": "C",
  "date": "D",
  "labels": "E",
  "attachments": "F"
}
```

---

## Google Sheets Configuration

### Sheet Settings
```json
{
  "emailToSheet.sheetSettings": {
    "spreadsheetId": "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
    "sheetName": "Emails",
    "appendMode": true,
    "includeHeaders": true,
    "headerRow": 1
  }
}
```

### Header Configuration
```json
{
  "emailToSheet.headerConfig": {
    "includeHeaders": true,
    "bold": true,
    "backgroundColor": "#2c2c2c",
    "textColor": "#ffffff",
    "fontSize": 12
  }
}
```

### Data Format Options
```json
{
  "emailToSheet.dataFormats": {
    "dateFormat": "yyyy-MM-dd",
    "timeFormat": "HH:mm:ss",
    "numberFormat": "#,##0.00",
    "bodyCharLimit": 500
  }
}
```

---

## Advanced Settings

### Cache Configuration
```json
{
  "emailToSheet.cache": {
    "enabled": true,
    "ttl": 3600,
    "maxSize": 10485760
  }
}
```

### Retry Configuration
```json
{
  "emailToSheet.retry": {
    "enabled": true,
    "maxAttempts": 3,
    "initialDelay": 1000,
    "backoffMultiplier": 2
  }
}
```

### Timeout Configuration
```json
{
  "emailToSheet.timeout": {
    "syncTimeout": 30000,
    "apiTimeout": 10000,
    "authTimeout": 60000
  }
}
```

### Logging Configuration
```json
{
  "emailToSheet.logging": {
    "level": "info",
    "maxLogSize": 5242880,
    "logRetention": 7,
    "includeSensitiveData": false
  }
}
```

---

## Notification Preferences

### Basic Notifications
```json
{
  "emailToSheet.enableNotifications": true,
  "emailToSheet.notificationOptions": {
    "showSuccess": true,
    "showError": true,
    "showWarning": true,
    "timeout": 5000
  }
}
```

### Sound Notifications
```json
{
  "emailToSheet.soundEnabled": false,
  "emailToSheet.notification": {
    "sound": "default",
    "volume": 80
  }
}
```

### Notification Types
```json
{
  "emailToSheet.notifications": {
    "onSyncComplete": true,
    "onSyncError": true,
    "onConnectionLost": true,
    "onAuthExpired": true
  }
}
```

---

## Complete Example Configurations

### Simple Setup (Gmail + Google Sheets)
```json
{
  "emailToSheet.emailProvider": "gmail",
  "emailToSheet.syncInterval": 30,
  "emailToSheet.maxEmails": 100,
  "emailToSheet.autoSync": true,
  "emailToSheet.enableNotifications": true,
  "emailToSheet.columnMapping": {
    "from": "A",
    "subject": "B",
    "date": "C",
    "body": "D"
  },
  "emailToSheet.sheetSettings": {
    "spreadsheetId": "YOUR_SHEET_ID",
    "sheetName": "Emails",
    "appendMode": true,
    "includeHeaders": true
  }
}
```

### Sales Team Setup
```json
{
  "emailToSheet.emailProvider": "outlook",
  "emailToSheet.autoSync": true,
  "emailToSheet.syncInterval": 15,
  "emailToSheet.maxEmails": 200,
  "emailToSheet.filterRules": [
    {
      "name": "Sales Emails",
      "type": "label",
      "value": "Sales",
      "enabled": true
    },
    {
      "name": "With Attachments",
      "type": "hasAttachment",
      "value": "true",
      "enabled": true
    }
  ],
  "emailToSheet.columnMapping": {
    "from": "A",
    "subject": "B",
    "date": "C",
    "attachments": "D"
  }
}
```

### Support Team Setup
```json
{
  "emailToSheet.emailProvider": "gmail",
  "emailToSheet.autoSync": true,
  "emailToSheet.syncInterval": 5,
  "emailToSheet.maxEmails": 500,
  "emailToSheet.filterRules": [
    {
      "name": "Support Queue",
      "type": "label",
      "value": "Support",
      "enabled": true
    },
    {
      "name": "Unread",
      "type": "subject",
      "value": "",
      "enabled": false
    }
  ],
  "emailToSheet.columnMapping": {
    "from": "A",
    "to": "B",
    "subject": "C",
    "date": "D",
    "body": "E"
  }
}
```

---

## Custom Scripts & Automation

### Pre-Sync Hook (Planned)
```javascript
// .vscode/email-to-sheet-config.js
module.exports = {
  onBeforeSync: async (emails) => {
    // Custom processing
    return processedEmails;
  },
  onAfterSync: async (result) => {
    // Custom actions
  }
};
```

---

## Tips & Tricks

1. **Start Simple**: Begin with basic settings, then add filters
2. **Test Filters**: Use "Test Connection" to verify your setup
3. **Monitor Logs**: Check logs when something doesn't work
4. **Backup State**: Export settings periodically
5. **Use Multiple Sheets**: Create separate sheets for different types of emails

---

## Performance Tuning

- **Reduce Email Limit**: Lower `maxEmails` for faster syncs
- **Increase Interval**: Set longer sync intervals if not real-time needed
- **Restrictive Filters**: Use filters to narrow down email set
- **Disable Attachments**: If not needed, reduces processing time

---

## Troubleshooting Customization

| Issue | Solution |
|-------|----------|
| Filters not working | Check filter type and value syntax |
| Column mapping wrong | Verify column letters (A-Z) |
| Settings not saving | Check configuration target (global/workspace) |
| Performance slow | Reduce maxEmails or add filters |
| Notifications not showing | Check notification settings and VS Code settings |

---

**Happy customizing! 🎉**
