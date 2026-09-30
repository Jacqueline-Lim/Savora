import { RecipeService } from '../src/application/RecipeService';
import { Recipe, RecipeInput } from '../src/domain/models/Recipe';
import { RecipeRepository } from '../src/domain/repositories/RecipeRepository';

class InMemoryRecipeRepository implements RecipeRepository {
  private recipes: Recipe[] = [];

  public async getAll(): Promise<Recipe[]> {
    return [...this.recipes];
  }

  public async save(recipe: Recipe): Promise<void> {
    const existingIndex = this.recipes.findIndex(item => item.id === recipe.id);
    if (existingIndex >= 0) {
      this.recipes[existingIndex] = recipe;
    } else {
      this.recipes.push(recipe);
    }
  }

  public async saveAll(recipes: Recipe[]): Promise<void> {
    this.recipes = [...recipes];
  }

  public async remove(id: string): Promise<void> {
    this.recipes = this.recipes.filter(recipe => recipe.id !== id);
  }
}

const input: RecipeInput = {
  title: 'Pancakes',
  typeId: 'breakfast',
  imageUri: 'file:///pancakes.jpg',
  ingredients: ['1 cup flour', '1 cup milk'],
  steps: ['Mix the batter', 'Cook in a pan'],
};

describe('RecipeService', () => {
  it('supports the complete add, update, and delete lifecycle', async () => {
    const service = new RecipeService(new InMemoryRecipeRepository());

    const created = await service.add(input);
    expect(await service.list()).toHaveLength(1);

    const updated = await service.update(created, {
      ...input,
      title: 'Blueberry Pancakes',
    });
    expect(updated.title).toBe('Blueberry Pancakes');
    expect((await service.list())[0].id).toBe(created.id);

    await service.permanentlyDelete(created.id);
    expect(await service.list()).toEqual([]);
  });

  it('rejects invalid recipes before persistence', async () => {
    const service = new RecipeService(new InMemoryRecipeRepository());

    await expect(service.add({ ...input, title: '' })).rejects.toThrow(
      'Enter a recipe name.',
    );
    expect(await service.list()).toEqual([]);
  });

  it('keeps trashed recipes available for restore', async () => {
    const service = new RecipeService(new InMemoryRecipeRepository());
    const created = await service.add(input);

    await service.save(created.moveToTrash());

    expect(await service.list()).toEqual([]);
    expect(await service.listTrash()).toHaveLength(1);
    expect(await service.listAll()).toHaveLength(1);

    await service.save((await service.listTrash())[0].restore());

    expect(await service.list()).toHaveLength(1);
    expect(await service.listTrash()).toEqual([]);
  });

  it('imports online recipes without creating duplicates', async () => {
    const service = new RecipeService(new InMemoryRecipeRepository());
    const onlineRecipe = new Recipe({
      id: 'online-1',
      ...input,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });

    expect((await service.importRecipes([onlineRecipe])).addedCount).toBe(1);
    expect((await service.importRecipes([onlineRecipe])).addedCount).toBe(0);
    expect(await service.list()).toHaveLength(1);
  });
});
