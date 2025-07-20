/**
 * Enhanced Error Handler
 * Sistema de tratamento de erros com opções de recuperação
 */
class ErrorHandler {
    constructor() {
        this.errorModal = null;
        this.errors = [];
        this.init();
    }

    init() {
        this.createErrorModal();
        this.setupGlobalErrorHandling();
    }

    createErrorModal() {
        const modalHTML = `
            <div id="error-modal" class="modal error-modal" style="display: none;">
                <div class="modal-backdrop"></div>
                <div class="modal-content">
                    <div class="modal-header error-header">
                        <h2><i class="fas fa-exclamation-triangle"></i> Ops! Algo deu errado</h2>
                        <button class="modal-close" type="button">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="error-message">
                            <p id="error-main-message">Ocorreu um erro inesperado no sistema.</p>
                        </div>
                        
                        <div class="error-suggestions">
                            <h4><i class="fas fa-lightbulb"></i> Possíveis soluções:</h4>
                            <ul id="error-suggestions-list">
                                <li>Recarregue a página (F5)</li>
                                <li>Limpe o cache do navegador</li>
                                <li>Verifique sua conexão com a internet</li>
                            </ul>
                        </div>
                        
                        <div class="error-details" style="display: none;">
                            <details>
                                <summary><i class="fas fa-code"></i> Detalhes técnicos</summary>
                                <pre id="error-technical-details"></pre>
                            </details>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="error-dismiss">
                            <i class="fas fa-times"></i> Fechar
                        </button>
                        <button type="button" class="btn btn-warning" id="error-clear-cache">
                            <i class="fas fa-broom"></i> Limpar Cache
                        </button>
                        <button type="button" class="btn btn-primary" id="error-reload">
                            <i class="fas fa-redo"></i> Recarregar
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.errorModal = document.getElementById('error-modal');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close buttons
        const closeBtn = this.errorModal.querySelector('.modal-close');
        const dismissBtn = document.getElementById('error-dismiss');
        const backdrop = this.errorModal.querySelector('.modal-backdrop');

        [closeBtn, dismissBtn, backdrop].forEach(element => {
            element.addEventListener('click', () => this.close());
        });

        // Action buttons
        document.getElementById('error-clear-cache').addEventListener('click', () => {
            this.clearCache();
        });

        document.getElementById('error-reload').addEventListener('click', () => {
            this.reloadPage();
        });

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.close();
            }
        });
    }

    setupGlobalErrorHandling() {
        // Capturar erros JavaScript
        window.addEventListener('error', (event) => {
            this.handleError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Capturar promessas rejeitadas
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                message: 'Promise rejeitada',
                reason: event.reason
            });
        });
    }

    handleError(errorInfo) {
        console.error('❌ Erro capturado:', errorInfo);
        this.errors.push({
            ...errorInfo,
            timestamp: new Date().toISOString()
        });

        // Determinar tipo de erro
        const errorType = this.categorizeError(errorInfo);
        this.showError(errorType, errorInfo);
    }

    categorizeError(errorInfo) {
        const message = errorInfo.message || errorInfo.reason?.toString() || '';
        
        if (message.includes('NetworkError') || message.includes('fetch')) {
            return 'network';
        } else if (message.includes('localStorage') || message.includes('storage')) {
            return 'storage';
        } else if (message.includes('not defined') || message.includes('undefined')) {
            return 'reference';
        } else if (message.includes('permission') || message.includes('access')) {
            return 'permission';
        } else {
            return 'general';
        }
    }

    showError(type, errorInfo) {
        const config = this.getErrorConfig(type);
        
        // Atualizar conteúdo do modal
        document.getElementById('error-main-message').textContent = config.message;
        
        const suggestionsList = document.getElementById('error-suggestions-list');
        suggestionsList.innerHTML = config.suggestions.map(suggestion => 
            `<li>${suggestion}</li>`
        ).join('');

        // Mostrar detalhes técnicos se disponível
        const errorDetails = this.errorModal.querySelector('.error-details');
        const technicalDetails = document.getElementById('error-technical-details');
        
        if (errorInfo.error?.stack || errorInfo.reason) {
            errorDetails.style.display = 'block';
            technicalDetails.textContent = errorInfo.error?.stack || JSON.stringify(errorInfo.reason, null, 2);
        } else {
            errorDetails.style.display = 'none';
        }

        this.open();
    }

    getErrorConfig(type) {
        const configs = {
            network: {
                message: 'Problema de conexão detectado. Verifique sua internet.',
                suggestions: [
                    'Verifique sua conexão com a internet',
                    'Tente recarregar a página',
                    'Aguarde alguns minutos e tente novamente'
                ]
            },
            storage: {
                message: 'Problema com o armazenamento local. Considere limpar o cache.',
                suggestions: [
                    'Limpe o cache do navegador',
                    'Libere espaço no dispositivo',
                    'Desabilite extensões do navegador temporariamente'
                ]
            },
            reference: {
                message: 'Erro de referência detectado. Alguns recursos podem não ter carregado.',
                suggestions: [
                    'Recarregue a página completamente',
                    'Limpe o cache do navegador',
                    'Desabilite bloqueadores de anúncios temporariamente'
                ]
            },
            permission: {
                message: 'Problema de permissão detectado.',
                suggestions: [
                    'Verifique as permissões do navegador',
                    'Tente em uma aba anônima/privada',
                    'Recarregue a página'
                ]
            },
            general: {
                message: 'Erro inesperado no sistema.',
                suggestions: [
                    'Recarregue a página',
                    'Limpe o cache do navegador',
                    'Tente usar um navegador diferente'
                ]
            }
        };

        return configs[type] || configs.general;
    }

    async clearCache() {
        try {
            const clearBtn = document.getElementById('error-clear-cache');
            const originalText = clearBtn.innerHTML;
            clearBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Limpando...';
            clearBtn.disabled = true;

            // Usar o método do database manager se disponível
            if (window.databaseManager?.limparCache) {
                const result = window.databaseManager.limparCache();
                this.showSuccess(`Cache limpo! ${result.removedItems} itens removidos.`);
            } else {
                // Fallback para limpeza básica
                const itemsRemoved = Object.keys(localStorage).length;
                localStorage.clear();
                this.showSuccess(`Cache limpo! ${itemsRemoved} itens removidos.`);
            }

            // Aguardar um pouco e recarregar
            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (error) {
            console.error('Erro ao limpar cache:', error);
            this.showError('general', { message: 'Erro ao limpar cache', error });
        } finally {
            const clearBtn = document.getElementById('error-clear-cache');
            clearBtn.disabled = false;
            clearBtn.innerHTML = '<i class="fas fa-broom"></i> Limpar Cache';
        }
    }

    reloadPage() {
        window.location.reload();
    }

    open() {
        if (!this.errorModal) return;
        
        this.errorModal.style.display = 'block';
        document.body.classList.add('modal-open');
        
        // Adicionar classe para animação
        requestAnimationFrame(() => {
            this.errorModal.classList.add('open');
        });
    }

    close() {
        if (!this.errorModal) return;
        
        this.errorModal.classList.remove('open');
        
        setTimeout(() => {
            this.errorModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }, 200);
    }

    isVisible() {
        return this.errorModal && this.errorModal.style.display === 'block';
    }

    showSuccess(message) {
        if (window.infoPanelManager?.showNotification) {
            window.infoPanelManager.showNotification(message, 'success');
        } else {
            console.log('✅ ' + message);
        }
    }

    // Método público para mostrar erros customizados
    showCustomError(message, suggestions = []) {
        this.showError('general', {
            message,
            suggestions: suggestions.length > 0 ? suggestions : [
                'Recarregue a página',
                'Limpe o cache do navegador',
                'Entre em contato com o suporte'
            ]
        });
    }

    // Obter estatísticas de erros
    getErrorStats() {
        return {
            totalErrors: this.errors.length,
            errorsByType: this.errors.reduce((acc, error) => {
                const type = this.categorizeError(error);
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {}),
            recentErrors: this.errors.slice(-5)
        };
    }
}

// Inicializar globalmente
window.errorHandler = new ErrorHandler();
