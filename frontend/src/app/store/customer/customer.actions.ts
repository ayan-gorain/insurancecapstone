import { createAction, props } from '@ngrx/store';


export const loadAvailablePolicies = createAction('[InsuranceHub] Load Available Policies');
export const loadAvailablePoliciesSuccess = createAction('[InsuranceHub] Load Available Policies Success', props<{ policies: any[] }>());
export const loadAvailablePoliciesFailure = createAction('[InsuranceHub] Load Available Policies Failure', props<{ error: any }>());


export const loadMyPolicies = createAction('[InsuranceHub] Load My Policies');
export const loadMyPoliciesSuccess = createAction('[InsuranceHub] Load My Policies Success', props<{ policies: any[] }>());
export const loadMyPoliciesFailure = createAction('[InsuranceHub] Load My Policies Failure', props<{ error: any }>());


export const buyPolicy = createAction('[InsuranceHub] Buy Policy', props<{ policyId: string, body: any }>());
export const buyPolicySuccess = createAction('[InsuranceHub] Buy Policy Success', props<{ userPolicy: any, payment: any }>());
export const buyPolicyFailure = createAction('[InsuranceHub] Buy Policy Failure', props<{ error: any }>());


export const cancelPolicy = createAction('[InsuranceHub] Cancel Policy', props<{ policyId: string }>());
export const cancelPolicySuccess = createAction('[InsuranceHub] Cancel Policy Success', props<{ policyId: string }>());
export const cancelPolicyFailure = createAction('[InsuranceHub] Cancel Policy Failure', props<{ error: any }>());

// Claims actions
export const submitClaim = createAction('[InsuranceHub] Submit Claim', props<{ claimData: any }>());
export const submitClaimSuccess = createAction('[InsuranceHub] Submit Claim Success', props<{ claim: any }>());
export const submitClaimFailure = createAction('[InsuranceHub] Submit Claim Failure', props<{ error: any }>());

export const loadMyClaims = createAction('[InsuranceHub] Load My Claims');
export const loadMyClaimsSuccess = createAction('[InsuranceHub] Load My Claims Success', props<{ claims: any[] }>());
export const loadMyClaimsFailure = createAction('[InsuranceHub] Load My Claims Failure', props<{ error: any }>());

export const loadClaimDetails = createAction('[InsuranceHub] Load Claim Details', props<{ claimId: string }>());
export const loadClaimDetailsSuccess = createAction('[InsuranceHub] Load Claim Details Success', props<{ claimDetails: any }>());
export const loadClaimDetailsFailure = createAction('[InsuranceHub] Load Claim Details Failure', props<{ error: any }>());

export const loadClaimStats = createAction('[InsuranceHub] Load Claim Stats');
export const loadClaimStatsSuccess = createAction('[InsuranceHub] Load Claim Stats Success', props<{ stats: any }>());
export const loadClaimStatsFailure = createAction('[InsuranceHub] Load Claim Stats Failure', props<{ error: any }>());

// Submit claim without policy actions
export const submitClaimWithoutPolicy = createAction('[InsuranceHub] Submit Claim Without Policy', props<{ claimData: any }>());
export const submitClaimWithoutPolicySuccess = createAction('[InsuranceHub] Submit Claim Without Policy Success', props<{ claim: any }>());
export const submitClaimWithoutPolicyFailure = createAction('[InsuranceHub] Submit Claim Without Policy Failure', props<{ error: any }>());

