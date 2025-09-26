import { createReducer, on } from '@ngrx/store';
import * as AgentActions from './agent.actions';
import { AgentState, initialAgentState } from './agent.state';

export const agentReducer = createReducer(
  initialAgentState,


  // Customers Reducers
  on(AgentActions.loadCustomers, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AgentActions.loadCustomersSuccess, (state, { customers }) => ({
    ...state,
    loading: false,
    customers,
    error: null
  })),
  on(AgentActions.loadCustomersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(AgentActions.selectCustomer, (state, { customer }) => ({
    ...state,
    selectedCustomer: customer
  })),
  on(AgentActions.clearSelectedCustomer, (state) => ({
    ...state,
    selectedCustomer: null,
    customerPolicies: [],
    customerClaims: []
  })),

  // Claims Reducers
  on(AgentActions.loadClaims, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AgentActions.loadClaimsSuccess, (state, { claims }) => ({
    ...state,
    loading: false,
    claims,
    error: null
  })),
  on(AgentActions.loadClaimsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(AgentActions.loadPendingClaims, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AgentActions.loadPendingClaimsSuccess, (state, { pendingClaims }) => ({
    ...state,
    loading: false,
    pendingClaims,
    error: null
  })),
  on(AgentActions.loadPendingClaimsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),


  on(AgentActions.reviewClaim, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AgentActions.reviewClaimSuccess, (state, { claim }) => ({
    ...state,
    loading: false,
    claims: state.claims.map(c => c._id === claim._id ? claim : c),
    pendingClaims: state.pendingClaims.filter(c => c._id !== claim._id),
    error: null
  })),
  on(AgentActions.reviewClaimFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(AgentActions.selectClaim, (state, { claim }) => ({
    ...state,
    selectedClaim: claim
  })),
  on(AgentActions.clearSelectedClaim, (state) => ({
    ...state,
    selectedClaim: null
  })),

  // Statistics Reducers
  on(AgentActions.loadClaimStats, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AgentActions.loadClaimStatsSuccess, (state, { stats }) => ({
    ...state,
    loading: false,
    claimStats: stats,
    error: null
  })),
  on(AgentActions.loadClaimStatsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Customer Specific Reducers
  on(AgentActions.loadCustomerPolicies, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AgentActions.loadCustomerPoliciesSuccess, (state, { policies }) => ({
    ...state,
    loading: false,
    customerPolicies: policies,
    error: null
  })),
  on(AgentActions.loadCustomerPoliciesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(AgentActions.loadCustomerClaims, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AgentActions.loadCustomerClaimsSuccess, (state, { claims }) => ({
    ...state,
    loading: false,
    customerClaims: claims,
    error: null
  })),
  on(AgentActions.loadCustomerClaimsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

);
