import { createAction, props } from '@ngrx/store';


// Customers Actions
export const loadCustomers = createAction('[Agent] Load Customers');
export const loadCustomersSuccess = createAction('[Agent] Load Customers Success', props<{ customers: any[] }>());
export const loadCustomersFailure = createAction('[Agent] Load Customers Failure', props<{ error: any }>());

export const selectCustomer = createAction('[Agent] Select Customer', props<{ customer: any }>());
export const clearSelectedCustomer = createAction('[Agent] Clear Selected Customer');

// Claims Actions
export const loadClaims = createAction('[Agent] Load Claims');
export const loadClaimsSuccess = createAction('[Agent] Load Claims Success', props<{ claims: any[] }>());
export const loadClaimsFailure = createAction('[Agent] Load Claims Failure', props<{ error: any }>());

export const loadPendingClaims = createAction('[Agent] Load Pending Claims');
export const loadPendingClaimsSuccess = createAction('[Agent] Load Pending Claims Success', props<{ pendingClaims: any[] }>());
export const loadPendingClaimsFailure = createAction('[Agent] Load Pending Claims Failure', props<{ error: any }>());


export const reviewClaim = createAction('[Agent] Review Claim', props<{ claimId: string, reviewData: any }>());
export const reviewClaimSuccess = createAction('[Agent] Review Claim Success', props<{ claim: any }>());
export const reviewClaimFailure = createAction('[Agent] Review Claim Failure', props<{ error: any }>());

export const selectClaim = createAction('[Agent] Select Claim', props<{ claim: any }>());
export const clearSelectedClaim = createAction('[Agent] Clear Selected Claim');

// Statistics Actions
export const loadClaimStats = createAction('[Agent] Load Claim Stats');
export const loadClaimStatsSuccess = createAction('[Agent] Load Claim Stats Success', props<{ stats: any }>());
export const loadClaimStatsFailure = createAction('[Agent] Load Claim Stats Failure', props<{ error: any }>());

// Customer Specific Actions
export const loadCustomerPolicies = createAction('[Agent] Load Customer Policies', props<{ customerId: string }>());
export const loadCustomerPoliciesSuccess = createAction('[Agent] Load Customer Policies Success', props<{ policies: any[] }>());
export const loadCustomerPoliciesFailure = createAction('[Agent] Load Customer Policies Failure', props<{ error: any }>());

export const loadCustomerClaims = createAction('[Agent] Load Customer Claims', props<{ customerId: string }>());
export const loadCustomerClaimsSuccess = createAction('[Agent] Load Customer Claims Success', props<{ claims: any[] }>());
export const loadCustomerClaimsFailure = createAction('[Agent] Load Customer Claims Failure', props<{ error: any }>());

