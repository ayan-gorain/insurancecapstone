import { createReducer, on } from '@ngrx/store';
import { PolicyState, initialPolicyState } from './policy.state';
import * as PolicyActions from './policy.actions';

export const policyReducer = createReducer(
  initialPolicyState,
  
  // Create Policy
  on(PolicyActions.createPolicy, (state) => ({
    ...state,
    loading: true,
    error: null,
    createdPolicy: null
  })),
  
  on(PolicyActions.createPolicySuccess, (state, { policy }) => ({
    ...state,
    loading: false,
    error: null,
    createdPolicy: policy,
    policies: [...state.policies, policy]
  })),
  
  on(PolicyActions.createPolicyFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
    createdPolicy: null
  })),
  
  // Load Policies
  on(PolicyActions.loadPolicies, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(PolicyActions.loadPoliciesSuccess, (state, { policies }) => ({
    ...state,
    loading: false,
    error: null,
    policies: policies
  })),
  
  on(PolicyActions.loadPoliciesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error
  })),
  
  // Clear Policy State
  on(PolicyActions.clearPolicyState, (state) => ({
    ...state,
    error: null,
    createdPolicy: null
  }))
);
