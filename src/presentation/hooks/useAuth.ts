import {useCallback} from 'react';

import {
  clearAuthError,
  login as loginAction,
  loginWithGoogle as loginWithGoogleAction,
  logout as logoutAction,
  register as registerAction,
} from '../../application/store/authSlice';
import {useAppDispatch, useAppSelector} from './reduxHooks';

export function useAuth() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(current => current.auth);

  const login = useCallback(
    async (email: string, password: string) => {
      await dispatch(loginAction({email, password})).unwrap();
    },
    [dispatch],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      await dispatch(registerAction({email, password})).unwrap();
    },
    [dispatch],
  );

  const loginWithGoogle = useCallback(async () => {
    await dispatch(loginWithGoogleAction()).unwrap();
  }, [dispatch]);

  const logout = useCallback(async () => {
    await dispatch(logoutAction()).unwrap();
  }, [dispatch]);

  const dismissError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  return {
    session: state.session,
    status: state.status,
    errorMessage: state.errorMessage,
    login,
    loginWithGoogle,
    register,
    logout,
    dismissError,
  };
}
