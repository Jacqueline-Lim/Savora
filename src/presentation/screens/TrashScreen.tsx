import React, { useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRecipeImageSource } from '../../data/seedRecipeImages';
import { getRecipeTypeName } from '../../data/recipeTypes';
import { Recipe } from '../../domain/models/Recipe';
import { AppButton } from '../components/AppButton';
import { useRecipes } from '../hooks/useRecipes';
import { colors, radius, spacing } from '../theme';

type TrashAction = 'restore' | 'delete';

interface ActiveAction {
  recipeId: string;
  action: TrashAction;
}

export function TrashScreen(): React.JSX.Element {
  const { trashedRecipes, restoreRecipe, permanentlyDeleteRecipe } =
    useRecipes();
  const [activeAction, setActiveAction] = useState<ActiveAction | null>(null);

  const restore = async (recipe: Recipe) => {
    setActiveAction({ recipeId: recipe.id, action: 'restore' });
    try {
      await restoreRecipe(recipe.id);
    } catch (error) {
      showActionError(error, 'The recipe could not be restored.');
    } finally {
      setActiveAction(null);
    }
  };

  const deleteForever = async (recipe: Recipe) => {
    setActiveAction({ recipeId: recipe.id, action: 'delete' });
    try {
      await permanentlyDeleteRecipe(recipe.id);
    } catch (error) {
      showActionError(error, 'The recipe could not be permanently deleted.');
    } finally {
      setActiveAction(null);
    }
  };

  const confirmDeleteForever = (recipe: Recipe) => {
    Alert.alert(
      'Delete forever?',
      `“${recipe.title}” will be removed from this device and Firebase. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete forever',
          style: 'destructive',
          onPress: () => {
            deleteForever(recipe).catch(() => undefined);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <FlatList
        data={trashedRecipes}
        keyExtractor={recipe => recipe.id}
        contentContainerStyle={[
          styles.content,
          trashedRecipes.length === 0 && styles.emptyContent,
        ]}
        renderItem={({ item }) => {
          const restoring =
            activeAction?.recipeId === item.id &&
            activeAction.action === 'restore';
          const deleting =
            activeAction?.recipeId === item.id &&
            activeAction.action === 'delete';
          const anotherActionIsRunning =
            activeAction !== null && activeAction.recipeId !== item.id;

          return (
            <View style={styles.card}>
              <View style={styles.recipeRow}>
                <Image
                  accessibilityLabel={`Photo of ${item.title}`}
                  source={getRecipeImageSource(item.imageUri)}
                  resizeMode="cover"
                  style={styles.image}
                />
                <View style={styles.recipeCopy}>
                  <Text numberOfLines={2} style={styles.recipeTitle}>
                    {item.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.recipeType}>
                    {getRecipeTypeName(item.typeId)}
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <AppButton
                  label="Restore"
                  variant="secondary"
                  disabled={anotherActionIsRunning || deleting}
                  loading={restoring}
                  onPress={() => {
                    restore(item).catch(() => undefined);
                  }}
                  style={styles.actionButton}
                />
                <AppButton
                  label="Delete forever"
                  variant="danger"
                  disabled={anotherActionIsRunning || restoring}
                  loading={deleting}
                  onPress={() => confirmDeleteForever(item)}
                  style={styles.actionButton}
                />
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Trash2 color={colors.primary} size={30} strokeWidth={1.9} />
            </View>
            <Text style={styles.emptyTitle}>Trash is empty</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function showActionError(error: unknown, fallback: string): void {
  Alert.alert(
    'Something went wrong',
    typeof error === 'string'
      ? error
      : error instanceof Error
      ? error.message
      : fallback,
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
    gap: 12,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    gap: spacing.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  recipeCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  recipeTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  recipeType: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
});
