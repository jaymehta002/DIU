import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SearchScreen } from './src/screens/SearchScreen';
import { BoothDetailScreen } from './src/screens/BoothDetailScreen';
import type { RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Booth Search' }} />
          <Stack.Screen
            name="BoothDetail"
            component={BoothDetailScreen}
            options={{ title: 'Booth Detail' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
