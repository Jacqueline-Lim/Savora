import { ONLINE_RECIPE_ID_PREFIX, Recipe } from '../../domain/models/Recipe';
import { ApiClient } from './ApiClient';

interface RemoteRecipe {
  id: number;
  name: string;
  ingredients: string[];
  instructions: string[];
  image: string;
  mealType: string[];
  tags: string[];
}

interface RecipeListResponse {
  recipes: RemoteRecipe[];
}

export class DummyJsonRecipeApi {
  public constructor(private readonly client: ApiClient) {}

  public async getFeatured(limit = 12): Promise<Recipe[]> {
    const response = await this.client.request<RecipeListResponse>(
      `/recipes?limit=${limit}`,
    );
    const importedAt = new Date().toISOString();

    return response.recipes.map(
      item =>
        new Recipe({
          id: `${ONLINE_RECIPE_ID_PREFIX}${item.id}`,
          title: item.name,
          typeId: toLocalType(item),
          imageUri: item.image,
          ingredients: item.ingredients,
          steps: item.instructions,
          createdAt: importedAt,
          updatedAt: importedAt,
        }),
    );
  }
}

function toLocalType(recipe: RemoteRecipe): string {
  const labels = [...recipe.mealType, ...recipe.tags]
    .join(' ')
    .toLocaleLowerCase();

  if (labels.includes('breakfast')) {
    return 'breakfast';
  }
  if (labels.includes('dessert')) {
    return 'dessert';
  }
  if (labels.includes('snack') || labels.includes('appetizer')) {
    return 'snack';
  }
  if (labels.includes('beverage') || labels.includes('drink')) {
    return 'drink';
  }
  return 'main';
}
