import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {RecipeForm} from '../components/RecipeForm';
import {useRecipes} from '../hooks/useRecipes';
import {RootStackParamList} from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddRecipe'>;

export function RecipeFormScreen({navigation}: Props): React.JSX.Element {
  const {addRecipe} = useRecipes();

  return (
    <RecipeForm
      submitLabel="Save recipe"
      onSubmit={async input => {
        const recipe = await addRecipe(input);
        navigation.replace('RecipeDetail', {recipeId: recipe.id});
      }}
      onCancel={() => navigation.goBack()}
    />
  );
}
