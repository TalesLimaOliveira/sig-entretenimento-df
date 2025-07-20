/**
 * Controlador do Seletor de Temas de Cores
 * Sistema integrado ao app principal para troca dinâmica de temas
 */
class ColorThemeController {
    constructor() {
        this.colorBtn = null;
        this.dropdown = null;
        this.colorOptions = null;
        this.currentTheme = 'azulClaro';
        this.isDropdownOpen = false;
        
        this.init();
    }

    init() {
        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }
    }

    setupElements() {
        this.colorBtn = document.getElementById('theme-color-btn');
        this.dropdown = document.getElementById('color-theme-dropdown');
        this.colorOptions = document.querySelectorAll('.color-option');

        if (!this.colorBtn || !this.dropdown) {
            console.warn('Elementos do seletor de cores não encontrados');
            return;
        }

        this.setupEventListeners();
        this.loadSavedTheme();
        this.updateActiveOption();
    }

    setupEventListeners() {
        // Botão para abrir/fechar dropdown
        this.colorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Opções de cor
        this.colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const theme = option.dataset.theme;
                this.setTheme(theme);
                this.closeDropdown();
            });
        });

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!this.dropdown.contains(e.target) && e.target !== this.colorBtn) {
                this.closeDropdown();
            }
        });

        // Fechar dropdown com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isDropdownOpen) {
                this.closeDropdown();
            }
        });
    }

    toggleDropdown() {
        if (this.isDropdownOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        this.dropdown.classList.add('show');
        this.isDropdownOpen = true;
        
        // Adicionar animação de entrada
        this.colorOptions.forEach((option, index) => {
            option.style.animationDelay = `${index * 50}ms`;
            option.style.animation = 'fadeInUp 0.3s ease forwards';
        });
    }

    closeDropdown() {
        this.dropdown.classList.remove('show');
        this.isDropdownOpen = false;
        
        // Limpar animações
        this.colorOptions.forEach(option => {
            option.style.animation = '';
            option.style.animationDelay = '';
        });
    }

    setTheme(themeName) {
        if (!window.colorThemeManager) {
            console.error('ColorThemeManager não encontrado');
            return;
        }

        // Verificar se o tema existe
        if (!window.colorThemeManager.colorThemes[themeName]) {
            console.error(`Tema '${themeName}' não encontrado`);
            return;
        }

        // Aplicar tema
        window.colorThemeManager.setTheme(themeName);
        this.currentTheme = themeName;
        
        // Salvar tema no localStorage
        this.saveTheme(themeName);
        
        // Atualizar opção ativa
        this.updateActiveOption();
        
        // Log para debug
        console.log(`Tema alterado para: ${themeName}`);
        
        // Feedback visual no botão
        this.showThemeChangeAnimation();
    }

    updateActiveOption() {
        this.colorOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === this.currentTheme) {
                option.classList.add('active');
            }
        });
    }

    saveTheme(themeName) {
        try {
            localStorage.setItem('selectedColorTheme', themeName);
        } catch (e) {
            console.warn('Não foi possível salvar o tema:', e);
        }
    }

    loadSavedTheme() {
        try {
            const savedTheme = localStorage.getItem('selectedColorTheme');
            if (savedTheme && window.colorThemeManager?.colorThemes[savedTheme]) {
                this.setTheme(savedTheme);
            } else {
                // Aplicar tema padrão
                this.setTheme('azulClaro');
            }
        } catch (e) {
            console.warn('Não foi possível carregar o tema salvo:', e);
            this.setTheme('azulClaro');
        }
    }

    showThemeChangeAnimation() {
        // Animação de feedback no botão
        this.colorBtn.style.transform = 'scale(1.2)';
        this.colorBtn.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            this.colorBtn.style.transform = '';
            this.colorBtn.style.transition = 'all 0.3s ease';
        }, 200);
    }

    // Método público para trocar tema programaticamente
    changeTheme(themeName) {
        this.setTheme(themeName);
    }

    // Método público para obter tema atual
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Método público para obter lista de temas disponíveis
    getAvailableThemes() {
        return Object.keys(window.colorThemeManager?.colorThemes || {});
    }
}

// CSS adicional para animações
const additionalCSS = `
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.color-option {
    animation-fill-mode: both;
}

/* Responsividade */
@media (max-width: 768px) {
    .color-theme-dropdown {
        right: -10px;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        padding: 15px;
    }
    
    .color-preview {
        width: 32px;
        height: 32px;
    }
    
    .theme-color-btn {
        width: 38px;
        height: 38px;
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    .color-theme-dropdown {
        left: 50%;
        transform: translateX(-50%);
        right: auto;
        margin-top: 10px;
    }
    
    .color-theme-dropdown.show {
        transform: translateX(-50%) translateY(0);
    }
}
`;

// Adicionar CSS ao documento
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);

// Inicializar controlador quando o DOM estiver pronto
let colorThemeController;

// Aguardar que o ColorThemeManager esteja disponível
function initColorThemeController() {
    if (window.colorThemeManager) {
        colorThemeController = new ColorThemeController();
        window.colorThemeController = colorThemeController;
        console.log('✅ Controlador de temas de cores inicializado');
    } else {
        // Tentar novamente em 100ms
        setTimeout(initColorThemeController, 100);
    }
}

// Iniciar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initColorThemeController);
} else {
    initColorThemeController();
}
