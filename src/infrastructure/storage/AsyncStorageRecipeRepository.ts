import AsyncStorage from '@react-native-async-storage/async-storage';

import { SEED_DATA_VERSION, seedRecipes } from '../../data/seedRecipes';
import { Recipe, RecipeData } from '../../domain/models/Recipe';
import { RecipeRepository } from '../../domain/repositories/RecipeRepository';

const STORAGE_KEY = '@recipe-app/recipes-v1';
const SEED_VERSION_KEY = '@recipe-app/seed-version';

export class AsyncStorageRecipeRepository implements RecipeRepository {
  public async getAll(): Promise<Recipe[]> {
    const storedValue = await AsyncStorage.getItem(STORAGE_KEY);

    if (storedValue === null) {
      await this.write(seedRecipes);
      await AsyncStorage.setItem(SEED_VERSION_KEY, SEED_DATA_VERSION);
      return seedRecipes.map(item => new Recipe(item));
    }

    const recipes = JSON.parse(storedValue) as RecipeData[];
    const storedRecipes = recipes.map(item => new Recipe(item));
    const seedVersion = await AsyncStorage.getItem(SEED_VERSION_KEY);

    if (seedVersion === SEED_DATA_VERSION) {
      return storedRecipes;
    }

    const seedRecipesById = new Map(
      seedRecipes.map(recipe => [recipe.id, new Recipe(recipe)]),
    );
    const refreshedRecipes = storedRecipes.map(
      recipe => seedRecipesById.get(recipe.id) ?? recipe,
    );
    const existingIds = new Set(refreshedRecipes.map(recipe => recipe.id));
    const newSeedRecipes = seedRecipes
      .filter(recipe => !existingIds.has(recipe.id))
      .map(recipe => new Recipe(recipe));
    const migratedRecipes = [...refreshedRecipes, ...newSeedRecipes];

    await this.write(migratedRecipes.map(recipe => recipe.toJSON()));
    await AsyncStorage.setItem(SEED_VERSION_KEY, SEED_DATA_VERSION);

    return migratedRecipes;
  }

  public async save(recipe: Recipe): Promise<void> {
    const recipes = await this.getAll();
    const existingIndex = recipes.findIndex(item => item.id === recipe.id);

    if (existingIndex >= 0) {
      recipes[existingIndex] = recipe;
    } else {
      recipes.unshift(recipe);
    }

    await this.write(recipes.map(item => item.toJSON()));
  }

  public async saveAll(recipes: Recipe[]): Promise<void> {
    await this.write(recipes.map(recipe => recipe.toJSON()));
  }

  public async remove(id: string): Promise<void> {
    const recipes = await this.getAll();
    await this.write(
      recipes.filter(recipe => recipe.id !== id).map(recipe => recipe.toJSON()),
    );
  }

  private async write(recipes: RecipeData[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  }
}
