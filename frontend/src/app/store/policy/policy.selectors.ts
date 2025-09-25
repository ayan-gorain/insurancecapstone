import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PolicyState } from './policy.state';

export const selectPolicyState = createFeatureSelector<PolicyState>('policy');

export const selectPolicies = createSelector(
  selectPolicyState,
  (state: PolicyState) => state.policies
);

export const selectPolicyLoading = createSelector(
  selectPolicyState,
  (state: PolicyState) => state.loading
);

export const selectPolicyError = createSelector(
  selectPolicyState,
  (state: PolicyState) => state.error
);

export const selectCreatedPolicy = createSelector(
  selectPolicyState,
  (state: PolicyState) => state.createdPolicy
);
