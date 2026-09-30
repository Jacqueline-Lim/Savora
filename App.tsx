import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { restoreSession } from './src/application/store/authSlice';
import { store } from './src/application/store/store';
import { useAppDispatch } from './src/presentation/hooks/reduxHooks';
import { useAuth } from './src/presentation/hooks/useAuth';
import { MainTabNavigator } from './src/presentation/navigation/MainTabNavigator';
import { RootStackParamList } from './src/presentation/navigation/types';
import { LoginScreen } from './src/presentation/screens/LoginScreen';
import { RecipeDetailScreen } from './src/presentation/screens/RecipeDetailScreen';
import { RecipeFormScreen } from './src/presentation/screens/RecipeFormScreen';
import { TrashScreen } from './src/presentation/screens/TrashScreen';
import { colors } from './src/presentation/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}

function AppContent(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const { session, status } = useAuth();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  if (status === 'checking') {
    return (
      <View accessibilityLiveRegion="polite" style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Restoring Firebase session…</Text>
      </View>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <NavigationContainer theme={DefaultTheme}>
      <Stack.Navigator
        screenOptions={{
          headerBackTitle: 'Back',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.ink,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddRecipe"
          component={RecipeFormScreen}
          options={{ title: 'Add Recipe' }}
        />
        <Stack.Screen
          name="RecipeDetail"
          component={RecipeDetailScreen}
          options={{ title: 'Recipe Details' }}
        />
        <Stack.Screen
          name="Trash"
          component={TrashScreen}
          options={{ title: 'Trash' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.inkMuted,
    fontSize: 16,
  },
});

export default App;
