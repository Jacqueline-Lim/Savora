import {
  collection,
  doc,
  getDocs,
  getFirestore,
  writeBatch,
} from '@react-native-firebase/firestore';

import { Recipe, RecipeData } from '../../domain/models/Recipe';

const BATCH_LIMIT = 450;

export class FirebaseRecipeSyncService {
  public async sync(userId: string, localRecipes: Recipe[]): Promise<Recipe[]> {
    if (!userId) {
      throw new Error('Sign in before syncing recipes.');
    }

    const remoteRecipes = await this.download(userId);
    const mergedRecipes = this.mergeNewest(localRecipes, remoteRecipes);
    await this.saveRecipes(userId, mergedRecipes);

    return mergedRecipes.sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt),
    );
  }

  public async removeRecipes(
    userId: string,
    recipeIds: string[],
  ): Promise<void> {
    if (!userId) {
      throw new Error('Sign in before removing cloud recipes.');
    }

    const database = getFirestore();

    for (let start = 0; start < recipeIds.length; start += BATCH_LIMIT) {
      const batch = writeBatch(database);
      const chunk = recipeIds.slice(start, start + BATCH_LIMIT);

      chunk.forEach(recipeId => {
        batch.delete(doc(database, 'users', userId, 'recipes', recipeId));
      });

      await batch.commit();
    }
  }

  public async saveRecipes(userId: string, recipes: Recipe[]): Promise<void> {
    if (!userId) {
      throw new Error('Sign in before saving cloud recipes.');
    }

    const database = getFirestore();

    for (let start = 0; start < recipes.length; start += BATCH_LIMIT) {
      const batch = writeBatch(database);
      const chunk = recipes.slice(start, start + BATCH_LIMIT);

      chunk.forEach(recipe => {
        batch.set(
          doc(database, 'users', userId, 'recipes', recipe.id),
          recipe.toJSON(),
        );
      });

      await batch.commit();
    }
  }

  private async download(userId: string): Promise<Recipe[]> {
    const recipeCollection = collection(
      getFirestore(),
      'users',
      userId,
      'recipes',
    );
    const snapshot = await getDocs(recipeCollection);

    return snapshot.docs.flatMap(document => {
      const recipe = this.parseRecipe(document.id, document.data());
      return recipe ? [recipe] : [];
    });
  }

  private mergeNewest(local: Recipe[], remote: Recipe[]): Recipe[] {
    const merged = new Map<string, Recipe>();

    [...remote, ...local].forEach(recipe => {
      const current = merged.get(recipe.id);
      if (!current || recipe.updatedAt >= current.updatedAt) {
        merged.set(recipe.id, recipe);
      }
    });

    return [...merged.values()];
  }

  private parseRecipe(id: string, value: unknown): Recipe | null {
    if (!isRecipeData(value)) {
      return null;
    }

    const recipe = new Recipe({ ...value, id });
    return recipe.validate().length === 0 ? recipe : null;
  }
}

function isRecipeData(value: unknown): value is RecipeData {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const data = value as Partial<RecipeData>;
  return (
    typeof data.title === 'string' &&
    typeof data.typeId === 'string' &&
    typeof data.imageUri === 'string' &&
    Array.isArray(data.ingredients) &&
    data.ingredients.every(item => typeof item === 'string') &&
    Array.isArray(data.steps) &&
    data.steps.every(item => typeof item === 'string') &&
    typeof data.createdAt === 'string' &&
    typeof data.updatedAt === 'string' &&
    (data.deletedAt === undefined ||
      data.deletedAt === null ||
      typeof data.deletedAt === 'string')
  );
}
