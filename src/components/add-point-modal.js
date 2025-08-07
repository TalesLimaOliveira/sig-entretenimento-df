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
                                <div class="location-selector">
                                    <div class="location-instructions">
                                        <p><i class="fas fa-info-circle"></i> Clique no mapa para selecionar a localização do ponto</p>
                                    </div>
                                    <div class="selected-coordinates" style="display:none;">
                                        <i class="fas fa-check-circle"></i>
                                        <span>Localização selecionada:</span>
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
                                        <input type="text" id="point-name" class="form-input" required placeholder="Digite o nome do local">
                                    </div>
                                    <div class="form-group">
                                        <label for="point-category" class="required">Categoria</label>
                                        <select id="point-category" class="form-select" required>
                                            <option value="">Selecione uma categoria</option>
                                            <option value="geral">📍 Geral</option>
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
    setupEventListeners() {
        console.log('⚙️ Configurando event listeners...');
        
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

        // Image system event listeners
        const imageSource = document.getElementById('point-image-source');
        const imageUrl = document.getElementById('point-image-url');
        const removeImageBtn = document.getElementById('remove-image');

        if (imageSource) {
            imageSource.addEventListener('change', (e) => this.handleImageSourceChange(e.target.value));
            console.log('✅ Event listener para fonte de imagem configurado');
        }

        if (imageUrl) {
            imageUrl.addEventListener('input', (e) => this.handleImageUrlInput(e.target.value));
            console.log('✅ Event listener para URL de imagem configurado');
        }

        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', () => this.removeImagePreview());
            console.log('✅ Event listener para remover imagem configurado');
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

        console.log('🚀 Abrindo modal de adicionar ponto');

        // Reset form
        this.resetForm();

        // Show modal
        this.modal.style.display = 'block';
        document.body.classList.add('modal-open');

        // Get map reference
        this.map = window.mapManager?.map;

        // Enable location selection
        this.enableLocationSelection();

        // Focus first input
        setTimeout(() => {
            const firstInput = this.modal.querySelector('input[type="text"]');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    close() {
        if (!this.modal) return;

        console.log('🚪 Fechando modal de adicionar ponto');
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
            console.warn('⚠️ Mapa não disponível para seleção de localização');
            return;
        }

        this.showLocationInstructions();
        
        // Add click handler to map
        this.map.on('click', this.onMapClick.bind(this));
        this.map.getContainer().style.cursor = 'crosshair';
        
        console.log('🎯 Modo de seleção de localização ativado');
    }

    disableLocationSelection() {
        if (!this.map) return;

        this.map.off('click', this.onMapClick.bind(this));
        this.map.getContainer().style.cursor = '';
        
        console.log('🎯 Modo de seleção de localização desativado');
    }

    onMapClick(e) {
        console.log('📍 Localização selecionada:', e.latlng);
        
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
            
            console.log('📌 Marcador temporário adicionado');
        }
    }

    clearTemporaryMarker() {
        if (this.temporaryMarker && this.map) {
            this.map.removeLayer(this.temporaryMarker);
            this.temporaryMarker = null;
            console.log('🗑️ Marcador temporário removido');
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
                console.warn(`⚠️ Erro ao carregar imagem: ${url}`);
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
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adicionando...';

            console.log('💾 Tentando salvar ponto...');
            await this.submitPoint(pointData);
            console.log('✅ Ponto salvo com sucesso');

            this.showSuccess('Ponto adicionado com sucesso!');
            this.close();

            // Refresh map if available
            if (window.mapManager) {
                console.log('🔄 Recarregando mapa...');
                setTimeout(() => window.mapManager.carregarPontos(), 500);
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

        // Coletar dados da imagem
        const imageSource = document.getElementById('point-image-source')?.value;
        const imageUrl = document.getElementById('point-image-url')?.value?.trim();
        const imageDescription = document.getElementById('point-image-description')?.value?.trim();

        // Criar objeto de imagem se há dados suficientes
        let imageData = null;
        if (imageSource && imageUrl) {
            imageData = {
                url: imageUrl,
                source: imageSource,
                description: imageDescription || null
            };
        }

        // Gerar ID único baseado no timestamp
        const id = Date.now();

        return {
            id: id,
            nome: document.getElementById('point-name').value.trim(),
            categoria: document.getElementById('point-category').value,
            coordenadas: [this.selectedPosition.lat, this.selectedPosition.lng],
            descricao: document.getElementById('point-description').value.trim() || 'Sem descrição',
            endereco: document.getElementById('point-address').value.trim() || '',
            telefone: document.getElementById('point-phone').value.trim() || '',
            website: document.getElementById('point-website').value.trim() || '',
            horario: document.getElementById('point-hours').value.trim() || 'Não informado',
            preco: document.getElementById('point-price').value.trim() || 'Não informado',
            avaliacao: 0,
            tags: document.getElementById('point-tags').value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag),
            ativo: true,
            dataCriacao: new Date().toISOString(),
            imagem: imageData,
            adicionadoPor: user?.username || user?.name || 'Usuário Anônimo',
            userRole: user?.role || 'user'
        };
    }

    async submitPoint(pointData) {
        console.log('💾 Salvando ponto no banco de dados...');
        
        if (!window.databaseManager?.adicionarPonto) {
            throw new Error('Database manager não disponível');
        }

        const user = window.authManager?.getCurrentUser();
        const userRole = user?.role || 'user';
        const username = user?.username || null;

        console.log('👤 Usuário:', { userRole, username });

        const novoPonto = await window.databaseManager.adicionarPonto(pointData, userRole, username);
        
        console.log('✅ Ponto adicionado:', novoPonto);
        return novoPonto;
    }

    showSuccess(message) {
        console.log('✅', message);
        
        if (window.infoPanelManager?.showNotification) {
            window.infoPanelManager.showNotification(message, 'success');
        } else {
            alert(message);
        }
    }

    showError(message) {
        console.error('❌', message);
        
        if (window.infoPanelManager?.showNotification) {
            window.infoPanelManager.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }
}

// Inicializar globalmente
window.addPointModal = new AddPointModal();