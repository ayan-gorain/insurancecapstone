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
  })),
  //delete policy
  on(PolicyActions.deletePolicy, (state) => ({
    ...state,
    loading:true,
    error:null
  })),
  on(PolicyActions.deletePolicySuccess, (state, { policyId }) => ({
    ...state,
    loading: false,
    error: null,
    policies: state.policies.filter(policy => policy._id !== policyId)
  })),
  on(PolicyActions.deletePolicyFailure,(state,{error})=>({
    ...state,
    loading:false,
    error:error
  })),
  //update policy
  on(PolicyActions.updatePolicy, (state)=>({
    ...state,
    loading:true,
    error:null
  })),
  on(PolicyActions.updatePolicySuccess, (state, { policy }) => ({
    ...state,
    loading:false,
    error:null,
    policies:state.policies.map(p=>p._id===policy._id?policy:p)
  })),
  on(PolicyActions.updatePolicyFailure, (state, { error }) => ({
    ...state,
    loading:false,
    error:error
  }))
);
