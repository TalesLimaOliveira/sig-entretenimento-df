/**
 * Sistema de Paletas de Cores Temáticas - SIG Entretenimento DF
 * 
 * Este arquivo centraliza todas as paletas de cores disponíveis para o aplicativo,
 * permitindo fácil troca de identidade visual mantendo a consistência.
 * 
 * Estrutura das Paletas:
 * - primary: Cor principal do tema (botões, destaques, etc.)
 * - primaryHover: Variação hover da cor principal
 * - primaryDark: Versão mais escura da cor principal
 * - secondary: Cor secundária (fundos suaves, elementos neutros)
 * - accent: Cor de destaque/contraste
 * - gradient: Gradiente principal do tema
 * - 
 * Cores Fixas (mantidas em todos os temas):
 * - favorite: Rosa para favoritos (#ff4081)
 * - route: Azul para rotas (#2196f3)
 * - success: Verde para sucesso (#10b981)
 * - warning: Laranja para avisos (#f59e0b)
 * - error: Vermelho para erros (#ef4444)
 * - admin: Dourado para administradores (#fbbf24)
 *
 * @author Tales Oliveira (github.com/TalesLimaOliveira)
 * @version 1.0.0
 * @note Este arquivo contém trechos de código gerados com auxílio de Inteligência Artificial.
 */

/**
 * Paletas de cores disponíveis
 */
const colorThemes = {
    // Tema Azul Claro (Padrão)
    azulClaro: {
        id: 'azulClaro',
        name: 'Azul Claro',
        description: 'Tema azul suave e profissional',
        primary: '#4da6ff',
        primaryHover: '#3d8bdb',
        primaryDark: '#2563eb',
        secondary: '#e3f2fd',
        accent: '#0066cc',
        light: '#f0f8ff',
        medium: '#90caf9',
        gradient: {
            primary: 'linear-gradient(135deg, #4da6ff 0%, #2563eb 100%)',
            secondary: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            button: 'linear-gradient(135deg, rgba(77, 166, 255, 0.8), rgba(37, 99, 235, 0.9))'
        }
    },

    // Tema Rosa
    rosa: {
        id: 'rosa',
        name: 'Rosa',
        description: 'Tema rosa elegante e feminino',
        primary: '#f48fb1',
        primaryHover: '#e91e63',
        primaryDark: '#ad1457',
        secondary: '#fce4ec',
        accent: '#c2185b',
        light: '#fff0f5',
        medium: '#f8bbd9',
        gradient: {
            primary: 'linear-gradient(135deg, #f48fb1 0%, #ad1457 100%)',
            secondary: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
            button: 'linear-gradient(135deg, rgba(244, 143, 177, 0.8), rgba(173, 20, 87, 0.9))'
        }
    },

    // Tema Vermelho
    vermelho: {
        id: 'vermelho',
        name: 'Vermelho',
        description: 'Tema vermelho vibrante e energético',
        primary: '#ef5350',
        primaryHover: '#d32f2f',
        primaryDark: '#b71c1c',
        secondary: '#ffebee',
        accent: '#f44336',
        light: '#fff5f5',
        medium: '#ffcdd2',
        gradient: {
            primary: 'linear-gradient(135deg, #ef5350 0%, #b71c1c 100%)',
            secondary: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
            button: 'linear-gradient(135deg, rgba(239, 83, 80, 0.8), rgba(183, 28, 28, 0.9))'
        }
    },

    // Tema Verde
    verde: {
        id: 'verde',
        name: 'Verde',
        description: 'Tema verde natural e sustentável',
        primary: '#66bb6a',
        primaryHover: '#4caf50',
        primaryDark: '#2e7d32',
        secondary: '#e8f5e8',
        accent: '#388e3c',
        light: '#f1f8e9',
        medium: '#a5d6a7',
        gradient: {
            primary: 'linear-gradient(135deg, #66bb6a 0%, #2e7d32 100%)',
            secondary: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
            button: 'linear-gradient(135deg, rgba(102, 187, 106, 0.8), rgba(46, 125, 50, 0.9))'
        }
    },

    // Tema Amarelo
    amarelo: {
        id: 'amarelo',
        name: 'Amarelo',
        description: 'Tema amarelo solar e alegre',
        primary: '#ffca28',
        primaryHover: '#ffc107',
        primaryDark: '#f57f17',
        secondary: '#fffde7',
        accent: '#ff8f00',
        light: '#fffef7',
        medium: '#fff59d',
        gradient: {
            primary: 'linear-gradient(135deg, #ffca28 0%, #f57f17 100%)',
            secondary: 'linear-gradient(135deg, #fffde7 0%, #fff9c4 100%)',
            button: 'linear-gradient(135deg, rgba(255, 202, 40, 0.8), rgba(245, 127, 23, 0.9))'
        }
    },

    // Tema Roxo
    roxo: {
        id: 'roxo',
        name: 'Roxo',
        description: 'Tema roxo criativo e moderno',
        primary: '#ab47bc',
        primaryHover: '#9c27b0',
        primaryDark: '#6a1b9a',
        secondary: '#f3e5f5',
        accent: '#8e24aa',
        light: '#faf2ff',
        medium: '#ce93d8',
        gradient: {
            primary: 'linear-gradient(135deg, #ab47bc 0%, #6a1b9a 100%)',
            secondary: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
            button: 'linear-gradient(135deg, rgba(171, 71, 188, 0.8), rgba(106, 27, 154, 0.9))'
        }
    }
};

/**
 * Cores fixas que não mudam entre temas
 */
const fixedColors = {
    // Cores funcionais (mantidas consistentes)
    favorite: '#ff4081',          // Rosa para favoritos
    route: '#2196f3',            // Azul para rotas
    success: '#10b981',          // Verde para sucesso
    warning: '#f59e0b',          // Laranja para avisos
    error: '#ef4444',            // Vermelho para erros
    info: '#3b82f6',             // Azul para informações
    admin: '#fbbf24',            // Dourado para administradores
    
    // Cores neutras (baseadas no tema claro/escuro)
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
    
    // Gradientes funcionais
    gradients: {
        favorite: 'linear-gradient(135deg, #ff4081 0%, #e91e63 100%)',
        success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        admin: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
    }
};

/**
 * Configuração do tema atual
 * 
 * Para trocar o tema, altere apenas esta linha:
 * - colorThemes.azulClaro (padrão)
 * - colorThemes.rosa
 * - colorThemes.vermelho
 * - colorThemes.verde
 * - colorThemes.amarelo
 * - colorThemes.roxo
 */
let currentColorTheme = colorThemes.azulClaro;

/**
 * Gerenciador de Temas de Cores
 */
class ColorThemeManager {
    constructor() {
        this.currentTheme = currentColorTheme;
        this.themes = colorThemes;
        this.fixed = fixedColors;
        this.cssVariables = new Map();
        
        this.init();
    }

    /**
     * Inicializar o sistema de temas
     */
    init() {
        this.applyTheme(this.currentTheme);
        console.log(`Theme system initialized: ${this.currentTheme.name}`);
    }

    /**
     * Aplicar tema selecionado
     * @param {Object} theme - Objeto do tema
     */
    applyTheme(theme) {
        if (!theme || !theme.id) {
            console.error('Invalid theme');
            return;
        }

        this.currentTheme = theme;
        this.updateCSSVariables();
        this.notifyThemeChange();
        
        console.log(`Theme applied: ${theme.name}`);
    }

    /**
     * Trocar tema por ID
     * @param {string} themeId - ID do tema
     */
    setTheme(themeId) {
        if (this.themes[themeId]) {
            this.applyTheme(this.themes[themeId]);
        } else {
            console.error(`❌ Tema não encontrado: ${themeId}`);
        }
    }

    /**
     * Atualizar variáveis CSS
     */
    updateCSSVariables() {
        const root = document.documentElement;
        const theme = this.currentTheme;

        // Aplicar cores do tema
        root.style.setProperty('--theme-primary', theme.primary);
        root.style.setProperty('--theme-primary-hover', theme.primaryHover);
        root.style.setProperty('--theme-primary-dark', theme.primaryDark);
        root.style.setProperty('--theme-secondary', theme.secondary);
        root.style.setProperty('--theme-accent', theme.accent);
        root.style.setProperty('--theme-light', theme.light);
        root.style.setProperty('--theme-medium', theme.medium);
        
        // Gradientes
        root.style.setProperty('--theme-gradient-primary', theme.gradient.primary);
        root.style.setProperty('--theme-gradient-secondary', theme.gradient.secondary);
        root.style.setProperty('--theme-gradient-button', theme.gradient.button);

        // Cores fixas
        root.style.setProperty('--color-favorite', this.fixed.favorite);
        root.style.setProperty('--color-route', this.fixed.route);
        root.style.setProperty('--color-success', this.fixed.success);
        root.style.setProperty('--color-warning', this.fixed.warning);
        root.style.setProperty('--color-error', this.fixed.error);
        root.style.setProperty('--color-info', this.fixed.info);
        root.style.setProperty('--color-admin', this.fixed.admin);

        // Gradientes fixos
        root.style.setProperty('--gradient-favorite', this.fixed.gradients.favorite);
        root.style.setProperty('--gradient-success', this.fixed.gradients.success);
        root.style.setProperty('--gradient-warning', this.fixed.gradients.warning);
        root.style.setProperty('--gradient-error', this.fixed.gradients.error);
        root.style.setProperty('--gradient-admin', this.fixed.gradients.admin);
    }

    /**
     * Notificar mudança de tema
     */
    notifyThemeChange() {
        // Disparar evento customizado para outros componentes
        window.dispatchEvent(new CustomEvent('colorThemeChanged', {
            detail: {
                theme: this.currentTheme,
                fixed: this.fixed
            }
        }));
    }

    /**
     * Obter cor do tema atual
     * @param {string} colorKey - Chave da cor
     * @returns {string} Valor da cor
     */
    getColor(colorKey) {
        return this.currentTheme[colorKey] || this.fixed[colorKey] || null;
    }

    /**
     * Obter gradiente do tema atual
     * @param {string} gradientKey - Chave do gradiente
     * @returns {string} Valor do gradiente
     */
    getGradient(gradientKey) {
        return this.currentTheme.gradient[gradientKey] || this.fixed.gradients[gradientKey] || null;
    }

    /**
     * Obter tema atual
     * @returns {Object} Tema atual
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Obter lista de temas disponíveis
     * @returns {Array} Lista de temas
     */
    getAvailableThemes() {
        return Object.values(this.themes);
    }
}

// Criar instância global
if (typeof window !== 'undefined') {
    window.colorThemeManager = new ColorThemeManager();
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        colorThemes,
        fixedColors,
        ColorThemeManager
    };
}
