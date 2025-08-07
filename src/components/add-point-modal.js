/**
 * Modal para Adicionar Novos Pontos
 * Interface pa                                            <option value="gastronomia">Gastronomia</option>a usuários adicionarem pontos ao mapa
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
            <div id="add-point-modal" class="modal-backdrop" style="display:none;">
                <div class="modal modal-content large">
                    <div class="modal-header">
                        <h2><i class="fas fa-map-marker-plus"></i> Adicionar Novo Ponto</h2>
                        <button class="modal-close" type="button"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <form id="add-point-form">
                            <!-- Seleção de Localização -->
                            <div class="form-section">
                                <h3><i class="fas fa-map-marker-alt"></i> Localização</h3>
                                <div class="location-selector" id="location-selector">
                                    <div class="location-instructions" id="location-instructions">
                                        <p><i class="fas fa-info-circle"></i> Clique no mapa para selecionar a localização do ponto</p>
                                        <small>O modal se minimizará para facilitar a seleção no mapa</small>
                                    </div>
                                    <div class="selected-coordinates" style="display:none;" id="selected-coordinates">
                                        <div class="coords-info">
                                            <div class="coords-label">
                                                <i class="fas fa-check-circle"></i>
                                                Localização selecionada:
                                            </div>
                                            <div class="coords-value" id="coordinates-display"></div>
                                        </div>
                                        <div class="coords-actions">
                                            <button type="button" class="btn-map-select" id="change-location">
                                                <i class="fas fa-crosshairs"></i> Alterar
                                            </button>
                                            <button type="button" class="btn btn-link btn-sm" id="clear-location">
                                                <i class="fas fa-times"></i> Limpar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-secondary" id="select-location-btn" style="margin-top: 1rem;">
                                    <i class="fas fa-crosshairs"></i> Selecionar no Mapa
                                </button>
                            </div>

                            <!-- Informações Básicas -->
                            <div class="form-section">
                                <h3><i class="fas fa-info-circle"></i> Informações Básicas</h3>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="point-name" class="required">Nome do Local</label>
                                        <input type="text" id="point-name" class="form-input" required placeholder="Digite o nome do local">
                                    </div>
                                    <div class="form-group">
                                        <label for="point-category" class="required">Categoria</label>
                                        <select id="point-category" class="form-select" required>
                                            <option value="">Selecione uma categoria</option>
                                            <option value="geral">Geral</option>
                                            <option value="esportes-lazer">� Esportes e Lazer</option>
                                            <option value="gastronomia">�️ Gastronomia</option>
                                            <option value="geek-nerd">🎮 Geek</option>
                                            <option value="casas-noturnas">🍸 Casas Noturnas</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="point-description">Descrição</label>
                                    <textarea id="point-description" class="form-textarea" rows="3" placeholder="Descreva o local, suas características principais..."></textarea>
                                </div>
                            </div>

                            <!-- Detalhes do Local -->
                            <div class="form-section">
                                <h3><i class="fas fa-building"></i> Detalhes do Local</h3>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="point-address">Endereço</label>
                                        <input type="text" id="point-address" class="form-input" placeholder="Rua, número, bairro">
                                    </div>
                                    <div class="form-group">
                                        <label for="point-phone">Telefone</label>
                                        <input type="tel" id="point-phone" class="form-input" placeholder="(61) 99999-9999">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="point-website">Website</label>
                                        <input type="url" id="point-website" class="form-input" placeholder="https://exemplo.com">
                                    </div>
                                    <div class="form-group">
                                        <label for="point-price">Preço</label>
                                        <input type="text" id="point-price" class="form-input" placeholder="R$ 10-30 ou Gratuito">
                                    </div>
                                </div>
                            </div>

                            <!-- Horário de Funcionamento -->
                            <div class="form-section">
                                <h3><i class="fas fa-clock"></i> Horário de Funcionamento</h3>
                                <div class="form-group">
                                    <label for="point-hours">Horários</label>
                                    <textarea id="point-hours" class="form-textarea" rows="2" placeholder="Ex: Seg-Sex: 10h às 22h, Sáb-Dom: 12h às 20h"></textarea>
                                </div>
                            </div>

                            <!-- Imagem -->
                            <div class="form-section">
                                <h3><i class="fas fa-image"></i> Imagem do Local</h3>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="point-image-source">Fonte da Imagem</label>
                                        <select id="point-image-source" class="form-select">
                                            <option value="">Selecione a fonte</option>
                                            <option value="web">🌐 URL da Web</option>
                                            <option value="local">📁 Arquivo Local</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="point-image-url">URL/Caminho da Imagem</label>
                                        <input type="text" id="point-image-url" class="form-input" placeholder="Selecione a fonte primeiro">
                                        <small class="form-help" id="image-help">Selecione a fonte da imagem</small>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="point-image-description">Descrição da Imagem</label>
                                    <input type="text" id="point-image-description" class="form-input" placeholder="Breve descrição da imagem (opcional)">
                                </div>
                                <div class="image-preview" id="image-preview" style="display:none;">
                                    <img id="preview-img" src="" alt="Preview">
                                    <div class="image-info">
                                        <span class="image-source" id="preview-source"></span>
                                        <button type="button" class="btn btn-sm btn-secondary" id="remove-image">
                                            <i class="fas fa-times"></i> Remover
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Tags -->
                            <div class="form-section">
                                <h3><i class="fas fa-tags"></i> Tags</h3>
                                <div class="form-group">
                                    <label for="point-tags">Tags (separadas por vírgula)</label>
                                    <input type="text" id="point-tags" class="form-input" placeholder="Ex: música ao vivo, família, pet friendly">
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
        console.log('');
        
        // Form submission
        const form = document.getElementById('add-point-form');
        if (!form) {
            console.error('Formulário add-point-form não encontrado!');
            return;
        }
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        console.log('');

        // Modal controls
        const closeBtn = this.modal.querySelector('.modal-close');
        const cancelBtn = document.getElementById('cancel-add-point');

        // Fechar ao clicar no backdrop (fora do modal) - apenas se não estiver em modo de seleção
        this.modal.addEventListener('click', (e) => {
            // Não fechar se estiver em modo de seleção de localização
            if (this.isLocationSelectionActive) {
                console.log('');
                return;
            }
            
            // Só fechar se clicar exatamente no backdrop (modal em si)
            if (e.target === this.modal) {
                console.log('');
                this.close();
            }
        });

        // Botões de fechar
        [closeBtn, cancelBtn].forEach((element, index) => {
            if (element) {
                element.addEventListener('click', () => {
                    console.log(`Fechando modal via botao ${index === 0 ? 'close' : 'cancel'}`);
                    this.close();
                });
                console.log(`Event listener configurado para botao ${index === 0 ? 'close' : 'cancel'}`);
            } else {
                console.warn(`Botao ${index === 0 ? 'close' : 'cancel'} nao encontrado`);
            }
        });

        // Image system event listeners
        const imageSource = document.getElementById('point-image-source');
        const imageUrl = document.getElementById('point-image-url');
        const removeImageBtn = document.getElementById('remove-image');

        if (imageSource) {
            imageSource.addEventListener('change', (e) => this.handleImageSourceChange(e.target.value));
            console.log('');
        }

        if (imageUrl) {
            imageUrl.addEventListener('input', (e) => this.handleImageUrlInput(e.target.value));
            console.log('');
        }

        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', () => this.removeImagePreview());
            console.log('');
        }

        // Change location button
        const changeLocationBtn = document.getElementById('change-location');
        if (changeLocationBtn) {
            changeLocationBtn.addEventListener('click', () => this.enableLocationSelection());
            console.log('');
        }

        // Select location button
        const selectLocationBtn = document.getElementById('select-location-btn');
        if (selectLocationBtn) {
            selectLocationBtn.addEventListener('click', () => this.enableLocationSelection());
            console.log('');
        }

        // Location selector click
        const locationSelector = document.getElementById('location-selector');
        if (locationSelector) {
            locationSelector.addEventListener('click', () => {
                if (!this.selectedPosition) {
                    this.enableLocationSelection();
                }
            });
        }

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                console.log('');
                this.close();
            }
        });

        console.log('');
    }

    open(options = {}) {
        if (!this.modal) return;

        console.log('');

        // Reset form
        this.resetForm();

        // Show modal
        this.modal.style.display = 'block';
        document.body.classList.add('modal-open');

        // Get map reference
        this.map = window.mapManager?.map;
        
        if (!this.map) {
            console.warn('⚠️ Mapa não disponível para seleção de localização');
        } else {
            console.log('');
        }

        // Update location display to show instructions
        this.updateLocationDisplay();

        // Focus first input
        setTimeout(() => {
            const firstInput = this.modal.querySelector('input[type="text"]');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    close() {
        if (!this.modal) return;

        console.log('');
        this.modal.style.display = 'none';
        document.body.classList.remove('modal-open');

        // Cleanup map interaction
        this.disableLocationSelection();
        this.clearTemporaryMarker();
    }

    isVisible() {
        return this.modal && this.modal.style.display === 'block';
    }

    resetForm() {
        const form = document.getElementById('add-point-form');
        if (form) {
            form.reset();
        }
        
        this.selectedPosition = null;
        this.updateLocationDisplay();
        this.clearImagePreview();
    }

    enableLocationSelection() {
        if (!this.map) {
            console.warn('Mapa não disponível para seleção de localização');
            this.showError('Mapa não disponível. Recarregue a página.');
            return;
        }

        console.log('');
        
        // Marcar que está em modo de seleção
        this.isLocationSelectionActive = true;
        
        // Minimizar modal temporariamente
        this.minimizeModal();
        
        // Mostrar instruções
        this.showMapInstructions();
        
        // Configurar cursor e eventos do mapa
        this.mapClickHandler = this.onMapClick.bind(this);
        this.map.on('click', this.mapClickHandler);
        this.map.getContainer().style.cursor = 'crosshair';
        
        // Adicionar classe para indicar modo de seleção
        this.map.getContainer().classList.add('location-selection-mode');
        
        console.log('');
    }

    disableLocationSelection() {
        if (!this.map) return;

        console.log('🔇 Desabilitando seleção de localização...');
        
        // Marcar que não está mais em modo de seleção
        this.isLocationSelectionActive = false;
        
        // Remover eventos e cursor
        if (this.mapClickHandler) {
            this.map.off('click', this.mapClickHandler);
            this.mapClickHandler = null;
        }
        this.map.getContainer().style.cursor = '';
        this.map.getContainer().classList.remove('location-selection-mode');
        
        // Restaurar modal apenas se foi minimizado
        if (this.originalModalState) {
            this.restoreModal();
        }
        
        // Remover instruções do mapa
        this.hideMapInstructions();
        
        console.log('✅ Seleção de localização desabilitada');
    }

    minimizeModal() {
        console.log('');
        
        if (this.modal) {
            // Salvar estados originais
            this.originalModalState = {
                opacity: this.modal.style.opacity || '1',
                pointerEvents: this.modal.style.pointerEvents || 'auto',
                zIndex: this.modal.style.zIndex || '9998',
                transform: this.modal.style.transform || 'none',
                transition: this.modal.style.transition || 'none'
            };
            
            // Aplicar estilo minimizado com animação
            this.modal.style.transition = 'all 0.3s ease';
            this.modal.style.opacity = '0.1';
            this.modal.style.pointerEvents = 'none';
            this.modal.style.zIndex = '9990'; // Bem abaixo do mapa
            this.modal.style.transform = 'scale(0.7) translateY(-20px)';
            
            // Adicionar classe para CSS adicional
            this.modal.classList.add('modal-minimized');
            
            console.log('');
        } else {
            console.error('❌ Modal não encontrado para minimizar');
        }
    }

    restoreModal() {
        console.log('🔄 Restaurando modal...');
        
        if (this.modal && this.originalModalState) {
            // Restaurar estados originais
            this.modal.style.transition = 'all 0.3s ease';
            this.modal.style.opacity = this.originalModalState.opacity;
            this.modal.style.pointerEvents = this.originalModalState.pointerEvents;
            this.modal.style.zIndex = this.originalModalState.zIndex;
            this.modal.style.transform = this.originalModalState.transform;
            
            // Remover classe de minimização
            this.modal.classList.remove('modal-minimized');
            
            // Limpar transição após animação
            setTimeout(() => {
                if (this.modal) {
                    this.modal.style.transition = this.originalModalState.transition;
                }
            }, 300);
            
            // Limpar estados salvos
            this.originalModalState = null;
            
            console.log('✅ Modal restaurado com sucesso');
        } else if (!this.modal) {
            console.warn('⚠️ Modal não encontrado para restaurar');
        } else if (!this.originalModalState) {
            console.log('ℹ️ Modal não estava minimizado, nada para restaurar');
        }
    }

    showMapInstructions() {
        // Remover instruções anteriores se existirem
        this.hideMapInstructions();
        
        // Criar elemento de instruções no mapa
        const instructionsElement = document.createElement('div');
        instructionsElement.id = 'map-location-instructions';
        instructionsElement.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 1rem 2rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                text-align: center;
                backdrop-filter: blur(10px);
                border: 2px solid var(--theme-primary);
            ">
                <i class="fas fa-crosshairs" style="margin-right: 0.5rem; color: var(--theme-primary);"></i>
                <strong>Clique no mapa para selecionar a localização</strong>
                <br>
                <small style="opacity: 0.8;">Pressione ESC para cancelar</small>
            </div>
        `;
        
        document.body.appendChild(instructionsElement);
        
        // Adicionar listener para ESC
        this.escListener = (e) => {
            if (e.key === 'Escape') {
                this.disableLocationSelection();
            }
        };
        document.addEventListener('keydown', this.escListener);
    }

    hideMapInstructions() {
        const existing = document.getElementById('map-location-instructions');
        if (existing) {
            existing.remove();
        }
        
        // Remover listener do ESC
        if (this.escListener) {
            document.removeEventListener('keydown', this.escListener);
            this.escListener = null;
        }
    }

    onMapClick(e) {
        // Prevenir que o evento se propague
        e.originalEvent.stopPropagation();
        
        const { lat, lng } = e.latlng;
        console.log(`📍 Localização selecionada: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        
        // Salvar posição selecionada
        this.selectedPosition = e.latlng;
        
        // Adicionar marcador no local exato clicado
        this.addTemporaryMarker(e.latlng);
        
        // Atualizar display e campos
        this.updateLocationDisplay();
        
        // Desativar modo de seleção após um pequeno delay para mostrar o feedback
        setTimeout(() => {
            this.disableLocationSelection();
        }, 1000); // 1 segundo para ver o marcador e popup
    }

    addTemporaryMarker(latlng) {
        this.clearTemporaryMarker();
        
        if (this.map) {
            this.temporaryMarker = L.marker(latlng, {
                icon: L.divIcon({
                    className: 'temporary-marker',
                    html: '<i class="fas fa-map-pin" style="color: var(--theme-primary); font-size: 24px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);"></i>',
                    iconSize: [24, 32],
                    iconAnchor: [12, 32], // Ponto inferior do PIN
                    popupAnchor: [0, -32] // Popup acima do PIN
                })
            }).addTo(this.map);
            
            // Popup com informações da localização
            this.temporaryMarker.bindPopup(`
                <div style="text-align: center; font-size: 12px;">
                    <strong>📍 Nova Localização</strong><br>
                    <small>Lat: ${latlng.lat.toFixed(6)}<br>Lng: ${latlng.lng.toFixed(6)}</small>
                </div>
            `).openPopup();
            
            console.log('');
        }
    }

    clearLocationSelection() {
        this.selectedPosition = null;
        this.clearTemporaryMarker();
        
        // Limpar campos do formulário
        const latInput = document.getElementById('lat');
        const lngInput = document.getElementById('lng');
        
        if (latInput) {
            latInput.value = '';
            latInput.style.borderColor = '';
            latInput.style.backgroundColor = '';
        }
        if (lngInput) {
            lngInput.value = '';
            lngInput.style.borderColor = '';
            lngInput.style.backgroundColor = '';
        }
        
        // Atualizar display
        this.updateLocationDisplay();
        
        console.log('');
    }

    clearTemporaryMarker() {
        if (this.temporaryMarker && this.map) {
            this.map.removeLayer(this.temporaryMarker);
            this.temporaryMarker = null;
            console.log('');
        }
    }

    updateLocationDisplay() {
        const instructions = document.querySelector('.location-instructions');
        const coordinates = document.querySelector('.selected-coordinates');
        const coordsDisplay = document.getElementById('coordinates-display');
        const latInput = document.getElementById('lat');
        const lngInput = document.getElementById('lng');

        if (this.selectedPosition) {
            // Atualizar display visual
            if (instructions) instructions.style.display = 'none';
            if (coordinates) coordinates.style.display = 'flex';
            if (coordsDisplay) {
                coordsDisplay.textContent = `${this.selectedPosition.lat.toFixed(6)}, ${this.selectedPosition.lng.toFixed(6)}`;
            }
            
            // Preencher campos do formulário
            if (latInput) {
                latInput.value = this.selectedPosition.lat.toFixed(6);
                latInput.style.borderColor = 'var(--success)';
                latInput.style.backgroundColor = 'rgba(46, 160, 67, 0.1)';
            }
            if (lngInput) {
                lngInput.value = this.selectedPosition.lng.toFixed(6);
                lngInput.style.borderColor = 'var(--success)';
                lngInput.style.backgroundColor = 'rgba(46, 160, 67, 0.1)';
            }
            
            // Remover feedback visual após alguns segundos
            setTimeout(() => {
                if (latInput) {
                    latInput.style.borderColor = '';
                    latInput.style.backgroundColor = '';
                }
                if (lngInput) {
                    lngInput.style.borderColor = '';
                    lngInput.style.backgroundColor = '';
                }
            }, 3000);
            
            console.log('');
        } else {
            if (instructions) instructions.style.display = 'block';
            if (coordinates) coordinates.style.display = 'none';
        }
    }

    showLocationInstructions() {
        const instructions = document.querySelector('.location-instructions');
        const coordinates = document.querySelector('.selected-coordinates');
        
        if (instructions && coordinates) {
            instructions.style.display = 'block';
            coordinates.style.display = 'none';
        }
    }

    handleImageSourceChange(source) {
        const imageUrl = document.getElementById('point-image-url');
        const imageHelp = document.getElementById('image-help');
        
        if (!imageUrl || !imageHelp) return;

        switch (source) {
            case 'web':
                imageUrl.placeholder = 'https://exemplo.com/imagem.jpg';
                imageUrl.type = 'url';
                imageHelp.textContent = 'Cole aqui o link de uma imagem da web (http/https)';
                imageUrl.disabled = false;
                break;
            case 'local':
                imageUrl.placeholder = '/assets/images/minha-imagem.jpg';
                imageUrl.type = 'text';
                imageHelp.textContent = 'Digite o caminho para o arquivo no servidor (ex: /assets/images/...)';
                imageUrl.disabled = false;
                break;
            default:
                imageUrl.placeholder = 'Selecione a fonte primeiro';
                imageUrl.type = 'text';
                imageHelp.textContent = 'Selecione a fonte da imagem';
                imageUrl.disabled = true;
                imageUrl.value = '';
                this.clearImagePreview();
                break;
        }
    }

    handleImageUrlInput(url) {
        const source = document.getElementById('point-image-source').value;
        
        if (!source || !url.trim()) {
            this.clearImagePreview();
            return;
        }

        // Validar URL baseada na fonte
        let isValid = false;
        if (source === 'web') {
            isValid = this.isValidWebImageUrl(url);
        } else if (source === 'local') {
            isValid = this.isValidLocalImagePath(url);
        }

        if (isValid) {
            this.previewImageWithSource(url, source);
        } else {
            this.clearImagePreview();
        }
    }

    isValidWebImageUrl(url) {
        try {
            const parsedUrl = new URL(url);
            return (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') &&
                   /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
        } catch {
            return false;
        }
    }

    isValidLocalImagePath(path) {
        // Verificar se é um caminho válido e tem extensão de imagem
        return (path.startsWith('/') || path.startsWith('./') || path.startsWith('../') || path.startsWith('assets/')) &&
               /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(path);
    }

    previewImageWithSource(url, source) {
        const preview = document.getElementById('image-preview');
        const img = document.getElementById('preview-img');
        const sourceSpan = document.getElementById('preview-source');
        
        if (img && preview && sourceSpan) {
            img.src = url;
            img.alt = 'Preview da imagem';
            
            const sourceIcon = source === 'web' ? '🌐' : '📁';
            const sourceText = source === 'web' ? 'Web' : 'Local';
            sourceSpan.innerHTML = `${sourceIcon} ${sourceText}`;
            
            preview.style.display = 'block';
            
            // Tratamento de erro de carregamento
            img.onerror = () => {
                console.warn(`Erro ao carregar imagem: ${url}`);
                this.clearImagePreview();
            };
        }
    }

    removeImagePreview() {
        document.getElementById('point-image-source').value = '';
        document.getElementById('point-image-url').value = '';
        document.getElementById('point-image-description').value = '';
        this.handleImageSourceChange(''); // Reset dos campos
        this.clearImagePreview();
    }

    clearImagePreview() {
        const preview = document.getElementById('image-preview');
        if (preview) {
            preview.style.display = 'none';
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        console.log('');

        if (!this.validateForm()) {
            console.error('Validacao do formulario falhou');
            return;
        }

        console.log('');
        const pointData = this.collectFormData();
        console.log('Dados coletados:', pointData);

        try {
            const submitBtn = document.getElementById('submit-add-point');
            if (!submitBtn) {
                throw new Error('Botão de submit não encontrado');
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adicionando...';

            console.log('');
            await this.submitPoint(pointData);
            console.log('');

            this.showSuccess('Ponto adicionado com sucesso!');
            this.close();

            // Refresh map if available
            if (window.mapManager && typeof window.mapManager.recarregarMarcadores === 'function') {
                console.log('🔄 Recarregando marcadores do mapa...');
                setTimeout(() => window.mapManager.recarregarMarcadores(), 500);
            } else {
                console.warn('⚠️ MapManager não disponível para atualizar marcadores');
            }

        } catch (error) {
            console.error('💥 Erro ao processar formulário:', error);
            console.error('📚 Stack trace:', error.stack);
            
            const errorMessage = 'Erro ao adicionar ponto. Tente novamente.';
            this.showError(errorMessage + ` (${error.message})`);
        } finally {
            const submitBtn = document.getElementById('submit-add-point');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Ponto';
            }
        }
    }

    validateForm() {
        console.log('🔍 Validando formulário...');

        // Verificar se uma localização foi selecionada
        if (!this.selectedPosition) {
            console.error('❌ Localização não selecionada');
            this.showError('Por favor, selecione uma localização no mapa');
            return false;
        }
        console.log('✅ Localização válida:', this.selectedPosition);

        // Validar campos obrigatórios
        const required = [
            { id: 'point-name', label: 'Nome do Local' },
            { id: 'point-category', label: 'Categoria' }
        ];

        for (const field of required) {
            const element = document.getElementById(field.id);
            if (!element) {
                console.error(`❌ Campo ${field.id} não encontrado no DOM`);
                this.showError(`Erro interno: Campo ${field.label} não encontrado`);
                return false;
            }

            const value = element.value ? element.value.trim() : '';
            if (!value) {
                console.error(`❌ Campo obrigatório vazio: ${field.id}`);
                element.focus();
                this.showError(`Campo obrigatório: ${field.label}`);
                return false;
            }
            console.log(`✅ Campo ${field.id} válido:`, value);
        }

        // Validar coordenadas
        if (!this.selectedPosition.lat || !this.selectedPosition.lng) {
            console.error('❌ Coordenadas inválidas');
            this.showError('Coordenadas inválidas. Selecione novamente a localização.');
            return false;
        }

        console.log('✅ Formulário válido');
        return true;
    }

    collectFormData() {
        console.log('📝 Coletando dados do formulário...');
        
        try {
            // Verificar usuário atual
            const user = window.authManager?.getCurrentUser();
            console.log('👤 Usuário atual:', user);

            // Verificar se uma localização foi selecionada
            if (!this.selectedPosition) {
                console.error('❌ Nenhuma localização selecionada');
                throw new Error('Localização não selecionada');
            }
            console.log('📍 Localização selecionada:', this.selectedPosition);

            // Coletar e validar dados básicos
            const nameElement = document.getElementById('point-name');
            const categoryElement = document.getElementById('point-category');
            
            if (!nameElement || !categoryElement) {
                throw new Error('Campos essenciais não encontrados no formulário');
            }

            const nome = nameElement.value ? nameElement.value.trim() : '';
            const categoria = categoryElement.value ? categoryElement.value.trim() : '';
            
            if (!nome || !categoria) {
                throw new Error('Nome e categoria são obrigatórios');
            }

            console.log('📝 Dados básicos válidos:', { nome, categoria });

            // Coletar dados opcionais (com fallbacks seguros)
            const descricaoElement = document.getElementById('point-description');
            const enderecoElement = document.getElementById('point-address');
            const telefoneElement = document.getElementById('point-phone');
            const websiteElement = document.getElementById('point-website');
            const horarioElement = document.getElementById('point-hours');
            const precoElement = document.getElementById('point-price');
            const tagsElement = document.getElementById('point-tags');

            const descricao = descricaoElement ? descricaoElement.value.trim() : '';
            const endereco = enderecoElement ? enderecoElement.value.trim() : '';
            const telefone = telefoneElement ? telefoneElement.value.trim() : '';
            const website = websiteElement ? websiteElement.value.trim() : '';
            const horario = horarioElement ? horarioElement.value.trim() || 'Não informado' : 'Não informado';
            const preco = precoElement ? precoElement.value.trim() || 'Não informado' : 'Não informado';
            const tags = tagsElement ? tagsElement.value.trim() : '';

            // Coletar dados da imagem
            const imageSourceElement = document.getElementById('point-image-source');
            const imageUrlElement = document.getElementById('point-image-url');
            const imageDescriptionElement = document.getElementById('point-image-description');

            const imageSource = imageSourceElement ? imageSourceElement.value : '';
            const imageUrl = imageUrlElement ? imageUrlElement.value.trim() : '';
            const imageDescription = imageDescriptionElement ? imageDescriptionElement.value.trim() : '';

            // Criar objeto de imagem se há dados suficientes
            let imageData = null;
            if (imageSource && imageUrl) {
                imageData = {
                    url: imageUrl,
                    source: imageSource,
                    description: imageDescription || null
                };
                console.log('🖼️ Dados da imagem:', imageData);
            }

            // Processar tags
            const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
            console.log('🏷️ Tags processadas:', tagsArray);

            // Gerar ID único baseado no timestamp
            const id = Date.now();

            const pointData = {
                id: id,
                nome: nome,
                categoria: categoria,
                coordenadas: [this.selectedPosition.lat, this.selectedPosition.lng],
                descricao: descricao || 'Sem descrição',
                endereco: endereco,
                telefone: telefone,
                website: website,
                horario: horario,
                preco: preco,
                avaliacao: 0,
                tags: tagsArray,
                ativo: true,
                dataCriacao: new Date().toISOString(),
                imagem: imageData,
                adicionadoPor: user?.username || user?.name || 'Usuário Anônimo',
                userRole: user?.role || 'user'
            };

            console.log('✅ Dados coletados com sucesso:', pointData);
            return pointData;

        } catch (error) {
            console.error('❌ Erro ao coletar dados do formulário:', error);
            throw error;
        }
    }

    async submitPoint(pointData) {
        console.log('📤 Salvando ponto no banco de dados...', pointData);
        
        try {
            // Verificar se o database manager está disponível
            if (!window.databaseManager) {
                throw new Error('Sistema de banco de dados não disponível');
            }

            if (typeof window.databaseManager.adicionarPonto !== 'function') {
                throw new Error('Função de adicionar ponto não disponível');
            }

            // Obter informações do usuário
            const user = window.authManager?.getCurrentUser();
            const userRole = user?.role || 'user';
            const username = user?.username || user?.name || null;

            console.log('👤 Contexto do usuário:', { userRole, username });

            // Validar dados essenciais antes de submeter
            if (!pointData.nome || !pointData.categoria || !pointData.coordenadas) {
                throw new Error('Dados essenciais do ponto estão faltando');
            }

            if (!Array.isArray(pointData.coordenadas) || pointData.coordenadas.length !== 2) {
                throw new Error('Coordenadas inválidas');
            }

            // Tentar adicionar o ponto
            const novoPonto = await window.databaseManager.adicionarPonto(pointData, userRole, username);
            console.log('✅ Ponto adicionado com sucesso:', novoPonto);
            
            // Força refresh dos dados para garantir sincronização
            await this.forceDataRefresh();
            
            return novoPonto;

        } catch (error) {
            console.error('❌ Erro ao adicionar ponto:', error);
            console.error('📚 Stack trace:', error.stack);
            
            // Re-throw com mensagem mais clara
            throw new Error(`Falha ao salvar ponto: ${error.message}`);
        }
    }

    async forceDataRefresh() {
        try {
            console.log('');
            
            // Recarregar dados do localStorage
            const pendingData = localStorage.getItem('sig_entretenimento_pontosPendentes');
            const confirmedData = localStorage.getItem('sig_entretenimento_pontosConfirmados');
            
            if (pendingData) {
                console.log('📊 Pontos pendentes no localStorage:', JSON.parse(pendingData).length);
            }
            
            if (confirmedData) {
                console.log('📊 Pontos confirmados no localStorage:', JSON.parse(confirmedData).length);
            }
            
            // Trigger refresh do mapa se disponível
            if (window.mapManager?.recarregarMarcadores) {
                setTimeout(() => {
                    window.mapManager.recarregarMarcadores();
                    console.log('🔄 Marcadores do mapa atualizados');
                }, 500);
            } else {
                console.warn('⚠️ Função recarregarMarcadores não disponível');
            }
            
        } catch (error) {
            console.warn('⚠️ Erro ao fazer refresh dos dados:', error);
        }
    }

    showSuccess(message) {
        console.log(message);
        
        if (window.infoPanelManager?.showNotification) {
            window.infoPanelManager.showNotification(message, 'success');
        } else {
            alert(message);
        }
    }

    showError(message) {
        console.error(message);
        
        if (window.infoPanelManager?.showNotification) {
            window.infoPanelManager.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }
}

// Inicializar globalmente
window.addPointModal = new AddPointModal();
