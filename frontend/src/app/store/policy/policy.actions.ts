import { createAction, props } from '@ngrx/store';

// Create Policy Actions
export const createPolicy = createAction(
  '[Policy] Create Policy',
  props<{ 
    code: string; 
    title: string; 
    description: string; 
    premium: number; 
    termMonths: number; 
    minSumInsured: number; 
    image: string; 
  }>()
);

export const createPolicySuccess = createAction(
  '[Policy] Create Policy Success',
  props<{ policy: any }>()
);

export const createPolicyFailure = createAction(
  '[Policy] Create Policy Failure',
  props<{ error: string }>()
);

// List Policies Actions
export const loadPolicies = createAction('[Policy] Load Policies');

export const loadPoliciesSuccess = createAction(
  '[Policy] Load Policies Success',
  props<{ policies: any[] }>()
);

export const loadPoliciesFailure = createAction(
  '[Policy] Load Policies Failure',
  props<{ error: string }>()
);

// Clear Policy State
export const clearPolicyState = createAction('[Policy] Clear Policy State');
