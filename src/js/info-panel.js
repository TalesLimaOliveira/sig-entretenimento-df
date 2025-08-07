/**
 * Simple InfoPanelManager - Unified approach for all environments
 * Works consistently on both file:// and http:// protocols
 */
class InfoPanelManager {
    constructor() {
        this.panel = null;
        this.init();
    }

    init() {
        console.log('Initializing InfoPanelManager...');
        this.setupElements();
        this.setupEventListeners();
    }

    setupElements() {
        this.panel = document.getElementById('info-panel');
        if (!this.panel) {
            console.error('Info panel element not found');
        }
    }

    setupEventListeners() {
        if (!this.panel) return;

        // Close button
        const closeBtn = document.getElementById('info-panel-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // Tab switching
        const tabs = document.querySelectorAll('.info-panel-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.panel.classList.contains('hidden')) {
                this.hide();
            }
        });
    }

    show(ponto) {
        if (!this.panel || !ponto) return;

        console.log('Showing info panel for:', ponto.nome);

        // Use the map manager's direct rendering method for consistency
        if (window.mapManager && window.mapManager.renderInfoPanelDirect) {
            window.mapManager.renderInfoPanelDirect(ponto);
        } else {
            console.error('MapManager not available for info panel rendering');
        }
    }

    hide() {
        if (!this.panel) return;

        this.panel.classList.remove('visible');
        setTimeout(() => {
            this.panel.classList.add('hidden');
            document.body.classList.remove('body-with-info-panel');
        }, 300);
    }

    switchTab(tabName) {
        // Switch active tab
        const tabs = document.querySelectorAll('.info-panel-tab');
        const contents = document.querySelectorAll('.info-panel-tab-content');

        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        contents.forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });
    }
}

// Simple initialization - works for all environments
if (typeof window !== 'undefined') {
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.infoPanelManager = new InfoPanelManager();
        });
    } else {
        window.infoPanelManager = new InfoPanelManager();
    }
}