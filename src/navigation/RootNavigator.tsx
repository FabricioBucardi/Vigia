import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../screens/auth/AuthScreen';
import MainTabs from './MainTabs';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

type RootNavigatorProps = {
  initialRouteName?: keyof RootStackParamList;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator({ initialRouteName = 'Auth' }: RootNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}
