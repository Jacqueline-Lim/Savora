import { useCallback, useMemo } from 'react';

import {
  addRecipe as addRecipeAction,
  clearSyncMessage,
  loadRecipes,
  moveRecipeToTrash as moveRecipeToTrashAction,
  permanentlyDeleteRecipe as permanentlyDeleteRecipeAction,
  restoreRecipe as restoreRecipeAction,
  syncCloudRecipes,
  syncRemoteRecipes,
  updateRecipe as updateRecipeAction,
} from '../../application/store/recipeSlice';
import { Recipe, RecipeInput } from '../../domain/models/Recipe';
import { useAppDispatch, useAppSelector } from './reduxHooks';

export function useRecipes() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(current => current.recipes);
  const signedInUserId = useAppSelector(
    current => current.auth.session?.user.id ?? null,
  );
  const allRecipes = useMemo(
    () => state.items.map(item => new Recipe(item)),
    [state.items],
  );
  const recipes = useMemo(
    () => allRecipes.filter(recipe => !recipe.isDeleted),
    [allRecipes],
  );
  const trashedRecipes = useMemo(
    () => allRecipes.filter(recipe => recipe.isDeleted),
    [allRecipes],
  );

  const reload = useCallback(async () => {
    await dispatch(loadRecipes()).unwrap();
  }, [dispatch]);

  const addRecipe = useCallback(
    async (input: RecipeInput) =>
      new Recipe(await dispatch(addRecipeAction(input)).unwrap()),
    [dispatch],
  );

  const updateRecipe = useCallback(
    async (id: string, input: RecipeInput) => {
      const existing = state.items.find(recipe => recipe.id === id);
      if (!existing) {
        throw new Error('This recipe is no longer available.');
      }
      return new Recipe(
        await dispatch(
          updateRecipeAction({ recipe: existing, input }),
        ).unwrap(),
      );
    },
    [dispatch, state.items],
  );

  const moveRecipeToTrash = useCallback(
    async (id: string) => {
      const existing = state.items.find(recipe => recipe.id === id);
      if (!existing) {
        throw new Error('This recipe is no longer available.');
      }
      await dispatch(
        moveRecipeToTrashAction({
          recipe: existing,
          userId: signedInUserId,
        }),
      ).unwrap();
    },
    [dispatch, signedInUserId, state.items],
  );

  const restoreRecipe = useCallback(
    async (id: string) => {
      const existing = state.items.find(recipe => recipe.id === id);
      if (!existing) {
        throw new Error('This recipe is no longer available.');
      }
      await dispatch(
        restoreRecipeAction({ recipe: existing, userId: signedInUserId }),
      ).unwrap();
    },
    [dispatch, signedInUserId, state.items],
  );

  const permanentlyDeleteRecipe = useCallback(
    async (id: string) => {
      await dispatch(
        permanentlyDeleteRecipeAction({ id, userId: signedInUserId }),
      ).unwrap();
    },
    [dispatch, signedInUserId],
  );

  const syncOnlineRecipes = useCallback(async () => {
    await dispatch(syncRemoteRecipes()).unwrap();
  }, [dispatch]);

  const syncFirebaseRecipes = useCallback(
    async (userId: string) => {
      await dispatch(syncCloudRecipes({ userId })).unwrap();
    },
    [dispatch],
  );

  const getRecipe = useCallback(
    (id: string) => recipes.find(recipe => recipe.id === id),
    [recipes],
  );

  const dismissSyncMessage = useCallback(() => {
    dispatch(clearSyncMessage());
  }, [dispatch]);

  return {
    recipes,
    trashedRecipes,
    isLoading: state.isLoading,
    isSyncing: state.isSyncing,
    errorMessage: state.errorMessage,
    syncMessage: state.syncMessage,
    syncSucceeded: state.syncSucceeded,
    reload,
    addRecipe,
    updateRecipe,
    moveRecipeToTrash,
    restoreRecipe,
    permanentlyDeleteRecipe,
    syncOnlineRecipes,
    syncFirebaseRecipes,
    dismissSyncMessage,
    getRecipe,
  };
}
