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
                // Não fechar se houver modal aberto
                const hasOpenModal = document.querySelector('.modal-backdrop[style*="flex"]') ||
                                   document.querySelector('.modal-backdrop[style*="block"]');
                if (!hasOpenModal) {
                    this.hide();
                }
            }
        });

        // Fechar ao clicar fora do painel (no mapa)
        document.addEventListener('click', (e) => {
            if (this.isVisible && !this.panel.contains(e.target) && 
                !e.target.closest('.marcador-personalizado') &&
                !e.target.closest('.modal-backdrop') &&
                !e.target.closest('.login-modal')) {
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
        const user = window.authManager?.getCurrentUser();

        // Renderizar apenas o conteúdo da aba Overview
        this.panelBody.innerHTML = `
            <div class="info-details">
                ${this.renderBasicInfo(ponto)}
                ${this.renderContactInfo(ponto)}
                ${this.renderAdditionalInfo(ponto)}
                ${this.renderTags(ponto)}
                ${this.renderUserActions(ponto, user)}
                ${isAdmin ? this.renderAdminActions(ponto) : ''}
            </div>
        `;

        // Configurar eventos dos botões
        this.setupActionButtons(ponto, user);
        
        if (isAdmin) {
            this.setupAdminButtons(ponto);
        }
    }

    /**
     * Renderizar ações do usuário (favoritar, sugerir mudança)
     */
    renderUserActions(ponto, user) {
        if (!ponto) return '';

        const isAuthenticated = window.authManager?.isAuthenticated();
        const isFavorito = isAuthenticated && user ? 
            window.databaseManager?.isFavorito(ponto.id, user.username) : false;

        return `
            <div class="info-user-actions">
                <div class="action-buttons-top">
                    <button class="action-btn favorite-btn ${isFavorito ? 'favorited' : ''}" id="btn-favorite" data-ponto-id="${ponto.id}">
                        <i class="fas fa-heart"></i>
                        ${isFavorito ? 'Favoritado' : 'Favoritar'}
                    </button>
                    
                    <button class="action-btn routes-btn" id="btn-routes" data-ponto-id="${ponto.id}" disabled>
                        <i class="fas fa-route"></i>
                        Rotas
                    </button>
                </div>
                
                <div class="action-buttons-bottom">
                    <button class="action-btn suggest-btn" id="btn-suggest" data-ponto-id="${ponto.id}">
                        <i class="fas fa-edit"></i>
                        Sugerir mudança
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Configurar eventos dos botões de ação
     */
    setupActionButtons(ponto, user) {
        // Botão de favoritar
        const favoriteBtn = document.getElementById('btn-favorite');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleFavoriteClick(ponto);
            });
        }

        // Botão de rotas (não funcional)
        const routesBtn = document.getElementById('btn-routes');
        if (routesBtn) {
            routesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showNotification('Funcionalidade de rotas em desenvolvimento', 'info');
            });
        }

        // Botão de sugerir mudança
        const suggestBtn = document.getElementById('btn-suggest');
        if (suggestBtn) {
            suggestBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSuggestClick(ponto);
            });
        }
    }

    /**
     * Handle clique no botão de favoritar
     */
    handleFavoriteClick(ponto) {
        if (!window.authManager.isAuthenticated()) {
            window.loginModal.open({
                pendingAction: () => this.handleFavoriteClick(ponto)
            });
            return;
        }

        try {
            const user = window.authManager.getCurrentUser();
            const foiAdicionado = window.databaseManager.toggleFavorito(ponto.id, user.username);
            
            // Atualizar botão
            const btn = document.getElementById('btn-favorite');
            if (btn) {
                if (foiAdicionado) {
                    btn.innerHTML = '<i class="fas fa-heart"></i> Favoritado';
                    btn.classList.add('favorited');
                } else {
                    btn.innerHTML = '<i class="fas fa-heart"></i> Favoritar';
                    btn.classList.remove('favorited');
                }
            }
            
            // Mostrar feedback
            const mensagem = foiAdicionado ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!';
            this.showNotification(mensagem, foiAdicionado ? 'success' : 'info');
            
        } catch (error) {
            console.error('Erro ao favoritar:', error);
            this.showNotification('Erro ao atualizar favoritos', 'error');
        }
    }

    /**
     * Handle clique no botão de sugerir mudança
     */
    handleSuggestClick(ponto) {
        if (!window.authManager.isAuthenticated()) {
            window.loginModal.open({
                pendingAction: () => this.handleSuggestClick(ponto)
            });
            return;
        }

        // Usar o novo modal de sugestão
        if (window.suggestionModal) {
            window.suggestionModal.open(ponto);
        } else {
            this.openSuggestionModal(ponto);
        }
    }

    /**
     * Abrir modal de sugestão de mudança
     */
    openSuggestionModal(ponto) {
        // Implementação simples - em produção seria um modal mais sofisticado
        const campos = [
            'nome', 'descricao', 'endereco', 'telefone', 
            'website', 'horario', 'preco'
        ];
        
        const sugestoes = {};
        let hasSuggestion = false;
        
        for (const campo of campos) {
            const valorAtual = ponto[campo] || '';
            const novoValor = prompt(`Sugerir novo ${campo}:\n\nValor atual: ${valorAtual}\n\nNovo valor (deixe vazio para não alterar):`);
            
            if (novoValor && novoValor.trim() !== '' && novoValor !== valorAtual) {
                sugestoes[campo] = novoValor.trim();
                hasSuggestion = true;
            }
        }
        
        if (hasSuggestion) {
            try {
                const user = window.authManager.getCurrentUser();
                window.databaseManager.sugerirMudanca(ponto.id, sugestoes, user.username);
                this.showNotification('Sugestão enviada para análise!', 'success');
            } catch (error) {
                console.error('Erro ao enviar sugestão:', error);
                this.showNotification('Erro ao enviar sugestão', 'error');
            }
        }
    }

    /**
     * Mostrar notificação
     */
    showNotification(message, type = 'info') {
        // Usar o sistema de notificações global se disponível
        if (window.notificationSystem) {
            window.notificationSystem.show(message, type);
            return;
        }

        // Fallback para implementação simples
        this.showSimpleNotification(message, type);
    }

    /**
     * Implementação simples de notificação como fallback
     */
    showSimpleNotification(message, type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        
        const notification = document.createElement('div');
        notification.className = `notification ${type} show`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem;
            border-radius: 6px;
            z-index: 10001;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        
        document.body.appendChild(notification);
        
        // Mostrar notificação
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        // Remover após 4 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    /**
     * Obter ícone para notificação
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        return icons[type] || icons.info;
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
