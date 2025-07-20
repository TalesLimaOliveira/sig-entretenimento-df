# Guia de Migração - SIG Entretenimento DF

## Migração para React Native

### Considerações Arquiteturais

#### 1. Estrutura de Projeto
```
Current Web Structure → React Native Structure
src/js/               → src/
  app.js             →   App.js (Main Component)
  database.js        →   services/DatabaseService.js
  auth.js            →   services/AuthService.js
  map.js             →   components/MapComponent.js
  theme.js           →   context/ThemeContext.js

src/css/             → src/styles/
  main.css           →   GlobalStyles.js
  components.css     →   ComponentStyles.js
  colors.css         →   theme.js

src/components/      → src/components/
  *.js               →   *.jsx (React Components)
```

#### 2. Padrões de Conversão

##### Managers → Services/Hooks
```javascript
// Web (Manager Class)
class DatabaseManager {
    constructor() { }
    getPontos() { }
}

// React Native (Service + Hook)
// services/DatabaseService.js
export const DatabaseService = {
    getPontos: async () => { }
};

// hooks/useDatabase.js
export const useDatabase = () => {
    const [pontos, setPontos] = useState([]);
    
    const getPontos = useCallback(async () => {
        const data = await DatabaseService.getPontos();
        setPontos(data);
    }, []);
    
    return { pontos, getPontos };
};
```

##### CSS → StyleSheet
```javascript
// Web CSS
.nav-btn {
    padding: 1rem;
    background: var(--primary-color);
    border-radius: 8px;
}

// React Native StyleSheet
const styles = StyleSheet.create({
    navBtn: {
        padding: 16,
        backgroundColor: theme.primaryColor,
        borderRadius: 8,
    }
});
```

### Bibliotecas e Dependências

#### Mapeamento de Dependências
```json
{
    "leaflet": "react-native-maps",
    "font-awesome": "react-native-vector-icons",
    "localStorage": "@react-native-async-storage/async-storage",
    "fetch": "built-in",
    "CSS Grid/Flexbox": "React Native Flexbox"
}
```

#### Instalação React Native
```bash
# Principais dependências
npm install react-native-maps
npm install react-native-vector-icons
npm install @react-native-async-storage/async-storage
npm install @react-navigation/native
npm install @react-navigation/stack
npm install react-native-safe-area-context
npm install react-native-screens
```

### Componentes de Migração

#### 1. Componente Principal (App.js)
```javascript
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import MainNavigator from './src/navigation/MainNavigator';
import LoadingScreen from './src/components/LoadingScreen';

export default function App() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            // Migrar lógica de inicialização do PontosEntretenimentoApp
            await DatabaseService.initialize();
            await AuthService.initialize();
            setIsReady(true);
        } catch (error) {
            console.error('Erro na inicialização:', error);
        }
    };

    if (!isReady) {
        return <LoadingScreen />;
    }

    return (
        <ThemeProvider>
            <AuthProvider>
                <NavigationContainer>
                    <MainNavigator />
                </NavigationContainer>
            </AuthProvider>
        </ThemeProvider>
    );
}
```

#### 2. Mapa Component
```javascript
import React, { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { useDatabase } from '../hooks/useDatabase';
import { useAuth } from '../hooks/useAuth';

export default function MapComponent() {
    const { pontos, getPontos } = useDatabase();
    const { user } = useAuth();
    const [region, setRegion] = useState({
        latitude: -15.7801,
        longitude: -47.9292,
        latitudeDelta: 0.3,
        longitudeDelta: 0.3,
    });

    useEffect(() => {
        loadPontos();
    }, [user]);

    const loadPontos = async () => {
        await getPontos(user?.role, user?.username);
    };

    return (
        <MapView
            style={{ flex: 1 }}
            region={region}
            onRegionChangeComplete={setRegion}
        >
            {pontos.map(ponto => (
                <Marker
                    key={ponto.id}
                    coordinate={{
                        latitude: ponto.latitude,
                        longitude: ponto.longitude
                    }}
                    title={ponto.nome}
                    description={ponto.descricao}
                />
            ))}
        </MapView>
    );
}
```

#### 3. Context para Autenticação
```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/AuthService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuthState();
    }, []);

    const checkAuthState = async () => {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
        }
    };

    const login = async (username, password) => {
        const userData = await AuthService.login(username, password);
        if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = async () => {
        await AuthService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};
```

### Persistência de Dados

#### AsyncStorage (substituindo localStorage)
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageService = {
    async setItem(key, value) {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
        }
    },

    async getItem(key) {
        try {
            const value = await AsyncStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return null;
        }
    },

    async removeItem(key) {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error('Erro ao remover dados:', error);
        }
    }
};
```

### Navegação

#### Stack Navigator
```javascript
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MapScreen from '../screens/MapScreen';
import LoginScreen from '../screens/LoginScreen';
import AdminScreen from '../screens/AdminScreen';
import { useAuth } from '../hooks/useAuth';

const Stack = createStackNavigator();

export default function MainNavigator() {
    const { isAuthenticated, user } = useAuth();

    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="Map" 
                component={MapScreen}
                options={{ headerShown: false }}
            />
            {!isAuthenticated && (
                <Stack.Screen 
                    name="Login" 
                    component={LoginScreen}
                    options={{ presentation: 'modal' }}
                />
            )}
            {user?.role === 'administrator' && (
                <Stack.Screen 
                    name="Admin" 
                    component={AdminScreen}
                />
            )}
        </Stack.Navigator>
    );
}
```

### Componentes de Interface

#### Botões Nativos
```javascript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export const CategoryButton = ({ category, isActive, onPress }) => {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                isActive && styles.buttonActive
            ]}
            onPress={() => onPress(category.id)}
        >
            <Text style={[
                styles.buttonText,
                isActive && styles.buttonTextActive
            ]}>
                {category.nome}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
    },
    buttonActive: {
        backgroundColor: '#007bff',
    },
    buttonText: {
        fontSize: 14,
        color: '#333',
    },
    buttonTextActive: {
        color: '#fff',
    }
});
```

## Migração para Outros Frameworks

### React.js Web
- Converter classes para functional components
- Implementar hooks customizados
- Usar Context API para estado global
- Manter Leaflet para mapas

### Vue.js
- Converter classes para Composition API
- Usar Pinia para gerenciamento de estado
- Integrar Vue-Leaflet para mapas
- Manter estrutura de services

### Angular
- Converter para services e components
- Usar RxJS para reatividade
- Implementar guards para autenticação
- Integrar Angular-Leaflet

### Svelte
- Converter para stores e components
- Usar stores writables para estado
- Manter arquitetura de serviços
- Integrar Leaflet diretamente

## Considerações Gerais

### Pontos de Atenção
1. **Performance**: React Native tem limitações de performance para mapas com muitos pontos
2. **Permissões**: Necessário configurar permissões de localização
3. **Platform Differences**: iOS e Android têm comportamentos diferentes
4. **Bundle Size**: Otimizar imports e usar metro bundler

### Estratégias de Migração
1. **Incremental**: Migrar um componente por vez
2. **Feature Parity**: Manter todas as funcionalidades
3. **Testing**: Implementar testes unitários e e2e
4. **Performance**: Otimizar desde o início

### Ferramentas Recomendadas
- **Development**: Expo CLI ou React Native CLI
- **Testing**: Jest + React Native Testing Library
- **State Management**: Context API + useReducer ou Zustand
- **Navigation**: React Navigation
- **Maps**: react-native-maps
- **Icons**: react-native-vector-icons
