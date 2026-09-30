import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRecipeImageSource } from '../../data/seedRecipeImages';
import { getRecipeTypeName } from '../../data/recipeTypes';
import { AppButton } from '../components/AppButton';
import { RecipeForm } from '../components/RecipeForm';
import { useRecipes } from '../hooks/useRecipes';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'>;

export function RecipeDetailScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const { getRecipe, updateRecipe, moveRecipeToTrash } = useRecipes();
  const recipe = getRecipe(route.params.recipeId);
  const [isEditing, setIsEditing] = useState(false);
  const [isMovingToTrash, setIsMovingToTrash] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Recipe' : 'Recipe Details',
    });
  }, [isEditing, navigation]);

  if (!recipe) {
    return (
      <View style={styles.missingContainer}>
        <Text style={styles.missingTitle}>Recipe not found</Text>
        <AppButton
          label="Back to recipes"
          onPress={() => navigation.popToTop()}
        />
      </View>
    );
  }

  if (isEditing) {
    return (
      <RecipeForm
        initialValue={{
          title: recipe.title,
          typeId: recipe.typeId,
          imageUri: recipe.imageUri,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
        }}
        submitLabel="Update recipe"
        onSubmit={async input => {
          await updateRecipe(recipe.id, input);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  const confirmMoveToTrash = () => {
    Alert.alert(
      'Move recipe to Trash?',
      `“${recipe.title}” can be restored later from Account > Trash.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move to Trash',
          style: 'destructive',
          onPress: () => {
            performMoveToTrash().catch(() => undefined);
          },
        },
      ],
    );
  };

  const performMoveToTrash = async () => {
    setIsMovingToTrash(true);
    setErrorMessage(null);
    try {
      await moveRecipeToTrash(recipe.id);
      navigation.popToTop();
    } catch (error) {
      setErrorMessage(
        typeof error === 'string'
          ? error
          : error instanceof Error
          ? error.message
          : 'The recipe could not be moved to Trash. Please try again.',
      );
      setIsMovingToTrash(false);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroImageFrame}>
          <Image
            accessibilityLabel={`Photo of ${recipe.title}`}
            source={getRecipeImageSource(recipe.imageUri)}
            resizeMode="cover"
            style={styles.heroImage}
          />
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.type}>{getRecipeTypeName(recipe.typeId)}</Text>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.summary}>
            {recipe.ingredients.length} ingredients · {recipe.steps.length}{' '}
            steps
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={`${ingredient}-${index}`} style={styles.listRow}>
              <Text accessibilityElementsHidden style={styles.bullet}>
                •
              </Text>
              <Text style={styles.listText}>{ingredient}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Steps</Text>
          {recipe.steps.map((step, index) => (
            <View key={`${step}-${index}`} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.listText}>{step}</Text>
            </View>
          ))}
        </View>

        {errorMessage ? (
          <View accessibilityLiveRegion="polite" style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <AppButton
            label="Edit recipe"
            accessibilityHint="Makes the photo, recipe type, ingredients, and steps editable"
            onPress={() => setIsEditing(true)}
          />
          <AppButton
            label="Move to Trash"
            onPress={confirmMoveToTrash}
            loading={isMovingToTrash}
            variant="danger"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  heroImageFrame: {
    width: '100%',
    aspectRatio: 16 / 9,
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  titleBlock: {
    gap: spacing.xs,
  },
  type: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 37,
  },
  summary: {
    color: colors.inkMuted,
    fontSize: 15,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '800',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bullet: {
    width: 20,
    color: colors.primary,
    fontSize: 22,
    lineHeight: 24,
    textAlign: 'center',
  },
  listText: {
    flex: 1,
    color: colors.ink,
    fontSize: 16,
    lineHeight: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: colors.surfaceMuted,
  },
  stepNumberText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  errorBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSurface,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    gap: spacing.sm,
  },
  missingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  missingTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
});
