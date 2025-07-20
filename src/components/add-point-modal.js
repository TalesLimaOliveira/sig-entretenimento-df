/**
 * Modal para Adicionar Novos Pontos
 * Interface para usuários adicionarem pontos ao mapa
 */
class AddPointModal {
    constructor() {
        this.modal = null;
        this.map = null;
        this.temporaryMarker = null;
        this.selectedPosition = null;
        this.init();
    }

    init() {
        this.createModal();
        this.setupEventListeners();
    }

    createModal() {
        const modalHTML = `
            <div id="add-point-modal" class="modal-backdrop" style="display: none;">
                <div class="modal modal-content large">
                    <div class="modal-header">
                        <h2><i class="fas fa-map-marker-plus"></i> Adicionar Novo Ponto</h2>
                        <button class="modal-close" type="button">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <form id="add-point-form">
                            <!-- Seleção de Localização -->
                            <div class="form-section">
                                <h3><i class="fas fa-map-marker-alt"></i> Localização</h3>
                                <div class="location-selector">
                                    <div class="location-instructions">
                                        <p><i class="fas fa-info-circle"></i> Clique no mapa para selecionar a localização do ponto</p>
                                    </div>
                                    <div class="selected-coordinates" style="display: none;">
                                        <i class="fas fa-check-circle"></i>
                                        <span>Localização selecionada: </span>
                                        <span id="coordinates-display"></span>
                                        <button type="button" class="btn-link" id="change-location">Alterar</button>
                                    </div>
                                </div>
                            </div>

                            <!-- Informações Básicas -->
                            <div class="form-section">
                                <h3><i class="fas fa-info-circle"></i> Informações Básicas</h3>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="point-name" class="required">Nome do Local</label>
                                        <input type="text" id="point-name" class="form-input" required 
                                               placeholder="Digite o nome do local">
                                    </div>
                                    <div class="form-group">
                                        <label for="point-category" class="required">Categoria</label>
                                        <select id="point-category" class="form-select" required>
                                            <option value="">Selecione uma categoria</option>
                                            <option value="cultura">🎭 Cultura</option>
                                            <option value="gastronomia">🍽️ Gastronomia</option>
                                            <option value="noturno">🍸 Vida Noturna</option>
                                            <option value="esportes">⚽ Esportes</option>
                                            <option value="geral">📍 Geral</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="point-description">Descrição</label>
                                    <textarea id="point-description" class="form-textarea" rows="3"
                                              placeholder="Descreva o local, suas características principais..."></textarea>
                                </div>
                            </div>

                            <!-- Detalhes do Local -->
                            <div class="form-section">
                                <h3><i class="fas fa-building"></i> Detalhes do Local</h3>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="point-address">Endereço</label>
                                        <input type="text" id="point-address" class="form-input"
                                               placeholder="Rua, número, bairro">
                                    </div>
                                    <div class="form-group">
                                        <label for="point-phone">Telefone</label>
                                        <input type="tel" id="point-phone" class="form-input"
                                               placeholder="(61) 99999-9999">
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="point-website">Website</label>
                                        <input type="url" id="point-website" class="form-input"
                                               placeholder="https://exemplo.com">
                                    </div>
                                    <div class="form-group">
                                        <label for="point-instagram">Instagram</label>
                                        <input type="text" id="point-instagram" class="form-input"
                                               placeholder="@usuario">
                                    </div>
                                </div>
                            </div>

                            <!-- Horário de Funcionamento -->
                            <div class="form-section">
                                <h3><i class="fas fa-clock"></i> Horário de Funcionamento</h3>
                                <div class="form-group">
                                    <label for="point-hours">Horários</label>
                                    <textarea id="point-hours" class="form-textarea" rows="2"
                                              placeholder="Ex: Seg-Sex: 10h às 22h, Sáb-Dom: 12h às 20h"></textarea>
                                </div>
                            </div>

                            <!-- Imagem -->
                            <div class="form-section">
                                <h3><i class="fas fa-image"></i> Imagem do Local</h3>
                                <div class="form-group">
                                    <label for="point-image">URL da Imagem</label>
                                    <input type="url" id="point-image" class="form-input"
                                           placeholder="https://exemplo.com/imagem.jpg">
                                    <small class="form-help">Cole aqui o link de uma imagem do local</small>
                                </div>
                                <div class="image-preview" id="image-preview" style="display: none;">
                                    <img id="preview-img" src="" alt="Preview">
                                </div>
                            </div>

                            <!-- Tags -->
                            <div class="form-section">
                                <h3><i class="fas fa-tags"></i> Tags</h3>
                                <div class="form-group">
                                    <label for="point-tags">Tags (separadas por vírgula)</label>
                                    <input type="text" id="point-tags" class="form-input"
                                           placeholder="Ex: música ao vivo, família, pet friendly">
                                    <small class="form-help">Adicione palavras-chave que descrevem o local</small>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancel-add-point">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <button type="submit" form="add-point-form" class="btn btn-primary" id="submit-add-point">
                            <i class="fas fa-plus"></i> Adicionar Ponto
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('add-point-modal');
    }

    setupEventListeners() {
        console.log('🔧 Configurando event listeners...');
        
        // Form submission
        const form = document.getElementById('add-point-form');
        if (!form) {
            console.error('❌ Formulário add-point-form não encontrado!');
            return;
        }
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        console.log('✅ Event listener do formulário configurado');

        // Modal controls
        const closeBtn = this.modal.querySelector('.modal-close');
        const cancelBtn = document.getElementById('cancel-add-point');

        // Fechar ao clicar no backdrop (fora do modal)
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                console.log('🚪 Fechando modal via backdrop');
                this.close();
            }
        });

        // Botões de fechar
        [closeBtn, cancelBtn].forEach((element, index) => {
            if (element) {
                element.addEventListener('click', () => {
                    console.log(`🚪 Fechando modal via botão ${index === 0 ? 'close' : 'cancel'}`);
                    this.close();
                });
                console.log(`✅ Event listener configurado para botão ${index === 0 ? 'close' : 'cancel'}`);
            } else {
                console.warn(`⚠️ Botão ${index === 0 ? 'close' : 'cancel'} não encontrado`);
            }
        });

        // Image preview
        const imageInput = document.getElementById('point-image');
        if (imageInput) {
            imageInput.addEventListener('input', (e) => this.previewImage(e.target.value));
            console.log('✅ Event listener para preview de imagem configurado');
        }

        // Change location button
        const changeLocationBtn = document.getElementById('change-location');
        if (changeLocationBtn) {
            changeLocationBtn.addEventListener('click', () => this.enableLocationSelection());
            console.log('✅ Event listener para mudança de localização configurado');
        }

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                console.log('🚪 Fechando modal via ESC');
                this.close();
            }
        });

        console.log('✅ Todos os event listeners configurados!');
    }

    open(options = {}) {
        if (!this.modal) return;

        // Configurar modo baseado nas opções
        this.isEditMode = options.isEditMode || false;
        this.isSuggestion = options.isSuggestion || false;
        this.originalPoint = options.originalPoint || null;
        this.onSaveCallback = options.onSave || null;

        // Reset form
        this.resetForm();
        
        // Configurar título baseado no modo
        this.updateModalTitle();
        
        // Atualizar texto do botão
        this.updateSubmitButton();
        
        // Pré-preencher dados se fornecidos
        if (options.pointData) {
            this.fillFormData(options.pointData);
        }
        
        // Show modal
        this.modal.style.display = 'block';
        document.body.classList.add('modal-open');

        // Get map reference
        this.map = window.mapManager?.map;

        // Enable location selection apenas se não for modo de sugestão
        if (!this.isSuggestion) {
            this.enableLocationSelection();
        } else {
            // Para sugestões, já temos a localização
            if (options.pointData && options.pointData.coordenadas) {
                this.selectedPosition = options.pointData.coordenadas;
                this.showSelectedCoordinates(options.pointData.coordenadas);
            }
        }

        // Focus first input
        setTimeout(() => {
            const firstInput = this.modal.querySelector('input[type="text"]');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    /**
     * Atualizar título do modal baseado no modo
     */
    updateModalTitle() {
        const titleElement = this.modal.querySelector('.modal-header h2');
        if (!titleElement) return;

        if (this.isSuggestion) {
            titleElement.innerHTML = '<i class="fas fa-edit"></i> Sugerir Alterações';
        } else if (this.isEditMode) {
            titleElement.innerHTML = '<i class="fas fa-edit"></i> Editar Ponto';
        } else {
            titleElement.innerHTML = '<i class="fas fa-map-marker-plus"></i> Adicionar Novo Ponto';
        }
    }

    /**
     * Atualizar texto do botão de submit baseado no modo
     */
    updateSubmitButton() {
        const submitBtn = document.getElementById('submit-add-point');
        if (!submitBtn) return;

        if (this.isSuggestion) {
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Sugestão';
        } else if (this.isEditMode) {
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Alterações';
        } else {
            submitBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Ponto';
        }
    }

    /**
     * Preencher formulário com dados fornecidos
     */
    fillFormData(data) {
        // Preencher campos básicos
        this.setFieldValue('point-name', data.nome);
        this.setFieldValue('point-category', data.categoria);
        this.setFieldValue('point-description', data.descricao);
        this.setFieldValue('point-address', data.endereco);
        this.setFieldValue('point-phone', data.telefone);
        this.setFieldValue('point-website', data.website);
        this.setFieldValue('point-hours', data.horario);
        this.setFieldValue('point-price', data.preco);
        this.setFieldValue('point-image', data.imagem);

        // Se tem coordenadas, marcar como selecionadas
        if (data.coordenadas && Array.isArray(data.coordenadas)) {
            this.selectedPosition = data.coordenadas;
            this.showSelectedCoordinates(data.coordenadas);
        }
    }

    /**
     * Definir valor de um campo do formulário
     */
    setFieldValue(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (field && value !== undefined && value !== null) {
            field.value = value;
        }
    }

    /**
     * Mostrar coordenadas selecionadas
     */
    showSelectedCoordinates(coords) {
        const coordsDisplay = document.getElementById('coordinates-display');
        const coordsContainer = document.querySelector('.selected-coordinates');
        const instructionsContainer = document.querySelector('.location-instructions');

        if (coordsDisplay && coordsContainer && instructionsContainer) {
            coordsDisplay.textContent = `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`;
            coordsContainer.style.display = 'block';
            instructionsContainer.style.display = 'none';
        }
    }

    close() {
        if (!this.modal) return;

        this.modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        
        // Clean up map interaction
        this.disableLocationSelection();
        this.clearTemporaryMarker();
    }

    isVisible() {
        return this.modal && this.modal.style.display === 'block';
    }

    resetForm() {
        const form = document.getElementById('add-point-form');
        form.reset();
        
        this.selectedPosition = null;
        this.updateLocationDisplay();
        this.clearImagePreview();
    }

    enableLocationSelection() {
        if (!this.map) return;

        this.showLocationInstructions();

        // Add click handler to map
        this.map.on('click', this.onMapClick.bind(this));
        this.map.getContainer().style.cursor = 'crosshair';
    }

    disableLocationSelection() {
        if (!this.map) return;

        this.map.off('click', this.onMapClick.bind(this));
        this.map.getContainer().style.cursor = '';
    }

    onMapClick(e) {
        this.selectedPosition = e.latlng;
        this.updateLocationDisplay();
        this.addTemporaryMarker(e.latlng);
        this.disableLocationSelection();
    }

    addTemporaryMarker(latlng) {
        this.clearTemporaryMarker();
        
        if (this.map) {
            this.temporaryMarker = L.marker(latlng, {
                icon: L.divIcon({
                    className: 'temporary-marker',
                    html: '<i class="fas fa-map-marker-alt"></i>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 30]
                })
            }).addTo(this.map);
        }
    }

    clearTemporaryMarker() {
        if (this.temporaryMarker && this.map) {
            this.map.removeLayer(this.temporaryMarker);
            this.temporaryMarker = null;
        }
    }

    updateLocationDisplay() {
        const instructions = document.querySelector('.location-instructions');
        const coordinates = document.querySelector('.selected-coordinates');
        const coordsDisplay = document.getElementById('coordinates-display');

        if (this.selectedPosition) {
            instructions.style.display = 'none';
            coordinates.style.display = 'flex';
            coordsDisplay.textContent = `${this.selectedPosition.lat.toFixed(6)}, ${this.selectedPosition.lng.toFixed(6)}`;
        } else {
            instructions.style.display = 'block';
            coordinates.style.display = 'none';
        }
    }

    showLocationInstructions() {
        const instructions = document.querySelector('.location-instructions');
        const coordinates = document.querySelector('.selected-coordinates');
        
        instructions.style.display = 'block';
        coordinates.style.display = 'none';
    }

    previewImage(url) {
        const preview = document.getElementById('image-preview');
        const img = document.getElementById('preview-img');

        if (url && this.isValidImageUrl(url)) {
            img.src = url;
            preview.style.display = 'block';
        } else {
            this.clearImagePreview();
        }
    }

    clearImagePreview() {
        const preview = document.getElementById('image-preview');
        preview.style.display = 'none';
    }

    isValidImageUrl(url) {
        try {
            new URL(url);
            return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
        } catch {
            return false;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        console.log('🚀 Iniciando submissão do formulário...');

        if (!this.validateForm()) {
            console.error('❌ Validação do formulário falhou');
            return;
        }

        console.log('✅ Formulário validado com sucesso');

        const pointData = this.collectFormData();
        console.log('📊 Dados coletados:', pointData);
        
        try {
            const submitBtn = document.getElementById('submit-add-point');
            if (!submitBtn) {
                throw new Error('Botão de submit não encontrado');
            }
            
            submitBtn.disabled = true;
            
            if (this.isSuggestion) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando Sugestão...';
                
                // Para sugestões, chamar callback personalizado
                if (this.onSaveCallback) {
                    this.onSaveCallback(pointData);
                    this.showSuccess('Sugestão enviada com sucesso!');
                    this.close();
                } else {
                    throw new Error('Callback de salvamento não definido para sugestão');
                }
            } else {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adicionando...';
                
                console.log('💾 Tentando salvar ponto...');
                await this.submitPoint(pointData);
                console.log('✅ Ponto salvo com sucesso');
                
                this.showSuccess('Ponto adicionado com sucesso!');
                this.close();
                
                // Refresh map if available
                if (window.mapManager) {
                    console.log('🗺️ Recarregando mapa...');
                    setTimeout(() => window.mapManager.carregarPontos(), 500);
                }
            }

        } catch (error) {
            console.error('💥 Erro ao processar formulário:', error);
            console.error('Stack trace:', error.stack);
            const errorMessage = this.isSuggestion ? 
                'Erro ao enviar sugestão. Tente novamente.' : 
                'Erro ao adicionar ponto. Tente novamente.';
            this.showError(errorMessage + ` (${error.message})`);
        } finally {
            const submitBtn = document.getElementById('submit-add-point');
            if (submitBtn) {
                submitBtn.disabled = false;
                
                // Restaurar texto do botão baseado no modo
                if (this.isSuggestion) {
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Sugestão';
                } else {
                    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Ponto';
                }
            }
        }
    }

    validateForm() {
        console.log('🔍 Validando formulário...');
        
        if (!this.selectedPosition) {
            console.error('❌ Localização não selecionada');
            this.showError('Por favor, selecione uma localização no mapa');
            return false;
        }
        console.log('✅ Localização válida:', this.selectedPosition);

        const required = ['point-name', 'point-category'];
        for (const fieldId of required) {
            const field = document.getElementById(fieldId);
            if (!field) {
                console.error(`❌ Campo ${fieldId} não encontrado no DOM`);
                this.showError(`Erro interno: Campo ${fieldId} não encontrado`);
                return false;
            }
            
            if (!field.value.trim()) {
                console.error(`❌ Campo obrigatório vazio: ${fieldId}`);
                field.focus();
                const label = field.previousElementSibling?.textContent || fieldId;
                this.showError(`Campo obrigatório: ${label}`);
                return false;
            }
            console.log(`✅ Campo ${fieldId} válido:`, field.value.trim());
        }

        console.log('✅ Formulário válido!');
        return true;
    }

    collectFormData() {
        const user = window.authManager?.getCurrentUser();
        
        return {
            nome: document.getElementById('point-name').value.trim(),
            categoria: document.getElementById('point-category').value,
            descricao: document.getElementById('point-description').value.trim(),
            endereco: document.getElementById('point-address').value.trim(),
            telefone: document.getElementById('point-phone').value.trim(),
            website: document.getElementById('point-website').value.trim(),
            instagram: document.getElementById('point-instagram').value.trim(),
            horario: document.getElementById('point-hours').value.trim(),
            imagem: document.getElementById('point-image').value.trim(),
            tags: document.getElementById('point-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            coordenadas: [this.selectedPosition.lat, this.selectedPosition.lng],
            latitude: this.selectedPosition.lat,
            longitude: this.selectedPosition.lng,
            nota: 0,
            verificado: user?.role === 'administrator',
            adicionadoPor: user?.username || user?.name || 'Usuário Anônimo'
        };
    }

    async submitPoint(pointData) {
        if (!window.databaseManager?.adicionarPonto) {
            throw new Error('Database manager não disponível');
        }

        const user = window.authManager?.getCurrentUser();
        const userRole = user?.role || 'visitor';
        const username = user?.username || null;

        const novoPonto = window.databaseManager.adicionarPonto(pointData, userRole, username);
        
        // Adicionar ao mapa se for administrador (pontos aprovados automaticamente)
        if (userRole === 'administrator' && window.mapManager?.adicionarMarcador) {
            window.mapManager.adicionarMarcador(novoPonto);
        }

        return novoPonto;
    }

    showSuccess(message) {
        if (window.infoPanelManager?.showNotification) {
            window.infoPanelManager.showNotification(message, 'success');
        } else {
            alert(message);
        }
    }

    showError(message) {
        if (window.infoPanelManager?.showNotification) {
            window.infoPanelManager.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }
}

// Inicializar globalmente
window.addPointModal = new AddPointModal();
