import {Recipe} from '../models/Recipe';

export interface RecipeRepository {
  getAll(): Promise<Recipe[]>;
  save(recipe: Recipe): Promise<void>;
  saveAll(recipes: Recipe[]): Promise<void>;
  remove(id: string): Promise<void>;
}
