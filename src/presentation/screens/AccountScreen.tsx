import React from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronRight,
  Cloud,
  HardDrive,
  LogOut,
  Mail,
  ShieldCheck,
  Trash2,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../hooks/useAuth';
import { useRecipes } from '../hooks/useRecipes';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

export function AccountScreen(): React.JSX.Element {
  const navigation =
    useNavigation<BottomTabNavigationProp<MainTabParamList, 'Account'>>();
  const { session, logout } = useAuth();
  const { recipes, trashedRecipes } = useRecipes();
  const displayName = session?.user.displayName?.trim() || 'Home chef';
  const initial = displayName.slice(0, 1).toUpperCase();

  const confirmLogout = () => {
    Alert.alert(
      'Sign out?',
      'Your account session will be removed. Recipes saved on this device will remain available after you sign in again.',
      [
        { text: 'Stay signed in', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: () => {
            logout().catch(error => {
              Alert.alert(
                'Could not sign out',
                typeof error === 'string'
                  ? error
                  : 'Your session could not be removed. Please try again.',
              );
            });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View>
          <Text style={styles.title}>Account</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {session?.user.photoUrl ? (
              <Image
                accessibilityLabel={`${displayName}'s profile photo`}
                source={{ uri: session.user.photoUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
          </View>
          <Text style={styles.profileName}>{displayName}</Text>
          <View style={styles.emailRow}>
            <Mail color={colors.inkMuted} size={15} strokeWidth={2} />
            <Text numberOfLines={1} style={styles.profileEmail}>
              {session?.user.email}
            </Text>
          </View>
          <View style={styles.verifiedBadge}>
            <ShieldCheck color={colors.success} size={16} strokeWidth={2.3} />
            <Text style={styles.verifiedText}>Firebase authenticated</Text>
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Cookbook</Text>
          <View style={styles.settingsCard}>
            <InfoRow
              icon={
                <HardDrive color={colors.primary} size={21} strokeWidth={2.1} />
              }
              iconBackground={colors.primarySoft}
              title="Saved on this device"
              value={`${recipes.length} ${
                recipes.length === 1 ? 'recipe' : 'recipes'
              }`}
            />
            <View style={styles.divider} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open cloud sync"
              onPress={() => navigation.navigate('Sync')}
              style={({ pressed }) => [
                styles.linkRow,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.rowIcon, styles.cloudIcon]}>
                <Cloud color={colors.primary} size={21} strokeWidth={2.1} />
              </View>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>Cloud & online recipes</Text>
              </View>
              <ChevronRight
                color={colors.inkSubtle}
                size={20}
                strokeWidth={2}
              />
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open Trash, ${trashedRecipes.length} ${
                trashedRecipes.length === 1 ? 'recipe' : 'recipes'
              }`}
              onPress={() =>
                navigation
                  .getParent<NativeStackNavigationProp<RootStackParamList>>()
                  ?.navigate('Trash')
              }
              style={({ pressed }) => [
                styles.linkRow,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.rowIcon, styles.trashIcon]}>
                <Trash2 color={colors.danger} size={21} strokeWidth={2.1} />
              </View>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>Trash</Text>
                <Text style={styles.rowValue}>
                  {trashedRecipes.length}{' '}
                  {trashedRecipes.length === 1 ? 'recipe' : 'recipes'}
                </Text>
              </View>
              <ChevronRight
                color={colors.inkSubtle}
                size={20}
                strokeWidth={2}
              />
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          onPress={confirmLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressed,
          ]}
        >
          <LogOut color={colors.danger} size={20} strokeWidth={2.2} />
          <Text style={styles.logoutText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  iconBackground: string;
  title: string;
  value: string;
}

function InfoRow({
  icon,
  iconBackground,
  title,
  value,
}: InfoRowProps): React.JSX.Element {
  return (
    <View style={styles.linkRow}>
      <View style={[styles.rowIcon, { backgroundColor: iconBackground }]}>
        {icon}
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    gap: spacing.lg,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    marginTop: 4,
    color: colors.ink,
    fontSize: 29,
    fontWeight: '900',
  },
  profileCard: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 26,
    backgroundColor: colors.ink,
  },
  avatar: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 39,
    backgroundColor: colors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '900',
  },
  profileName: {
    marginTop: 14,
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
  },
  emailRow: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 6,
  },
  profileEmail: {
    color: '#D8CBC5',
    fontSize: 13,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 13,
    backgroundColor: '#E7F6EF',
  },
  verifiedText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '800',
  },
  sectionTitle: {
    marginBottom: 10,
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  settingsCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  linkRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  rowIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  cloudIcon: {
    backgroundColor: colors.surfaceMuted,
  },
  trashIcon: {
    backgroundColor: colors.dangerSurface,
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  rowValue: {
    marginTop: 3,
    color: colors.inkMuted,
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginLeft: 72,
    backgroundColor: colors.border,
  },
  logoutButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#F0B9B4',
    borderRadius: radius.md,
    backgroundColor: colors.dangerSurface,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.72,
  },
});
