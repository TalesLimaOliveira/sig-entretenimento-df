/**
 * Enhanced Error Handler
 * Sistema de tratamento de erros com opções de recuperação
 */
class ErrorHandler {
    constructor() {
        this.errorModal = null;
        this.errors = [];
        this.errorThrottle = new Map();
        this.lastErrorTime = 0;
        this.errorCooldown = 3000; // 3 segundos entre erros
        this.init();
    }

    init() {
        this.createErrorModal();
        this.setupGlobalErrorHandling();
    }

    createErrorModal() {
        const modalHTML = `
            <div id="error-modal" class="modal error-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000;">
                <div class="modal-backdrop" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; pointer-events: auto;"></div>
                <div class="modal-content" style="position: relative; background: white; border-radius: 8px; max-width: 600px; width: 90%; max-height: 90vh; overflow: auto; z-index: 10001; pointer-events: auto; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">
                    <div class="modal-header error-header" style="padding: 1rem; border-bottom: 1px solid #ddd; background: rgba(239, 68, 68, 0.1);">
                        <h2 style="margin: 0; color: #dc2626; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-exclamation-triangle"></i> Ops! Algo deu errado</h2>
                        <button class="modal-close" type="button" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666; padding: 0.25rem;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body" style="padding: 1rem;">
                        <div class="error-message" style="padding: 1rem; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); border-radius: 6px; margin-bottom: 1.5rem;">
                            <p id="error-main-message" style="margin: 0; font-weight: 500;">Ocorreu um erro inesperado no sistema.</p>
                        </div>
                        
                        <div class="error-suggestions" style="margin-bottom: 1.5rem;">
                            <h4 style="color: #f59e0b; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-lightbulb"></i> Possíveis soluções:</h4>
                            <ul id="error-suggestions-list" style="list-style: none; padding: 0; margin: 0;">
                                <li style="padding: 0.5rem 0; padding-left: 1.5rem; position: relative;">Recarregue a página (F5)</li>
                                <li style="padding: 0.5rem 0; padding-left: 1.5rem; position: relative;">Limpe o cache do navegador</li>
                                <li style="padding: 0.5rem 0; padding-left: 1.5rem; position: relative;">Verifique sua conexão com a internet</li>
                            </ul>
                        </div>
                        
                        <div class="error-details" style="margin-top: 1rem;">
                            <details style="cursor: pointer;">
                                <summary style="padding: 0.5rem; background: #f5f5f5; border-radius: 4px; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;"><i class="fas fa-code"></i> Detalhes técnicos</summary>
                                <pre id="error-technical-details" style="background: #1f2937; color: #f9fafb; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; line-height: 1.4; max-height: 200px; overflow-y: auto; white-space: pre-wrap; word-wrap: break-word;"></pre>
                            </details>
                        </div>
                    </div>
                    
                    <div class="modal-footer" style="padding: 1rem; border-top: 1px solid #ddd; display: flex; justify-content: flex-end; gap: 0.5rem;">
                        <button type="button" class="btn btn-secondary" id="error-dismiss" style="padding: 0.5rem 1rem; border: 1px solid #ddd; background: #f9fafb; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-times"></i> Fechar
                        </button>
                        <button type="button" class="btn btn-primary" id="error-reload" style="padding: 0.5rem 1rem; border: none; background: #3b82f6; color: white; border-radius: 4px; cursor: pointer;">
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
            console.error('JavaScript error:', event);
            
            this.handleError({
                message: event.message || 'Erro JavaScript',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                type: 'javascript',
                event: event
            });
        });

        // Capturar promessas rejeitadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event);
            
            let reason = event.reason;
            let details = {};
            
            // Extrair mais informações da promise rejeitada
            if (reason instanceof Error) {
                details = {
                    name: reason.name,
                    message: reason.message,
                    stack: reason.stack
                };
            } else if (typeof reason === 'object' && reason !== null) {
                details = reason;
            } else {
                details = { value: reason };
            }
            
            this.handleError({
                message: `Promise rejeitada: ${reason?.message || reason || 'Motivo desconhecido'}`,
                reason: details,
                type: 'unhandledrejection',
                event: event
            });
        });
    }

    handleError(errorInfo) {
        console.error('Erro capturado:', errorInfo);
        
        // Sistema de throttling para evitar spam de erros
        const now = Date.now();
        const errorKey = JSON.stringify({
            message: errorInfo.message,
            filename: errorInfo.filename,
            lineno: errorInfo.lineno
        });
        
        // Verificar se erro similar foi mostrado recentemente
        const lastShown = this.errorThrottle.get(errorKey);
        if (lastShown && (now - lastShown) < this.errorCooldown) {
            console.log('Error throttled:', errorInfo.message);
            return;
        }
        
        // Cooldown global entre erros
        if (now - this.lastErrorTime < 1000) {
            console.log('Global error cooldown active');
            return;
        }
        
        this.errorThrottle.set(errorKey, now);
        this.lastErrorTime = now;
        
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

        // Mostrar detalhes técnicos sempre que disponível
        const errorDetails = this.errorModal.querySelector('.error-details');
        const technicalDetails = document.getElementById('error-technical-details');
        
        // Construir informações técnicas detalhadas
        let technicalInfo = '';
        
        if (errorInfo.error) {
            technicalInfo += `ERRO: ${errorInfo.error.name || 'Error'}\n`;
            technicalInfo += `MENSAGEM: ${errorInfo.error.message || errorInfo.message}\n`;
            if (errorInfo.error.stack) {
                technicalInfo += `\nSTACK TRACE:\n${errorInfo.error.stack}`;
            }
        } else if (errorInfo.reason) {
            technicalInfo += `TIPO: Promise Rejeitada\n`;
            if (typeof errorInfo.reason === 'object') {
                technicalInfo += `DETALHES: ${JSON.stringify(errorInfo.reason, null, 2)}`;
            } else {
                technicalInfo += `RAZÃO: ${errorInfo.reason}`;
            }
        } else if (errorInfo.technicalDetails) {
            technicalInfo += `DETALHES: ${errorInfo.technicalDetails}\n`;
        } else {
            technicalInfo += `ERRO: ${errorInfo.message || 'Erro desconhecido'}\n`;
            if (errorInfo.filename) {
                technicalInfo += `ARQUIVO: ${errorInfo.filename}\n`;
            }
            if (errorInfo.lineno) {
                technicalInfo += `LINHA: ${errorInfo.lineno}\n`;
            }
            if (errorInfo.colno) {
                technicalInfo += `COLUNA: ${errorInfo.colno}\n`;
            }
        }
        
        // Adicionar timestamp
        technicalInfo += `\nTIMESTAMP: ${new Date().toISOString()}`;
        
        // Adicionar informações do navegador
        technicalInfo += `\nNAVEGADOR: ${navigator.userAgent}`;
        technicalInfo += `\nURL: ${window.location.href}`;
        
        if (technicalInfo.trim()) {
            errorDetails.style.display = 'block';
            technicalDetails.textContent = technicalInfo;
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
            console.log(message);
        }
    }

    // Método público para mostrar erros customizados
    showCustomError(message, suggestions = [], technicalDetails = null) {
        const errorInfo = {
            message,
            suggestions: suggestions.length > 0 ? suggestions : [
                'Recarregue a página',
                'Limpe o cache do navegador',
                'Entre em contato com o suporte'
            ]
        };
        
        // Se technicalDetails for uma Error, extrair informações
        if (technicalDetails instanceof Error) {
            errorInfo.error = technicalDetails;
        } else if (technicalDetails) {
            errorInfo.technicalDetails = technicalDetails;
        }
        
        this.showError('general', errorInfo);
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
