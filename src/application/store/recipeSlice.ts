import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { RecipeService } from '../RecipeService';
import { Recipe, RecipeData, RecipeInput } from '../../domain/models/Recipe';
import { ApiClient } from '../../infrastructure/api/ApiClient';
import { DummyJsonRecipeApi } from '../../infrastructure/api/DummyJsonRecipeApi';
import { FirebaseRecipeSyncService } from '../../infrastructure/firebase/FirebaseRecipeSyncService';
import { AsyncStorageRecipeRepository } from '../../infrastructure/storage/AsyncStorageRecipeRepository';

interface RecipeState {
  items: RecipeData[];
  isLoading: boolean;
  isSyncing: boolean;
  errorMessage: string | null;
  syncMessage: string | null;
  syncSucceeded: boolean | null;
}

const recipeService = new RecipeService(new AsyncStorageRecipeRepository());
const remoteRecipeApi = new DummyJsonRecipeApi(
  new ApiClient('https://dummyjson.com'),
);
const cloudRecipeService = new FirebaseRecipeSyncService();

const initialState: RecipeState = {
  items: [],
  isLoading: false,
  isSyncing: false,
  errorMessage: null,
  syncMessage: null,
  syncSucceeded: null,
};

export const loadRecipes = createAsyncThunk<
  RecipeData[],
  void,
  { rejectValue: string }
>('recipes/load', async (_, { rejectWithValue }) => {
  try {
    return (await recipeService.listAll()).map(recipe => recipe.toJSON());
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const addRecipe = createAsyncThunk<
  RecipeData,
  RecipeInput,
  { rejectValue: string }
>('recipes/add', async (input, { rejectWithValue }) => {
  try {
    return (await recipeService.add(input)).toJSON();
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const updateRecipe = createAsyncThunk<
  RecipeData,
  { recipe: RecipeData; input: RecipeInput },
  { rejectValue: string }
>('recipes/update', async ({ recipe, input }, { rejectWithValue }) => {
  try {
    return (await recipeService.update(new Recipe(recipe), input)).toJSON();
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const moveRecipeToTrash = createAsyncThunk<
  RecipeData,
  { recipe: RecipeData; userId: string | null },
  { rejectValue: string }
>('recipes/moveToTrash', async ({ recipe, userId }, { rejectWithValue }) => {
  try {
    const trashedRecipe = new Recipe(recipe).moveToTrash();
    if (userId) {
      await cloudRecipeService.saveRecipes(userId, [trashedRecipe]);
    }
    await recipeService.save(trashedRecipe);
    return trashedRecipe.toJSON();
  } catch (error) {
    return rejectWithValue(toFirebaseSyncMessage(error));
  }
});

export const restoreRecipe = createAsyncThunk<
  RecipeData,
  { recipe: RecipeData; userId: string | null },
  { rejectValue: string }
>('recipes/restore', async ({ recipe, userId }, { rejectWithValue }) => {
  try {
    const restoredRecipe = new Recipe(recipe).restore();
    if (userId) {
      await cloudRecipeService.saveRecipes(userId, [restoredRecipe]);
    }
    await recipeService.save(restoredRecipe);
    return restoredRecipe.toJSON();
  } catch (error) {
    return rejectWithValue(toFirebaseSyncMessage(error));
  }
});

export const permanentlyDeleteRecipe = createAsyncThunk<
  string,
  { id: string; userId: string | null },
  { rejectValue: string }
>('recipes/permanentlyDelete', async ({ id, userId }, { rejectWithValue }) => {
  try {
    if (userId) {
      await cloudRecipeService.removeRecipes(userId, [id]);
    }
    await recipeService.permanentlyDelete(id);
    return id;
  } catch (error) {
    return rejectWithValue(toFirebaseSyncMessage(error));
  }
});

export const syncRemoteRecipes = createAsyncThunk<
  { recipes: RecipeData[]; addedCount: number },
  void,
  { rejectValue: string }
>('recipes/syncRemote', async (_, { rejectWithValue }) => {
  try {
    const remoteRecipes = await remoteRecipeApi.getFeatured();
    const result = await recipeService.importRecipes(remoteRecipes);
    return {
      recipes: result.recipes.map(recipe => recipe.toJSON()),
      addedCount: result.addedCount,
    };
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const syncCloudRecipes = createAsyncThunk<
  RecipeData[],
  { userId: string },
  { rejectValue: string }
>('recipes/syncCloud', async ({ userId }, { rejectWithValue }) => {
  try {
    const localRecipes = await recipeService.listAll();
    const mergedRecipes = await cloudRecipeService.sync(userId, localRecipes);
    return (await recipeService.replaceAll(mergedRecipes)).map(recipe =>
      recipe.toJSON(),
    );
  } catch (error) {
    return rejectWithValue(toFirebaseSyncMessage(error));
  }
});

const recipeSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    clearSyncMessage(state) {
      state.syncMessage = null;
      state.syncSucceeded = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadRecipes.pending, state => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(loadRecipes.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
      })
      .addCase(loadRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload ?? 'Recipes could not be loaded.';
      })
      .addCase(addRecipe.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          item => item.id === action.payload.id,
        );
        if (index >= 0) {
          state.items[index] = action.payload;
        }
      })
      .addCase(moveRecipeToTrash.fulfilled, (state, action) => {
        replaceRecipe(state.items, action.payload);
      })
      .addCase(restoreRecipe.fulfilled, (state, action) => {
        replaceRecipe(state.items, action.payload);
      })
      .addCase(permanentlyDeleteRecipe.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(syncRemoteRecipes.pending, state => {
        state.isSyncing = true;
        state.syncMessage = null;
        state.syncSucceeded = null;
      })
      .addCase(syncRemoteRecipes.fulfilled, (state, action) => {
        state.items = action.payload.recipes;
        state.isSyncing = false;
        state.syncSucceeded = true;
        state.syncMessage =
          action.payload.addedCount === 0
            ? 'Online recipes are already up to date.'
            : `${action.payload.addedCount} online recipes imported.`;
      })
      .addCase(syncRemoteRecipes.rejected, (state, action) => {
        state.isSyncing = false;
        state.syncSucceeded = false;
        state.syncMessage =
          action.payload ?? 'Online recipes could not be imported.';
      })
      .addCase(syncCloudRecipes.pending, state => {
        state.isSyncing = true;
        state.syncMessage = null;
        state.syncSucceeded = null;
      })
      .addCase(syncCloudRecipes.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isSyncing = false;
        state.syncSucceeded = true;
        state.syncMessage = 'Recipes synced securely with Firebase.';
      })
      .addCase(syncCloudRecipes.rejected, (state, action) => {
        state.isSyncing = false;
        state.syncSucceeded = false;
        state.syncMessage =
          action.payload ?? 'Firebase recipe sync could not be completed.';
      });
  },
});

export const { clearSyncMessage } = recipeSlice.actions;
export const recipeReducer = recipeSlice.reducer;

function toErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.';
}

function toFirebaseSyncMessage(error: unknown): string {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
      ? error.code
      : null;

  if (code === 'firestore/permission-denied') {
    return 'Firestore denied access. Deploy the included user-scoped rules.';
  }
  if (code === 'firestore/unavailable') {
    return 'Firebase is temporarily unavailable. Try again when online.';
  }

  return toErrorMessage(error);
}

function replaceRecipe(items: RecipeData[], recipe: RecipeData): void {
  const index = items.findIndex(item => item.id === recipe.id);
  if (index >= 0) {
    items[index] = recipe;
  }
}
