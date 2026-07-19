import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/auth';
import { SearchScreen } from './src/screens/SearchScreen';
import { BoothDetailScreen } from './src/screens/BoothDetailScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SplashScreen } from './src/components/SplashScreen';
import { LogoutButton } from './src/components/LogoutButton';
import type { AuthStackParamList, AppStackParamList } from './src/navigation/types';
import { colors, fontWeight } from './src/theme';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const headerScreenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.accent,
  headerTitleStyle: { color: colors.text, fontWeight: fontWeight.semibold },
  headerShadowVisible: false,
} as const;

function RootNavigator() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <SplashScreen />;
  }

  if (status === 'unauthenticated') {
    return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
      </AuthStack.Navigator>
    );
  }

  return (
    <AppStack.Navigator screenOptions={headerScreenOptions}>
      <AppStack.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'Booth Search', headerRight: () => <LogoutButton /> }}
      />
      <AppStack.Screen name="BoothDetail" component={BoothDetailScreen} options={{ title: 'Booth Detail' }} />
    </AppStack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
