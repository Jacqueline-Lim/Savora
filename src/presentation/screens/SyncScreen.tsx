import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CheckCircle2,
  Cloud,
  Database,
  Globe2,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../hooks/useAuth';
import { useRecipes } from '../hooks/useRecipes';
import { colors, radius, spacing } from '../theme';

export function SyncScreen(): React.JSX.Element {
  const [activeAction, setActiveAction] = useState<SyncActionKey | null>(null);
  const { session } = useAuth();
  const {
    recipes,
    isSyncing,
    syncMessage,
    syncSucceeded,
    reload,
    syncFirebaseRecipes,
    syncOnlineRecipes,
  } = useRecipes();
  const actionsAreBusy = isSyncing || activeAction !== null;

  const runAction = async (
    action: SyncActionKey,
    operation: () => Promise<void>,
  ) => {
    setActiveAction(action);
    try {
      await operation();
    } finally {
      setActiveAction(null);
    }
  };

  useEffect(() => {
    if (recipes.length === 0) {
      reload().catch(() => undefined);
    }
  }, [recipes.length, reload]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View>
          <Text style={styles.title}>Sync & discover</Text>
        </View>

        <View style={styles.overviewCard}>
          <View style={styles.overviewIcon}>
            <Database color={colors.primary} size={25} strokeWidth={2.1} />
          </View>
          <View style={styles.overviewCopy}>
            <Text style={styles.overviewValue}>{recipes.length}</Text>
            <Text style={styles.overviewLabel}>Recipes</Text>
          </View>
          <View style={styles.secureBadge}>
            <ShieldCheck color={colors.success} size={15} strokeWidth={2.3} />
            <Text style={styles.secureText}>Private</Text>
          </View>
        </View>

        {syncMessage ? (
          <View
            accessibilityLiveRegion="polite"
            style={[
              styles.messageCard,
              syncSucceeded === false && styles.errorMessageCard,
            ]}
          >
            {syncSucceeded === false ? (
              <TriangleAlert
                color={colors.danger}
                size={20}
                strokeWidth={2.2}
              />
            ) : (
              <CheckCircle2
                color={colors.success}
                size={20}
                strokeWidth={2.2}
              />
            )}
            <Text
              style={[
                styles.messageText,
                syncSucceeded === false && styles.errorMessageText,
              ]}
            >
              {syncMessage}
            </Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Actions</Text>

        <View style={styles.actionPanel}>
          <SyncActionRow
            icon={<Cloud color={colors.white} size={22} strokeWidth={2.1} />}
            iconBackground={colors.primary}
            title="Firebase cloud backup"
            actionLabel="Sync"
            loading={activeAction === 'cloud'}
            disabled={actionsAreBusy}
            onPress={() => {
              if (session) {
                runAction('cloud', () =>
                  syncFirebaseRecipes(session.user.id),
                ).catch(() => undefined);
              }
            }}
          />

          <View style={styles.actionDivider} />

          <SyncActionRow
            icon={<Globe2 color={colors.primary} size={22} strokeWidth={2.1} />}
            iconBackground={colors.primarySoft}
            title="Discover online recipes"
            actionLabel="Import"
            loading={activeAction === 'import'}
            disabled={actionsAreBusy}
            onPress={() => {
              runAction('import', syncOnlineRecipes).catch(() => undefined);
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type SyncActionKey = 'cloud' | 'import';

interface SyncActionRowProps {
  icon: React.ReactNode;
  iconBackground: string;
  title: string;
  actionLabel: string;
  loading: boolean;
  disabled?: boolean;
  onPress: () => void;
}

function SyncActionRow({
  icon,
  iconBackground,
  title,
  actionLabel,
  loading,
  disabled = false,
  onPress,
}: SyncActionRowProps): React.JSX.Element {
  return (
    <View style={styles.actionRow}>
      <View style={[styles.actionIcon, { backgroundColor: iconBackground }]}>
        {icon}
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: loading || disabled, busy: loading }}
        disabled={loading || disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.actionButton,
          pressed && styles.pressed,
          (loading || disabled) && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : null}
        <Text style={styles.actionButtonText}>
          {loading ? '' : actionLabel}
        </Text>
      </Pressable>
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
    maxWidth: 760,
    alignSelf: 'center',
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    marginTop: 4,
    color: colors.ink,
    fontSize: 29,
    fontWeight: '900',
    lineHeight: 35,
  },
  overviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
  },
  overviewIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
  },
  overviewCopy: {
    flex: 1,
  },
  overviewValue: {
    color: colors.white,
    fontSize: 23,
    fontWeight: '900',
  },
  overviewLabel: {
    color: '#D8CBC5',
    fontSize: 12,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#E7F6EF',
  },
  secureText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '800',
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: '#E7F6EF',
  },
  errorMessageCard: {
    backgroundColor: colors.dangerSurface,
  },
  messageText: {
    flex: 1,
    color: colors.success,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  errorMessageText: {
    color: colors.danger,
  },
  sectionTitle: {
    marginTop: spacing.sm,
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  actionPanel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  actionRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
  },
  actionDivider: {
    height: 1,
    marginLeft: 72,
    backgroundColor: colors.border,
  },
  actionIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  actionTitle: {
    flex: 1,
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  actionButton: {
    minWidth: 76,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.76,
  },
  disabled: {
    opacity: 0.62,
  },
});
