// Options page script

class SettingsManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadSettings();
        this.setupTabNavigation();
    }

    initializeElements() {
        // General
        this.syncInterval = document.getElementById('syncInterval');
        this.maxEmails = document.getElementById('maxEmails');
        this.autoSync = document.getElementById('autoSync');
        this.enableNotifications = document.getElementById('enableNotifications');

        // Email
        this.emailProvider = document.getElementById('emailProvider');
        this.imapSettings = document.getElementById('imapSettings');
        this.imapHost = document.getElementById('imapHost');
        this.imapPort = document.getElementById('imapPort');
        this.imapEmail = document.getElementById('imapEmail');
        this.imapPassword = document.getElementById('imapPassword');

        // Sheets
        this.spreadsheetId = document.getElementById('spreadsheetId');
        this.sheetName = document.getElementById('sheetName');
        this.appendMode = document.getElementById('appendMode');
        this.includeHeaders = document.getElementById('includeHeaders');

        // Filters
        this.filterType = document.getElementById('filterType');
        this.filterValue = document.getElementById('filterValue');
        this.filterName = document.getElementById('filterName');
        this.filtersList = document.getElementById('filtersList');

        // Columns
        this.columnMapping = document.getElementById('columnMapping');

        // Status
        this.saveStatus = document.getElementById('saveStatus');
    }

    attachEventListeners() {
        this.emailProvider.addEventListener('change', () => this.toggleImapSettings());
        
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
    }

    setupTabNavigation() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                
                // Remove active class from all
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Add active class
                e.target.classList.add('active');
                document.getElementById(tabName).classList.add('active');
            });
        });
    }

    switchTab(tabName) {
        // Implementation handled by setupTabNavigation
    }

    toggleImapSettings() {
        const isImap = this.emailProvider.value === 'imap';
        this.imapSettings.classList.toggle('hidden', !isImap);
    }

    async saveSettings() {
        const settings = {
            general: {
                syncInterval: parseInt(this.syncInterval.value),
                maxEmails: parseInt(this.maxEmails.value),
                autoSync: this.autoSync.checked,
                enableNotifications: this.enableNotifications.checked
            },
            email: {
                provider: this.emailProvider.value,
                imap: {
                    host: this.imapHost.value,
                    port: parseInt(this.imapPort.value),
                    email: this.imapEmail.value
                }
            },
            sheets: {
                spreadsheetId: this.spreadsheetId.value,
                sheetName: this.sheetName.value,
                appendMode: this.appendMode.checked,
                includeHeaders: this.includeHeaders.checked
            }
        };

        try {
            await chrome.storage.sync.set(settings);
            this.showStatus('Settings saved successfully!', 'success');

            // Also send message to background
            chrome.runtime.sendMessage({ 
                action: 'settingsUpdated', 
                settings 
            });
        } catch (error) {
            console.error('Save error:', error);
            this.showStatus('Error saving settings', 'error');
        }
    }

    async loadSettings() {
        const data = await chrome.storage.sync.get(null);

        // Load general
        if (data.general) {
            this.syncInterval.value = data.general.syncInterval || 15;
            this.maxEmails.value = data.general.maxEmails || 100;
            this.autoSync.checked = data.general.autoSync || false;
            this.enableNotifications.checked = data.general.enableNotifications !== false;
        }

        // Load email
        if (data.email) {
            this.emailProvider.value = data.email.provider || 'gmail';
            if (data.email.imap) {
                this.imapHost.value = data.email.imap.host || '';
                this.imapPort.value = data.email.imap.port || 993;
                this.imapEmail.value = data.email.imap.email || '';
            }
            this.toggleImapSettings();
        }

        // Load sheets
        if (data.sheets) {
            this.spreadsheetId.value = data.sheets.spreadsheetId || '';
            this.sheetName.value = data.sheets.sheetName || 'Emails';
            this.appendMode.checked = data.sheets.appendMode !== false;
            this.includeHeaders.checked = data.sheets.includeHeaders !== false;
        }

        // Load filters
        if (data.filters) {
            this.displayFilters(data.filters);
        }

        // Load column mapping
        if (data.columnMapping) {
            this.displayColumnMapping(data.columnMapping);
        } else {
            this.displayColumnMapping(this.getDefaultColumnMapping());
        }
    }

    displayFilters(filters) {
        if (!filters || filters.length === 0) {
            this.filtersList.innerHTML = '<p style="padding: 16px; text-align: center; color: #5f6368;">No filters added yet</p>';
            return;
        }

        this.filtersList.innerHTML = filters.map((filter, index) => `
            <div class="filter-item">
                <div class="filter-item-content">
                    <div class="filter-item-name">${filter.name || filter.type}</div>
                    <div class="filter-item-details">${filter.type}: ${filter.value}</div>
                </div>
                <button class="filter-item-remove" onclick="removeFilter(${index})">🗑️</button>
            </div>
        `).join('');
    }

    displayColumnMapping(mapping) {
        const fields = Object.keys(mapping);
        
        this.columnMapping.innerHTML = fields.map(field => `
            <div class="column-item">
                <label>${this.capitalizeField(field)}</label>
                <select onchange="updateColumnMapping('${field}', this.value)">
                    <option value="A" ${mapping[field] === 'A' ? 'selected' : ''}>Column A</option>
                    <option value="B" ${mapping[field] === 'B' ? 'selected' : ''}>Column B</option>
                    <option value="C" ${mapping[field] === 'C' ? 'selected' : ''}>Column C</option>
                    <option value="D" ${mapping[field] === 'D' ? 'selected' : ''}>Column D</option>
                    <option value="E" ${mapping[field] === 'E' ? 'selected' : ''}>Column E</option>
                    <option value="F" ${mapping[field] === 'F' ? 'selected' : ''}>Column F</option>
                    <option value="G" ${mapping[field] === 'G' ? 'selected' : ''}>Column G</option>
                </select>
            </div>
        `).join('');
    }

    getDefaultColumnMapping() {
        return {
            from: 'A',
            to: 'B',
            subject: 'C',
            date: 'D',
            body: 'E',
            attachments: 'F'
        };
    }

    capitalizeField(field) {
        return field.charAt(0).toUpperCase() + field.slice(1);
    }

    showStatus(message, type) {
        this.saveStatus.textContent = message;
        this.saveStatus.className = `save-status ${type}`;
        
        setTimeout(() => {
            this.saveStatus.classList.add('hidden');
        }, 3000);
    }
}

// Global functions for onclick handlers
let manager = null;

function addFilter() {
    const type = document.getElementById('filterType').value;
    const value = document.getElementById('filterValue').value;
    const name = document.getElementById('filterName').value;

    if (!value) {
        alert('Please enter a filter value');
        return;
    }

    chrome.storage.sync.get(['filters'], (result) => {
        const filters = result.filters || [];
        filters.push({
            name: name || type,
            type,
            value,
            enabled: true
        });

        chrome.storage.sync.set({ filters });
        
        // Clear inputs
        document.getElementById('filterValue').value = '';
        document.getElementById('filterName').value = '';
        document.getElementById('filterType').selectedIndex = 0;

        manager.displayFilters(filters);
    });
}

function removeFilter(index) {
    chrome.storage.sync.get(['filters'], (result) => {
        const filters = result.filters || [];
        filters.splice(index, 1);
        chrome.storage.sync.set({ filters });
        manager.displayFilters(filters);
    });
}

function updateColumnMapping(field, column) {
    chrome.storage.sync.get(['columnMapping'], (result) => {
        const mapping = result.columnMapping || manager.getDefaultColumnMapping();
        mapping[field] = column;
        chrome.storage.sync.set({ columnMapping: mapping });
    });
}

function resetColumnMapping() {
    if (confirm('Reset column mapping to defaults?')) {
        chrome.storage.sync.set({ columnMapping: manager.getDefaultColumnMapping() });
        manager.displayColumnMapping(manager.getDefaultColumnMapping());
    }
}

function saveSettings() {
    manager.saveSettings();
}

function resetSettings() {
    if (confirm('Reset all settings to defaults?')) {
        chrome.storage.sync.clear(() => {
            location.reload();
        });
    }
}

async function testConnections() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'testConnection' });
        const emailOk = response.email?.connected;
        const sheetsOk = response.sheets?.connected;
        
        if (emailOk && sheetsOk) {
            manager.showStatus('✓ All connections successful!', 'success');
        } else {
            const missing = [];
            if (!emailOk) missing.push('Email');
            if (!sheetsOk) missing.push('Sheets');
            manager.showStatus(`✗ Connection failed: ${missing.join(', ')}`, 'error');
        }
    } catch (error) {
        manager.showStatus('Error testing connections', 'error');
    }
}

async function authorizeEmail() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'authorizeEmail' });
        if (response.success) {
            manager.showStatus('✓ Email authorized!', 'success');
        } else {
            manager.showStatus('✗ Email authorization failed', 'error');
        }
    } catch (error) {
        manager.showStatus('Error authorizing email', 'error');
    }
}

async function authorizeSheets() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'authorizeSheets' });
        if (response.success) {
            manager.showStatus('✓ Google Sheets authorized!', 'success');
        } else {
            manager.showStatus('✗ Sheets authorization failed', 'error');
        }
    } catch (error) {
        manager.showStatus('Error authorizing Sheets', 'error');
    }
}

async function testEmailConnection() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'testEmailConnection' });
        if (response.success) {
            manager.showStatus('✓ Email connection successful!', 'success');
        } else {
            manager.showStatus('✗ Email connection failed: ' + response.error, 'error');
        }
    } catch (error) {
        manager.showStatus('Error testing email connection', 'error');
    }
}

async function testSheetsConnection() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'testSheetsConnection' });
        if (response.success) {
            manager.showStatus('✓ Sheets connection successful!', 'success');
        } else {
            manager.showStatus('✗ Sheets connection failed: ' + response.error, 'error');
        }
    } catch (error) {
        manager.showStatus('Error testing sheets connection', 'error');
    }
}

async function createNewSheet() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'createNewSheet' });
        if (response.success) {
            document.getElementById('spreadsheetId').value = response.spreadsheetId;
            manager.showStatus('✓ New sheet created: ' + response.spreadsheetId, 'success');
        } else {
            manager.showStatus('✗ Failed to create sheet', 'error');
        }
    } catch (error) {
        manager.showStatus('Error creating new sheet', 'error');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    manager = new SettingsManager();
});
