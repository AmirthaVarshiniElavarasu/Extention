// Email Service - Handles email provider integrations

class EmailService {
    constructor(provider = 'gmail') {
        this.provider = provider;
        this.token = null;
    }

    /**
     * Initialize service with token
     */
    async initialize(token) {
        this.token = token;
        if (!token) {
            throw new Error('No authentication token provided');
        }
    }

    /**
     * Get emails based on provider
     */
    async getEmails(options = {}) {
        const maxResults = options.maxResults || 100;
        const filter = options.filter || '';

        if (this.provider === 'gmail') {
            return this.getGmailEmails(maxResults, filter);
        } else if (this.provider === 'outlook') {
            return this.getOutlookEmails(maxResults, filter);
        } else if (this.provider === 'imap') {
            return this.getImapEmails(maxResults, filter);
        } else {
            throw new Error(`Unsupported email provider: ${this.provider}`);
        }
    }

    /**
     * Get unread Gmail emails
     */
    async getGmailEmails(maxResults, filter) {
        const query = `is:unread ${filter}`;
        const url = `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`;

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${this.token}` }
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Gmail API error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        const messageIds = (data.messages || []).map(m => m.id);

        // Fetch full message details
        return Promise.all(messageIds.map(id => this.getGmailMessage(id)));
    }

    /**
     * Get single Gmail message with full details
     */
    async getGmailMessage(messageId) {
        const url = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${this.token}` }
        });

        if (!response.ok) {
            console.warn(`Failed to fetch Gmail message ${messageId}`);
            return null;
        }

        const message = await response.json();
        return this.parseGmailMessage(message);
    }

    /**
     * Parse Gmail message into standardized format
     */
    parseGmailMessage(message) {
        const headers = message.payload?.headers || [];
        const getHeader = (name) => headers.find(h => h.name === name)?.value || '';

        return {
            id: message.id,
            from: getHeader('From'),
            to: getHeader('To'),
            cc: getHeader('Cc'),
            bcc: getHeader('Bcc'),
            subject: getHeader('Subject'),
            date: getHeader('Date'),
            body: this.extractGmailBody(message.payload),
            attachments: (message.payload?.parts || []).filter(p => p.filename).length,
            labels: message.labelIds || [],
            internalDate: message.internalDate,
            source: 'gmail'
        };
    }

    /**
     * Extract email body from Gmail payload
     */
    extractGmailBody(payload) {
        if (!payload) return '';

        // Try text/plain first
        if (payload.mimeType === 'text/plain' && payload.body?.data) {
            return this.decodeBase64(payload.body.data);
        }

        // Try multipart
        if (payload.parts) {
            const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
            if (textPart?.body?.data) {
                return this.decodeBase64(textPart.body.data);
            }

            // Fall back to HTML
            const htmlPart = payload.parts.find(p => p.mimeType === 'text/html');
            if (htmlPart?.body?.data) {
                return this.decodeBase64(htmlPart.body.data);
            }
        }

        return '';
    }

    /**
     * Get Outlook emails
     */
    async getOutlookEmails(maxResults, filter) {
        const filters = filter.trim() 
            ? `&$filter=isRead eq false and (from/emailAddress/address eq '${filter}' or subject contains '${filter}')`
            : '&$filter=isRead eq false';

        const url = `https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$top=${maxResults}${filters}&$orderby=receivedDateTime desc`;

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${this.token}` }
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Outlook API error: ${response.status}`);
        }

        const data = await response.json();
        return (data.value || []).map(msg => this.parseOutlookMessage(msg));
    }

    /**
     * Parse Outlook message
     */
    parseOutlookMessage(msg) {
        return {
            id: msg.id,
            from: msg.from?.emailAddress?.address || '',
            to: (msg.toRecipients || []).map(r => r.emailAddress?.address).filter(Boolean).join(', '),
            cc: (msg.ccRecipients || []).map(r => r.emailAddress?.address).filter(Boolean).join(', '),
            bcc: (msg.bccRecipients || []).map(r => r.emailAddress?.address).filter(Boolean).join(', '),
            subject: msg.subject || '',
            date: msg.receivedDateTime,
            body: msg.bodyPreview || msg.body?.content || '',
            attachments: msg.hasAttachments ? 1 : 0,
            labels: [],
            source: 'outlook'
        };
    }

    /**
     * Get IMAP emails (requires backend service)
     */
    async getImapEmails(maxResults, filter) {
        // IMAP connections from browser extensions are not possible
        // This would require a backend service
        throw new Error('IMAP access requires a backend server. See documentation for setup instructions.');
    }

    /**
     * Mark email as read
     */
    async markAsRead(messageId) {
        if (this.provider === 'gmail') {
            return this.markGmailAsRead(messageId);
        } else if (this.provider === 'outlook') {
            return this.markOutlookAsRead(messageId);
        }
    }

    /**
     * Mark Gmail as read
     */
    async markGmailAsRead(messageId) {
        const url = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ removeLabelIds: ['UNREAD'] })
        });

        return response.ok;
    }

    /**
     * Mark Outlook as read
     */
    async markOutlookAsRead(messageId) {
        const url = `https://graph.microsoft.com/v1.0/me/messages/${messageId}`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isRead: true })
        });

        return response.ok;
    }

    /**
     * Get email attachments
     */
    async getAttachments(messageId) {
        if (this.provider === 'gmail') {
            return this.getGmailAttachments(messageId);
        } else if (this.provider === 'outlook') {
            return this.getOutlookAttachments(messageId);
        }
        return [];
    }

    /**
     * Get Gmail attachments
     */
    async getGmailAttachments(messageId) {
        const url = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${this.token}` }
        });

        if (!response.ok) return [];

        const message = await response.json();
        const parts = message.payload?.parts || [];

        return parts
            .filter(p => p.filename)
            .map(p => ({
                id: p.body?.attachmentId,
                filename: p.filename,
                mimeType: p.mimeType,
                size: p.body?.size || 0
            }));
    }

    /**
     * Get Outlook attachments
     */
    async getOutlookAttachments(messageId) {
        const url = `https://graph.microsoft.com/v1.0/me/messages/${messageId}/attachments`;

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${this.token}` }
        });

        if (!response.ok) return [];

        const data = await response.json();
        return (data.value || []).map(att => ({
            id: att.id,
            filename: att.name,
            mimeType: att.contentType,
            size: 0
        }));
    }

    /**
     * Test connection
     */
    async testConnection() {
        try {
            if (this.provider === 'gmail') {
                const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
                    headers: { Authorization: `Bearer ${this.token}` }
                });
                return response.ok;
            } else if (this.provider === 'outlook') {
                const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                    headers: { Authorization: `Bearer ${this.token}` }
                });
                return response.ok;
            }
            return false;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }

    /**
     * Decode base64 string
     */
    decodeBase64(str) {
        try {
            const binary = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
            return decodeURIComponent(
                binary.split('').map((c) => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join('')
            );
        } catch (e) {
            console.warn('Base64 decode error:', e);
            return '';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailService;
}
