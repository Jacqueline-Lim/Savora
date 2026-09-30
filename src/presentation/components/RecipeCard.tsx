import React from 'react';
import {
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { ListChecks, ShoppingBasket } from 'lucide-react-native';

import { getRecipeImageSource } from '../../data/seedRecipeImages';
import { Recipe } from '../../domain/models/Recipe';
import { colors, radius, spacing } from '../theme';

interface RecipeCardProps {
  recipe: Recipe;
  typeName: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function RecipeCard({
  recipe,
  typeName,
  onPress,
  style,
}: RecipeCardProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${recipe.title}, ${typeName}, ${recipe.ingredients.length} ingredients and ${recipe.steps.length} steps`}
      accessibilityHint="Opens the recipe details"
      onPress={onPress}
      style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}
    >
      <View style={styles.imageFrame}>
        <Image
          accessibilityIgnoresInvertColors
          source={getRecipeImageSource(recipe.imageUri)}
          resizeMode="cover"
          style={styles.image}
        />
        <View style={styles.typeBadge}>
          <Text numberOfLines={1} style={styles.type}>
            {typeName}
          </Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          {recipe.title}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <ShoppingBasket color={colors.inkMuted} size={14} strokeWidth={2} />
            <Text style={styles.metaText}>{recipe.ingredients.length}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <ListChecks color={colors.inkMuted} size={14} strokeWidth={2} />
            <Text style={styles.metaText}>{recipe.steps.length} steps</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }],
  },
  imageFrame: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1.28,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    maxWidth: '82%',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
  },
  type: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  content: {
    minHeight: 91,
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: 12,
  },
  title: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  metaText: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: '600',
  },
});
