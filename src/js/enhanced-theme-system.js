/**
 * Enhanced Theme System - Sistema de Temas Aprimorado
 * 
 * Sistema robusto de temas com:
 * - Temas claro e escuro aprimorados
 * - Cores mais confortáveis aos olhos
 * - Sistema de troca programática
 * - Cores de estado acessíveis
 * - Fácil manutenção e extensibilidade
 *
 * @author Tales Oliveira (github.com/TalesLimaOliveira)
 * @version 1.0.0
 * @note Este arquivo contém trechos de código gerados com auxílio de Inteligência Artificial.
 */

class EnhancedThemeSystem {
    constructor() {
        this.STORAGE_KEY = 'sig-df-enhanced-theme';
        this.THEMES = {
            DARK: 'dark',
            LIGHT: 'light'
        };
        
        this.currentTheme = null;
        this.themeConfigs = this.initializeThemeConfigs();
        
        this.init();
    }

    /**
     * Configurações dos temas
     */
    initializeThemeConfigs() {
        return {
            [this.THEMES.DARK]: {
                name: 'Tema Escuro',
                
                // Cores de fundo - cinza escuro confortável
                backgrounds: {
                    primary: '#1e1e1e',        // Cinza escuro principal
                    secondary: '#2a2a2a',      // Cinza escuro secundário
                    tertiary: '#333333',       // Cinza escuro terciário
                    card: '#252525',           // Cards e painéis
                    form: '#1f1f1f',          // Formulários
                    hover: '#363636',          // Estados de hover
                    overlay: 'rgba(0, 0, 0, 0.7)'
                },
                
                // Cores de texto
                text: {
                    primary: '#f0f0f0',        // Texto principal
                    secondary: '#b8b8b8',      // Texto secundário
                    muted: '#888888',          // Texto desbotado
                    inverse: '#1e1e1e'        // Texto inverso
                },
                
                // Bordas
                borders: {
                    primary: '#404040',        // Bordas principais
                    secondary: '#4a4a4a',      // Bordas secundárias
                    focus: '#4a90e2'          // Bordas em foco
                },
                
                // Azuis escurecidos e menos saturados
                blues: {
                    primary: '#2d5aa0',        // Azul primário escurecido
                    secondary: '#1e3d5f',      // Azul secundário mais escuro
                    accent: '#4a90e2',         // Azul de destaque menos saturado
                    light: '#3d4b5c',         // Azul claro escurecido
                    dark: '#1a2b3d',          // Azul escuro profundo
                    hover: '#2a4d7c'          // Azul para hover
                },
                
                // Cores de estado acessíveis para tema escuro
                status: {
                    success: '#10b981',        // Verde sucesso
                    warning: '#f59e0b',        // Amarelo alerta
                    error: '#ef4444',          // Vermelho erro
                    info: '#3b82f6',           // Azul informação
                    
                    // Versões menos intensas para fundos
                    successBg: '#065f46',
                    warningBg: '#92400e',
                    errorBg: '#991b1b',
                    infoBg: '#1e40af'
                }
            },
            
            [this.THEMES.LIGHT]: {
                name: 'Tema Claro',
                
                // Cores de fundo - cinza claro confortável
                backgrounds: {
                    primary: '#f5f5f5',        // Cinza claro principal (não branco puro)
                    secondary: '#f0f0f0',      // Cinza claro secundário
                    tertiary: '#e8e8e8',       // Cinza claro terciário
                    card: '#fafafa',           // Cards e painéis
                    form: '#f8f8f8',          // Formulários
                    hover: '#e0e0e0',          // Estados de hover
                    overlay: 'rgba(0, 0, 0, 0.4)'
                },
                
                // Cores de texto
                text: {
                    primary: '#2c2c2c',        // Texto principal (não preto puro)
                    secondary: '#4a4a4a',      // Texto secundário
                    muted: '#6b7280',          // Texto desbotado
                    inverse: '#f5f5f5'        // Texto inverso
                },
                
                // Bordas
                borders: {
                    primary: '#d1d5db',        // Bordas principais
                    secondary: '#e5e7eb',      // Bordas secundárias
                    focus: '#4a90e2'          // Bordas em foco
                },
                
                // Azuis ajustados para tema claro
                blues: {
                    primary: '#1d4ed8',        // Azul primário
                    secondary: '#2563eb',      // Azul secundário
                    accent: '#3b82f6',         // Azul de destaque
                    light: '#dbeafe',          // Azul claro
                    dark: '#1e40af',          // Azul escuro
                    hover: '#1e3a8a'          // Azul para hover
                },
                
                // Cores de estado acessíveis para tema claro
                status: {
                    success: '#059669',        // Verde sucesso mais escuro
                    warning: '#d97706',        // Amarelo alerta mais escuro
                    error: '#dc2626',          // Vermelho erro mais escuro
                    info: '#2563eb',           // Azul informação
                    
                    // Versões claras para fundos
                    successBg: '#d1fae5',
                    warningBg: '#fef3c7',
                    errorBg: '#fee2e2',
                    infoBg: '#dbeafe'
                }
            }
        };
    }

    /**
     * Inicialização do sistema
     */
    init() {
        console.log('Inicializando Enhanced Theme System...');
        this.loadTheme();
        this.applyTheme();
        console.log(`Tema aplicado: ${this.currentTheme}`);
    }

    /**
     * Carrega tema salvo ou aplica padrão
     */
    loadTheme() {
        try {
            const savedTheme = localStorage.getItem(this.STORAGE_KEY);
            
            if (savedTheme && this.themeConfigs[savedTheme]) {
                this.currentTheme = savedTheme;
            } else {
                // Detectar preferência do sistema ou usar escuro como padrão
                this.currentTheme = this.detectSystemTheme() || this.THEMES.DARK;
            }
        } catch (error) {
            console.warn('Erro ao carregar tema:', error);
            this.currentTheme = this.THEMES.DARK;
        }
    }

    /**
     * Detecta preferência de tema do sistema
     */
    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return this.THEMES.DARK;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return this.THEMES.LIGHT;
        }
        return null;
    }

    /**
     * Aplica o tema atual
     */
    applyTheme() {
        const config = this.themeConfigs[this.currentTheme];
        if (!config) {
            console.error('Configuração de tema não encontrada:', this.currentTheme);
            return;
        }

        this.setCSSVariables(config);
        this.updateBodyClass();
        this.saveTheme();
        
        // Disparar evento para outros componentes
        this.dispatchThemeChangeEvent();
    }

    /**
     * Define variáveis CSS baseadas no tema
     */
    setCSSVariables(config) {
        const root = document.documentElement;
        
        // Aplicar cores de fundo
        Object.entries(config.backgrounds).forEach(([key, value]) => {
            root.style.setProperty(`--bg-${key}`, value);
        });
        
        // Aplicar cores de texto
        Object.entries(config.text).forEach(([key, value]) => {
            root.style.setProperty(`--text-${key}`, value);
        });
        
        // Aplicar bordas
        Object.entries(config.borders).forEach(([key, value]) => {
            root.style.setProperty(`--border-${key}`, value);
        });
        
        // Aplicar azuis temáticos
        Object.entries(config.blues).forEach(([key, value]) => {
            root.style.setProperty(`--blue-${key}`, value);
        });
        
        // Aplicar cores de estado
        Object.entries(config.status).forEach(([key, value]) => {
            root.style.setProperty(`--status-${key}`, value);
        });

        // Variáveis de compatibilidade
        root.style.setProperty('--bg-primary', config.backgrounds.primary);
        root.style.setProperty('--bg-secondary', config.backgrounds.secondary);
        root.style.setProperty('--text-primary', config.text.primary);
        root.style.setProperty('--text-secondary', config.text.secondary);
        root.style.setProperty('--border', config.borders.primary);
    }

    /**
     * Atualiza classe do body
     */
    updateBodyClass() {
        const body = document.body;
        
        // Remove classes de tema anteriores
        body.classList.remove('theme-dark', 'theme-light');
        
        // Adiciona classe do tema atual
        body.classList.add(`theme-${this.currentTheme}`);
        
        // Adiciona atributo para CSS seletores
        body.setAttribute('data-theme', this.currentTheme);
    }

    /**
     * Salva tema no localStorage
     */
    saveTheme() {
        try {
            localStorage.setItem(this.STORAGE_KEY, this.currentTheme);
        } catch (error) {
            console.warn('Erro ao salvar tema:', error);
        }
    }

    /**
     * Dispara evento de mudança de tema
     */
    dispatchThemeChangeEvent() {
        const event = new CustomEvent('themeChanged', {
            detail: {
                theme: this.currentTheme,
                config: this.themeConfigs[this.currentTheme]
            }
        });
        
        window.dispatchEvent(event);
    }

    /**
     * Define tema específico programaticamente
     * @param {string} theme - 'dark' ou 'light'
     */
    setTheme(theme) {
        if (!this.themeConfigs[theme]) {
            console.error('Tema inválido:', theme);
            return false;
        }
        
        console.log(`Mudando tema para: ${theme}`);
        this.currentTheme = theme;
        this.applyTheme();
        return true;
    }

    /**
     * Alterna entre temas
     */
    toggleTheme() {
        const newTheme = this.currentTheme === this.THEMES.DARK 
            ? this.THEMES.LIGHT 
            : this.THEMES.DARK;
            
        return this.setTheme(newTheme);
    }

    /**
     * Obtém tema atual
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Obtém configuração do tema atual
     */
    getCurrentConfig() {
        return this.themeConfigs[this.currentTheme];
    }

    /**
     * Obtém todos os temas disponíveis
     */
    getAvailableThemes() {
        return Object.keys(this.themeConfigs);
    }

    /**
     * Verifica se é tema escuro
     */
    isDark() {
        return this.currentTheme === this.THEMES.DARK;
    }

    /**
     * Verifica se é tema claro
     */
    isLight() {
        return this.currentTheme === this.THEMES.LIGHT;
    }
}

// Instância global para compatibilidade
let enhancedThemeSystem = null;

/**
 * Inicializa o sistema de temas aprimorado
 */
function initializeEnhancedThemes() {
    if (!enhancedThemeSystem) {
        enhancedThemeSystem = new EnhancedThemeSystem();
        
        // Disponibilizar globalmente para uso programático
        window.enhancedThemeSystem = enhancedThemeSystem;
        
        console.log('Sistema de temas aprimorado inicializado');
    }
    
    return enhancedThemeSystem;
}

/**
 * Funções de conveniência para uso programático
 */

/**
 * Define tema programaticamente
 * @param {string} theme - 'dark' ou 'light'
 * @returns {boolean} Sucesso da operação
 * 
 * @example
 * setTheme('dark');   // Ativa tema escuro
 * setTheme('light');  // Ativa tema claro
 */
function setTheme(theme) {
    if (!enhancedThemeSystem) {
        initializeEnhancedThemes();
    }
    return enhancedThemeSystem.setTheme(theme);
}

/**
 * Alterna entre temas
 * @returns {boolean} Sucesso da operação
 * 
 * @example
 * toggleTheme(); // Alterna entre claro e escuro
 */
function toggleTheme() {
    if (!enhancedThemeSystem) {
        initializeEnhancedThemes();
    }
    return enhancedThemeSystem.toggleTheme();
}

/**
 * Obtém tema atual
 * @returns {string} Tema atual ('dark' ou 'light')
 * 
 * @example
 * const currentTheme = getCurrentTheme();
 * console.log('Tema atual:', currentTheme);
 */
function getCurrentTheme() {
    if (!enhancedThemeSystem) {
        initializeEnhancedThemes();
    }
    return enhancedThemeSystem.getCurrentTheme();
}

// Exportar para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EnhancedThemeSystem,
        initializeEnhancedThemes,
        setTheme,
        toggleTheme,
        getCurrentTheme
    };
}

// Auto-inicializar quando o DOM estiver pronto
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEnhancedThemes);
    } else {
        initializeEnhancedThemes();
    }
}
