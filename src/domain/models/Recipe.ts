export interface RecipeData {
  id: string;
  title: string;
  typeId: string;
  imageUri: string;
  ingredients: string[];
  steps: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface RecipeInput {
  title: string;
  typeId: string;
  imageUri: string;
  ingredients: string[];
  steps: string[];
}

export const ONLINE_RECIPE_ID_PREFIX = 'online-';

export class Recipe implements RecipeData {
  public readonly id: string;
  public readonly title: string;
  public readonly typeId: string;
  public readonly imageUri: string;
  public readonly ingredients: string[];
  public readonly steps: string[];
  public readonly createdAt: string;
  public readonly updatedAt: string;
  public readonly deletedAt: string | null;

  public constructor(data: RecipeData) {
    this.id = data.id;
    this.title = data.title.trim();
    this.typeId = data.typeId;
    this.imageUri = data.imageUri.trim();
    this.ingredients = Recipe.cleanList(data.ingredients);
    this.steps = Recipe.cleanList(data.steps);
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt ?? null;
  }

  public static create(input: RecipeInput): Recipe {
    const now = new Date().toISOString();

    return new Recipe({
      ...input,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  public update(input: RecipeInput): Recipe {
    return new Recipe({
      ...input,
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: new Date().toISOString(),
      deletedAt: this.deletedAt,
    });
  }

  public moveToTrash(): Recipe {
    const now = new Date().toISOString();

    return new Recipe({
      ...this.toJSON(),
      updatedAt: now,
      deletedAt: now,
    });
  }

  public restore(): Recipe {
    return new Recipe({
      ...this.toJSON(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    });
  }

  public get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public validate(): string[] {
    const errors: string[] = [];

    if (!this.title) {
      errors.push('Enter a recipe name.');
    }
    if (!this.typeId) {
      errors.push('Choose a recipe type.');
    }
    if (!this.imageUri) {
      errors.push('Add a recipe photo.');
    }
    if (this.ingredients.length === 0) {
      errors.push('Add at least one ingredient.');
    }
    if (this.steps.length === 0) {
      errors.push('Add at least one preparation step.');
    }

    return errors;
  }

  public toJSON(): RecipeData {
    return {
      id: this.id,
      title: this.title,
      typeId: this.typeId,
      imageUri: this.imageUri,
      ingredients: [...this.ingredients],
      steps: [...this.steps],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  private static cleanList(values: string[]): string[] {
    return values.map(value => value.trim()).filter(Boolean);
  }
}
