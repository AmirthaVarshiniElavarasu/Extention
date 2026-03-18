// Popup script for Email to Google Sheet Chrome Extension

class PopupManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadStatus();
    }

    initializeElements() {
        this.elements = {
            syncNowBtn: document.getElementById('syncNowBtn'),
            testConnectionBtn: document.getElementById('testConnectionBtn'),
            authorizeBtn: document.getElementById('authorizeBtn'),
            openSettingsBtn: document.getElementById('openSettingsBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            emailStatus: document.getElementById('emailStatus'),
            sheetsStatus: document.getElementById('sheetsStatus'),
            lastSyncTime: document.getElementById('lastSyncTime'),
            totalSynced: document.getElementById('totalSynced'),
            activityLog: document.getElementById('activityLog'),
            loadingSpinner: document.getElementById('loadingSpinner'),
            syncStatus: document.getElementById('syncStatus'),
            statusInfo: document.getElementById('statusInfo')
        };
    }

    attachEventListeners() {
        this.elements.syncNowBtn.addEventListener('click', () => this.syncNow());
        this.elements.testConnectionBtn.addEventListener('click', () => this.testConnection());
        this.elements.authorizeBtn.addEventListener('click', () => this.authorize());
        this.elements.openSettingsBtn.addEventListener('click', () => this.openSettings());
        this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
    }

    async syncNow() {
        this.showLoading(true);
        this.elements.syncNowBtn.disabled = true;

        try {
            const response = await chrome.runtime.sendMessage({ action: 'syncNow' });
            
            if (response.success) {
                this.showStatus('Sync completed successfully!', 'success');
                this.addActivityLog(`Synced ${response.emailsCount} emails`, 'success');
                await this.loadStatus();
            } else {
                this.showStatus('Sync failed: ' + response.error, 'error');
                this.addActivityLog('Sync failed: ' + response.error, 'error');
            }
        } catch (error) {
            console.error('Sync error:', error);
            this.showStatus('Error: ' + error.message, 'error');
            this.addActivityLog('Error: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
            this.elements.syncNowBtn.disabled = false;
        }
    }

    async testConnection() {
        this.showLoading(true);
        this.elements.testConnectionBtn.disabled = true;

        try {
            const response = await chrome.runtime.sendMessage({ action: 'testConnection' });
            
            const emailOk = response.email?.connected;
            const sheetsOk = response.sheets?.connected;
            
            const message = `Gmail: ${emailOk ? '✓' : '✗'} | Sheets: ${sheetsOk ? '✓' : '✗'}`;
            
            if (emailOk && sheetsOk) {
                this.showStatus('All connections OK!', 'success');
                this.addActivityLog('Connection test passed', 'success');
            } else {
                this.showStatus(message, 'error');
                this.addActivityLog(message, 'error');
            }
        } catch (error) {
            console.error('Test error:', error);
            this.showStatus('Error: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
            this.elements.testConnectionBtn.disabled = false;
        }
    }

    async authorize() {
        this.showLoading(true);

        try {
            const response = await chrome.runtime.sendMessage({ action: 'authorize' });
            
            if (response.success) {
                this.showStatus('Authorization successful!', 'success');
                this.addActivityLog('Account authorized', 'success');
                await this.loadStatus();
            } else {
                this.showStatus('Authorization failed', 'error');
                this.addActivityLog('Authorization failed', 'error');
            }
        } catch (error) {
            console.error('Auth error:', error);
            this.showStatus('Error: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    openSettings() {
        chrome.runtime.openOptionsPage();
    }

    async loadStatus() {
        try {
            const data = await chrome.storage.local.get([
                'lastSyncTime',
                'totalSynced',
                'activityLog',
                'emailConnected',
                'sheetsConnected'
            ]);

            // Update status
            this.elements.emailStatus.textContent = data.emailConnected ? '✓ Connected' : '✗ Not connected';
            this.elements.sheetsStatus.textContent = data.sheetsConnected ? '✓ Connected' : '✗ Not connected';
            this.elements.lastSyncTime.textContent = data.lastSyncTime ? this.formatTime(new Date(data.lastSyncTime)) : 'Never';
            this.elements.totalSynced.textContent = `${data.totalSynced || 0} emails`;

            // Update activity log
            this.displayActivityLog(data.activityLog || []);
        } catch (error) {
            console.error('Error loading status:', error);
        }
    }

    displayActivityLog(logs) {
        if (logs.length === 0) {
            this.elements.activityLog.innerHTML = '<p class="empty">No recent activity</p>';
            return;
        }

        this.elements.activityLog.innerHTML = logs
            .slice(-5) // Show last 5
            .reverse()
            .map(log => `
                <div class="activity-item ${log.type}">
                    <span>${log.message}</span>
                    <span class="time">${this.formatTime(new Date(log.timestamp))}</span>
                </div>
            `)
            .join('');
    }

    addActivityLog(message, type = 'info') {
        chrome.storage.local.get(['activityLog'], (result) => {
            const logs = result.activityLog || [];
            logs.push({
                message,
                type,
                timestamp: new Date().toISOString()
            });
            chrome.storage.local.set({ activityLog: logs.slice(-20) }); // Keep last 20
        });
    }

    showStatus(message, type) {
        const statusBox = this.elements.syncStatus;
        const textEl = statusBox.querySelector('.status-text');
        
        statusBox.className = `status-box ${type}`;
        textEl.textContent = message;
        statusBox.classList.remove('hidden');

        setTimeout(() => {
            statusBox.classList.add('hidden');
        }, 4000);
    }

    showLoading(show) {
        if (show) {
            this.elements.loadingSpinner.classList.remove('hidden');
        } else {
            this.elements.loadingSpinner.classList.add('hidden');
        }
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return date.toLocaleDateString();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});
