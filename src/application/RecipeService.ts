import { Recipe, RecipeInput } from '../domain/models/Recipe';
import { RecipeRepository } from '../domain/repositories/RecipeRepository';

export class RecipeService {
  public constructor(private readonly repository: RecipeRepository) {}

  public async list(): Promise<Recipe[]> {
    const recipes = await this.listAll();
    return recipes.filter(recipe => !recipe.isDeleted);
  }

  public async listAll(): Promise<Recipe[]> {
    const recipes = await this.repository.getAll();
    return [...recipes].sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt),
    );
  }

  public async listTrash(): Promise<Recipe[]> {
    const recipes = await this.listAll();
    return recipes.filter(recipe => recipe.isDeleted);
  }

  public async add(input: RecipeInput): Promise<Recipe> {
    const recipe = Recipe.create(input);
    this.ensureValid(recipe);
    await this.repository.save(recipe);
    return recipe;
  }

  public async update(recipe: Recipe, input: RecipeInput): Promise<Recipe> {
    const updatedRecipe = recipe.update(input);
    this.ensureValid(updatedRecipe);
    await this.repository.save(updatedRecipe);
    return updatedRecipe;
  }

  public async permanentlyDelete(id: string): Promise<void> {
    await this.repository.remove(id);
  }

  public async save(recipe: Recipe): Promise<Recipe> {
    this.ensureValid(recipe);
    await this.repository.save(recipe);
    return recipe;
  }

  public async importRecipes(
    remoteRecipes: Recipe[],
  ): Promise<{ recipes: Recipe[]; addedCount: number }> {
    const existingRecipes = await this.repository.getAll();
    const existingIds = new Set(existingRecipes.map(recipe => recipe.id));
    const newRecipes = remoteRecipes.filter(
      recipe => !existingIds.has(recipe.id),
    );
    const mergedRecipes = [...newRecipes, ...existingRecipes];

    await this.repository.saveAll(mergedRecipes);

    return {
      recipes: await this.listAll(),
      addedCount: newRecipes.length,
    };
  }

  public async replaceAll(recipes: Recipe[]): Promise<Recipe[]> {
    recipes.forEach(recipe => this.ensureValid(recipe));
    await this.repository.saveAll(recipes);
    return this.listAll();
  }

  private ensureValid(recipe: Recipe): void {
    const errors = recipe.validate();
    if (errors.length > 0) {
      throw new Error(errors[0]);
    }
  }
}
