import { useMemo } from 'react';

import { Recipe } from '../../domain/models/Recipe';

export function useRecipeFilter(
  recipes: Recipe[],
  query: string,
  typeId: string,
): Recipe[] {
  return useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return recipes.filter(recipe => {
      const matchesType = typeId === 'all' || recipe.typeId === typeId;
      const matchesQuery =
        !normalizedQuery ||
        recipe.title.toLocaleLowerCase().includes(normalizedQuery) ||
        recipe.ingredients.some(ingredient =>
          ingredient.toLocaleLowerCase().includes(normalizedQuery),
        );

      return matchesType && matchesQuery;
    });
  }, [query, recipes, typeId]);
}
