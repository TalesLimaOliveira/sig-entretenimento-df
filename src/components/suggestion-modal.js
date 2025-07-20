/**
 * Modal de Sugestão de Mudança - Formulário Interativo
 * Substitui o sistema de prompts por uma interface visual amigável
 */
class SuggestionModal {
    constructor() {
        this.modal = null;
        this.currentPoint = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createModal();
        this.setupEventListeners();
    }

    createModal() {
        const modalHTML = `
            <div id="suggestion-modal" class="modal-backdrop suggestion-modal-backdrop" style="display: none;">
                <div class="modal suggestion-modal">
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <i class="fas fa-edit"></i>
                            Sugerir Mudança
                        </h3>
                        <button class="modal-close-btn" id="suggestion-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <form id="suggestion-form" class="suggestion-form">
                            <div class="form-group">
                                <label for="suggestion-nome">Nome do Local</label>
                                <input type="text" id="suggestion-nome" name="nome" class="form-input" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="suggestion-descricao">Descrição</label>
                                <textarea id="suggestion-descricao" name="descricao" class="form-textarea" rows="3"></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="suggestion-endereco">Endereço</label>
                                <input type="text" id="suggestion-endereco" name="endereco" class="form-input">
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="suggestion-telefone">Telefone</label>
                                    <input type="tel" id="suggestion-telefone" name="telefone" class="form-input">
                                </div>
                                
                                <div class="form-group">
                                    <label for="suggestion-website">Website</label>
                                    <input type="url" id="suggestion-website" name="website" class="form-input">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="suggestion-horario">Horário de Funcionamento</label>
                                <input type="text" id="suggestion-horario" name="horario" class="form-input" placeholder="Ex: Seg-Sex: 9h-18h">
                            </div>
                            
                            <div class="form-group">
                                <label for="suggestion-preco">Faixa de Preço</label>
                                <select id="suggestion-preco" name="preco" class="form-select">
                                    <option value="">Selecione...</option>
                                    <option value="Gratuito">Gratuito</option>
                                    <option value="$">$ - Econômico</option>
                                    <option value="$$">$$ - Moderado</option>
                                    <option value="$$$">$$$ - Caro</option>
                                    <option value="$$$$">$$$$ - Premium</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="suggestion-observacoes">Observações Adicionais</label>
                                <textarea id="suggestion-observacoes" name="observacoes" class="form-textarea" rows="2" placeholder="Informações extras sobre sua sugestão..."></textarea>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="suggestion-cancel">
                            <i class="fas fa-times"></i>
                            Cancelar
                        </button>
                        <button type="submit" form="suggestion-form" class="btn btn-primary" id="suggestion-submit">
                            <i class="fas fa-paper-plane"></i>
                            Enviar Sugestão
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('suggestion-modal');
    }

    setupEventListeners() {
        // Fechar modal
        const closeBtn = document.getElementById('suggestion-close');
        const cancelBtn = document.getElementById('suggestion-cancel');
        
        closeBtn?.addEventListener('click', () => this.close());
        cancelBtn?.addEventListener('click', () => this.close());
        
        // Fechar ao clicar no backdrop
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Submissão do formulário
        const form = document.getElementById('suggestion-form');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    open(point) {
        if (!point) return;
        
        this.currentPoint = point;
        this.populateForm(point);
        
        this.modal.style.display = 'flex';
        this.isOpen = true;
        
        // Foco no primeiro campo
        setTimeout(() => {
            const firstInput = this.modal.querySelector('input');
            firstInput?.focus();
        }, 100);
    }

    close() {
        this.modal.style.display = 'none';
        this.isOpen = false;
        this.currentPoint = null;
        this.clearForm();
    }

    populateForm(point) {
        const fields = ['nome', 'descricao', 'endereco', 'telefone', 'website', 'horario', 'preco'];
        
        fields.forEach(field => {
            const input = document.getElementById(`suggestion-${field}`);
            if (input && point[field]) {
                input.value = point[field];
            }
        });
    }

    clearForm() {
        const form = document.getElementById('suggestion-form');
        form?.reset();
    }

    async handleSubmit() {
        if (!window.authManager?.isAuthenticated()) {
            this.showNotification('Você precisa estar logado para enviar sugestões', 'error');
            return;
        }

        const form = document.getElementById('suggestion-form');
        const formData = new FormData(form);
        const suggestions = {};
        let hasChanges = false;

        // Comparar dados atuais com sugestões
        for (const [key, value] of formData.entries()) {
            const currentValue = this.currentPoint[key] || '';
            if (value.trim() && value.trim() !== currentValue) {
                suggestions[key] = value.trim();
                hasChanges = true;
            }
        }

        // Incluir observações se preenchidas
        const observacoes = formData.get('observacoes');
        if (observacoes?.trim()) {
            suggestions.observacoes = observacoes.trim();
            hasChanges = true;
        }

        if (!hasChanges) {
            this.showNotification('Nenhuma alteração foi detectada', 'warning');
            return;
        }

        try {
            const user = window.authManager.getCurrentUser();
            const result = window.databaseManager.sugerirMudanca(
                this.currentPoint.id, 
                suggestions, 
                user.username
            );

            if (result.success) {
                this.showNotification('Sugestão enviada com sucesso!', 'success');
                this.close();
            } else {
                this.showNotification(result.message || 'Erro ao enviar sugestão', 'error');
            }
        } catch (error) {
            console.error('Erro ao enviar sugestão:', error);
            this.showNotification('Erro interno ao processar sugestão', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Usar o sistema de notificação existente
        if (window.infoPanelManager?.showNotification) {
            window.infoPanelManager.showNotification(message, type);
        } else {
            // Fallback
            alert(message);
        }
    }
}

// Inicializar globalmente
window.suggestionModal = new SuggestionModal();
