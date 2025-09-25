import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.state';

export const selectUserState = createFeatureSelector<UserState>('users');

export const selectAllUsers = createSelector(selectUserState, (state) => state.users);
export const selectAllAgents = createSelector(selectUserState, (state) => state.agents);
export const selectUserLoading = createSelector(selectUserState, (state) => state.loading);
export const selectUserError = createSelector(selectUserState, (state) => state.error);
export const selectCreatedAgent = createSelector(selectUserState, (state) => state.createdAgent);
