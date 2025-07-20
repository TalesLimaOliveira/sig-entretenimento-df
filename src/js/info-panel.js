/**
 * Gerenciador do Painel Lateral de Informações - Clean Architecture
 * 
 * Responsabilidades:
 * - Exibir informações dos pontos selecionados
 * - Controlar abertura/fechamento do painel
 * - Renderizar conteúdo de forma estruturada
 * - Gerenciar eventos de interação
 * 
 * @author Sistema de Entretenimento DF
 * @version 1.0.0
 */

class InfoPanelManager {
    constructor() {
        this.panel = null;
        this.panelBody = null;
        this.panelTitle = null;
        this.panelImage = null;
        this.imagePlaceholder = null;
        this.closeButton = null;
        this.tabs = null;
        this.tabContents = null;
        this.currentTab = 'overview';
        this.isVisible = false;
        this.currentPoint = null;
        
        this.init();
    }

    /**
     * Inicializa o gerenciador do painel
     */
    init() {
        console.log('📋 Inicializando InfoPanelManager...');
        
        this.setupElements();
        this.setupEventListeners();
        
        console.log('✅ InfoPanelManager inicializado');
    }

    /**
     * Configurar elementos DOM
     */
    setupElements() {
        this.panel = document.getElementById('info-panel');
        this.panelBody = document.getElementById('info-panel-body');
        this.panelTitle = document.getElementById('info-panel-title');
        this.panelImage = document.getElementById('info-panel-image');
        this.imagePlaceholder = document.querySelector('.info-panel-image-placeholder');
        this.closeButton = document.getElementById('info-panel-close');
        this.tabs = document.querySelectorAll('.info-panel-tab');
        this.tabContents = document.querySelectorAll('.info-panel-tab-content');

        if (!this.panel || !this.panelBody || !this.panelTitle || !this.closeButton) {
            console.error('❌ Elementos do painel não encontrados');
            return;
        }
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        if (!this.closeButton) return;

        // Botão de fechar
        this.closeButton.addEventListener('click', () => {
            this.hide();
        });

        // Eventos das abas
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Fechar com tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });

        // Fechar ao clicar fora do painel (no mapa)
        document.addEventListener('click', (e) => {
            if (this.isVisible && !this.panel.contains(e.target) && 
                !e.target.closest('.marcador-personalizado')) {
                this.hide();
            }
        });
    }

    /**
     * Alternar entre abas
     * @param {string} tabName - Nome da aba
     */
    switchTab(tabName) {
        // Atualizar estado da aba atual
        this.currentTab = tabName;

        // Remover classe active de todas as abas e conteúdos
        this.tabs.forEach(tab => tab.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.remove('active'));

        // Adicionar classe active na aba e conteúdo selecionados
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`tab-${tabName}`);

        if (activeTab) activeTab.classList.add('active');
        if (activeContent) activeContent.classList.add('active');

        console.log(`📋 Aba alterada para: ${tabName}`);
    }

    /**
     * Exibir painel com informações do ponto
     * @param {Object} ponto - Dados do ponto
     */
    show(ponto) {
        if (!this.panel || !ponto) return;

        this.currentPoint = ponto;
        this.renderContent(ponto);
        this.setupImage(ponto);
        
        // Garantir que a aba Overview está selecionada
        this.switchTab('overview');
        
        // Mostrar painel
        this.panel.classList.remove('hidden');
        setTimeout(() => {
            this.panel.classList.add('visible');
        }, 10);
        
        this.isVisible = true;
        console.log('📋 Painel aberto para:', ponto.nome);
    }

    /**
     * Ocultar painel
     */
    hide() {
        if (!this.panel || !this.isVisible) return;

        this.panel.classList.remove('visible');
        setTimeout(() => {
            this.panel.classList.add('hidden');
        }, 300);
        
        this.isVisible = false;
        this.currentPoint = null;
        console.log('📋 Painel fechado');
    }

    /**
     * Configurar imagem do painel
     * @param {Object} ponto - Dados do ponto
     */
    setupImage(ponto) {
        if (!this.panelImage || !this.imagePlaceholder) return;

        // Definir título da imagem
        this.panelTitle.textContent = ponto.nome || 'Local selecionado';

        // Verificar se há imagem disponível
        if (ponto.imagem && ponto.imagem !== 'https://via.placeholder.com/300x200') {
            this.panelImage.src = ponto.imagem;
            this.panelImage.alt = `Imagem de ${ponto.nome}`;
            this.panelImage.style.display = 'block';
            this.imagePlaceholder.style.display = 'none';
            
            // Tratamento de erro de carregamento da imagem
            this.panelImage.onerror = () => {
                this.panelImage.style.display = 'none';
                this.imagePlaceholder.style.display = 'flex';
            };
        } else {
            // Mostrar placeholder quando não há imagem
            this.panelImage.style.display = 'none';
            this.imagePlaceholder.style.display = 'flex';
        }
    }

    /**
     * Renderizar conteúdo do painel
     * @param {Object} ponto - Dados do ponto
     */
    renderContent(ponto) {
        if (!this.panelBody) return;

        const categoria = window.databaseManager?.obterCategoria(ponto.categoria);
        const isAdmin = window.authManager?.isAdmin();

        // Renderizar apenas o conteúdo da aba Overview
        this.panelBody.innerHTML = `
            <div class="info-details">
                ${this.renderBasicInfo(ponto)}
                ${this.renderContactInfo(ponto)}
                ${this.renderAdditionalInfo(ponto)}
                ${this.renderTags(ponto)}
                ${isAdmin ? this.renderAdminActions(ponto) : ''}
                ${this.renderMetadata(ponto)}
            </div>
        `;

        // Configurar eventos dos botões admin
        if (isAdmin) {
            this.setupAdminButtons(ponto);
        }
    }

    /**
     * Renderizar informações básicas
     * @param {Object} ponto - Dados do ponto
     * @returns {string} HTML das informações básicas
     */
    renderBasicInfo(ponto) {
        let html = '';

        if (ponto.endereco) {
            html += `
                <div class="info-detail">
                    <span class="info-detail-icon">📍</span>
                    <span class="info-detail-text">${ponto.endereco}</span>
                </div>
            `;
        }

        if (ponto.descricao) {
            html += `
                <div class="info-detail">
                    <span class="info-detail-icon">📝</span>
                    <span class="info-detail-text">${ponto.descricao}</span>
                </div>
            `;
        }

        return html;
    }

    /**
     * Renderizar informações de contato
     * @param {Object} ponto - Dados do ponto
     * @returns {string} HTML das informações de contato
     */
    renderContactInfo(ponto) {
        let html = '';

        if (ponto.telefone) {
            html += `
                <div class="info-detail">
                    <span class="info-detail-icon">📞</span>
                    <span class="info-detail-text">
                        <a href="tel:${ponto.telefone}" class="info-link">${ponto.telefone}</a>
                    </span>
                </div>
            `;
        }

        if (ponto.website) {
            html += `
                <div class="info-detail">
                    <span class="info-detail-icon">🌐</span>
                    <span class="info-detail-text">
                        <a href="${ponto.website}" target="_blank" class="info-link">Site oficial</a>
                    </span>
                </div>
            `;
        }

        return html;
    }

    /**
     * Renderizar informações adicionais
     * @param {Object} ponto - Dados do ponto
     * @returns {string} HTML das informações adicionais
     */
    renderAdditionalInfo(ponto) {
        let html = '';

        if (ponto.horario) {
            html += `
                <div class="info-detail">
                    <span class="info-detail-icon">🕒</span>
                    <span class="info-detail-text">${ponto.horario}</span>
                </div>
            `;
        }

        if (ponto.preco) {
            html += `
                <div class="info-detail">
                    <span class="info-detail-icon">💰</span>
                    <span class="info-detail-text">${ponto.preco}</span>
                </div>
            `;
        }

        if (ponto.avaliacao > 0) {
            html += `
                <div class="info-detail">
                    <span class="info-detail-icon">⭐</span>
                    <span class="info-detail-text">${ponto.avaliacao}/5</span>
                </div>
            `;
        }

        return html;
    }

    /**
     * Renderizar tags
     * @param {Object} ponto - Dados do ponto
     * @returns {string} HTML das tags
     */
    renderTags(ponto) {
        if (!ponto.tags || !Array.isArray(ponto.tags) || ponto.tags.length === 0) {
            return '';
        }

        const tagsHtml = ponto.tags.map(tag => 
            `<span class="info-tag">#${tag}</span>`
        ).join('');

        return `<div class="info-tags">${tagsHtml}</div>`;
    }

    /**
     * Renderizar ações de administrador
     * @param {Object} ponto - Dados do ponto
     * @returns {string} HTML das ações de admin
     */
    renderAdminActions(ponto) {
        return `
            <div class="info-admin-actions">
                <button class="info-admin-btn edit" data-action="edit" data-id="${ponto.id}">
                    <i class="fas fa-edit"></i>
                    Editar
                </button>
                <button class="info-admin-btn delete" data-action="delete" data-id="${ponto.id}">
                    <i class="fas fa-trash"></i>
                    Remover
                </button>
            </div>
        `;
    }

    /**
     * Renderizar metadados
     * @param {Object} ponto - Dados do ponto
     * @returns {string} HTML dos metadados
     */
    renderMetadata(ponto) {
        return `
            <div class="info-metadata">
                ID: ${ponto.id} | Views: ${ponto.metadata?.views || 0}
            </div>
        `;
    }

    /**
     * Obter ícone da categoria
     * @param {Object} categoria - Dados da categoria
     * @returns {string} Emoji do ícone
     */
    getIconeCategoria(categoria) {
        if (!categoria) return '📍';
        
        const mapaIcones = {
            'cultura': '🎭',
            'gastronomia': '🍴',
            'noturno': '🍺',
            'esportes': '⚽',
            'geral': '📍',
            'teatro': '🎭',
            'museu': '🏛️',
            'parque': '🌳',
            'restaurante': '🍽️',
            'bar': '🍻',
            'clube': '🎵',
            'academia': '🏋️',
            'shopping': '🛍️'
        };
        
        return mapaIcones[categoria.id] || mapaIcones[categoria.nome?.toLowerCase()] || '📍';
    }

    /**
     * Configurar botões de administrador
     * @param {Object} ponto - Dados do ponto
     */
    setupAdminButtons(ponto) {
        const editBtn = this.panelBody.querySelector('[data-action="edit"]');
        const deleteBtn = this.panelBody.querySelector('[data-action="delete"]');

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.handleEditPoint(ponto.id);
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.handleDeletePoint(ponto.id);
            });
        }
    }

    /**
     * Manipular edição de ponto
     * @param {number} pontoId - ID do ponto
     */
    handleEditPoint(pontoId) {
        if (window.mapManager && typeof window.mapManager.editarPonto === 'function') {
            window.mapManager.editarPonto(pontoId);
        }
    }

    /**
     * Manipular remoção de ponto
     * @param {number} pontoId - ID do ponto
     */
    handleDeletePoint(pontoId) {
        if (window.mapManager && typeof window.mapManager.removerPonto === 'function') {
            window.mapManager.removerPonto(pontoId);
            this.hide(); // Fechar painel após remoção
        }
    }

    /**
     * Verificar se o painel está visível
     * @returns {boolean}
     */
    isOpen() {
        return this.isVisible;
    }

    /**
     * Obter ponto atual
     * @returns {Object|null}
     */
    getCurrentPoint() {
        return this.currentPoint;
    }
}

// Instanciar globalmente
window.infoPanelManager = new InfoPanelManager();
