// Teste do Dynamic User Button
// Este script pode ser executado no console do navegador para testar o componente

console.log('=== Teste do Dynamic User Button ===');

// Verificar se o componente foi carregado
if (window.dynamicUserButton) {
    console.log('✅ DynamicUserButton carregado:', window.dynamicUserButton);
    
    // Verificar se os botões foram encontrados
    console.log('Desktop button:', window.dynamicUserButton.desktopButton);
    console.log('Mobile button:', window.dynamicUserButton.mobileButton);
    
    // Verificar estado de autenticação
    console.log('Authenticated:', window.dynamicUserButton.isAuthenticated);
    console.log('Is admin:', window.dynamicUserButton.isAdmin);
    console.log('Current user:', window.dynamicUserButton.currentUser);
    
} else {
    console.log('❌ DynamicUserButton não encontrado');
}

// Verificar se AuthManager está disponível
if (window.authManager) {
    console.log('✅ AuthManager disponível');
    console.log('User authenticated:', window.authManager.isAuthenticated());
    if (window.authManager.isAuthenticated()) {
        console.log('Current user:', window.authManager.getCurrentUser());
    }
} else {
    console.log('❌ AuthManager não encontrado');
}

// Verificar se loginModal está disponível
if (window.loginModal) {
    console.log('✅ LoginModal disponível');
} else {
    console.log('❌ LoginModal não encontrado');
}

// Função para testar login
function testLogin() {
    if (window.authManager && window.loginModal) {
        console.log('Abrindo modal de login...');
        window.loginModal.open();
    }
}

// Função para simular logout
function testLogout() {
    if (window.authManager && window.authManager.isAuthenticated()) {
        console.log('Fazendo logout...');
        window.authManager.logout();
    }
}

// Disponibilizar funções globalmente para teste
window.testLogin = testLogin;
window.testLogout = testLogout;

console.log('Para testar:');
console.log('- testLogin() - Abre modal de login');
console.log('- testLogout() - Faz logout se logado');
console.log('=================================');
