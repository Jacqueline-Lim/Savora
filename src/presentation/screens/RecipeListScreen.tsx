import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  CompositeNavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_LOGO, APP_NAME } from '../../config/branding';
import { getRecipeTypeName, recipeTypes } from '../../data/recipeTypes';
import { AppButton } from '../components/AppButton';
import { RecipeCard } from '../components/RecipeCard';
import { useAuth } from '../hooks/useAuth';
import { useRecipeFilter } from '../hooks/useRecipeFilter';
import { useRecipes } from '../hooks/useRecipes';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type HomeNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const CARD_GAP = 12;
const CONTENT_PADDING = 16;
const MAX_CONTENT_WIDTH = 1000;

function CardSeparator(): React.JSX.Element {
  return <View style={styles.cardSeparator} />;
}

export function RecipeListScreen(): React.JSX.Element {
  const navigation = useNavigation<HomeNavigation>();
  const { width } = useWindowDimensions();
  const { session } = useAuth();
  const { recipes, isLoading, errorMessage, reload } = useRecipes();
  const [selectedTypeId, setSelectedTypeId] = useState('all');
  const filteredRecipes = useRecipeFilter(recipes, '', selectedTypeId);
  const columnCount = width >= 760 ? 3 : 2;
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH) - CONTENT_PADDING * 2;
  const cardWidth = (contentWidth - CARD_GAP * (columnCount - 1)) / columnCount;

  useEffect(() => {
    reload().catch(() => undefined);
  }, [reload]);

  if (isLoading && recipes.length === 0) {
    return (
      <View accessibilityLiveRegion="polite" style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.statusText}>Preparing your kitchen...</Text>
      </View>
    );
  }

  if (errorMessage && recipes.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>We could not load your recipes</Text>
        <Text style={styles.emptyText}>{errorMessage}</Text>
        <AppButton
          label="Try again"
          onPress={() => reload().catch(() => undefined)}
        />
      </View>
    );
  }

  const displayName = session?.user.displayName?.trim() || 'Home chef';
  const firstName = displayName.split(/\s+/)[0];

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        key={columnCount}
        data={filteredRecipes}
        numColumns={columnCount}
        keyExtractor={item => item.id}
        columnWrapperStyle={styles.cardRow}
        ItemSeparatorComponent={CardSeparator}
        onRefresh={() => reload().catch(() => undefined)}
        refreshing={isLoading}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.topBar}>
              <View style={styles.brand}>
                <Image
                  accessibilityIgnoresInvertColors
                  source={APP_LOGO}
                  resizeMode="contain"
                  style={styles.brandLogo}
                />
                <Text style={styles.brandName}>{APP_NAME}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open account"
                onPress={() => navigation.navigate('Account')}
                style={({ pressed }) => [
                  styles.avatar,
                  pressed && styles.pressed,
                ]}
              >
                {session?.user.photoUrl ? (
                  <Image
                    source={{ uri: session.user.photoUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {firstName.slice(0, 1).toUpperCase()}
                  </Text>
                )}
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Search recipes and ingredients"
              onPress={() => navigation.navigate('Search')}
              style={({ pressed }) => [
                styles.searchShortcut,
                pressed && styles.pressed,
              ]}
            >
              <Search color={colors.inkMuted} size={21} strokeWidth={2.1} />
              <Text style={styles.searchPlaceholder}>
                Search recipes or ingredients
              </Text>
              <View style={styles.searchAction}>
                <Text style={styles.searchActionText}>Search</Text>
              </View>
            </Pressable>

            <View style={styles.sectionHeadingRow}>
              <View>
                <Text style={styles.eyebrow}>EXPLORE</Text>
                <Text style={styles.sectionTitle}>Browse by type</Text>
              </View>
              {selectedTypeId !== 'all' ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSelectedTypeId('all')}
                  hitSlop={10}
                >
                  <Text style={styles.textButton}>Show all</Text>
                </Pressable>
              ) : null}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              <CategoryChip
                label="All recipes"
                count={recipes.length}
                selected={selectedTypeId === 'all'}
                onPress={() => setSelectedTypeId('all')}
              />
              {recipeTypes.map(type => (
                <CategoryChip
                  key={type.id}
                  label={type.name}
                  count={
                    recipes.filter(recipe => recipe.typeId === type.id).length
                  }
                  selected={selectedTypeId === type.id}
                  onPress={() => setSelectedTypeId(type.id)}
                />
              ))}
            </ScrollView>

            <View style={styles.sectionHeadingRow}>
              <View>
                <Text style={styles.eyebrow}>YOUR COLLECTION</Text>
                <Text style={styles.sectionTitle}>
                  {selectedTypeId === 'all'
                    ? 'Recently updated'
                    : getRecipeTypeName(selectedTypeId)}
                </Text>
              </View>
              <Text accessibilityLiveRegion="polite" style={styles.resultCount}>
                {filteredRecipes.length}{' '}
                {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Image
              accessibilityIgnoresInvertColors
              source={APP_LOGO}
              resizeMode="contain"
              style={styles.emptyLogo}
            />
            <Text style={styles.emptyTitle}>No recipes in this type yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            typeName={getRecipeTypeName(item.typeId)}
            style={{ width: cardWidth }}
            onPress={() =>
              navigation.navigate('RecipeDetail', { recipeId: item.id })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

interface CategoryChipProps {
  label: string;
  count: number;
  selected: boolean;
  onPress: () => void;
}

function CategoryChip({
  label,
  count,
  selected,
  onPress,
}: CategoryChipProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.categoryChip,
        selected && styles.categoryChipSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[styles.categoryLabel, selected && styles.categoryLabelSelected]}
      >
        {label}
      </Text>
      <View
        style={[styles.categoryCount, selected && styles.categoryCountSelected]}
      >
        <Text
          style={[
            styles.categoryCountText,
            selected && styles.categoryCountTextSelected,
          ]}
        >
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  statusText: {
    color: colors.inkMuted,
    fontSize: 15,
  },
  listContent: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: CONTENT_PADDING,
    paddingTop: 8,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  topBar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogo: {
    width: 48,
    height: 48,
  },
  brandName: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  avatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: 22,
    backgroundColor: colors.primary,
    elevation: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  searchShortcut: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  searchPlaceholder: {
    flex: 1,
    color: colors.inkMuted,
    fontSize: 14,
  },
  searchAction: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  searchActionText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  sectionTitle: {
    marginTop: 3,
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
  },
  textButton: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  resultCount: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  categoryRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  categoryChip: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  categoryChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  categoryLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  categoryLabelSelected: {
    color: colors.white,
  },
  categoryCount: {
    minWidth: 23,
    height: 23,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  categoryCountSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  categoryCountText: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  categoryCountTextSelected: {
    color: colors.white,
  },
  cardRow: {
    gap: CARD_GAP,
  },
  cardSeparator: {
    height: CARD_GAP,
  },
  emptyState: {
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyLogo: {
    width: 64,
    height: 64,
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyText: {
    maxWidth: 330,
    color: colors.inkMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
