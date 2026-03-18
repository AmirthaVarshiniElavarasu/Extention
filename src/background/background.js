// Background service worker

const GMAIL_API_BASE = 'https://www.googleapis.com/gmail/v1';
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'syncNow') {
        syncEmails().then(result => sendResponse(result)).catch(error => sendResponse({ success: false, error }));
        return true;
    } else if (request.action === 'testConnection') {
        testConnections().then(result => sendResponse(result)).catch(error => sendResponse({ success: false, error }));
        return true;
    } else if (request.action === 'testEmailConnection') {
        testEmailConnection().then(result => sendResponse(result)).catch(error => sendResponse({ success: false, error }));
        return true;
    } else if (request.action === 'testSheetsConnection') {
        testSheetsConnection().then(result => sendResponse(result)).catch(error => sendResponse({ success: false, error }));
        return true;
    } else if (request.action === 'authorizeEmail') {
        authorizeEmail().then(result => sendResponse(result)).catch(error => sendResponse({ success: false, error }));
        return true;
    } else if (request.action === 'authorizeSheets') {
        authorizeSheets().then(result => sendResponse(result)).catch(error => sendResponse({ success: false, error }));
        return true;
    } else if (request.action === 'createNewSheet') {
        createNewSheet().then(result => sendResponse(result)).catch(error => sendResponse({ success: false, error }));
        return true;
    } else if (request.action === 'settingsUpdated') {
        onSettingsUpdated(request.settings);
    }
});

// Sync emails
async function syncEmails() {
    const startTime = new Date();
    
    try {
        const { email: emailSettings, sheets: sheetsSettings, general: generalSettings } = 
            await chrome.storage.sync.get(['email', 'sheets', 'general']);

        if (!emailSettings || !sheetsSettings) {
            logActivity('Sync failed: Missing email or sheets configuration', 'error');
            return { success: false, error: 'Configure email and sheets first' };
        }

        // Fetch emails based on provider
        let emails = [];
        if (emailSettings.provider === 'gmail') {
            emails = await fetchGmailEmails(emailSettings, generalSettings);
        } else if (emailSettings.provider === 'outlook') {
            emails = await fetchOutlookEmails(emailSettings, generalSettings);
        } else if (emailSettings.provider === 'imap') {
            emails = await fetchImapEmails(emailSettings, generalSettings);
        }

        // Write to Google Sheets
        if (emails.length > 0) {
            const sheetsResult = await writeToSheets(emails, sheetsSettings);
            if (sheetsResult.success) {
                const duration = ((new Date() - startTime) / 1000).toFixed(1);
                logActivity(`Synced ${emails.length} emails in ${duration}s`, 'success');
                
                // Update sync status
                await chrome.storage.local.set({
                    lastSyncTime: new Date().getTime(),
                    totalSynced: (await chrome.storage.local.get('totalSynced')).totalSynced + emails.length || emails.length
                });

                return { success: true, emailsProcessed: emails.length };
            } else {
                logActivity(`Failed to write to sheets: ${sheetsResult.error}`, 'error');
                return { success: false, error: sheetsResult.error };
            }
        } else {
            logActivity('No new emails to sync', 'info');
            return { success: true, emailsProcessed: 0 };
        }
    } catch (error) {
        console.error('Sync error:', error);
        logActivity(`Sync error: ${error.message}`, 'error');
        return { success: false, error: error.message };
    }
}

// Fetch emails from Gmail
async function fetchGmailEmails(emailSettings, generalSettings) {
    const token = await getAccessToken('gmail');
    if (!token) {
        throw new Error('No Gmail access token');
    }

    const maxResults = generalSettings?.maxEmails || 100;
    const url = `${GMAIL_API_BASE}/users/me/messages?maxResults=${maxResults}&q=is:unread`;

    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Gmail API error: ${response.status} - ${text}`);
    }

    const data = await response.json();
    const messageIds = (data.messages || []).map(m => m.id);

    // Fetch full message details
    const emails = await Promise.all(
        messageIds.map(id => fetchGmailMessage(token, id))
    );

    return emails.filter(Boolean);
}

// Fetch single Gmail message
async function fetchGmailMessage(token, messageId) {
    const url = `${GMAIL_API_BASE}/users/me/messages/${messageId}?format=full`;
    
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        console.warn(`Failed to fetch message ${messageId}`);
        return null;
    }

    const message = await response.json();
    const headers = message.payload.headers || [];
    const getHeader = (name) => headers.find(h => h.name === name)?.value || '';

    return {
        from: getHeader('From'),
        to: getHeader('To'),
        subject: getHeader('Subject'),
        date: getHeader('Date'),
        body: extractEmailBody(message.payload),
        attachments: message.payload.parts?.filter(p => p.filename).length || 0,
        labels: message.labelIds || [],
        source: 'gmail'
    };
}

// Extract email body from Gmail payload
function extractEmailBody(payload) {
    if (payload.mimeType.includes('text/plain')) {
        return payload.body?.data ? decodeBase64(payload.body.data) : '';
    }

    if (payload.parts) {
        const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
        return textPart?.body?.data ? decodeBase64(textPart.body.data) : '';
    }

    return '';
}

// Decode base64 string
function decodeBase64(str) {
    try {
        return decodeURIComponent(atob(str.replace(/-/g, '+').replace(/_/g, '/')).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    } catch (e) {
        return '';
    }
}

// Fetch emails from Outlook
async function fetchOutlookEmails(emailSettings, generalSettings) {
    const token = await getAccessToken('outlook');
    if (!token) {
        throw new Error('No Outlook access token');
    }

    const maxResults = generalSettings?.maxEmails || 100;
    const url = `https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$top=${maxResults}&$filter=isRead eq false`;

    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error(`Outlook API error: ${response.status}`);
    }

    const data = await response.json();

    return (data.value || []).map(msg => ({
        from: msg.from?.emailAddress?.address || '',
        to: msg.toRecipients?.map(r => r.emailAddress?.address).join(', ') || '',
        subject: msg.subject,
        date: msg.receivedDateTime,
        body: msg.bodyPreview,
        attachments: msg.hasAttachments ? 1 : 0,
        labels: [],
        source: 'outlook'
    }));
}

// Fetch emails from IMAP (simplified - would need backend service)
async function fetchImapEmails(emailSettings, generalSettings) {
    // IMAP requires a backend service since Chrome extensions can't directly connect to IMAP
    // This is a placeholder - in production, use a backend server
    throw new Error('IMAP requires backend server integration. See documentation.');
}

// Write emails to Google Sheets
async function writeToSheets(emails, sheetsSettings) {
    const token = await getAccessToken('sheets');
    if (!token) {
        throw new Error('No Sheets access token');
    }

    const spreadsheetId = sheetsSettings.spreadsheetId;
    const sheetName = sheetsSettings.sheetName || 'Emails';

    try {
        // Get column mapping
        const { columnMapping } = await chrome.storage.sync.get('columnMapping');
        const mapping = columnMapping || getDefaultColumnMapping();

        // Prepare rows
        const rows = emails.map(email => {
            const row = [];
            const columns = getColumnsFromMapping(mapping);
            
            columns.forEach((field, idx) => {
                const colIndex = mapping[field].charCodeAt(0) - 65; // A=0, B=1, etc.
                row[colIndex] = email[field] || '';
            });

            return row;
        });

        // Add headers if needed
        if (sheetsSettings.includeHeaders) {
            const columns = getColumnsFromMapping(mapping);
            const headerRow = [];
            columns.forEach(field => {
                const colIndex = mapping[field].charCodeAt(0) - 65;
                headerRow[colIndex] = capitalizeField(field);
            });
            rows.unshift(headerRow);
        }

        // Write to sheets
        const range = `${sheetName}!A1`;
        const appendUrl = `${SHEETS_API_BASE}/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

        const response = await fetch(appendUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                values: rows
            })
        });

        if (!response.ok) {
            const text = await response.text();
            return { success: false, error: `Sheets API error: ${response.status}` };
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Test connections
async function testConnections() {
    const emailOk = await testEmailConnection().then(r => r.success).catch(() => false);
    const sheetsOk = await testSheetsConnection().then(r => r.success).catch(() => false);
    
    return {
        success: emailOk && sheetsOk,
        email: { connected: emailOk },
        sheets: { connected: sheetsOk }
    };
}

// Test email connection
async function testEmailConnection() {
    const { email: emailSettings } = await chrome.storage.sync.get('email');
    
    if (!emailSettings || !emailSettings.provider) {
        return { success: false, error: 'Email not configured' };
    }

    try {
        const token = await getAccessToken(emailSettings.provider);
        if (!token) {
            return { success: false, error: 'Not authorized' };
        }

        if (emailSettings.provider === 'gmail') {
            const response = await fetch(`${GMAIL_API_BASE}/users/me/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return { success: response.ok };
        } else if (emailSettings.provider === 'outlook') {
            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return { success: response.ok };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Test sheets connection
async function testSheetsConnection() {
    const { sheets: sheetsSettings } = await chrome.storage.sync.get('sheets');
    
    if (!sheetsSettings || !sheetsSettings.spreadsheetId) {
        return { success: false, error: 'Sheets not configured' };
    }

    try {
        const token = await getAccessToken('sheets');
        if (!token) {
            return { success: false, error: 'Not authorized' };
        }

        const response = await fetch(
            `${SHEETS_API_BASE}/${sheetsSettings.spreadsheetId}?fields=spreadsheetId`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return { success: response.ok };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Authorize services
async function authorizeEmail() {
    const { email: emailSettings } = await chrome.storage.sync.get('email');
    
    if (!emailSettings) {
        return { success: false, error: 'Email settings not found' };
    }

    try {
        const token = await chrome.identity.getAuthToken({ interactive: true, scopes: getEmailScopes(emailSettings.provider) });
        
        // Store token
        await chrome.storage.sync.set({ 
            emailToken: token,
            emailAuthorized: true 
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function authorizeSheets() {
    try {
        const token = await chrome.identity.getAuthToken({ 
            interactive: true, 
            scopes: ['https://www.googleapis.com/auth/spreadsheets'] 
        });
        
        await chrome.storage.sync.set({ 
            sheetsToken: token,
            sheetsAuthorized: true 
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Create new Google Sheet
async function createNewSheet() {
    const token = await getAccessToken('sheets');
    if (!token) {
        throw new Error('Not authorized for Google Sheets');
    }

    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            properties: {
                title: 'Email Sync ' + new Date().toLocaleDateString()
            }
        })
    });

    if (!response.ok) {
        throw new Error('Failed to create sheet');
    }

    const data = await response.json();
    return { success: true, spreadsheetId: data.spreadsheetId };
}

// Get access token
async function getAccessToken(provider) {
    const storageKey = provider === 'gmail' || provider === 'outlook' ? 'emailToken' : provider === 'sheets' ? 'sheetsToken' : null;
    
    if (!storageKey) return null;

    const stored = await chrome.storage.sync.get(storageKey);
    if (stored[storageKey]) {
        return stored[storageKey];
    }

    // Try to get new token
    try {
        const scopes = provider === 'gmail' 
            ? ['https://www.googleapis.com/auth/gmail.readonly']
            : provider === 'outlook'
            ? ['https://graph.microsoft.com/Mail.Read']
            : provider === 'sheets'
            ? ['https://www.googleapis.com/auth/spreadsheets']
            : [];

        const token = await chrome.identity.getAuthToken({ interactive: false, scopes });
        return token;
    } catch (error) {
        console.warn(`Failed to get ${provider} token:`, error);
        return null;
    }
}

// Get email scopes
function getEmailScopes(provider) {
    if (provider === 'gmail') {
        return ['https://www.googleapis.com/auth/gmail.readonly'];
    } else if (provider === 'outlook') {
        return ['https://graph.microsoft.com/Mail.Read'];
    }
    return [];
}

// Get columns from mapping
function getColumnsFromMapping(mapping) {
    return Object.keys(mapping).sort((a, b) => {
        return mapping[a].charCodeAt(0) - mapping[b].charCodeAt(0);
    });
}

// Get default column mapping
function getDefaultColumnMapping() {
    return {
        from: 'A',
        to: 'B',
        subject: 'C',
        date: 'D',
        body: 'E',
        attachments: 'F'
    };
}

// Capitalize field name
function capitalizeField(field) {
    return field.charAt(0).toUpperCase() + field.slice(1);
}

// Log activity
async function logActivity(message, type) {
    const { activityLog = [] } = await chrome.storage.local.get('activityLog');
    
    activityLog.unshift({
        message,
        type,
        timestamp: new Date().getTime()
    });

    // Keep only last 50 entries
    const trimmed = activityLog.slice(0, 50);
    
    await chrome.storage.local.set({ activityLog: trimmed });
}

// Handle settings updates
function onSettingsUpdated(settings) {
    // Update sync interval alarm
    if (settings.general?.autoSync) {
        chrome.alarms.create('autoSync', { periodInMinutes: settings.general.syncInterval || 15 });
    } else {
        chrome.alarms.clear('autoSync');
    }
}

// Alarm listener for auto-sync
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'autoSync') {
        syncEmails().then(result => {
            if (result.success) {
                const { enableNotifications } = chrome.storage.sync.get('general');
                chrome.storage.sync.get('general', (result) => {
                    if (result.general?.enableNotifications) {
                        chrome.notifications.create({
                            type: 'basic',
                            iconUrl: 'images/icon-128.png',
                            title: 'Email Sync Complete',
                            message: `Synced ${result.emailsProcessed || 0} emails`
                        });
                    }
                });
            }
        });
    }
});

// Install/update listener - set up initial alarms
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(['general'], (result) => {
        if (result.general?.autoSync) {
            chrome.alarms.create('autoSync', { periodInMinutes: result.general.syncInterval || 15 });
        }
    });
});
