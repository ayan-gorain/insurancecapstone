import { createReducer, on } from '@ngrx/store';
import * as CustomerActions from './customer.actions';
import { CustomerState, initialCustomerState } from './customer.state';

export const customerReducer = createReducer(
  initialCustomerState,

  // Load available policies
  on(CustomerActions.loadAvailablePolicies, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CustomerActions.loadAvailablePoliciesSuccess, (state, { policies }) => {
    console.log('Customer Reducer - loadAvailablePoliciesSuccess:', policies);
    console.log('Customer Reducer - Policies count:', policies?.length || 0);
    return {
      ...state,
      loading: false,
      availablePolicies: policies,
      error: null
    };
  }),
  on(CustomerActions.loadAvailablePoliciesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load my policies
  on(CustomerActions.loadMyPolicies, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CustomerActions.loadMyPoliciesSuccess, (state, { policies }) => ({
    ...state,
    loading: false,
    myPolicies: policies,
    error: null
  })),
  on(CustomerActions.loadMyPoliciesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Buy policy
  on(CustomerActions.buyPolicy, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CustomerActions.buyPolicySuccess, (state, { userPolicy }) => ({
    ...state,
    loading: false,
    myPolicies: [...state.myPolicies, userPolicy],
    error: null
  })),
  on(CustomerActions.buyPolicyFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Cancel policy
  on(CustomerActions.cancelPolicy, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CustomerActions.cancelPolicySuccess, (state, { policyId }) => ({
    ...state,
    loading: false,
    myPolicies: state.myPolicies.filter(policy => policy._id !== policyId),
    error: null
  })),
  on(CustomerActions.cancelPolicyFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Submit claim
  on(CustomerActions.submitClaim, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CustomerActions.submitClaimSuccess, (state, { claim }) => ({
    ...state,
    loading: false,
    myClaims: [...state.myClaims, claim],
    error: null
  })),
  on(CustomerActions.submitClaimFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Submit claim without policy
  on(CustomerActions.submitClaimWithoutPolicy, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CustomerActions.submitClaimWithoutPolicySuccess, (state, { claim }) => ({
    ...state,
    loading: false,
    myClaims: [...state.myClaims, claim],
    error: null
  })),
  on(CustomerActions.submitClaimWithoutPolicyFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load my claims
  on(CustomerActions.loadMyClaims, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CustomerActions.loadMyClaimsSuccess, (state, { claims }) => ({
    ...state,
    loading: false,
    myClaims: claims,
    error: null
  })),
  on(CustomerActions.loadMyClaimsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load claim details
  on(CustomerActions.loadClaimDetails, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CustomerActions.loadClaimDetailsSuccess, (state, { claimDetails }) => ({
    ...state,
    loading: false,
    claimDetails: claimDetails,
    error: null
  })),
  on(CustomerActions.loadClaimDetailsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load claim stats
  on(CustomerActions.loadClaimStats, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CustomerActions.loadClaimStatsSuccess, (state, { stats }) => ({
    ...state,
    loading: false,
    claimStats: stats,
    error: null
  })),
  on(CustomerActions.loadClaimStatsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

);
