// Google Sheets Service - Handles Google Sheets API operations

class SheetsService {
    constructor(spreadsheetId = null) {
        this.spreadsheetId = spreadsheetId;
        this.token = null;
        this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
    }

    /**
     * Initialize service with token and spreadsheet ID
     */
    async initialize(token, spreadsheetId) {
        this.token = token;
        this.spreadsheetId = spreadsheetId;

        if (!token) {
            throw new Error('No authentication token provided');
        }

        if (!spreadsheetId) {
            throw new Error('No spreadsheet ID provided');
        }

        // Verify access
        const hasAccess = await this.testConnection();
        if (!hasAccess) {
            throw new Error('No access to spreadsheet');
        }
    }

    /**
     * Append rows to sheet
     */
    async appendRows(sheetName, rows, options = {}) {
        if (!this.spreadsheetId) {
            throw new Error('Spreadsheet ID not set');
        }

        const includeHeaders = options.includeHeaders !== false;
        const valueInputOption = options.valueInputOption || 'USER_ENTERED';

        try {
            // Get current sheet structure to determine if headers exist
            const existingData = await this.getSheetData(sheetName, 'A1:Z1');

            // If headers don't exist and we should include them, add them
            let rowsToAdd = rows;
            if (includeHeaders && (!existingData || existingData.length === 0)) {
                const headerRow = this.generateHeaders(rows[0]);
                rowsToAdd = [headerRow, ...rows];
            }

            // Get the last row with data
            const lastRow = await this.getLastRow(sheetName);
            const startRow = lastRow + 1;

            const range = `${sheetName}!A${startRow}`;
            const url = `${this.baseUrl}/${this.spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=${valueInputOption}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: rowsToAdd
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Sheets API error: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                updatedRows: data.updates?.updatedRows || 0,
                updatedColumns: data.updates?.updatedColumns || 0
            };
        } catch (error) {
            throw new Error(`Failed to append rows: ${error.message}`);
        }
    }

    /**
     * Format rows with column mapping
     */
    formatRowsWithMapping(emails, columnMapping) {
        const columns = Object.keys(columnMapping).sort((a, b) => {
            return columnMapping[a].charCodeAt(0) - columnMapping[b].charCodeAt(0);
        });

        return emails.map(email => {
            const row = new Array(columns.length);
            
            columns.forEach((field, idx) => {
                row[idx] = email[field] || '';
            });

            return row;
        });
    }

    /**
     * Get sheet data
     */
    async getSheetData(sheetName, range) {
        if (!this.spreadsheetId) {
            throw new Error('Spreadsheet ID not set');
        }

        const fullRange = `${sheetName}!${range}`;
        const url = `${this.baseUrl}/${this.spreadsheetId}/values/${encodeURIComponent(fullRange)}`;

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${this.token}` }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null; // Sheet doesn't exist
            }
            throw new Error(`Sheets API error: ${response.status}`);
        }

        const data = await response.json();
        return data.values || [];
    }

    /**
     * Get the last row with data in a sheet
     */
    async getLastRow(sheetName) {
        try {
            // Get spreadsheet metadata to find sheet properties
            const url = `${this.baseUrl}/${this.spreadsheetId}`;
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${this.token}` }
            });

            if (!response.ok) return 0;

            const spreadsheet = await response.json();
            const sheet = spreadsheet.sheets.find(s => s.properties.title === sheetName);

            if (!sheet) return 0;

            // Get all values in the sheet to find last row
            const valuesUrl = `${this.baseUrl}/${this.spreadsheetId}/values/${encodeURIComponent(sheetName)}`;
            const valuesResponse = await fetch(valuesUrl, {
                headers: { Authorization: `Bearer ${this.token}` }
            });

            if (!valuesResponse.ok) return 0;

            const data = await valuesResponse.json();
            return (data.values || []).length;
        } catch (error) {
            console.warn('Error getting last row:', error);
            return 0;
        }
    }

    /**
     * Create new spreadsheet
     */
    async createSpreadsheet(title = 'Email Sync') {
        const url = 'https://sheets.googleapis.com/v3/spreadsheets';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                properties: {
                    title: title || 'Email Sync ' + new Date().toLocaleDateString()
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create spreadsheet');
        }

        const data = await response.json();
        return data.spreadsheetId;
    }

    /**
     * Create new sheet tab
     */
    async createSheet(sheetTitle) {
        if (!this.spreadsheetId) {
            throw new Error('Spreadsheet ID not set');
        }

        const url = `${this.baseUrl}/${this.spreadsheetId}:batchUpdate`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: sheetTitle
                            }
                        }
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create sheet');
        }

        const data = await response.json();
        return data.replies[0].addSheet.properties.sheetId;
    }

    /**
     * Delete sheet tab
     */
    async deleteSheet(sheetId) {
        if (!this.spreadsheetId) {
            throw new Error('Spreadsheet ID not set');
        }

        const url = `${this.baseUrl}/${this.spreadsheetId}:batchUpdate`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requests: [
                    {
                        deleteSheet: {
                            sheetId: sheetId
                        }
                    }
                ]
            })
        });

        return response.ok;
    }

    /**
     * Update cells with formatting
     */
    async updateCellsWithFormat(sheetName, rows, options = {}) {
        if (!this.spreadsheetId) {
            throw new Error('Spreadsheet ID not set');
        }

        const url = `${this.baseUrl}/${this.spreadsheetId}:batchUpdate`;

        // Build format requests
        const requests = [];

        // Apply header formatting if needed
        if (options.formatHeaders) {
            requests.push({
                repeatCell: {
                    range: {
                        sheetId: await this.getSheetId(sheetName),
                        startRowIndex: 0,
                        endRowIndex: 1
                    },
                    cell: {
                        userEnteredFormat: {
                            backgroundColor: {
                                red: 0.2,
                                green: 0.2,
                                blue: 0.2
                            },
                            textFormat: {
                                foregroundColor: {
                                    red: 1,
                                    green: 1,
                                    blue: 1
                                },
                                bold: true
                            }
                        }
                    },
                    fields: 'userEnteredFormat(backgroundColor,textFormat)'
                }
            });
        }

        // Apply auto-resize
        if (options.autoResize) {
            const sheetId = await this.getSheetId(sheetName);
            requests.push({
                autoResizeDimensions: {
                    dimensions: {
                        sheetId: sheetId,
                        dimension: 'COLUMNS',
                        startIndex: 0,
                        endIndex: rows[0]?.length || 10
                    }
                }
            });
        }

        if (requests.length === 0) {
            return { success: true };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requests })
        });

        return { success: response.ok };
    }

    /**
     * Get sheet ID by name
     */
    async getSheetId(sheetName) {
        const url = `${this.baseUrl}/${this.spreadsheetId}`;
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${this.token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to get sheet metadata');
        }

        const spreadsheet = await response.json();
        const sheet = spreadsheet.sheets.find(s => s.properties.title === sheetName);

        if (!sheet) {
            throw new Error(`Sheet "${sheetName}" not found`);
        }

        return sheet.properties.sheetId;
    }

    /**
     * Clear sheet
     */
    async clearSheet(sheetName) {
        if (!this.spreadsheetId) {
            throw new Error('Spreadsheet ID not set');
        }

        const url = `${this.baseUrl}/${this.spreadsheetId}/values/${encodeURIComponent(sheetName)}:clear`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        });

        return response.ok;
    }

    /**
     * Get sheet metadata
     */
    async getSheetMetadata() {
        if (!this.spreadsheetId) {
            throw new Error('Spreadsheet ID not set');
        }

        const url = `${this.baseUrl}/${this.spreadsheetId}`;

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${this.token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to get sheet metadata');
        }

        return await response.json();
    }

    /**
     * Generate headers from email object
     */
    generateHeaders(emailObject) {
        if (!emailObject) {
            return ['From', 'To', 'Subject', 'Date', 'Body', 'Attachments'];
        }

        return Object.keys(emailObject).map(key => {
            return key.charAt(0).toUpperCase() + key.slice(1);
        });
    }

    /**
     * Test connection
     */
    async testConnection() {
        try {
            if (!this.spreadsheetId) {
                return false;
            }

            const url = `${this.baseUrl}/${this.spreadsheetId}?fields=spreadsheetId`;
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${this.token}` }
            });

            return response.ok;
        } catch (error) {
            console.error('Sheets connection test failed:', error);
            return false;
        }
    }

    /**
     * Grant permission to user
     */
    async shareSpreadsheet(userEmail, role = 'writer') {
        if (!this.spreadsheetId) {
            throw new Error('Spreadsheet ID not set');
        }

        const url = `https://www.googleapis.com/drive/v3/files/${this.spreadsheetId}/permissions`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'user',
                role: role,
                emailAddress: userEmail
            })
        });

        return response.ok;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SheetsService;
}
