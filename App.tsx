import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

function Root() {
  const { user } = useAuth();
  // Alterna o estado autenticado/não autenticado gerenciando o index do stack.
  // user === null -> mostra Auth; user !== null -> mostra Main.
  return (
    <NavigationContainer>
      <RootNavigator key={user ? 'authed' : 'guest'} initialRouteName={user ? 'Main' : 'Auth'} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <Root />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
