import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BottomTabBarButtonProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { Cloud, Home, Plus, Search, UserRound } from 'lucide-react-native';

import { AccountScreen } from '../screens/AccountScreen';
import { RecipeListScreen } from '../screens/RecipeListScreen';
import { RecipeSearchScreen } from '../screens/RecipeSearchScreen';
import { SyncScreen } from '../screens/SyncScreen';
import { colors } from '../theme';
import { MainTabParamList, RootStackParamList } from './types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface TabIconProps {
  color: string;
  size: number;
}

function HomeTabIcon({ color, size }: TabIconProps): React.JSX.Element {
  return <Home color={color} size={size} strokeWidth={2.2} />;
}

function SearchTabIcon({ color, size }: TabIconProps): React.JSX.Element {
  return <Search color={color} size={size} strokeWidth={2.2} />;
}

function SyncTabIcon({ color, size }: TabIconProps): React.JSX.Element {
  return <Cloud color={color} size={size} strokeWidth={2.2} />;
}

function AccountTabIcon({ color, size }: TabIconProps): React.JSX.Element {
  return <UserRound color={color} size={size} strokeWidth={2.2} />;
}

function AddPlaceholder(): React.JSX.Element {
  return <View />;
}

function AddTabButton({ onPress }: BottomTabBarButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add recipe"
      accessibilityHint="Opens the new recipe form"
      onPress={onPress}
      style={({ pressed }) => [styles.addSlot, pressed && styles.pressed]}
    >
      <View style={styles.addButton}>
        <Plus color={colors.white} size={28} strokeWidth={2.6} />
      </View>
      <Text style={styles.addLabel}>Add</Text>
    </Pressable>
  );
}

export function MainTabNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkSubtle,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="Home"
        component={RecipeListScreen}
        options={{
          tabBarAccessibilityLabel: 'Home tab',
          tabBarIcon: HomeTabIcon,
        }}
      />
      <Tab.Screen
        name="Search"
        component={RecipeSearchScreen}
        options={{
          tabBarAccessibilityLabel: 'Search recipes tab',
          tabBarIcon: SearchTabIcon,
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddPlaceholder}
        listeners={({ navigation }) => ({
          tabPress: event => {
            event.preventDefault();
            navigation
              .getParent<NativeStackNavigationProp<RootStackParamList>>()
              ?.navigate('AddRecipe');
          },
        })}
        options={{
          tabBarButton: AddTabButton,
        }}
      />
      <Tab.Screen
        name="Sync"
        component={SyncScreen}
        options={{
          tabBarAccessibilityLabel: 'Sync recipes tab',
          tabBarIcon: SyncTabIcon,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarAccessibilityLabel: 'Account tab',
          tabBarIcon: AccountTabIcon,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 88 : 76,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 22 : 9,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    elevation: 18,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  addSlot: {
    flex: 1,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'flex-start',
    transform: [{ translateY: -18 }],
  },
  addButton: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    borderWidth: 4,
    borderColor: colors.background,
    backgroundColor: colors.primary,
    elevation: 8,
    shadowColor: colors.primaryPressed,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 9,
  },
  addLabel: {
    marginTop: 2,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.75,
  },
});
