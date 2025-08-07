/**
 * Database Manager - Sistema de Banco de Dados com Controle de Acesso
 * 
 * @author Tales Oliveira (github.com/TalesLimaOliveira)
 * @version 1.0.0
 * @note Este arquivo contém trechos de código gerados com auxílio de Inteligência Artificial.
 */

class DatabaseManager {
    constructor() {
        this.confirmedPoints = [];
        this.pendingPoints = [];
        this.hiddenPoints = [];
        this.usuarios = {};
        this.categorias = [];
        this.proximoId = 1;
        this.baseStorageKey = 'pontosEntretenimento';
        this.databasePath = 'database/';
        // init() será chamado explicitamente pelo app.js
    }

    async init() {
        try {
            console.log('');
            console.log(`Protocolo atual: ${window.location.protocol}`);
            
            await this.loadCategories();
            console.log('');
            
            await this.loadAllData();
            console.log('');
            
            this.migrateOldData();
            console.log('');
            
            this.migrateAlternativeCategory();
            console.log('');
            
            // Verificação final - garantir que há dados
            if (this.confirmedPoints.length === 0) {
                console.warn('Nenhum ponto confirmado após carregamento, forçando dados padrão...');
                this.confirmedPoints = this.getConfirmedPointsDefault();
                this.saveAllData();
            }
            
            if (this.categorias.length === 0) {
                console.warn('Nenhuma categoria após carregamento, forçando categorias padrão...');
                this.categorias = this.getCategoriesDefault();
                this.saveCategories();
            }
            
            console.log(`Estado final: ${this.confirmedPoints.length} pontos confirmados, ${this.categorias.length} categorias`);
            console.log('');
            
            return true;
        } catch (error) {
            console.error('Erro crítico ao inicializar DatabaseManager:', error);
            this.initializeDefaultData();
            return false;
        }
    }

    /**
     * Load all data from JSON files
     */
    async loadAllData() {
        try {
            console.log('');
            
            // Primeiro, tentar carregar dos arquivos JSON (prioridade)
            let dadosCarregadosJSON = false;
            
            try {
                console.log('');
                
                // Carregar pontos confirmados
                const confirmedPointsData = await this.loadJsonFile('./database/pontos_confirmados.json');
                if (confirmedPointsData && Array.isArray(confirmedPointsData) && confirmedPointsData.length > 0) {
                    // Normalizar dados para compatibilidade
                    this.confirmedPoints = confirmedPointsData.map(ponto => ({
                        ...ponto,
                        nota: ponto.nota || ponto.avaliacao || 0,
                        verificado: ponto.verificado !== false,
                        status: ponto.status || 'confirmado'
                    }));
                    dadosCarregadosJSON = true;
                    console.log(`${confirmedPointsData.length} pontos confirmados carregados do JSON`);
                }

                // Carregar pontos pendentes
                const pendingPointsData = await this.loadJsonFile('./database/pontos_pendentes.json');
                if (pendingPointsData && Array.isArray(pendingPointsData)) {
                    this.pendingPoints = pendingPointsData;
                    console.log(`${pendingPointsData.length} pontos pendentes carregados do JSON`);
                }

                // Carregar pontos ocultos
                const hiddenPointsData = await this.loadJsonFile('./database/pontos_ocultos.json');
                if (hiddenPointsData && Array.isArray(hiddenPointsData)) {
                    this.hiddenPoints = hiddenPointsData;
                    console.log(`${hiddenPointsData.length} pontos ocultos carregados do JSON`);
                }

                // Carregar usuários
                const usuarios = await this.loadJsonFile('./database/usuarios.json');
                if (usuarios && Array.isArray(usuarios)) {
                    this.usuarios = usuarios.reduce((acc, user) => {
                        acc[user.username] = user;
                        return acc;
                    }, {});
                    console.log(`${usuarios.length} usuários carregados do JSON`);
                }

            } catch (error) {
                console.warn('Error loading from JSON files:', error);
            }
            
            // If couldn't load from JSON, try localStorage
            if (!dadosCarregadosJSON) {
                console.log('');
                
                const confirmedPoints = localStorage.getItem(this.baseStorageKey + '_pontosConfirmados');
                const pendingPoints = localStorage.getItem(this.baseStorageKey + '_pontosPendentes');
                const hiddenPoints = localStorage.getItem(this.baseStorageKey + '_pontosOcultos');
                const usuarios = localStorage.getItem(this.baseStorageKey + '_usuarios');

                if (confirmedPoints) {
                    this.confirmedPoints = JSON.parse(confirmedPoints);
                    console.log(`${this.confirmedPoints.length} pontos confirmados carregados do localStorage`);
                    dadosCarregadosJSON = true;
                }
                if (pendingPoints) {
                    this.pendingPoints = JSON.parse(pendingPoints);
                }
                if (hiddenPoints) {
                    this.hiddenPoints = JSON.parse(hiddenPoints);
                }
                if (usuarios) {
                    this.usuarios = JSON.parse(usuarios);
                }
            }

            // Se ainda não há pontos, usar dados padrão
            if (!dadosCarregadosJSON || this.confirmedPoints.length === 0) {
                console.log('');
                this.inicializarPontosDefault();
            }

            // Salvar dados carregados no localStorage para cache
            if (this.confirmedPoints.length > 0) {
                this.saveAllData();
                console.log('');
            }

            // Calcular próximo ID
            const todosOsPontos = [...this.confirmedPoints, ...this.pendingPoints, ...this.hiddenPoints];
            this.proximoId = todosOsPontos.length > 0 ? Math.max(...todosOsPontos.map(p => parseInt(p.id) || 0)) + 1 : 1;

            console.log(`Total final: ${this.confirmedPoints.length} confirmados, ${this.pendingPoints.length} pendentes, ${this.hiddenPoints.length} ocultos`);

        } catch (error) {
            console.error('Critical error loading data:', error);
            this.initializeDefaultData();
        }
    }

    /**
     * UNIFIED: Load JSON file - same behavior for both file:// and http://
     * No more protocol-specific logic, always try to load actual files
     * @param {string} url - URL do arquivo JSON
     * @returns {Promise<Object>} - Dados JSON carregados
     */
    async loadJsonFile(url) {
        console.log(`Loading: ${url} (Protocol: ${window.location.protocol})`);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`Successfully loaded ${url}:`, Array.isArray(data) ? `${data.length} items` : 'data object');
            return data;

        } catch (error) {
            console.warn(`Failed to load ${url}:`, error.message);
            
            // Fallback to default data only if fetch completely fails
            if (url.includes('categorias.json')) {
                console.log('');
                return this.getCategoriesDefault();
            } else if (url.includes('pontos_confirmados.json')) {
                console.log('');
                return this.getConfirmedPointsDefault();
            } else if (url.includes('pontos_ocultos.json')) {
                console.log('');
                return this.getHiddenPointsDefault();
            } else if (url.includes('usuarios.json')) {
                console.log('');
                return this.getUsersDefault();
            } else {
                console.log('');
                return [];
            }
        }
    }

    /**
     * Carrega dados do arquivo db.json principal (versão assíncrona)
     */
    async carregarDoPrincipalDbAsync() {
        try {
            const data = await this.loadJsonFile('./db.json');
            
            if (data.pontos && Array.isArray(data.pontos)) {
                // Converter pontos do db.json para formato esperado
                const pontosConvertidos = data.pontos
                    .filter(ponto => ponto.ativo !== false)
                    .map(ponto => ({
                        id: ponto.id,
                        nome: ponto.nome,
                        descricao: ponto.descricao,
                        categoria: ponto.categoria,
                        coordenadas: ponto.coordenadas,
                        endereco: ponto.endereco,
                        telefone: ponto.telefone,
                        website: ponto.website,
                        horario: ponto.horario,
                        preco: ponto.preco,
                        nota: ponto.avaliacao || ponto.nota || 0,
                        verificado: true,
                        status: 'confirmado',
                        dataAdicao: ponto.dataCriacao || new Date().toISOString()
                    }));

                this.confirmedPoints = pontosConvertidos;
                this.saveAllData();
                
                console.log(`${pontosConvertidos.length} pontos carregados do db.json`);
            }
        } catch (error) {
            console.error('Erro ao carregar db.json:', error);
            // Não lançar erro, deixar que seja usado o fallback
        }
    }

    /**
     * Migrate old data to new structure
     */
    migrateOldData() {
        const oldPoints = localStorage.getItem(this.baseStorageKey + '_pontos');
        if (oldPoints && this.confirmedPoints.length === 0) {
            console.log('');
            const pontos = JSON.parse(oldPoints);
            
            pontos.forEach(ponto => {
                // Pontos verificados vão para confirmados, não verificados para pendentes
                if (ponto.verificado) {
                    this.confirmedPoints.push({...ponto, status: 'confirmado'});
                } else {
                    this.pendingPoints.push({...ponto, status: 'pendente'});
                }
            });
            
            this.saveAllData();
            console.log('');
        }
    }

    /**
     * Migrate points from "alternative" category to "general"
     */
    migrateAlternativeCategory() {
        let changes = 0;
        
        // Migrar pontos confirmados
        this.confirmedPoints.forEach(ponto => {
            if (ponto.categoria === 'alternativo') {
                ponto.categoria = 'geral';
                changes++;
            }
        });
        
        // Migrar pontos pendentes
        this.pendingPoints.forEach(ponto => {
            if (ponto.categoria === 'alternativo') {
                ponto.categoria = 'geral';
                changes++;
            }
        });
        
        // Migrar pontos ocultos
        this.hiddenPoints.forEach(ponto => {
            if (ponto.categoria === 'alternativo') {
                ponto.categoria = 'geral';
                changes++;
            }
        });
        
        if (changes > 0) {
            this.saveAllData();
            console.log(`${changes} points migrated from 'alternativo' to 'geral' category`);
        }
        
        // Remover categoria "alternativo" das categorias salvas
        this.categorias = this.categorias.filter(cat => cat.id !== 'alternativo');
        this.saveCategories();
    }

    async loadCategories() {
        try {
            // Limpar cache primeiro para forçar atualização
            localStorage.removeItem(this.baseStorageKey + '_categorias');
            
            // Tentar carregar usando a função compatível
            const categorias = await this.loadJsonFile('./database/categorias.json');
            this.categorias = categorias;
            console.log('Categorias carregadas do JSON:', categorias.length);
            
            // Salvar no localStorage
            this.saveCategories();
            
            // Disparar evento para atualizar marcadores
            document.dispatchEvent(new CustomEvent('database_categoriasCarregadas', {
                detail: { categorias: this.categorias }
            }));
            return;
        } catch (error) {
            console.warn('Erro ao carregar categorias do JSON:', error);
        }

        // Fallback: tentar carregar do localStorage
        const saved = localStorage.getItem(this.baseStorageKey + '_categorias');
        if (saved) {
            this.categorias = JSON.parse(saved);
            console.log('');
            
            // Verificar se precisa atualizar cores
            const geralCategory = this.categorias.find(c => c.id === 'geral');
            if (geralCategory && geralCategory.cor !== '#b8860b') {
                console.log('');
                geralCategory.cor = '#b8860b';
                this.saveCategories();
            }
            
            // Disparar evento para atualizar marcadores
            document.dispatchEvent(new CustomEvent('database_categoriasCarregadas', {
                detail: { categorias: this.categorias }
            }));
        } else {
            // Fallback final: categorias padrão com cor atualizada
            this.categorias = this.getCategoriesDefault();
            this.saveCategories();
            console.log('');
            
            // Disparar evento para atualizar marcadores
            document.dispatchEvent(new CustomEvent('database_categoriasCarregadas', {
                detail: { categorias: this.categorias }
            }));
        }
    }

    /**
     * Salva todos os dados no localStorage e tenta salvar nos arquivos JSON
     */
    saveAllData() {
        console.log('');
        
        // Salvar no localStorage (backup local)
        localStorage.setItem(this.baseStorageKey + '_pontosConfirmados', JSON.stringify(this.confirmedPoints));
        localStorage.setItem(this.baseStorageKey + '_pontosPendentes', JSON.stringify(this.pendingPoints));
        localStorage.setItem(this.baseStorageKey + '_pontosOcultos', JSON.stringify(this.hiddenPoints));
        localStorage.setItem(this.baseStorageKey + '_usuarios', JSON.stringify(this.usuarios));
        
        console.log('');
    }

    /**
     * Salva os dados diretamente nos arquivos JSON da pasta database/
     * Modifica os arquivos existentes adicionando novos registros
     */
    async saveToJsonFiles() {
        try {
            console.log('');
            
            // Focar apenas nos pontos pendentes para este caso de uso
            await this.savePointsToFile();
            
            // Salvar backup no localStorage
            this.saveAllDataToLocalStorage();
            
            console.log('');
            
        } catch (error) {
            console.error('❌ Erro ao salvar arquivos JSON:', error);
            throw error;
        }
    }

    /**
     * Salva pontos diretamente no arquivo pontos_pendentes.json
     */
    async savePointsToFile() {
        try {
            // Ler arquivo atual
            const currentFile = await this.readCurrentFile('database/pontos_pendentes.json');
            
            // Combinar dados existentes com novos
            const updatedData = this.mergeWithExistingData(currentFile, this.pendingPoints);
            
            // Escrever arquivo atualizado
            await this.writeToFile('database/pontos_pendentes.json', updatedData);
            
            console.log(`📁 pontos_pendentes.json atualizado com ${this.pendingPoints.length} pontos`);
            
        } catch (error) {
            console.error('❌ Erro ao salvar pontos pendentes:', error);
            throw error;
        }
    }

    /**
     * Lê o arquivo atual
     */
    async readCurrentFile(filePath) {
        try {
            const response = await fetch(filePath);
            if (response.ok) {
                const data = await response.json();
                return Array.isArray(data) ? data : [];
            } else {
                console.log(`📄 Arquivo ${filePath} não encontrado, criando novo`);
                return [];
            }
        } catch (error) {
            console.log(`📄 Erro ao ler ${filePath}, usando array vazio:`, error.message);
            return [];
        }
    }

    /**
     * Combina dados existentes com novos, evitando duplicatas
     */
    mergeWithExistingData(existingData, newData) {
        const combined = [...existingData];
        
        for (const newPoint of newData) {
            // Verificar se o ponto já existe (por ID ou coordenadas similares)
            const exists = combined.find(existing => 
                existing.id === newPoint.id || 
                (Math.abs(existing.coordenadas[0] - newPoint.coordenadas[0]) < 0.0001 &&
                 Math.abs(existing.coordenadas[1] - newPoint.coordenadas[1]) < 0.0001)
            );
            
            if (!exists) {
                combined.push(newPoint);
                console.log(`➕ Novo ponto adicionado: ${newPoint.nome}`);
            } else {
                console.log(`⚠️ Ponto já existe: ${newPoint.nome}`);
            }
        }
        
        return combined;
    }

    /**
     * Escreve dados no arquivo usando diferentes métodos
     */
    async writeToFile(filePath, data) {
        const jsonString = JSON.stringify(data, null, 2);
        
        try {
            // Método 1: Tentar usar fetch com PUT (se servidor suportar)
            await this.tryServerWrite(filePath, jsonString);
        } catch (error) {
            console.log('');
            
            // Método 2: Criar arquivo temporário para download manual
            await this.createTemporaryFile(filePath, jsonString);
            
            // Método 3: Instruções para usuário
            this.showFileUpdateInstructions(filePath, data.length);
        }
    }

    /**
     * Tenta escrever no servidor
     */
    async tryServerWrite(filePath, content) {
        const response = await fetch(filePath, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: content
        });
        
        if (!response.ok) {
            throw new Error(`Servidor retornou ${response.status}`);
        }
        
        console.log(`✅ Arquivo ${filePath} atualizado no servidor`);
    }

    /**
     * Cria arquivo temporário visível para o usuário
     */
    async createTemporaryFile(filePath, content) {
        // Salvar no localStorage com chave especial
        const fileName = filePath.split('/').pop();
        const storageKey = `temp_file_${fileName}`;
        localStorage.setItem(storageKey, content);
        
        // Exibir no console para facilitar cópia
        console.log(`📋 Conteúdo atualizado para ${fileName}:`);
        console.log(content);
        
        // Criar elemento temporário na página para facilitar acesso
        this.createFileDisplayElement(fileName, content);
    }

    /**
     * Cria elemento na página mostrando o conteúdo do arquivo
     */
    createFileDisplayElement(fileName, content) {
        // Remover elemento anterior se existir
        const existing = document.getElementById('temp-file-display');
        if (existing) {
            existing.remove();
        }
        
        // Criar novo elemento
        const element = document.createElement('div');
        element.id = 'temp-file-display';
        element.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            max-height: 200px;
            background: var(--bg-secondary);
            border: 2px solid var(--theme-primary);
            border-radius: 8px;
            padding: 10px;
            z-index: 10000;
            overflow-y: auto;
            font-family: monospace;
            font-size: 11px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        element.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong style="color: var(--theme-primary);">� ${fileName}</strong>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: var(--error); 
                    color: white; 
                    border: none; 
                    border-radius: 4px; 
                    padding: 2px 6px; 
                    cursor: pointer;
                ">✕</button>
            </div>
            <div style="font-size: 10px; margin-bottom: 8px; color: var(--text-muted);">
                Copie este conteúdo para o arquivo ${fileName}
            </div>
            <textarea readonly style="
                width: 100%; 
                height: 120px; 
                background: var(--bg-primary); 
                color: var(--text-primary); 
                border: 1px solid var(--border); 
                border-radius: 4px; 
                padding: 4px; 
                font-family: monospace; 
                font-size: 10px;
                resize: none;
            ">${content}</textarea>
            <button onclick="navigator.clipboard.writeText(this.previousElementSibling.value)" style="
                background: var(--theme-primary); 
                color: white; 
                border: none; 
                border-radius: 4px; 
                padding: 4px 8px; 
                margin-top: 4px; 
                cursor: pointer; 
                font-size: 10px;
            ">📋 Copiar</button>
        `;
        
        document.body.appendChild(element);
        
        // Auto-remover após 30 segundos
        setTimeout(() => {
            if (document.getElementById('temp-file-display')) {
                element.remove();
            }
        }, 30000);
    }

    /**
     * Mostra instruções para atualização manual do arquivo
     */
    showFileUpdateInstructions(filePath, recordCount) {
        const message = `
📁 Para completar o salvamento:
1. Copie o conteúdo exibido na tela
2. Substitua o conteúdo do arquivo: ${filePath}
3. Salve o arquivo
Total de registros: ${recordCount}
        `.trim();
        
        console.log(message);
        
        if (window.infoPanelManager?.showNotification) {
            window.infoPanelManager.showNotification(
                `Arquivo ${filePath.split('/').pop()} pronto para atualização (${recordCount} registros)`, 
                'info'
            );
        }
    }

    /**
     * Salva todos os dados no localStorage como backup
     */
    saveAllDataToLocalStorage() {
        localStorage.setItem(this.baseStorageKey + '_pontosConfirmados', JSON.stringify(this.confirmedPoints));
        localStorage.setItem(this.baseStorageKey + '_pontosPendentes', JSON.stringify(this.pendingPoints));
        localStorage.setItem(this.baseStorageKey + '_pontosOcultos', JSON.stringify(this.hiddenPoints));
        localStorage.setItem(this.baseStorageKey + '_usuarios', JSON.stringify(this.usuarios));
        
        console.log('');
    }

    /**
     * Cria backup downloadável dos arquivos em ambiente local
     */
    createDownloadBackup(filename, content) {
        try {
            // Criar timestamp para o backup
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFilename = `backup_${timestamp}_${filename}`;
            
            // Criar blob e URL de download
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Salvar referência para limpeza posterior
            if (!this.downloadBackups) this.downloadBackups = [];
            this.downloadBackups.push(url);
            
            console.log(`💾 Backup criado: ${backupFilename}`);
            
            // Automaticamente fazer download apenas se solicitado pelo usuário
            // Para evitar spam de downloads, comentamos a linha abaixo
            // this.triggerDownload(url, backupFilename);
            
        } catch (error) {
            console.warn('⚠️ Não foi possível criar backup de download:', error);
        }
    }

    /**
     * Força o download de um arquivo
     */
    triggerDownload(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Limpar URL após download
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    /**
     * Cria links de download dos arquivos JSON para salvamento manual
     */
    createDownloadLinks(data) {
        const user = window.authManager?.getCurrentUser();
        if (user?.role !== 'administrator') return;

        // Remover links antigos
        const existingContainer = document.getElementById('download-links-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Criar container para os links
        const container = document.createElement('div');
        container.id = 'download-links-container';
        container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 10000;
            font-size: 12px;
            max-width: 300px;
        `;

        container.innerHTML = `
            <div style="margin-bottom: 8px;">
                <strong>Arquivos para download (Admin)</strong>
                <button onclick="this.parentElement.parentElement.remove()" style="float: right; background: none; border: none; color: white; cursor: pointer;">✕</button>
            </div>
        `;

        // Criar links de download para cada arquivo
        const files = [
            { name: 'pontos_confirmados.json', data: data.pontos_confirmados },
            { name: 'pontos_pendentes.json', data: data.pontos_pendentes },
            { name: 'pontos_ocultos.json', data: data.pontos_ocultos },
            { name: 'usuarios.json', data: data.usuarios }
        ];

        files.forEach(file => {
            const blob = new Blob([JSON.stringify(file.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = file.name;
            link.textContent = `${file.name}`;
            link.style.cssText = `
                display: block;
                color: #4CAF50;
                text-decoration: none;
                margin: 3px 0;
                font-size: 11px;
            `;
            
            link.addEventListener('click', () => {
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            });
            
            container.appendChild(link);
        });

        document.body.appendChild(container);

        // Remover automaticamente após 30 segundos
        setTimeout(() => {
            if (container.parentNode) {
                container.remove();
            }
        }, 30000);
    }

    saveCategories() {
        localStorage.setItem(this.baseStorageKey + '_categorias', JSON.stringify(this.categorias));
    }

    /**
     * Obter dados do usuário ou criar se não existir
     * @param {string} username - Nome do usuário
     * @returns {Object} Dados do usuário
     */
    obterDadosUsuario(username) {
        try {
            if (!username || typeof username !== 'string') {
                throw new Error('Username é obrigatório e deve ser uma string');
            }

            if (!this.usuarios[username]) {
                this.usuarios[username] = {
                    username: username,
                    favoritos: [],
                    pontosEnviados: [],
                    sugestoesEnviadas: [],
                    dataCriacao: new Date().toISOString()
                };
                this.saveAllData();
                console.log(`Dados criados para o usuário: ${username}`);
            }
            
            return this.usuarios[username];
        } catch (error) {
            console.error('Erro ao obter dados do usuário:', error);
            // Retornar estrutura padrão em caso de erro
            return {
                username: username || 'unknown',
                favoritos: [],
                pontosEnviados: [],
                sugestoesEnviadas: [],
                dataCriacao: new Date().toISOString()
            };
        }
    }

    /**
     * Inicializar dados padrão quando não há dados salvos
     */
    initializeDefaultData() {
        console.log('');
        this.inicializarPontosDefault();
        this.loadCategories(); // Garantir que categorias estejam carregadas
        console.log('');
    }

    inicializarPontosDefault() {
        const pontosDefault = [
            {
                id: 1,
                nome: 'Teatro Nacional Claudio Santoro',
                descricao: 'Principal teatro de Brasília, com programação diversificada',
                categoria: 'geral',
                coordenadas: [-15.796, -47.878],
                endereco: 'Via N2 - Asa Norte, Brasília',
                telefone: '(61) 3325-6268',
                horario: 'Conforme programação',
                preco: 'R$ 20-80',
                nota: 4.6,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString(),
                imagem: {
                    url: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=400',
                    source: 'web',
                    description: 'Teatro Nacional de Brasília'
                }
            },
            {
                id: 2,
                nome: 'Cine Brasília',
                descricao: 'Cinema de arte e cultura, com filmes alternativos',
                categoria: 'geral',
                coordenadas: [-15.795, -47.882],
                endereco: 'EQS 106/107 - Asa Sul, Brasília',
                telefone: '(61) 3244-1660',
                horario: '14h às 22h',
                preco: 'R$ 10-15',
                nota: 4.4,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString(),
                imagem: {
                    url: 'https://images.unsplash.com/photo-1489599433510-0fcf9d9c4e2d?w=400',
                    source: 'web',
                    description: 'Cinema Brasília'
                }
            },
            {
                id: 3,
                nome: 'Estádio Nacional de Brasília',
                descricao: 'Arena multiuso para grandes eventos esportivos',
                categoria: 'esportes-lazer',
                coordenadas: [-15.783, -47.899],
                endereco: 'SRPN - Asa Norte, Brasília',
                telefone: '(61) 3424-4000',
                horario: 'Conforme eventos',
                preco: 'Variável',
                nota: 4.5,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString(),
                imagem: {
                    url: '/assets/images/estadio-nacional.jpg',
                    source: 'local',
                    description: 'Estádio Nacional de Brasília - Mané Garrincha'
                }
            },
            {
                id: 4,
                nome: 'Parque da Cidade Sarah Kubitschek',
                descricao: 'Maior parque urbano do mundo, ideal para esportes e lazer',
                categoria: 'esportes-lazer',
                coordenadas: [-15.788, -47.907],
                endereco: 'Asa Sul, Brasília',
                horario: '24 horas',
                preco: 'Gratuito',
                nota: 4.7,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 5,
                nome: 'Restaurante Olivae',
                descricao: 'Restaurante italiano sofisticado com ambiente acolhedor',
                categoria: 'gastronomia',
                coordenadas: [-15.795, -48.105],
                endereco: 'CLN 201 - Asa Norte, Brasília',
                telefone: '(61) 3340-8120',
                horario: '12h às 15h, 19h às 23h',
                preco: 'R$ 80-120',
                nota: 4.5,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 6,
                nome: 'Feira da Torre de TV',
                descricao: 'Feira gastronômica tradicional aos fins de semana',
                categoria: 'gastronomia',
                coordenadas: [-15.790, -47.896],
                endereco: 'Torre de TV, Asa Norte, Brasília',
                horario: 'Sábados e domingos, 9h às 18h',
                preco: 'R$ 15-40',
                nota: 4.2,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 7,
                nome: 'Dragonstore',
                descricao: 'Loja especializada em jogos, cards e cultura geek',
                categoria: 'geek-nerd',
                coordenadas: [-15.794, -47.889],
                endereco: 'CLN 208 - Asa Norte, Brasília',
                telefone: '(61) 3328-1234',
                horario: '10h às 22h',
                preco: 'R$ 20-200',
                nota: 4.6,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 8,
                nome: 'Arena E-Sports BSB',
                descricao: 'Centro de e-sports com torneios e competições',
                categoria: 'geek-nerd',
                coordenadas: [-15.835, -48.044],
                endereco: 'Taguatinga Centro, Brasília',
                telefone: '(61) 3562-9876',
                horario: '14h às 23h',
                preco: 'R$ 10-30/hora',
                nota: 4.3,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 9,
                nome: 'Centro Cultural da República',
                descricao: 'Espaço cultural independente com exposições alternativas',
                categoria: 'geral',
                coordenadas: [-15.797, -47.879],
                endereco: 'Eixo Monumental, Brasília',
                horario: '9h às 18h',
                preco: 'Gratuito',
                nota: 4.4,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 10,
                nome: 'Sarau do Beco',
                descricao: 'Sarau independente com poesia e música',
                categoria: 'geral',
                coordenadas: [-15.840, -48.045],
                endereco: 'Taguatinga Norte, Brasília',
                horario: 'Quintas, 19h às 23h',
                preco: 'R$ 5-15',
                nota: 4.1,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 11,
                nome: 'Villa Mix Brasília',
                descricao: 'Casa noturna com música sertaneja e eletrônica',
                categoria: 'casas-noturnas',
                coordenadas: [-15.796, -47.885],
                endereco: 'SCLS 109 - Asa Sul, Brasília',
                telefone: '(61) 3244-1010',
                horario: '22h às 4h',
                preco: 'R$ 40-80',
                nota: 4.2,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 12,
                nome: 'Lounge 442',
                descricao: 'Lounge sofisticado com drinks autorais',
                categoria: 'casas-noturnas',
                coordenadas: [-15.794, -47.886],
                endereco: 'CLN 442 - Asa Norte, Brasília',
                telefone: '(61) 3328-4422',
                horario: '19h às 2h',
                preco: 'R$ 30-60',
                nota: 4.0,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            }
        ];
        
        this.confirmedPoints = pontosDefault;
        
        // Calcular próximo ID baseado em todos os pontos existentes
        const todosOsPontos = [...this.confirmedPoints, ...this.pendingPoints, ...this.hiddenPoints];
        this.proximoId = todosOsPontos.length > 0 ? Math.max(...todosOsPontos.map(p => parseInt(p.id) || 0)) + 1 : 1;
        
        this.saveAllData();
        console.log(`${pontosDefault.length} pontos padrao carregados, próximo ID: ${this.proximoId}`);
    }

    // API pública - Métodos principais

    /**
     * Retorna pontos confirmados + ocultos (unified behavior)
     * UNIFIED: Now includes hidden points like the Python server
     */
    getPontos() {
        return [...this.confirmedPoints, ...this.hiddenPoints];
    }

    /**
     * Retorna pontos baseado no perfil do usuário
     * UNIFIED: Now returns all points (confirmed + hidden) for all users, like the Python server
     */
    getPontosParaUsuario(userRole = 'visitor', username = null) {
        if (userRole === 'administrator') {
            // Admins see everything: confirmed + pending + hidden
            return [...this.confirmedPoints, ...this.pendingPoints, ...this.hiddenPoints];
        }
        // Regular users see confirmed + hidden points (unified with Python server behavior)
        return [...this.confirmedPoints, ...this.hiddenPoints];
    }

    /**
     * Retorna pontos pendentes (apenas para admin)
     */
    getPontosPendentes() {
        return this.pendingPoints;
    }

    /**
     * Retorna pontos ocultos (apenas para admin)
     */
    getPontosOcultos() {
        return this.hiddenPoints;
    }

    getCategorias() {
        return this.categorias;
    }

    getPontoById(id) {
        // Garantir que o ID seja tratado como string e número para compatibilidade
        const pontoId = id;
        const pontoIdInt = parseInt(id);
        
        return [...this.confirmedPoints, ...this.pendingPoints, ...this.hiddenPoints]
               .find(p => p.id === pontoId || p.id === pontoIdInt);
    }

    obterPorId(id) {
        return this.getPontoById(id);
    }

    obterPonto(id) {
        return this.getPontoById(id);
    }

    obterTodos() {
        return this.getPontos();
    }

    obterCategoria(categoriaId) {
        return this.categorias.find(c => c.id === categoriaId);
    }

    /**
     * Buscar pontos por categoria
     * @param {string|number} categoria - ID da categoria ou 'todos' para todas
     * @param {string} userRole - Papel do usuário (visitor, user, administrator)
     * @param {string} username - Nome do usuário (para filtros personalizados)
     * @returns {Array} Array de pontos da categoria especificada
     */
    buscarPorCategoria(categoria = 'todos', userRole = 'visitor', username = null) {
        // Se categoria for 'todos', retornar todos os pontos baseado no papel do usuário
        if (categoria === 'todos') {
            return this.getPontosParaUsuario(userRole, username);
        }

        // Converter categoria para número se necessário
        const categoriaId = typeof categoria === 'string' && categoria !== 'todos' 
            ? parseInt(categoria) 
            : categoria;

        // Obter pontos baseado no papel do usuário
        const pontos = this.getPontosParaUsuario(userRole, username);
        
        // Filtrar por categoria específica
        return pontos.filter(ponto => ponto.categoria === categoriaId);
    }

    /**
     * Adicionar ponto (comportamento baseado no perfil)
     * @param {Object} dadosPonto - Dados do ponto a ser adicionado
     * @param {string} userRole - Papel do usuário (visitor, user, administrator)
     * @param {string} username - Nome do usuário
     * @returns {Object} Ponto adicionado
     */
    adicionarPonto(dadosPonto, userRole = 'visitor', username = null) {
        try {
            console.log('📤 Iniciando adição de ponto...', dadosPonto.nome);
            
            // Validações básicas
            if (!dadosPonto || typeof dadosPonto !== 'object') {
                throw new Error('Dados do ponto são obrigatórios');
            }

            if (!dadosPonto.nome || !dadosPonto.descricao || !dadosPonto.categoria) {
                throw new Error('Nome, descrição e categoria são obrigatórios');
            }

            if (!dadosPonto.coordenadas || !Array.isArray(dadosPonto.coordenadas) || dadosPonto.coordenadas.length !== 2) {
                throw new Error('Coordenadas devem ser um array com latitude e longitude');
            }

            // Validar categoria
            const categoriaExiste = this.categorias.find(cat => cat.id === dadosPonto.categoria);
            if (!categoriaExiste) {
                throw new Error('Categoria inválida');
            }

            // Validar e processar imagem se fornecida
            if (dadosPonto.imagem) {
                const isValidImage = this.validateImageUrl(dadosPonto.imagem.url, dadosPonto.imagem.source);
                if (!isValidImage) {
                    console.warn('URL de imagem inválida fornecida, removendo dados da imagem');
                    delete dadosPonto.imagem;
                } else {
                    // Estruturar dados da imagem corretamente
                    dadosPonto.imagem = {
                        url: dadosPonto.imagem.url,
                        source: dadosPonto.imagem.source,
                        description: dadosPonto.imagem.description || '',
                        addedAt: new Date().toISOString()
                    };
                }
            }

            const ponto = {
                id: `ponto_${Date.now()}`, // Usar timestamp para garantir ID único
                ...dadosPonto,
                dataAdicao: new Date().toISOString(),
                adicionadoPor: username || 'anonimo'
            };

            // Determinar onde salvar baseado no papel do usuário
            if (userRole === 'administrator') {
                // Admin adiciona diretamente como confirmado
                ponto.status = 'confirmado';
                ponto.verificado = true;
                this.confirmedPoints.push(ponto);
                console.log(`✅ Ponto ${ponto.id} adicionado como confirmado pelo administrador`);
            } else {
                // Usuário comum adiciona como pendente
                ponto.status = 'pendente';
                ponto.verificado = false;
                this.pendingPoints.push(ponto);
                
                // Registrar no perfil do usuário
                if (username) {
                    const dadosUsuario = this.obterDadosUsuario(username);
                    dadosUsuario.pontosEnviados.push(ponto.id);
                }
                console.log(`📝 Ponto ${ponto.id} adicionado como pendente pelo usuário ${username}`);
            }
            
            // Salvar dados imediatamente
            this.saveDataDirectly(ponto, userRole);
            
            return ponto;
        } catch (error) {
            console.error('❌ Erro ao adicionar ponto:', error);
            throw error;
        }
    }

    /**
     * Salva dados diretamente sem downloads
     */
    saveDataDirectly(novoPonto, userRole) {
        try {
            console.log('💾 Salvando dados do ponto...');
            
            // Salvar no localStorage imediatamente
            localStorage.setItem(this.baseStorageKey + '_pontosConfirmados', JSON.stringify(this.confirmedPoints));
            localStorage.setItem(this.baseStorageKey + '_pontosPendentes', JSON.stringify(this.pendingPoints));
            localStorage.setItem(this.baseStorageKey + '_pontosOcultos', JSON.stringify(this.hiddenPoints));
            localStorage.setItem(this.baseStorageKey + '_usuarios', JSON.stringify(this.usuarios));
            
            // Para todos os usuários (incluindo admins), salvar apenas silenciosamente
            if (userRole !== 'administrator') {
                // Salvar backup silenciosamente para pontos pendentes
                const jsonContent = JSON.stringify(this.pendingPoints, null, 2);
                localStorage.setItem('backup_pontos_pendentes', jsonContent);
                console.log(`📁 pontos_pendentes.json atualizado (${this.pendingPoints.length} registros)`);
            } else {
                // Para admins, salvar também silenciosamente sem mostrar helper
                const jsonContent = JSON.stringify(this.confirmedPoints, null, 2);
                localStorage.setItem('backup_pontos_confirmados', jsonContent);
                console.log(`📁 pontos_confirmados.json atualizado (${this.confirmedPoints.length} registros)`);
            }
            
            console.log('✅ Dados salvos com sucesso');
            
            // Mostrar notificação específica baseada no papel do usuário
            this.showSaveNotification(novoPonto, userRole);
            
        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
        }
    }

    /**
     * Atualiza arquivo de pontos pendentes
     */
    updatePendingPointsFile() {
        try {
            const jsonContent = JSON.stringify(this.pendingPoints, null, 2);
            
            // Salvar backup especial para pontos pendentes
            localStorage.setItem('backup_pontos_pendentes', jsonContent);
            
            // Exibir conteúdo para cópia manual
            this.showFileUpdateHelper('pontos_pendentes.json', jsonContent);
            
            console.log(`📁 pontos_pendentes.json atualizado (${this.pendingPoints.length} registros)`);
        } catch (error) {
            console.error('❌ Erro ao atualizar pontos pendentes:', error);
        }
    }

    /**
     * Atualiza arquivo de pontos confirmados
     */
    updateConfirmedPointsFile() {
        try {
            const jsonContent = JSON.stringify(this.confirmedPoints, null, 2);
            
            // Salvar backup especial para pontos confirmados
            localStorage.setItem('backup_pontos_confirmados', jsonContent);
            
            // Exibir conteúdo para cópia manual (apenas para admins)
            this.showFileUpdateHelper('pontos_confirmados.json', jsonContent);
            
            console.log(`📁 pontos_confirmados.json atualizado (${this.confirmedPoints.length} registros)`);
        } catch (error) {
            console.error('❌ Erro ao atualizar pontos confirmados:', error);
        }
    }

    /**
     * Mostra helper para atualização de arquivo
     */
    showFileUpdateHelper(filename, content) {
        // Criar elemento de ajuda na tela
        const helper = document.createElement('div');
        helper.id = `file-helper-${filename}`;
        helper.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 600px;
            background: #1a1a1a;
            border: 3px solid #007bff;
            border-radius: 12px;
            padding: 20px;
            z-index: 10000;
            box-shadow: 0 8px 32px rgba(0,0,0,0.8);
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        helper.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #007bff;">📁 Arquivo Atualizado</h3>
                <p style="margin: 10px 0; color: #ccc;">
                    O arquivo <strong>${filename}</strong> precisa ser atualizado manualmente
                </p>
            </div>
            
            <div style="margin: 15px 0;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">
                    📋 Conteúdo para copiar:
                </label>
                <textarea readonly style="
                    width: 100%; 
                    height: 200px; 
                    background: #000; 
                    color: #0f0; 
                    border: 1px solid #333; 
                    border-radius: 6px; 
                    padding: 10px; 
                    font-family: monospace; 
                    font-size: 11px;
                    resize: vertical;
                ">${content}</textarea>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="navigator.clipboard.writeText(this.parentElement.previousElementSibling.querySelector('textarea').value).then(() => alert('Conteúdo copiado!'))" style="
                    background: #28a745; 
                    color: white; 
                    border: none; 
                    padding: 10px 20px; 
                    border-radius: 6px; 
                    cursor: pointer; 
                    font-weight: bold;
                ">📋 Copiar Conteúdo</button>
                
                <button onclick="this.closest('[id^=file-helper]').remove()" style="
                    background: #dc3545; 
                    color: white; 
                    border: none; 
                    padding: 10px 20px; 
                    border-radius: 6px; 
                    cursor: pointer; 
                    font-weight: bold;
                ">✕ Fechar</button>
            </div>
            
            <div style="margin-top: 15px; padding: 10px; background: #2d2d2d; border-radius: 6px; font-size: 12px; color: #ccc;">
                <strong>📝 Instruções:</strong><br>
                1. Clique em "Copiar Conteúdo"<br>
                2. Abra o arquivo <code>database/${filename}</code><br>
                3. Substitua todo o conteúdo pelo copiado<br>
                4. Salve o arquivo
            </div>
        `;
        
        // Remover helper anterior se existir
        const existing = document.getElementById(`file-helper-${filename}`);
        if (existing) existing.remove();
        
        document.body.appendChild(helper);
        
        // Auto-remover após 2 minutos
        setTimeout(() => {
            if (document.getElementById(`file-helper-${filename}`)) {
                helper.remove();
            }
        }, 120000);
    }

    /**
     * Mostra notificação de salvamento
     */
    showSaveNotification(ponto, userRole = 'visitor') {
        let message;
        
        if (userRole === 'administrator') {
            message = `Ponto "${ponto.nome}" adicionado com sucesso!`;
        } else {
            message = `Ponto enviado para verificação`;
        }
        
        // Usar sistema de notificação do MapManager se disponível
        if (window.mapManager?.showNotification) {
            window.mapManager.showNotification(message, 'success');
        } else if (window.infoPanelManager?.showNotification) {
            window.infoPanelManager.showNotification(message, 'success');
        } else {
            console.log(`✅ ${message}`);
        }
    }

    /**
     * Aprovar ponto pendente (apenas admin)
     */
    aprovarPonto(pontoId, userRole = 'visitor') {
        if (userRole !== 'administrator') {
            throw new Error('Apenas administradores podem aprovar pontos');
        }

        // Garantir compatibilidade com string e número
        const index = this.pendingPoints.findIndex(p => p.id == pontoId);
        if (index === -1) {
            throw new Error('Ponto pendente não encontrado');
        }

        const ponto = this.pendingPoints.splice(index, 1)[0];
        ponto.status = 'confirmado';
        ponto.verificado = true;
        ponto.dataAprovacao = new Date().toISOString();
        
        this.confirmedPoints.push(ponto);
        this.saveAllData();
        
        return ponto;
    }

    /**
     * Ocultar ponto (apenas admin) - move para pontos ocultos
     */
    ocultarPonto(pontoId, userRole = 'visitor') {
        if (userRole !== 'administrator') {
            throw new Error('Apenas administradores podem ocultar pontos');
        }

        // Buscar em confirmados (usando comparação flexível)
        let index = this.confirmedPoints.findIndex(p => p.id == pontoId);
        let ponto = null;
        
        if (index !== -1) {
            ponto = this.confirmedPoints.splice(index, 1)[0];
        } else {
            // Buscar em pendentes (usando comparação flexível)
            index = this.pendingPoints.findIndex(p => p.id == pontoId);
            if (index !== -1) {
                ponto = this.pendingPoints.splice(index, 1)[0];
            }
        }

        if (!ponto) {
            throw new Error('Ponto não encontrado');
        }

        ponto.status = 'oculto';
        ponto.dataOcultacao = new Date().toISOString();
        this.hiddenPoints.push(ponto);
        this.saveAllData();
        
        return ponto;
    }

    /**
     * Restaurar ponto oculto (apenas admin)
     */
    restaurarPonto(pontoId, userRole = 'visitor') {
        if (userRole !== 'administrator') {
            throw new Error('Apenas administradores podem restaurar pontos');
        }

        const index = this.hiddenPoints.findIndex(p => p.id === pontoId);
        if (index === -1) {
            throw new Error('Ponto oculto não encontrado');
        }

        const ponto = this.hiddenPoints.splice(index, 1)[0];
        ponto.status = 'confirmado';
        ponto.verificado = true;
        ponto.dataRestauracao = new Date().toISOString();
        
        this.confirmedPoints.push(ponto);
        this.saveAllData();
        
        return ponto;
    }

    /**
     * Adicionar/remover favorito
     * @param {number} pontoId - ID do ponto
     * @param {string} username - Nome do usuário
     * @returns {boolean} True se agora é favorito, false se foi removido
     */
    toggleFavorito(pontoId, username) {
        try {
            if (!username) {
                throw new Error('Username é obrigatório para gerenciar favoritos');
            }

            const dadosUsuario = this.obterDadosUsuario(username);
            const pontoIdNum = parseInt(pontoId);
            
            if (!dadosUsuario.favoritos) {
                dadosUsuario.favoritos = [];
            }

            const index = dadosUsuario.favoritos.indexOf(pontoIdNum);
            
            if (index === -1) {
                // Adicionar aos favoritos
                dadosUsuario.favoritos.push(pontoIdNum);
                this.saveAllData();
                console.log(`Ponto ${pontoId} adicionado aos favoritos de ${username}`);
                return true;
            } else {
                // Remover dos favoritos
                dadosUsuario.favoritos.splice(index, 1);
                this.saveAllData();
                console.log(`Ponto ${pontoId} removido dos favoritos de ${username}`);
                return false;
            }
        } catch (error) {
            console.error('Erro ao alternar favorito:', error);
            return false;
        }
    }

    /**
     * Verificar se ponto é favorito
     * @param {number} pontoId - ID do ponto
     * @param {string} username - Nome do usuário
     * @returns {boolean} True se é favorito
     */
    isFavorito(pontoId, username) {
        try {
            if (!username) {
                return false;
            }

            const dadosUsuario = this.obterDadosUsuario(username);
            if (!dadosUsuario.favoritos) {
                dadosUsuario.favoritos = [];
                return false;
            }

            const pontoIdNum = parseInt(pontoId);
            return dadosUsuario.favoritos.includes(pontoIdNum);
        } catch (error) {
            console.error('Erro ao verificar favorito:', error);
            return false;
        }
    }

    /**
     * Obter pontos favoritos do usuário
     * @param {string} username - Nome do usuário
     * @returns {Array} Array com pontos favoritos do usuário
     */
    getFavoritos(username) {
        try {
            if (!username) {
                return [];
            }

            const dadosUsuario = this.obterDadosUsuario(username);
            if (!dadosUsuario.favoritos || dadosUsuario.favoritos.length === 0) {
                return [];
            }

            // Obter pontos favoritos dos pontos confirmados
            const pontosFavoritos = this.confirmedPoints.filter(ponto => 
                dadosUsuario.favoritos.includes(ponto.id)
            );

            console.log(`${pontosFavoritos.length} pontos favoritos carregados para ${username}`);
            return pontosFavoritos;
        } catch (error) {
            console.error('Erro ao obter favoritos:', error);
            return [];
        }
    }

    /**
     * Sugerir mudança em ponto existente
     */
    sugerirMudanca(pontoId, sugestoes, username) {
        if (!username) {
            throw new Error('Usuário deve estar logado para sugerir mudanças');
        }

        const ponto = this.getPontoById(pontoId);
        if (!ponto) {
            throw new Error('Ponto não encontrado');
        }

        const sugestao = {
            id: Date.now(),
            pontoId: pontoId,
            pontoOriginal: {...ponto},
            sugestoes: sugestoes,
            usuarioSugeriu: username,
            dataSugestao: new Date().toISOString(),
            status: 'pendente'
        };

        const dadosUsuario = this.obterDadosUsuario(username);
        dadosUsuario.sugestoesEnviadas.push(sugestao.id);
        
        // Armazenar sugestões em uma lista separada
        if (!this.usuarios._sugestoes) {
            this.usuarios._sugestoes = [];
        }
        this.usuarios._sugestoes.push(sugestao);
        
        this.saveAllData();
        return sugestao;
    }

    /**
     * Obter sugestões pendentes (admin)
     */
    getSugestoesPendentes() {
        if (!this.usuarios._sugestoes) return [];
        return this.usuarios._sugestoes.filter(s => s.status === 'pendente');
    }

    /**
     * Aprovar sugestão (admin)
     */
    aprovarSugestao(sugestaoId, userRole = 'visitor') {
        if (userRole !== 'administrator') {
            throw new Error('Apenas administradores podem aprovar sugestões');
        }

        if (!this.usuarios._sugestoes) return null;
        
        const sugestao = this.usuarios._sugestoes.find(s => s.id === sugestaoId);
        if (!sugestao) {
            throw new Error('Sugestão não encontrada');
        }

        // Aplicar mudanças ao ponto
        const ponto = this.getPontoById(sugestao.pontoId);
        if (ponto) {
            Object.assign(ponto, sugestao.sugestoes);
            ponto.dataUltimaEdicao = new Date().toISOString();
        }

        // Marcar sugestão como aprovada
        sugestao.status = 'aprovada';
        sugestao.dataAprovacao = new Date().toISOString();
        
        this.saveAllData();
        return sugestao;
    }

    /**
     * Atualizar dados de um ponto existente
     * @param {number} pontoId - ID do ponto a ser atualizado
     * @param {Object} novosDados - Novos dados para o ponto
     * @param {string} userRole - Papel do usuário
     * @returns {Object|null} Ponto atualizado ou null se não encontrado
     */
    atualizarPonto(pontoId, novosDados, userRole = 'visitor') {
        try {
            if (!pontoId || !novosDados || typeof novosDados !== 'object') {
                throw new Error('ID do ponto e novos dados são obrigatórios');
            }

            // Verificar permissões
            if (userRole !== 'administrator') {
                throw new Error('Apenas administradores podem atualizar pontos');
            }

            // Buscar em todas as listas
            let ponto = this.confirmedPoints.find(p => p.id === pontoId);
            if (!ponto) {
                ponto = this.pendingPoints.find(p => p.id === pontoId);
            }
            if (!ponto) {
                ponto = this.hiddenPoints.find(p => p.id === pontoId);
            }

            if (!ponto) {
                throw new Error('Ponto não encontrado');
            }

            // Validar categoria se fornecida
            if (novosDados.categoria) {
                const categoriaExiste = this.categorias.find(cat => cat.id === novosDados.categoria);
                if (!categoriaExiste) {
                    throw new Error('Categoria inválida');
                }
            }

            // Validar coordenadas se fornecidas
            if (novosDados.coordenadas) {
                if (!Array.isArray(novosDados.coordenadas) || novosDados.coordenadas.length !== 2) {
                    throw new Error('Coordenadas devem ser um array com latitude e longitude');
                }
            }

            // Validar imagem se fornecida
            if (novosDados.imagem) {
                const isValidImage = this.validateImageUrl(novosDados.imagem.url, novosDados.imagem.source);
                if (!isValidImage) {
                    console.warn('URL de imagem inválida fornecida, removendo dados da imagem');
                    delete novosDados.imagem;
                } else {
                    novosDados.imagem = {
                        url: novosDados.imagem.url,
                        source: novosDados.imagem.source,
                        description: novosDados.imagem.description || '',
                        updatedAt: new Date().toISOString()
                    };
                }
            }

            // Aplicar atualizações
            Object.assign(ponto, novosDados);
            ponto.dataUltimaEdicao = new Date().toISOString();
            
            this.saveAllData();
            console.log(`Ponto ${pontoId} atualizado com sucesso`);
            return ponto;
        } catch (error) {
            console.error('Erro ao atualizar ponto:', error);
            throw error;
        }
    }

    /**
     * Buscar pontos por texto
     * @param {string} termo - Termo de busca
     * @param {string} userRole - Papel do usuário
     * @param {string} username - Nome do usuário
     * @returns {Array} Array de pontos que correspondem à busca
     */
    buscarPontos(termo, userRole = 'visitor', username = null) {
        try {
            if (!termo || typeof termo !== 'string') {
                return [];
            }

            const termoLower = termo.toLowerCase().trim();
            if (termoLower.length === 0) {
                return [];
            }

            // Obter pontos baseado no papel do usuário
            const pontos = this.getPontosParaUsuario(userRole, username);
            
            // Filtrar por termo de busca
            const resultados = pontos.filter(ponto => 
                ponto.nome.toLowerCase().includes(termoLower) ||
                ponto.descricao.toLowerCase().includes(termoLower) ||
                (ponto.endereco && ponto.endereco.toLowerCase().includes(termoLower)) ||
                (ponto.tags && ponto.tags.some(tag => tag.toLowerCase().includes(termoLower)))
            );

            console.log(`Busca por "${termo}" retornou ${resultados.length} resultados`);
            return resultados;
        } catch (error) {
            console.error('Erro ao buscar pontos:', error);
            return [];
        }
    }

    /**
     * Adicionar ou atualizar imagem de um ponto
     * @param {number} pontoId - ID do ponto
     * @param {Object} imageData - Dados da imagem
     * @param {string} imageData.url - URL ou caminho da imagem
     * @param {string} imageData.source - 'web' ou 'local'
     * @param {string} imageData.description - Descrição da imagem
     * @returns {boolean} - true se atualizado com sucesso
     */
    updatePointImage(pontoId, imageData) {
        try {
            // Validar dados da imagem
            if (!imageData.url || !imageData.source) {
                throw new Error('URL e source são obrigatórios');
            }

            if (!['web', 'local'].includes(imageData.source)) {
                throw new Error('Source deve ser "web" ou "local"');
            }

            // Encontrar o ponto
            const ponto = this.getPontoById(pontoId);
            if (!ponto) {
                throw new Error('Ponto não encontrado');
            }

            // Estrutura da imagem
            const imagemStructure = {
                url: imageData.url,
                source: imageData.source,
                description: imageData.description || '',
                updatedAt: new Date().toISOString()
            };

            // Atualizar a imagem
            ponto.imagem = imagemStructure;
            ponto.dataUltimaEdicao = new Date().toISOString();

            this.saveAllData();
            console.log(`Image updated for point ${pontoId}: ${imageData.source} - ${imageData.url}`);
            return true;

        } catch (error) {
            console.error('Error updating point image:', error);
            return false;
        }
    }

    /**
     * Remover imagem de um ponto
     * @param {number} pontoId - ID do ponto
     * @returns {boolean} - true se removido com sucesso
     */
    removePointImage(pontoId) {
        try {
            const ponto = this.getPontoById(pontoId);
            if (!ponto) {
                throw new Error('Ponto não encontrado');
            }

            delete ponto.imagem;
            ponto.dataUltimaEdicao = new Date().toISOString();

            this.saveAllData();
            console.log(`Image removed from point ${pontoId}`);
            return true;

        } catch (error) {
            console.error('Error removing point image:', error);
            return false;
        }
    }

    /**
     * Obter informações de imagem de um ponto
     * @param {number} pontoId - ID do ponto
     * @returns {Object|null} - Dados da imagem ou null se não houver
     */
    getPointImage(pontoId) {
        const ponto = this.getPontoById(pontoId);
        return ponto?.imagem || null;
    }

    /**
     * Validar URL de imagem
     * @param {string} url - URL para validar
     * @param {string} source - Tipo da fonte ('web' ou 'local')
     * @returns {boolean} - true se válida
     */
    validateImageUrl(url, source) {
        if (!url || typeof url !== 'string') {
            return false;
        }

        if (source === 'web') {
            // Validar URL web
            try {
                const urlObj = new URL(url);
                return ['http:', 'https:'].includes(urlObj.protocol);
            } catch {
                return false;
            }
        } else if (source === 'local') {
            // Validar caminho local (relativo ou absoluto)
            return url.startsWith('/') || url.startsWith('./') || url.startsWith('../') || 
                   url.match(/^[a-zA-Z]:/) || url.startsWith('assets/');
        }

        return false;
    }

    filterByCategory(categoria, username = null) {
        try {
            if (categoria === 'todos') {
                return this.confirmedPoints;
            }
            
            // Implementar filtro de favoritos
            if (categoria === 'favoritos' && username) {
                return this.getFavoritos(username);
            }
            
            return this.confirmedPoints.filter(p => p.categoria === categoria);
        } catch (error) {
            console.error('Erro ao filtrar por categoria:', error);
            return [];
        }
    }

    getEstatisticas() {
        const totalConfirmados = this.confirmedPoints.length;
        const totalPendentes = this.pendingPoints.length;
        const totalOcultos = this.hiddenPoints.length;
        const pontosPorCategoria = {};
        
        // Inicializar contadores para todas as categorias
        this.categorias.forEach(cat => {
            pontosPorCategoria[cat.id] = 0;
        });
        
        // Contar pontos confirmados por categoria
        this.confirmedPoints.forEach(ponto => {
            if (pontosPorCategoria.hasOwnProperty(ponto.categoria)) {
                pontosPorCategoria[ponto.categoria]++;
            }
        });
        
        return {
            totalPontos: totalConfirmados,
            totalConfirmados,
            totalPendentes,
            totalOcultos,
            pontosPorCategoria,
            pontosVerificados: totalConfirmados,
            pontosNaoVerificados: totalPendentes,
            totalUsuarios: Object.keys(this.usuarios).filter(k => !k.startsWith('_')).length,
            totalSugestoes: this.usuarios._sugestoes ? this.usuarios._sugestoes.length : 0
        };
    }

    async carregarDados() {
        // Método para compatibilidade com app.js
        return Promise.resolve();
    }

    /**
     * Exportar dados para backup
     */
    exportarDados() {
        return {
            confirmedPoints: this.confirmedPoints,
            pendingPoints: this.pendingPoints,
            hiddenPoints: this.hiddenPoints,
            usuarios: this.usuarios,
            categorias: this.categorias,
            dataExport: new Date().toISOString(),
            versao: '2.0'
        };
    }

    /**
     * Importar dados de backup
     */
    importarDados(dados, userRole = 'visitor') {
        if (userRole !== 'administrator') {
            throw new Error('Apenas administradores podem importar dados');
        }

        if (dados.versao && (dados.confirmedPoints || dados.pontosConfirmados)) {
            this.confirmedPoints = dados.confirmedPoints || dados.pontosConfirmados || [];
            this.pendingPoints = dados.pendingPoints || dados.pontosPendentes || [];
            this.hiddenPoints = dados.hiddenPoints || dados.pontosOcultos || [];
            this.usuarios = dados.usuarios || {};
            this.categorias = dados.categorias || this.categorias;
            
            // Recalcular próximo ID
            const todosOsPontos = [...this.confirmedPoints, ...this.pendingPoints, ...this.hiddenPoints];
            this.proximoId = todosOsPontos.length > 0 ? Math.max(...todosOsPontos.map(p => p.id || 0)) + 1 : 1;
            
            this.saveAllData();
            return { success: true, message: 'Dados importados com sucesso' };
        }
        
        throw new Error('Formato de dados inválido');
    }

    /**
     * Salvar dados no localStorage (método de compatibilidade)
     */
    salvarNoLocalStorage() {
        this.saveAllData();
    }

    /**
     * Deletar ponto definitivamente
     * @param {number} pontoId - ID do ponto a ser deletado
     * @param {string} userRole - Papel do usuário
     * @returns {boolean} True se deletado com sucesso
     */
    deletarPonto(pontoId, userRole = 'visitor') {
        if (userRole !== 'administrator') {
            throw new Error('Apenas administradores podem deletar pontos');
        }

        let deletado = false;

        // Tentar deletar de todas as listas (usando comparação flexível)
        let index = this.confirmedPoints.findIndex(p => p.id == pontoId);
        if (index !== -1) {
            this.confirmedPoints.splice(index, 1);
            deletado = true;
        }

        index = this.pendingPoints.findIndex(p => p.id == pontoId);
        if (index !== -1) {
            this.pendingPoints.splice(index, 1);
            deletado = true;
        }

        index = this.hiddenPoints.findIndex(p => p.id == pontoId);
        if (index !== -1) {
            this.hiddenPoints.splice(index, 1);
            deletado = true;
        }

        if (deletado) {
            this.saveAllData();
            console.log(`Ponto ${pontoId} deletado definitivamente`);
        }

        return deletado;
    }

    /**
     * Remover ponto (alias para deletarPonto para compatibilidade)
     * @param {number} pontoId - ID do ponto a ser removido
     * @param {string} userRole - Papel do usuário
     * @returns {boolean} True se removido com sucesso
     */
    removerPonto(pontoId, userRole = 'visitor') {
        return this.deletarPonto(pontoId, userRole);
    }

    /**
     * Buscar pontos por proximidade geográfica
     * @param {number} lat - Latitude do centro
     * @param {number} lng - Longitude do centro
     * @param {number} raio - Raio em quilômetros
     * @param {string} userRole - Papel do usuário
     * @param {string} username - Nome do usuário
     * @returns {Array} Array de pontos dentro do raio especificado
     */
    buscarPorProximidade(lat, lng, raio = 1, userRole = 'visitor', username = null) {
        const pontos = this.getPontosParaUsuario(userRole, username);
        
        return pontos.filter(ponto => {
            if (!ponto.coordenadas || ponto.coordenadas.length !== 2) {
                return false;
            }

            const [pontoLat, pontoLng] = ponto.coordenadas;
            const distancia = this.calcularDistancia(lat, lng, pontoLat, pontoLng);
            
            return distancia <= raio;
        }).sort((a, b) => {
            // Ordenar por distância
            const distA = this.calcularDistancia(lat, lng, a.coordenadas[0], a.coordenadas[1]);
            const distB = this.calcularDistancia(lat, lng, b.coordenadas[0], b.coordenadas[1]);
            return distA - distB;
        });
    }

    /**
     * Calcular distância entre duas coordenadas usando fórmula de Haversine
     * @param {number} lat1 - Latitude do primeiro ponto
     * @param {number} lng1 - Longitude do primeiro ponto
     * @param {number} lat2 - Latitude do segundo ponto
     * @param {number} lng2 - Longitude do segundo ponto
     * @returns {number} Distância em quilômetros
     */
    calcularDistancia(lat1, lng1, lat2, lng2) {
        const R = 6371; // Raio da Terra em km
        const dLat = this.degreesToRadians(lat2 - lat1);
        const dLng = this.degreesToRadians(lng2 - lng1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Converter graus para radianos
     * @param {number} degrees - Ângulo em graus
     * @returns {number} Ângulo em radianos
     */
    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Dados padrão de categorias para fallback quando file:// não pode carregar JSON
     */
    getCategoriesDefault() {
        return [
            {
                "id": "geral",
                "nome": "Geral",
                "icon": "fas fa-theater-masks",
                "cor": "#b8860b",
                "descricao": "Pontos de interesse geral e diversos"
            },
            {
                "id": "esportes-lazer",
                "nome": "Esportes",
                "icon": "fas fa-running",
                "cor": "#28a745",
                "descricao": "Atividades esportivas e de lazer"
            },
            {
                "id": "gastronomia",
                "nome": "Gastronomia",
                "icon": "fas fa-utensils",
                "cor": "#dc3545",
                "descricao": "Restaurantes, bares e experiências culinárias"
            },
            {
                "id": "geek-nerd",
                "nome": "Geek",
                "icon": "fas fa-gamepad",
                "cor": "#6f42c1",
                "descricao": "Cultura geek, games e tecnologia"
            },
            {
                "id": "casas-noturnas",
                "nome": "Casas Noturnas",
                "icon": "fas fa-glass-cheers",
                "cor": "#6610f2",
                "descricao": "Vida noturna, bares e casas de show"
            }
        ];
    }

    /**
     * Dados padrão de pontos confirmados para fallback
     */
    getConfirmedPointsDefault() {
        return [
            {
                "id": 1,
                "nome": "Teatro Nacional Claudio Santoro",
                "categoria": "geral",
                "coordenadas": [-15.796, -47.878],
                "descricao": "Principal teatro de Brasília, com programação diversificada",
                "endereco": "Via N2 - Asa Norte",
                "telefone": "(61) 3325-6268",
                "horario": "Conforme programação",
                "preco": "R$ 20-80",
                "avaliacao": 4.6,
                "tags": ["teatro", "cultura", "espetaculos"],
                "ativo": true,
                "dataCriacao": "2025-01-20T10:00:00.000Z",
                "imagem": {
                    "url": "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=400",
                    "source": "web",
                    "description": "Teatro Nacional de Brasília"
                }
            },
            {
                "id": 2,
                "nome": "Museu Nacional da República",
                "categoria": "geral",
                "coordenadas": [-15.798, -47.875],
                "descricao": "Espaço cultural com exposições de arte e história",
                "endereco": "Via N1 - Asa Norte",
                "telefone": "(61) 3325-5220",
                "horario": "Ter-Dom: 9h-18h",
                "preco": "R$ 5-15",
                "avaliacao": 4.3,
                "tags": ["museu", "arte", "cultura"],
                "ativo": true,
                "dataCriacao": "2025-01-20T10:15:00.000Z",
                "imagem": {
                    "url": "https://images.unsplash.com/photo-1554072675-66db59dba46f?w=400",
                    "source": "web",
                    "description": "Museu Nacional da República"
                }
            },
            {
                "id": 3,
                "nome": "Parque da Cidade Sarah Kubitschek",
                "categoria": "esportes-lazer",
                "coordenadas": [-15.798, -47.896],
                "descricao": "Maior parque urbano da América Latina, ideal para atividades físicas",
                "endereco": "Asa Sul",
                "telefone": "(61) 3224-5717",
                "horario": "24h",
                "preco": "Gratuito",
                "avaliacao": 4.8,
                "tags": ["parque", "exercicios", "natureza"],
                "ativo": true,
                "dataCriacao": "2025-01-20T10:30:00.000Z",
                "imagem": {
                    "url": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
                    "source": "web",
                    "description": "Parque da Cidade"
                }
            }
        ];
    }

    /**
     * Dados padrão de pontos ocultos para fallback
     */
    getHiddenPointsDefault() {
        return [
            {
                "id": 101,
                "nome": "Ponto Oculto de Exemplo",
                "categoria": "geral",
                "coordenadas": [-15.794, -47.882],
                "descricao": "Exemplo de ponto oculto carregado por padrão",
                "endereco": "Localização reservada",
                "ativo": true,
                "dataCriacao": "2025-01-20T12:00:00.000Z",
                "oculto": true
            }
        ];
    }

    /**
     * Dados padrão de usuários para fallback
     */
    getUsersDefault() {
        return [
            {
                "id": 1,
                "username": "admin",
                "password": "admin123",
                "role": "administrator",
                "email": "admin@sigdf.gov.br",
                "nome": "Administrador do Sistema",
                "dataCriacao": "2025-01-20T08:00:00.000Z",
                "ativo": true
            }
        ];
    }
}

// Criar instância global
const databaseManager = new DatabaseManager();

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseManager;
}

// Disponibilizar globalmente
window.DatabaseManager = DatabaseManager;
window.databaseManager = databaseManager;

console.log('');
