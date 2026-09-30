import { Recipe } from '../src/domain/models/Recipe';

const validInput = {
  title: '  Vegetable Soup  ',
  typeId: 'main',
  imageUri: 'file:///soup.jpg',
  ingredients: [' 2 carrots ', '', '1 onion'],
  steps: [' Chop the vegetables ', 'Simmer for 20 minutes'],
};

describe('Recipe', () => {
  it('normalizes user-entered values when creating a recipe', () => {
    const recipe = Recipe.create(validInput);

    expect(recipe.title).toBe('Vegetable Soup');
    expect(recipe.ingredients).toEqual(['2 carrots', '1 onion']);
    expect(recipe.steps[0]).toBe('Chop the vegetables');
    expect(recipe.validate()).toEqual([]);
  });

  it('reports missing required information', () => {
    const recipe = Recipe.create({
      title: '',
      typeId: '',
      imageUri: '',
      ingredients: [],
      steps: [],
    });

    expect(recipe.validate()).toHaveLength(5);
  });

  it('keeps identity and creation time when updated', () => {
    const recipe = Recipe.create(validInput);
    const updated = recipe.update({ ...validInput, title: 'Quick Soup' });

    expect(updated.id).toBe(recipe.id);
    expect(updated.createdAt).toBe(recipe.createdAt);
    expect(updated.title).toBe('Quick Soup');
  });

  it('moves a recipe to Trash and restores it without changing its identity', () => {
    const recipe = Recipe.create(validInput);
    const trashed = recipe.moveToTrash();

    expect(trashed.id).toBe(recipe.id);
    expect(trashed.isDeleted).toBe(true);
    expect(trashed.deletedAt).not.toBeNull();

    const restored = trashed.restore();

    expect(restored.id).toBe(recipe.id);
    expect(restored.isDeleted).toBe(false);
    expect(restored.deletedAt).toBeNull();
  });
});
