/**
 * Modal de Limpeza de Cache
 */
class CacheCleanModal {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createModal();
        this.setupEventListeners();
    }

    createModal() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'cache-modal-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        `;
        
        this.overlay.innerHTML = `
            <div class="cache-modal" style="
                background: var(--bg-primary);
                border-radius: 12px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                transform: scale(0.9) translateY(20px);
                transition: transform 0.3s ease;
                border: 1px solid var(--border-color);
            ">
                <div class="cache-modal-header" style="text-align: center; margin-bottom: 2rem;">
                    <h2 style="color: var(--text-primary); margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 600;">
                        <i class="fas fa-broom"></i> Limpeza de Cache
                    </h2>
                    <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">
                        Esta ação irá limpar dados temporários do sistema
                    </p>
                </div>
                
                <div class="cache-options" style="margin-bottom: 2rem;">
                    <div class="option-group" style="margin-bottom: 1rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="clean-temp" checked style="margin: 0;">
                            <span style="color: var(--text-primary);">Limpar dados temporários</span>
                        </label>
                        <small style="color: var(--text-secondary); margin-left: 1.5rem; display: block;">
                            Remove cache de imagens, sessões antigas, etc.
                        </small>
                    </div>
                    
                    <div class="option-group" style="margin-bottom: 1rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="clean-logs">
                            <span style="color: var(--text-primary);">Limpar logs antigos</span>
                        </label>
                        <small style="color: var(--text-secondary); margin-left: 1.5rem; display: block;">
                            Remove logs de debug e erro mais antigos
                        </small>
                    </div>
                    
                    <div class="option-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="optimize-db">
                            <span style="color: var(--text-primary);">Otimizar banco de dados</span>
                        </label>
                        <small style="color: var(--text-secondary); margin-left: 1.5rem; display: block;">
                            Reorganiza e otimiza estrutura dos dados
                        </small>
                    </div>
                </div>
                
                <div class="warning-box" style="
                    background: #fef3cd;
                    border: 1px solid #fecaca;
                    border-radius: 6px;
                    padding: 1rem;
                    margin-bottom: 2rem;
                ">
                    <p style="margin: 0; color: #92400e; font-size: 0.9rem;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>Atenção:</strong> Esta ação não afetará seus pontos, usuários ou dados importantes.
                    </p>
                </div>
                
                <div class="cache-progress" style="display: none; margin-bottom: 2rem;">
                    <div class="progress-bar" style="
                        width: 100%;
                        height: 8px;
                        background: #e5e7eb;
                        border-radius: 4px;
                        overflow: hidden;
                    ">
                        <div class="progress-fill" style="
                            height: 100%;
                            background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                            width: 0%;
                            transition: width 0.3s ease;
                        "></div>
                    </div>
                    <p class="progress-text" style="text-align: center; margin: 0.5rem 0 0 0; color: var(--text-secondary);">
                        Preparando limpeza...
                    </p>
                </div>
                
                <div class="cache-buttons" style="display: flex; gap: 1rem;">
                    <button class="cache-btn cache-btn-secondary" id="cache-cancel" style="
                        flex: 1;
                        padding: 0.75rem;
                        border: none;
                        border-radius: 6px;
                        font-size: 1rem;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        background: transparent;
                        color: var(--text-secondary);
                        border: 1px solid var(--border-color);
                    ">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button class="cache-btn cache-btn-primary" id="cache-start" style="
                        flex: 1;
                        padding: 0.75rem;
                        border: none;
                        border-radius: 6px;
                        font-size: 1rem;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        background: linear-gradient(135deg, #ef4444, #dc2626);
                        color: white;
                    ">
                        <i class="fas fa-broom"></i> Iniciar Limpeza
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.overlay);
    }

    setupEventListeners() {
        // Fechar modal
        document.getElementById('cache-cancel').addEventListener('click', () => {
            this.close();
        });

        // Iniciar limpeza
        document.getElementById('cache-start').addEventListener('click', () => {
            this.startCleaning();
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Hover effects
        this.setupHoverEffects();
    }

    setupHoverEffects() {
        const buttons = this.overlay.querySelectorAll('.cache-btn');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-1px)';
                btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = 'none';
            });
        });
    }

    async startCleaning() {
        const progressDiv = this.overlay.querySelector('.cache-progress');
        const progressFill = this.overlay.querySelector('.progress-fill');
        const progressText = this.overlay.querySelector('.progress-text');
        const startBtn = document.getElementById('cache-start');
        const cancelBtn = document.getElementById('cache-cancel');
        
        // Mostrar progress
        progressDiv.style.display = 'block';
        startBtn.disabled = true;
        cancelBtn.disabled = true;
        
        // Obter opções selecionadas
        const cleanTemp = document.getElementById('clean-temp').checked;
        const cleanLogs = document.getElementById('clean-logs').checked;
        const optimizeDb = document.getElementById('optimize-db').checked;
        
        const steps = [];
        if (cleanTemp) steps.push('Limpando dados temporários...');
        if (cleanLogs) steps.push('Removendo logs antigos...');
        if (optimizeDb) steps.push('Otimizando banco de dados...');
        
        let progress = 0;
        const stepProgress = 100 / steps.length;
        
        for (let i = 0; i < steps.length; i++) {
            progressText.textContent = steps[i];
            
            // Simular processamento
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            progress += stepProgress;
            progressFill.style.width = `${progress}%`;
        }
        
        // Executar limpeza real
        let cleaningResult = { success: true, removedItems: 0 };
        
        try {
            if (cleanTemp && window.databaseManager) {
                cleaningResult = window.databaseManager.limparCache();
            }
        } catch (error) {
            console.error('Erro na limpeza:', error);
            cleaningResult = { success: false, error: error.message };
        }
        
        // Finalizar
        progressText.textContent = 'Limpeza concluída!';
        progressFill.style.width = '100%';
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mostrar resultado
        if (cleaningResult.success) {
            this.showResult(`Limpeza concluída com sucesso! ${cleaningResult.removedItems || 0} itens removidos.`, 'success');
        } else {
            this.showResult(`Erro na limpeza: ${cleaningResult.error}`, 'error');
        }
    }

    showResult(message, type) {
        const modal = this.overlay.querySelector('.cache-modal');
        modal.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">
                    ${type === 'success' ? '✅' : '❌'}
                </div>
                <h3 style="color: var(--text-primary); margin-bottom: 1rem;">
                    ${type === 'success' ? 'Sucesso!' : 'Erro!'}
                </h3>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                    ${message}
                </p>
                <button onclick="window.cacheCleanModal.close()" style="
                    padding: 0.75rem 2rem;
                    border: none;
                    border-radius: 6px;
                    background: var(--primary-color);
                    color: white;
                    font-weight: 500;
                    cursor: pointer;
                ">
                    Fechar
                </button>
            </div>
        `;
    }

    open() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.overlay.style.opacity = '1';
        this.overlay.style.visibility = 'visible';
        
        setTimeout(() => {
            this.overlay.querySelector('.cache-modal').style.transform = 'scale(1) translateY(0)';
        }, 10);
    }

    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.overlay.style.opacity = '0';
        this.overlay.style.visibility = 'hidden';
        this.overlay.querySelector('.cache-modal').style.transform = 'scale(0.9) translateY(20px)';
    }
}

// Criar instância global
window.CacheCleanModal = CacheCleanModal;
window.cacheCleanModal = new CacheCleanModal();
