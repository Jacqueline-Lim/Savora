import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  CompositeNavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChefHat, Search, SlidersHorizontal, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRecipeTypeName, recipeTypes } from '../../data/recipeTypes';
import { RecipeCard } from '../components/RecipeCard';
import { useRecipeFilter } from '../hooks/useRecipeFilter';
import { useRecipes } from '../hooks/useRecipes';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type SearchNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Search'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const CARD_GAP = 12;
const CONTENT_PADDING = 16;
const MAX_CONTENT_WIDTH = 1000;

function CardSeparator(): React.JSX.Element {
  return <View style={styles.cardSeparator} />;
}

export function RecipeSearchScreen(): React.JSX.Element {
  const navigation = useNavigation<SearchNavigation>();
  const { width } = useWindowDimensions();
  const { recipes, reload } = useRecipes();
  const [query, setQuery] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('all');
  const filteredRecipes = useRecipeFilter(recipes, query, selectedTypeId);
  const columnCount = width >= 760 ? 3 : 2;
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH) - CONTENT_PADDING * 2;
  const cardWidth = (contentWidth - CARD_GAP * (columnCount - 1)) / columnCount;

  useEffect(() => {
    if (recipes.length === 0) {
      reload().catch(() => undefined);
    }
  }, [recipes.length, reload]);

  const isFiltering = Boolean(query.trim()) || selectedTypeId !== 'all';

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        key={columnCount}
        data={filteredRecipes}
        numColumns={columnCount}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id}
        columnWrapperStyle={styles.cardRow}
        ItemSeparatorComponent={CardSeparator}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Search your cookbook</Text>
            </View>

            <View style={styles.searchBox}>
              <Search color={colors.primary} size={21} strokeWidth={2.2} />
              <TextInput
                accessibilityLabel="Search recipes or ingredients"
                value={query}
                onChangeText={setQuery}
                placeholder="Try 'pasta' or 'tomato'"
                placeholderTextColor={colors.inkSubtle}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                style={styles.input}
              />
              {query ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  onPress={() => setQuery('')}
                  hitSlop={8}
                  style={styles.clearButton}
                >
                  <X color={colors.inkMuted} size={18} strokeWidth={2.3} />
                </Pressable>
              ) : null}
            </View>

            <View style={styles.filterHeading}>
              <View style={styles.filterTitleRow}>
                <SlidersHorizontal
                  color={colors.ink}
                  size={17}
                  strokeWidth={2.2}
                />
                <Text style={styles.filterTitle}>Recipe type</Text>
              </View>
              {isFiltering ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setQuery('');
                    setSelectedTypeId('all');
                  }}
                  hitSlop={10}
                >
                  <Text style={styles.resetText}>Reset</Text>
                </Pressable>
              ) : null}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              <FilterChip
                label="All"
                selected={selectedTypeId === 'all'}
                onPress={() => setSelectedTypeId('all')}
              />
              {recipeTypes.map(type => (
                <FilterChip
                  key={type.id}
                  label={type.name}
                  selected={selectedTypeId === type.id}
                  onPress={() => setSelectedTypeId(type.id)}
                />
              ))}
            </ScrollView>

            <View style={styles.resultHeader}>
              <Text accessibilityLiveRegion="polite" style={styles.resultTitle}>
                {isFiltering ? 'Search results' : 'All recipes'}
              </Text>
              <Text style={styles.resultCount}>
                {filteredRecipes.length} found
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <ChefHat color={colors.primary} size={30} strokeWidth={1.8} />
            </View>
            <Text style={styles.emptyTitle}>No matching recipes</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setQuery('');
                setSelectedTypeId('all');
              }}
              style={({ pressed }) => [
                styles.resetButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.resetButtonText}>Clear filters</Text>
            </Pressable>
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

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function FilterChip({
  label,
  selected,
  onPress,
}: FilterChipProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        selected && styles.filterChipSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.filterChipText,
          selected && styles.filterChipTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: CONTENT_PADDING,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    marginTop: 4,
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },
  searchBox: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 9,
  },
  input: {
    flex: 1,
    minHeight: 54,
    paddingVertical: 0,
    color: colors.ink,
    fontSize: 16,
  },
  clearButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: colors.surfaceMuted,
  },
  filterHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  filterTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  resetText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  filterRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  filterChip: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.surface,
  },
  filterChipSelected: {
    borderColor: colors.ink,
    backgroundColor: colors.ink,
  },
  filterChipText: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  filterChipTextSelected: {
    color: colors.white,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  resultTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  resultCount: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  cardRow: {
    gap: CARD_GAP,
  },
  cardSeparator: {
    height: CARD_GAP,
  },
  emptyState: {
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
  },
  resetButton: {
    minHeight: 44,
    justifyContent: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
  },
  resetButtonText: {
    color: colors.primaryPressed,
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
  },
});
