/* Debug Console para SIG Entretenimento DF
 * Execute no console do navegador para verificar o estado da aplicação
 */

function debugSigEntretenimento() {
    console.log('🔍 === DEBUG SIG ENTRETENIMENTO DF ===');
    console.log('');
    
    // Verificar managers disponíveis
    console.log('📋 MANAGERS DISPONÍVEIS:');
    console.log('- databaseManager:', typeof window.databaseManager, window.databaseManager ? '✅' : '❌');
    console.log('- mapManager:', typeof window.mapManager, window.mapManager ? '✅' : '❌');
    console.log('- authManager:', typeof window.authManager, window.authManager ? '✅' : '❌');
    console.log('');
    
    // Verificar DatabaseManager
    if (window.databaseManager) {
        console.log('📊 DATABASE MANAGER:');
        const pontos = window.databaseManager.getPontos();
        const categorias = window.databaseManager.getCategorias();
        console.log(`- Pontos confirmados: ${pontos.length}`);
        console.log(`- Categorias: ${categorias.length}`);
        
        if (pontos.length > 0) {
            console.log('- Exemplos de pontos:', pontos.slice(0, 3).map(p => ({
                id: p.id,
                nome: p.nome,
                categoria: p.categoria,
                coordenadas: p.coordenadas
            })));
        }
        
        if (categorias.length > 0) {
            console.log('- Categorias disponíveis:', categorias.map(c => c.id));
        }
    }
    console.log('');
    
    // Verificar MapManager
    if (window.mapManager) {
        console.log('🗺️ MAP MANAGER:');
        console.log('- Mapa inicializado:', window.mapManager.map ? '✅' : '❌');
        console.log('- Marcadores ativos:', window.mapManager.marcadores ? window.mapManager.marcadores.size : 0);
        console.log('- Grupos por categoria:', window.mapManager.gruposPorCategoria ? window.mapManager.gruposPorCategoria.size : 0);
        console.log('- Categoria ativa:', window.mapManager.activeCategory);
        
        if (window.mapManager.gruposPorCategoria) {
            console.log('- Grupos disponíveis:', Array.from(window.mapManager.gruposPorCategoria.keys()));
            
            // Verificar quantos pontos por categoria
            window.mapManager.gruposPorCategoria.forEach((grupo, categoria) => {
                console.log(`  * ${categoria}: ${grupo.getLayers().length} pontos`);
            });
        }
    }
    console.log('');
    
    // Verificar DOM
    console.log('🌐 DOM E INTERFACE:');
    console.log('- Elemento #map:', document.getElementById('map') ? '✅' : '❌');
    console.log('- Container nav-buttons:', document.getElementById('nav-buttons-container') ? '✅' : '❌');
    console.log('- Botões de categoria:', document.querySelectorAll('.nav-btn[data-categoria]').length);
    console.log('');
    
    // Verificar protocolo e servidor
    console.log('🌍 CONEXÃO:');
    console.log('- Protocolo:', window.location.protocol);
    console.log('- Host:', window.location.host);
    console.log('- URL completa:', window.location.href);
    console.log('');
    
    console.log('🎯 AÇÕES DE DEBUG:');
    console.log('Para forçar recarregamento de pontos, execute:');
    console.log('  debugReloadPoints()');
    console.log('');
    console.log('Para verificar dados JSON:');
    console.log('  debugCheckJsonFiles()');
    console.log('');
    console.log('Para forçar filtro "todos":');
    console.log('  debugShowAllPoints()');
}

function debugReloadPoints() {
    console.log('🔄 Forçando recarregamento de pontos...');
    
    if (window.mapManager && window.mapManager.reloadPoints) {
        window.mapManager.reloadPoints('visitor', null);
    } else {
        console.error('❌ MapManager ou método reloadPoints não disponível');
    }
}

async function debugCheckJsonFiles() {
    console.log('📁 Verificando arquivos JSON...');
    
    const files = [
        'database/pontos_confirmados.json',
        'database/categorias.json',
        'database/pontos_pendentes.json',
        'database/usuarios.json'
    ];
    
    for (const file of files) {
        try {
            const response = await fetch(file);
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${file}: ${Array.isArray(data) ? data.length : Object.keys(data).length} itens`);
            } else {
                console.error(`❌ ${file}: HTTP ${response.status}`);
            }
        } catch (error) {
            console.error(`❌ ${file}: ${error.message}`);
        }
    }
}

function debugShowAllPoints() {
    console.log('🔍 Forçando exibição de todos os pontos...');
    
    if (window.mapManager && window.mapManager.filterByCategory) {
        window.mapManager.filterByCategory('todos');
    } else {
        console.error('❌ MapManager ou método filterByCategory não disponível');
    }
}

function debugClearAndReload() {
    console.log('🗑️ Limpando cache e recarregando...');
    
    if (window.mapManager) {
        window.mapManager.clearMarkers();
        window.mapManager.limparCacheIcones();
        setTimeout(() => {
            debugReloadPoints();
            setTimeout(() => debugShowAllPoints(), 500);
        }, 100);
    }
}

// Executar debug automático
debugSigEntretenimento();

// Expor funções globalmente para fácil acesso
window.debugSig = debugSigEntretenimento;
window.debugReloadPoints = debugReloadPoints;
window.debugCheckJsonFiles = debugCheckJsonFiles;
window.debugShowAllPoints = debugShowAllPoints;
window.debugClearAndReload = debugClearAndReload;
