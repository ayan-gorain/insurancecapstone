import { createAction, props } from '@ngrx/store';

export const signup = createAction(
  '[Auth] Signup',
  props<{ name: string; email: string; password: string; role: string; photo?: string }>()
);

export const signupSuccess = createAction(
  '[Auth] Signup Success',
  props<{ user: any; token: string }>()
);

export const signupFailure = createAction(
  '[Auth] Signup Failure',
  props<{ error: string }>()
);

export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: any; token: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Auth] Logout');

export const initializeAuth = createAction('[Auth] Initialize Auth');

export const initializeAuthSuccess = createAction(
  '[Auth] Initialize Auth Success',
  props<{ user: any; token: string }>()
);

export const initializeAuthFailure = createAction('[Auth] Initialize Auth Failure');
