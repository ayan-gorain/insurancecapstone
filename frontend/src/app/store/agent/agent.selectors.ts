import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AgentState } from './agent.state';

export const selectAgentState = createFeatureSelector<AgentState>('agent');


// Customers Selectors
export const selectCustomers = createSelector(
  selectAgentState,
  (state: AgentState) => state.customers
);

export const selectSelectedCustomer = createSelector(
  selectAgentState,
  (state: AgentState) => state.selectedCustomer
);

export const selectCustomersCount = createSelector(
  selectCustomers,
  (customers) => customers.length
);

// Claims Selectors
export const selectClaims = createSelector(
  selectAgentState,
  (state: AgentState) => state.claims
);

export const selectPendingClaims = createSelector(
  selectAgentState,
  (state: AgentState) => state.pendingClaims
);


export const selectSelectedClaim = createSelector(
  selectAgentState,
  (state: AgentState) => state.selectedClaim
);

export const selectClaimsCount = createSelector(
  selectClaims,
  (claims) => claims.length
);

export const selectPendingClaimsCount = createSelector(
  selectPendingClaims,
  (pendingClaims) => pendingClaims.length
);

// Statistics Selectors
export const selectClaimStats = createSelector(
  selectAgentState,
  (state: AgentState) => state.claimStats
);

// Customer Specific Selectors
export const selectCustomerPolicies = createSelector(
  selectAgentState,
  (state: AgentState) => state.customerPolicies
);

export const selectCustomerClaims = createSelector(
  selectAgentState,
  (state: AgentState) => state.customerClaims
);

// UI Selectors
export const selectLoading = createSelector(
  selectAgentState,
  (state: AgentState) => state.loading
);

export const selectError = createSelector(
  selectAgentState,
  (state: AgentState) => state.error
);

// Computed Selectors
export const selectDashboardStats = createSelector(
  selectCustomersCount,
  selectPendingClaimsCount,
  selectClaimsCount,
  selectClaimStats,
  (customersCount, pendingCount, totalClaims, stats) => ({
    customersCount,
    pendingCount,
    totalClaims,
    approvedCount: stats?.approvedClaims || 0,
    rejectedCount: stats?.rejectedClaims || 0,
    successRate: stats?.successRate || 0
  })
);

export const selectClaimsByStatus = createSelector(
  selectClaims,
  (claims) => ({
    pending: claims.filter(claim => claim.status === 'PENDING'),
    approved: claims.filter(claim => claim.status === 'APPROVED'),
    rejected: claims.filter(claim => claim.status === 'REJECTED')
  })
);

export const selectRecentClaims = createSelector(
  selectClaims,
  (claims) => claims
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
);

export const selectCustomerWithMostClaims = createSelector(
  selectClaims,
  (claims) => {
    const customerClaimCounts = claims.reduce((acc, claim) => {
      const customerId = claim.userId?._id;
      if (customerId) {
        acc[customerId] = (acc[customerId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topCustomer = Object.entries(customerClaimCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];

    return topCustomer ? {
      customerId: topCustomer[0],
      claimCount: topCustomer[1]
    } : null;
  }
);

// Loading States
export const selectIsLoadingCustomers = createSelector(
  selectAgentState,
  (state) => state.loading && state.customers.length === 0
);

export const selectIsLoadingClaims = createSelector(
  selectAgentState,
  (state) => state.loading && state.claims.length === 0
);

export const selectIsLoadingPendingClaims = createSelector(
  selectAgentState,
  (state) => state.loading && state.pendingClaims.length === 0
);
