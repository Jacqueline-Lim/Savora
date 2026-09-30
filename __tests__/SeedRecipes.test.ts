import { seedRecipes } from '../src/data/seedRecipes';
import { getRecipeImageSource } from '../src/data/seedRecipeImages';
import { recipeTypes } from '../src/data/recipeTypes';
import { Recipe } from '../src/domain/models/Recipe';

describe('seedRecipes', () => {
  it('contains a valid and unique recipe catalogue', () => {
    const ids = seedRecipes.map(recipe => recipe.id);

    expect(seedRecipes).toHaveLength(9);
    expect(new Set(ids).size).toBe(seedRecipes.length);
    seedRecipes.forEach(recipe => {
      expect(new Recipe(recipe).validate()).toEqual([]);
      expect(recipe.imageUri).toMatch(/^seed-recipe:\/\//);
      expect(getRecipeImageSource(recipe.imageUri)).toBeDefined();
    });
  });

  it('covers every available recipe type', () => {
    const seededTypeIds = new Set(seedRecipes.map(recipe => recipe.typeId));

    recipeTypes.forEach(type => {
      expect(seededTypeIds.has(type.id)).toBe(true);
    });
  });
});
