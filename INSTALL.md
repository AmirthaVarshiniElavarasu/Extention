# Installation Guide

Complete step-by-step instructions for installing the Email to Google Sheets Chrome Extension.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Methods](#installation-methods)
3. [First Launch Setup](#first-launch-setup)
4. [Authorization Setup](#authorization-setup)
5. [Testing the Installation](#testing-the-installation)
6. [Troubleshooting](#troubleshooting)

## System Requirements

- **Operating System**: Windows, macOS, or Linux
- **Browser**: Google Chrome v88 or later
- **Google Account**: For Google Sheets integration
- **Email Account**: Gmail, Outlook, or IMAP-compatible email
- **Internet Connection**: Required for email and spreadsheet sync

### Optional but Recommended

- `Node.js` v16+ (only if building from source)
- Text editor or IDE (if modifying source code)

## Installation Methods

### Method 1: Chrome Web Store (Recommended)

1. **Visit Chrome Web Store**
   - Open [Chrome Web Store](https://chrome.google.com/webstore)
   - Search for "Email to Google Sheets"

2. **Install Extension**
   - Click on the extension
   - Click blue **"Add to Chrome"** button
   - Confirm permissions dialog

3. **Done!**
   - Extension icon appears in Chrome toolbar
   - Ready to configure

### Method 2: Load from Source (Development)

If you want to build from source or modify the code:

#### Step 1: Get the Code

```bash
# Option A: Clone from GitHub
git clone https://github.com/your-username/email-to-gsheet-chrome.git
cd email-to-gsheet-chrome

# Option B: Download as ZIP
# 1. Go to GitHub repository
# 2. Click "Code" → "Download ZIP"
# 3. Extract the ZIP file
# 4. Open command line in extracted folder
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Build the Extension

```bash
npm run build
```

This creates a `dist/` folder with the compiled extension.

#### Step 4: Load in Chrome

1. **Open Chrome Extensions Page**
   - Type `chrome://extensions/` in address bar
   - Press Enter

2. **Enable Developer Mode**
   - Top right corner: toggle **"Developer mode"** ON

3. **Load Unpacked Extension**
   - Click **"Load unpacked"** button
   - Navigate to the `dist/` folder
   - Click **"Select Folder"**

4. **Verify Installation**
   - Extension appears in the list
   - Extension icon shows in Chrome toolbar

## First Launch Setup

### Step 1: Open the Extension

1. **Click Extension Icon**
   - Look for the extension icon in Chrome toolbar (right side)
   - If not visible: click **Extensions icon** (puzzle piece) → pin the extension

2. **First Time Popup**
   - You'll see a welcome popup
   - Status will show: "Not Configured"

### Step 2: Open Settings

1. **Click Settings Button**
   - In the popup, click ⚙️ icon (top right)
   - Options page opens in new tab

2. **Settings Page Tabs**
   - You'll see 5 tabs: General, Email, Sheets, Filters, Columns

## Authorization Setup

### Gmail Setup

1. **In Settings → Email Tab**
   - Provider: Select **"Gmail"**
   - Click **"Authorize Email"** button

2. **Authorization Window**
   - Google login page appears
   - Sign in with your Google account
   - Click **"Continue"** when prompted
   - Grant requested permissions

3. **Verification**
   - You're redirected back to extension
   - Status should show ✓ under "Email Connected"

**Troubleshooting Gmail:**
- If popup closes without authorization: Try incognito mode
- "Permission denied": Check you have the right Google account
- Still not working: Clear cookies for google.com and try again

### Outlook Setup

1. **In Settings → Email Tab**
   - Provider: Select **"Outlook"** or **"Office 365"**
   - Click **"Authorize Email"** button

2. **Authorization Window**
   - Microsoft login page appears
   - Sign in with your Microsoft account
   - Grant requested permissions

3. **Verification**
   - Status shows ✓ under "Email Connected"

**Troubleshooting Outlook:**
- If authorization fails: Check you're using the right Outlook account
- Multiple Microsoft accounts: Switch to the correct account first

### IMAP Setup (Advanced)

1. **In Settings → Email Tab**
   - Provider: Select **"IMAP"**
   - Additional fields appear:
     - **Host**: Your IMAP server address (e.g., imap.gmail.com)
     - **Port**: Usually 993 (SSL/TLS)
     - **Email**: Your full email address
     - **Password**: Your email password

2. **Common IMAP Servers**
   ```
   Gmail:        imap.gmail.com:993
   Outlook:      outlook.office365.com:993
   Yahoo:        imap.mail.yahoo.com:993
   Hotmail:      imap-mail.outlook.com:993
   ```

3. **Gmail-Specific Note**
   - Regular password won't work
   - Use "App Password" instead:
     1. Go to myaccount.google.com
     2. Security → App passwords
     3. Generate password for "Mail" and "Windows"
     4. Use generated password in IMAP field

### Google Sheets Setup

1. **In Settings → Sheets Tab**
   - Click **"Authorize Sheets"** button

2. **Authorization Window**
   - Google login page appears
   - Sign in with your Google account
   - Grant spreadsheet permissions

3. **Enter Spreadsheet ID**
   - Open your Google Sheet in another tab
   - Copy the ID from URL: `https://docs.google.com/spreadsheets/d/[COPY_THIS]/edit`
   - Paste in **"Spreadsheet ID"** field
   - Click **"Save"**

4. **Verification**
   - Status shows ✓ under "Sheets Connected"

**Create New Spreadsheet:**
- If you don't have one yet:
  1. Click **"Create New Sheet"** button
  2. A sheet is created automatically
  3. ID is filled in for you

## Testing the Installation

### Test 1: Check Connections

1. **In Popup Window**
   - Click **"Test Connection"** button
   - Wait for results

2. **Result**
   - ✓ Both "Email" and "Sheets" should show green
   - ✗ If either shows red, check authorization steps above

### Test 2: Sync a Single Email

1. **In Popup**
   - Click **"Sync Now"** button
   - Watch activity log for progress

2. **Check Result**
   - Look at your Google Sheet
   - New rows should appear with emails

3. **Troubleshooting**
   - No emails appear: Check filters (may be too restrictive)
   - Error message: See troubleshooting section

### Test 3: Verify Auto-Sync (Optional)

1. **In Settings → General Tab**
   - Check **"Enable Auto-Sync"**
   - Set interval to 5 minutes for testing
   - Click **"Save"**

2. **Test**
   - Wait 5 minutes
   - Check activity log for automatic sync
   - Receive notification (if enabled)

## Troubleshooting

### Extension Won't Load

**Issue**: Extension doesn't appear in Chrome toolbar

**Solutions**:
1. Check if already installed: `chrome://extensions/`
2. If found but disabled: Click toggle to enable
3. If not visible: Click puzzle icon → pin the extension
4. Reinstall: Remove and install again

### Configuration Won't Save

**Issue**: Settings keep reverting

**Solutions**:
1. Check Chrome permissions:
   - `chrome://settings/content/storage`
   - Ensure site storage is allowed
2. Try using Chrome sync account
3. Check available storage space on computer
4. Try incognito mode to test
5. Clear Chrome cache and try again

### Sync Fails with Error

**Issue**: Sync button shows error message

**Common Errors & Solutions**:

| Error | Cause | Solution |
|-------|-------|----------|
| "Not authorized" | Auth expired | Click "Authorize Email" again |
| "Invalid spreadsheet ID" | Wrong format | Copy ID again from Google Sheets URL |
| "Quota exceeded" | Too many API calls | Increase sync interval |
| "Sheet not found" | Wrong sheet name | Check exact sheet name in settings |
| "Connection failed" | Network issue | Check internet connection |

### Too Many/Too Few Emails

**Issue**: Syncing wrong number of emails

**Solutions**:
- **Too many emails**:
  1. Lower "Max Emails" in General settings
  2. Add filters in Filters tab
  3. Increase sync interval (fewer syncs = fewer total emails)

- **Too few emails**:
  1. Raise "Max Emails" setting
  2. Disable or modify filters
  3. Check if emails exist in source account

### Extension Keeps Stopping

**Issue**: Auto-sync stops working after some time

**Solutions**:
1. Chrome unloads idle extensions
2. Click extension occasionally to keep it active
3. Reduce sync interval to keep extension awake
4. Check if "Enable Auto-Sync" is still checked

### Authorization Popup Closes Without Saving

**Issue**: Authorization window closes without completing

**Solutions**:
1. Disable pop-up blocker for `chrome://` URLs
2. Try in incognito mode
3. Clear cookies for google.com or microsoft.com
4. Temporarily disable other extensions
5. Check browser console for errors

### Still Having Issues?

1. **Check Activity Log**
   - Open popup
   - Scroll activity log for error messages
   - Note exact error text

2. **Check Browser Console**
   - Right-click extension icon
   - Click "Inspect"
   - Look at "Console" tab for errors

3. **Try Basic Troubleshooting**
   - Disable and re-enable extension
   - Clear Chrome cache
   - Restart Chrome
   - Reinstall extension

4. **Report Issue**
   - Provide error message
   - Steps to reproduce
   - Email provider being used
   - Chrome version: `chrome://version/`

## Next Steps

After successful installation:

1. **Configure Filters** (optional)
   - Settings → Filters tab
   - Add rules to sync specific emails only

2. **Customize Columns** (optional)
   - Settings → Columns tab
   - Choose which email fields appear in spreadsheet

3. **Enable Auto-Sync** (optional)
   - Settings → General tab
   - Check "Enable Auto-Sync"
   - Choose your preferred interval

4. **Start Using**
   - Click "Sync Now" whenever you want
   - Or let it sync automatically

## Questions?

- **FAQ**: Check README.md
- **Development Help**: See DEVELOPMENT.md
- **Feature Requests**: Open GitHub issue
- **Bug Reports**: Provide error message and steps

---

**Welcome to Email to Google Sheets extension!** 🎉
