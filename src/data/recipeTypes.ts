import recipeTypesData from './recipetypes.json';

export interface RecipeType {
  id: string;
  name: string;
}

export const recipeTypes = recipeTypesData as RecipeType[];

export function getRecipeTypeName(typeId: string): string {
  return recipeTypes.find(type => type.id === typeId)?.name ?? 'Other';
}
