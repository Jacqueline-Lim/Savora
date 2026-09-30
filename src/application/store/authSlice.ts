import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';

import {AuthSession} from '../../domain/models/AuthSession';
import {
  FirebaseAuthService,
  toFirebaseAuthMessage,
} from '../../infrastructure/firebase/FirebaseAuthService';

interface AuthState {
  session: AuthSession | null;
  status: 'checking' | 'unauthenticated' | 'authenticating' | 'authenticated';
  errorMessage: string | null;
}

const authService = new FirebaseAuthService();

const initialState: AuthState = {
  session: null,
  status: 'checking',
  errorMessage: null,
};

export const restoreSession = createAsyncThunk<
  AuthSession | null,
  void,
  {rejectValue: string}
>('auth/restoreSession', async (_, {rejectWithValue}) => {
  try {
    return await authService.restoreSession();
  } catch (error) {
    return rejectWithValue(toFirebaseAuthMessage(error));
  }
});

export const login = createAsyncThunk<
  AuthSession,
  {email: string; password: string},
  {rejectValue: string}
>('auth/login', async ({email, password}, {rejectWithValue}) => {
  try {
    if (!email.trim() || !password) {
      throw new Error('Enter both your email and password.');
    }

    return await authService.login(email, password);
  } catch (error) {
    return rejectWithValue(toFirebaseAuthMessage(error));
  }
});

export const register = createAsyncThunk<
  AuthSession,
  {email: string; password: string},
  {rejectValue: string}
>('auth/register', async ({email, password}, {rejectWithValue}) => {
  try {
    if (!email.trim() || !password) {
      throw new Error('Enter both your email and password.');
    }
    if (password.length < 6) {
      throw new Error('Use a password with at least 6 characters.');
    }

    return await authService.register(email, password);
  } catch (error) {
    return rejectWithValue(toFirebaseAuthMessage(error));
  }
});

export const loginWithGoogle = createAsyncThunk<
  AuthSession,
  void,
  {rejectValue: string}
>('auth/loginWithGoogle', async (_, {rejectWithValue}) => {
  try {
    return await authService.loginWithGoogle();
  } catch (error) {
    return rejectWithValue(toFirebaseAuthMessage(error));
  }
});

export const logout = createAsyncThunk<void, void, {rejectValue: string}>(
  'auth/logout',
  async (_, {rejectWithValue}) => {
    try {
      await authService.logout();
    } catch (error) {
      return rejectWithValue(toFirebaseAuthMessage(error));
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.errorMessage = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(restoreSession.pending, state => {
        state.status = 'checking';
        state.errorMessage = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.session = action.payload;
        state.status = action.payload ? 'authenticated' : 'unauthenticated';
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.errorMessage = action.payload ?? 'The saved session could not be restored.';
      })
      .addCase(login.pending, state => {
        state.status = 'authenticating';
        state.errorMessage = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.session = action.payload;
        state.status = 'authenticated';
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.errorMessage = action.payload ?? 'Login failed. Please try again.';
      })
      .addCase(register.pending, state => {
        state.status = 'authenticating';
        state.errorMessage = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.session = action.payload;
        state.status = 'authenticated';
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.errorMessage =
          action.payload ?? 'Account creation failed. Please try again.';
      })
      .addCase(loginWithGoogle.pending, state => {
        state.status = 'authenticating';
        state.errorMessage = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.session = action.payload;
        state.status = 'authenticated';
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.errorMessage =
          action.payload ?? 'Google sign-in failed. Please try again.';
      })
      .addCase(logout.fulfilled, state => {
        state.session = null;
        state.status = 'unauthenticated';
        state.errorMessage = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.errorMessage = action.payload ?? 'Logout failed. Please try again.';
      });
  },
});

export const {clearAuthError} = authSlice.actions;
export const authReducer = authSlice.reducer;
