/**
 * Gerenciador de Temas - Clean Architecture
 * 
 * Responsabilidades:
 * - Alternar entre tema claro e escuro
 * - Persistir preferência do usuário
 * - Aplicar tema padrão (escuro)
 * - Sincronizar interface do switch
 * 
 * Como usar:
 * const themeManager = new ThemeManager();
 * themeManager.toggle(); // Alterna o tema
 * themeManager.setTheme('dark'); // Define tema específico
 * 
 * @author Sistema de Entretenimento DF
 * @version 2.0.0
 */

class ThemeManager {
    constructor() {
        this.STORAGE_KEY = 'sig-df-theme';
        this.THEME_DARK = 'dark';
        this.THEME_LIGHT = 'light';
        this.DEFAULT_THEME = this.THEME_DARK; // Tema escuro como padrão
        
        this.currentTheme = null;
        this.toggleButton = null;
        
        this.init();
    }

    /**
     * Inicializa o gerenciador de temas
     */
    init() {
        console.log('🎨 Inicializando ThemeManager...');
        this.loadTheme();
        this.setupToggleButton();
        this.applyTheme();
        console.log(`✅ Tema aplicado: ${this.currentTheme}`);
    }

    /**
     * Carrega o tema salvo ou aplica o padrão
     */
    loadTheme() {
        try {
            const savedTheme = localStorage.getItem(this.STORAGE_KEY);
            this.currentTheme = savedTheme || this.DEFAULT_THEME;
        } catch (error) {
            console.warn('⚠️ Erro ao carregar tema do localStorage:', error);
            this.currentTheme = this.DEFAULT_THEME;
        }
    }

    /**
     * Configura o botão de alternância de tema
     */
    setupToggleButton() {
        // Aguarda o DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.findAndSetupButton());
        } else {
            this.findAndSetupButton();
        }
    }

    /**
     * Encontra e configura o botão de tema
     */
    findAndSetupButton() {
        this.toggleButton = document.getElementById('theme-toggle');
        
        if (!this.toggleButton) {
            console.warn('⚠️ Botão de tema não encontrado. Criando botão...');
            this.createToggleButton();
            return;
        }

        // Configura o estado inicial do botão
        this.updateButtonState();
        
        // Adiciona event listener
        this.toggleButton.addEventListener('change', () => {
            this.toggle();
        });
    }

    /**
     * Cria o botão de alternância se não existir
     */
    createToggleButton() {
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) return;

        const themeSwitch = document.createElement('div');
        themeSwitch.className = 'theme-switch';
        themeSwitch.innerHTML = `
            <input type="checkbox" id="theme-toggle" class="theme-toggle-checkbox">
            <label for="theme-toggle" class="theme-toggle-label">
                <span class="theme-toggle-inner">
                    <i class="fas fa-moon"></i>
                    <i class="fas fa-sun"></i>
                </span>
                <span class="theme-toggle-switch"></span>
            </label>
        `;

        headerActions.insertBefore(themeSwitch, headerActions.firstChild);
        this.setupToggleButton(); // Reconfigura após criar
    }

    /**
     * Atualiza o estado visual do botão
     */
    updateButtonState() {
        if (!this.toggleButton) return;
        
        // Checkbox marcado = tema claro, desmarcado = tema escuro
        this.toggleButton.checked = this.currentTheme === this.THEME_LIGHT;
        
        // Atualizar ícones baseado no tema atual
        this.updateThemeIcons();
    }

    /**
     * Atualiza os ícones do switch baseado no tema atual
     */
    updateThemeIcons() {
        const themeToggleInner = document.querySelector('.theme-toggle-inner');
        if (!themeToggleInner) return;
        
        if (this.currentTheme === this.THEME_LIGHT) {
            // Tema claro: mostrar sol em destaque (segunda posição) e lua diminuída (primeira posição)
            themeToggleInner.innerHTML = `
                <i class="fas fa-moon" style="opacity: 0.4; font-size: 12px; color: #fff; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);"></i>
                <i class="fas fa-sun" style="opacity: 1; font-size: 14px; color: #ffd700; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);"></i>
            `;
        } else {
            // Tema escuro: mostrar lua em destaque (primeira posição) e sol diminuído (segunda posição)
            themeToggleInner.innerHTML = `
                <i class="fas fa-moon" style="opacity: 1; font-size: 14px; color: #e2e8f0; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);"></i>
                <i class="fas fa-sun" style="opacity: 0.4; font-size: 12px; color: #ffd700; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);"></i>
            `;
        }
    }

    /**
     * Aplica o tema atual ao documento
     */
    applyTheme() {
        const body = document.body;
        
        // Remove classes de tema existentes
        body.classList.remove('theme-light', 'theme-dark');
        
        // Aplica a classe do tema atual
        if (this.currentTheme === this.THEME_LIGHT) {
            body.classList.add('theme-light');
        }
        // Tema escuro é o padrão (sem classe adicional necessária)
        
        // Atualiza atributo para CSS
        body.setAttribute('data-theme', this.currentTheme);
        
        // Atualiza os ícones do switch
        this.updateThemeIcons();
        
        // Aplica tema ao mapa se existir
        this.applyMapTheme();
    }

    /**
     * Aplica tema específico ao mapa Leaflet
     */
    applyMapTheme() {
        // Alterar tema do mapa se o MapManager estiver disponível
        if (window.mapManager && typeof window.mapManager.alternarTemaMapa === 'function') {
            const temaEscuro = this.currentTheme === this.THEME_DARK;
            window.mapManager.alternarTemaMapa(temaEscuro);
        }
        
        const mapContainer = document.querySelector('.leaflet-container');
        if (!mapContainer) return;

        if (this.currentTheme === this.THEME_DARK) {
            mapContainer.style.filter = 'brightness(0.7) contrast(1.2)';
        } else {
            mapContainer.style.filter = 'none';
        }
    }

    /**
     * Alterna entre os temas
     */
    toggle() {
        const newTheme = this.currentTheme === this.THEME_DARK ? 
                        this.THEME_LIGHT : 
                        this.THEME_DARK;
        
        this.setTheme(newTheme);
    }

    /**
     * Define um tema específico
     * @param {string} theme - 'dark' ou 'light'
     */
    setTheme(theme) {
        if (theme !== this.THEME_DARK && theme !== this.THEME_LIGHT) {
            console.error('❌ Tema inválido:', theme);
            return;
        }

        this.currentTheme = theme;
        this.saveTheme();
        this.applyTheme();
        this.updateButtonState();
        
        console.log(`🎨 Tema alterado para: ${theme}`);
        
        // Dispatch evento customizado para outros componentes
        this.dispatchThemeChange();
    }

    /**
     * Salva o tema no localStorage
     */
    saveTheme() {
        try {
            localStorage.setItem(this.STORAGE_KEY, this.currentTheme);
        } catch (error) {
            console.warn('⚠️ Erro ao salvar tema:', error);
        }
    }

    /**
     * Dispatcha evento de mudança de tema
     */
    dispatchThemeChange() {
        const event = new CustomEvent('themeChanged', {
            detail: { theme: this.currentTheme }
        });
        document.dispatchEvent(event);
    }

    /**
     * Obtém o tema atual
     * @returns {string} Tema atual
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Verifica se está no tema escuro
     * @returns {boolean}
     */
    isDarkTheme() {
        return this.currentTheme === this.THEME_DARK;
    }

    /**
     * Verifica se está no tema claro
     * @returns {boolean}
     */
    isLightTheme() {
        return this.currentTheme === this.THEME_LIGHT;
    }

    /**
     * Reseta para o tema padrão
     */
    resetToDefault() {
        this.setTheme(this.DEFAULT_THEME);
    }
}
