import { createReducer, on } from '@ngrx/store';
import { initialAuthState, AuthState } from './auth.state';
import * as AuthActions from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.signup, AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.signupSuccess, AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    loading: false,
    error: null,
  })),

  on(AuthActions.signupFailure, AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(AuthActions.logout, () => initialAuthState),

  on(AuthActions.initializeAuth, (state) => ({
    ...state,
    loading: true,
  })),

  on(AuthActions.initializeAuthSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    loading: false,
    error: null,
  })),

  on(AuthActions.initializeAuthFailure, (state) => ({
    ...state,
    loading: false,
    error: null,
    user: null,
    token: null,
  }))
);
