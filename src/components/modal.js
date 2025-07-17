/**
 * Componente de Modal
 * Sistema de modais reutilizável para formulários e confirmações
 * 
 * @author Seu Nome
 * @version 1.0.0
 */

class ModalManager {
    constructor() {
        this.modalAtivo = null;
        this.init();
    }

    /**
     * Inicializar o sistema de modais
     */
    init() {
        this.criarEstilosCSS();
        this.configurarEventListeners();
        console.log('✅ ModalManager inicializado');
    }

    /**
     * Criar estilos CSS para os modais
     */
    criarEstilosCSS() {
        if (document.querySelector('#modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .modal-overlay.show {
                opacity: 1;
            }

            .modal-content {
                background: white;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                max-width: 90vw;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.7);
                transition: transform 0.3s ease;
            }

            .modal-overlay.show .modal-content {
                transform: scale(1);
            }

            .modal-header {
                padding: 20px 25px 15px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .modal-title {
                margin: 0;
                font-size: 24px;
                color: #333;
            }

            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
            }

            .modal-close:hover {
                background: #f5f5f5;
                color: #333;
            }

            .modal-body {
                padding: 25px;
            }

            .modal-footer {
                padding: 15px 25px 25px;
                text-align: right;
                border-top: 1px solid #eee;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #333;
                font-size: 14px;
            }

            .form-label.required::after {
                content: ' *';
                color: #e74c3c;
            }

            .form-input {
                width: 100%;
                padding: 12px 15px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.2s ease;
                box-sizing: border-box;
            }

            .form-input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .form-textarea {
                min-height: 100px;
                resize: vertical;
            }

            .form-select {
                appearance: none;
                background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
                background-position: right 12px center;
                background-repeat: no-repeat;
                background-size: 16px;
                padding-right: 40px;
            }

            .form-error {
                color: #e74c3c;
                font-size: 12px;
                margin-top: 5px;
                display: none;
            }

            .form-group.error .form-input {
                border-color: #e74c3c;
            }

            .form-group.error .form-error {
                display: block;
            }

            .btn {
                padding: 12px 24px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                display: inline-block;
                text-align: center;
            }

            .btn-primary {
                background: #667eea;
                color: white;
            }

            .btn-primary:hover {
                background: #5a6fd8;
                transform: translateY(-1px);
            }

            .btn-secondary {
                background: #6c757d;
                color: white;
            }

            .btn-secondary:hover {
                background: #5a6268;
            }

            .btn-danger {
                background: #e74c3c;
                color: white;
            }

            .btn-danger:hover {
                background: #c0392b;
            }

            .coordenadas-info {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 6px;
                margin-bottom: 20px;
                border-left: 4px solid #667eea;
            }

            .tags-input {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                min-height: 45px;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 6px;
                background: white;
                cursor: text;
            }

            .tag-item {
                background: #667eea;
                color: white;
                padding: 4px 8px;
                border-radius: 15px;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .tag-remove {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 14px;
                padding: 0;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .tag-remove:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .tag-input {
                border: none;
                outline: none;
                flex: 1;
                min-width: 100px;
                padding: 8px 4px;
                font-size: 14px;
            }

            @media (max-width: 768px) {
                .modal-content {
                    margin: 20px;
                    max-width: calc(100vw - 40px);
                }

                .modal-header, .modal-body, .modal-footer {
                    padding-left: 20px;
                    padding-right: 20px;
                }

                .modal-footer {
                    flex-direction: column;
                }

                .btn {
                    width: 100%;
                    margin-bottom: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Configurar event listeners globais
     */
    configurarEventListeners() {
        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalAtivo) {
                this.fecharModal();
            }
        });

        // Event listeners customizados
        document.addEventListener('abrirModalAdicao', (e) => {
            this.abrirModalAdicaoPonto(e.detail.coordenadas);
        });

        document.addEventListener('editarPonto', (e) => {
            this.abrirModalEdicaoPonto(e.detail.id);
        });
    }

    /**
     * Criar estrutura base do modal
     * @param {string} titulo - Título do modal
     * @param {string} conteudo - Conteúdo HTML do modal
     * @param {Array} botoes - Array de botões
     * @returns {HTMLElement} Elemento do modal
     */
    criarModal(titulo, conteudo, botoes = []) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">${titulo}</h2>
                    <button class="modal-close" type="button">×</button>
                </div>
                <div class="modal-body">
                    ${conteudo}
                </div>
                ${botoes.length > 0 ? `
                    <div class="modal-footer">
                        ${botoes.map(botao => `
                            <button class="btn ${botao.classe}" type="${botao.tipo || 'button'}" id="${botao.id || ''}">
                                ${botao.texto}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        // Event listener para fechar
        overlay.querySelector('.modal-close').addEventListener('click', () => {
            this.fecharModal();
        });

        // Fechar ao clicar no overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.fecharModal();
            }
        });

        return overlay;
    }

    /**
     * Mostrar modal
     * @param {HTMLElement} modalElement - Elemento do modal
     */
    mostrarModal(modalElement) {
        if (this.modalAtivo) {
            this.fecharModal();
        }

        document.body.appendChild(modalElement);
        this.modalAtivo = modalElement;

        // Trigger animation
        requestAnimationFrame(() => {
            modalElement.classList.add('show');
        });

        // Focar no primeiro input
        const primeiroInput = modalElement.querySelector('input, select, textarea');
        if (primeiroInput) {
            setTimeout(() => primeiroInput.focus(), 100);
        }
    }

    /**
     * Fechar modal ativo
     */
    fecharModal() {
        if (!this.modalAtivo) return;

        this.modalAtivo.classList.remove('show');
        
        setTimeout(() => {
            if (this.modalAtivo && this.modalAtivo.parentNode) {
                this.modalAtivo.parentNode.removeChild(this.modalAtivo);
            }
            this.modalAtivo = null;
        }, 300);
    }

    /**
     * Abrir modal para adicionar novo ponto
     * @param {Array} coordenadas - Coordenadas [lat, lng]
     */
    abrirModalAdicaoPonto(coordenadas) {
        if (!authManager.isAdmin()) {
            alert('Apenas administradores podem adicionar pontos');
            return;
        }

        const categorias = databaseManager.obterCategorias();
        const [lat, lng] = coordenadas;

        const conteudo = `
            <form id="form-adicionar-ponto">
                <div class="coordenadas-info">
                    <strong>📍 Localização selecionada:</strong><br>
                    Latitude: ${lat.toFixed(6)}<br>
                    Longitude: ${lng.toFixed(6)}
                </div>

                <div class="form-group">
                    <label class="form-label required" for="nome">Nome do Local</label>
                    <input type="text" id="nome" class="form-input" placeholder="Ex: Restaurante Olivae" required>
                    <div class="form-error">Nome é obrigatório (mínimo 3 caracteres)</div>
                </div>

                <div class="form-group">
                    <label class="form-label required" for="categoria">Categoria</label>
                    <select id="categoria" class="form-input form-select" required>
                        <option value="">Selecione uma categoria</option>
                        ${categorias.map(cat => `
                            <option value="${cat.id}">${cat.icone} ${cat.nome}</option>
                        `).join('')}
                    </select>
                    <div class="form-error">Categoria é obrigatória</div>
                </div>

                <div class="form-group">
                    <label class="form-label required" for="endereco">Endereço</label>
                    <input type="text" id="endereco" class="form-input" placeholder="Ex: CLN 201 - Asa Norte" required>
                    <div class="form-error">Endereço é obrigatório (mínimo 10 caracteres)</div>
                </div>

                <div class="form-group">
                    <label class="form-label required" for="descricao">Descrição</label>
                    <textarea id="descricao" class="form-input form-textarea" placeholder="Descreva o local, suas características e diferenciais..." required></textarea>
                    <div class="form-error">Descrição é obrigatória (mínimo 20 caracteres)</div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="telefone">Telefone</label>
                    <input type="tel" id="telefone" class="form-input" placeholder="(61) 99999-9999">
                    <div class="form-error">Formato inválido. Use: (61) 99999-9999</div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="website">Website</label>
                    <input type="url" id="website" class="form-input" placeholder="https://exemplo.com.br">
                    <div class="form-error">URL inválida. Deve começar com http:// ou https://</div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="horario">Horário de Funcionamento</label>
                    <input type="text" id="horario" class="form-input" placeholder="Ex: Segunda a Sexta: 10h às 22h">
                </div>

                <div class="form-group">
                    <label class="form-label" for="preco">Faixa de Preço</label>
                    <input type="text" id="preco" class="form-input" placeholder="Ex: R$ 50-80 por pessoa">
                </div>

                <div class="form-group">
                    <label class="form-label" for="avaliacao">Avaliação (1-5)</label>
                    <input type="number" id="avaliacao" class="form-input" min="1" max="5" step="0.1" placeholder="4.5">
                    <div class="form-error">Avaliação deve estar entre 1 e 5</div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="tags">Tags (pressione Enter para adicionar)</label>
                    <div class="tags-input" id="tags-container">
                        <input type="text" class="tag-input" placeholder="Ex: italiano, romântico, estacionamento...">
                    </div>
                </div>

                <input type="hidden" id="latitude" value="${lat}">
                <input type="hidden" id="longitude" value="${lng}">
            </form>
        `;

        const botoes = [
            {
                texto: 'Cancelar',
                classe: 'btn-secondary',
                id: 'btn-cancelar'
            },
            {
                texto: '📍 Adicionar Ponto',
                classe: 'btn-primary',
                tipo: 'submit',
                id: 'btn-salvar'
            }
        ];

        const modal = this.criarModal('Adicionar Novo Ponto', conteudo, botoes);
        this.mostrarModal(modal);

        // Configurar funcionalidades específicas
        this.configurarFormularioAdicao(modal);
    }

    /**
     * Configurar funcionalidades do formulário de adição
     * @param {HTMLElement} modal - Elemento do modal
     */
    configurarFormularioAdicao(modal) {
        const form = modal.querySelector('#form-adicionar-ponto');
        const tagsContainer = modal.querySelector('#tags-container');
        const tagInput = tagsContainer.querySelector('.tag-input');
        const tags = [];

        // Sistema de tags
        tagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && tagInput.value.trim()) {
                e.preventDefault();
                const tag = tagInput.value.trim().toLowerCase();
                
                if (!tags.includes(tag)) {
                    tags.push(tag);
                    this.adicionarTag(tagsContainer, tag, tags);
                }
                
                tagInput.value = '';
            }
        });

        // Validação em tempo real
        form.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('blur', () => {
                this.validarCampo(input);
            });
        });

        // Envio do formulário
        modal.querySelector('#btn-salvar').addEventListener('click', (e) => {
            e.preventDefault();
            this.processarAdicaoPonto(form, tags);
        });

        modal.querySelector('#btn-cancelar').addEventListener('click', () => {
            this.fecharModal();
        });
    }

    /**
     * Adicionar tag visual
     * @param {HTMLElement} container - Container das tags
     * @param {string} tag - Texto da tag
     * @param {Array} tagsArray - Array de tags
     */
    adicionarTag(container, tag, tagsArray) {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `
            ${tag}
            <button type="button" class="tag-remove">×</button>
        `;

        tagElement.querySelector('.tag-remove').addEventListener('click', () => {
            const index = tagsArray.indexOf(tag);
            if (index > -1) {
                tagsArray.splice(index, 1);
            }
            tagElement.remove();
        });

        container.insertBefore(tagElement, container.querySelector('.tag-input'));
    }

    /**
     * Validar campo individual
     * @param {HTMLElement} input - Campo a validar
     * @returns {boolean} Se o campo é válido
     */
    validarCampo(input) {
        const group = input.closest('.form-group');
        const valor = input.value.trim();
        let valido = true;

        // Remover estado de erro anterior
        group.classList.remove('error');

        // Validações específicas
        switch (input.id) {
            case 'nome':
                valido = valor.length >= 3;
                break;
            case 'categoria':
                valido = valor !== '';
                break;
            case 'endereco':
                valido = valor.length >= 10;
                break;
            case 'descricao':
                valido = valor.length >= 20;
                break;
            case 'telefone':
                if (valor) {
                    valido = /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(valor);
                }
                break;
            case 'website':
                if (valor) {
                    try {
                        new URL(valor);
                    } catch {
                        valido = false;
                    }
                }
                break;
            case 'avaliacao':
                if (valor) {
                    const num = parseFloat(valor);
                    valido = num >= 1 && num <= 5;
                }
                break;
        }

        if (!valido) {
            group.classList.add('error');
        }

        return valido;
    }

    /**
     * Processar adição de novo ponto
     * @param {HTMLElement} form - Formulário
     * @param {Array} tags - Array de tags
     */
    async processarAdicaoPonto(form, tags) {
        const formData = new FormData(form);
        let todosValidos = true;

        // Validar todos os campos
        form.querySelectorAll('.form-input').forEach(input => {
            if (!this.validarCampo(input)) {
                todosValidos = false;
            }
        });

        if (!todosValidos) {
            alert('Por favor, corrija os campos marcados com erro.');
            return;
        }

        // Preparar dados
        const dadosPonto = {
            nome: form.nome.value.trim(),
            categoria: form.categoria.value,
            coordenadas: [
                parseFloat(form.latitude.value),
                parseFloat(form.longitude.value)
            ],
            endereco: form.endereco.value.trim(),
            descricao: form.descricao.value.trim(),
            telefone: form.telefone.value.trim(),
            website: form.website.value.trim(),
            horario: form.horario.value.trim(),
            preco: form.preco.value.trim(),
            avaliacao: form.avaliacao.value ? parseFloat(form.avaliacao.value) : 0,
            tags: tags
        };

        try {
            // Mostrar loading
            const btnSalvar = form.querySelector('#btn-salvar');
            const textoOriginal = btnSalvar.innerHTML;
            btnSalvar.innerHTML = '⏳ Salvando...';
            btnSalvar.disabled = true;

            // Salvar no banco
            const novoPonto = await databaseManager.criarPonto(dadosPonto);
            
            // Sucesso
            alert('✅ Ponto adicionado com sucesso!');
            this.fecharModal();

            // Centralizar mapa no novo ponto
            if (mapManager) {
                mapManager.centralizarEm(novoPonto.id);
            }

        } catch (error) {
            alert('❌ Erro ao adicionar ponto: ' + error.message);
            
            // Restaurar botão
            const btnSalvar = form.querySelector('#btn-salvar');
            btnSalvar.innerHTML = '📍 Adicionar Ponto';
            btnSalvar.disabled = false;
        }
    }

    /**
     * Abrir modal para editar ponto
     * @param {number} id - ID do ponto
     */
    abrirModalEdicaoPonto(id) {
        if (!authManager.isAdmin()) {
            alert('Apenas administradores podem editar pontos');
            return;
        }

        const ponto = databaseManager.obterPonto(id);
        if (!ponto) {
            alert('Ponto não encontrado');
            return;
        }

        // Implementar modal de edição similar ao de adição
        // Por simplicidade, vou redirecionar para a funcionalidade de adição
        alert('Funcionalidade de edição em desenvolvimento. Use a opção "Remover" e adicione novamente se necessário.');
    }

    /**
     * Modal de confirmação simples
     * @param {string} titulo - Título do modal
     * @param {string} mensagem - Mensagem
     * @param {Function} callback - Função a executar na confirmação
     */
    confirmar(titulo, mensagem, callback) {
        const conteudo = `<p style="font-size: 16px; line-height: 1.5;">${mensagem}</p>`;
        
        const botoes = [
            {
                texto: 'Cancelar',
                classe: 'btn-secondary',
                id: 'btn-cancelar-conf'
            },
            {
                texto: 'Confirmar',
                classe: 'btn-danger',
                id: 'btn-confirmar'
            }
        ];

        const modal = this.criarModal(titulo, conteudo, botoes);
        this.mostrarModal(modal);

        modal.querySelector('#btn-cancelar-conf').addEventListener('click', () => {
            this.fecharModal();
        });

        modal.querySelector('#btn-confirmar').addEventListener('click', () => {
            this.fecharModal();
            if (callback) callback();
        });
    }

    /**
     * Modal de alerta simples
     * @param {string} titulo - Título do modal
     * @param {string} mensagem - Mensagem
     */
    alerta(titulo, mensagem) {
        const conteudo = `<p style="font-size: 16px; line-height: 1.5;">${mensagem}</p>`;
        
        const botoes = [
            {
                texto: 'OK',
                classe: 'btn-primary',
                id: 'btn-ok'
            }
        ];

        const modal = this.criarModal(titulo, conteudo, botoes);
        this.mostrarModal(modal);

        modal.querySelector('#btn-ok').addEventListener('click', () => {
            this.fecharModal();
        });
    }
}

// Criar instância global
const modalManager = new ModalManager();

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalManager;
}

// Disponibilizar globalmente
window.ModalManager = ModalManager;
window.modalManager = modalManager;
