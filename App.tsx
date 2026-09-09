import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ReportsProvider } from './src/context/ReportsContext';
import AuthStack from './src/navigation/AuthStack';
import MainTabs from './src/navigation/MainTabs';

function Root() {
  const { user } = useAuth();
  // Renderização condicional: deslogado mostra AuthStack; logado mostra MainTabs.
  // A troca condicional desmonta/remonta o navigator, garantindo que o logout
  // retorne de fato para a tela de Login/Cadastro.
  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ReportsProvider>
            <StatusBar style="dark" />
            <Root />
          </ReportsProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
