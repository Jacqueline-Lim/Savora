import {configureStore} from '@reduxjs/toolkit';

import {authReducer} from './authSlice';
import {recipeReducer} from './recipeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipes: recipeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
