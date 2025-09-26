export interface AgentState {
  // Customers
  customers: any[];
  
  // Claims
  claims: any[];
  pendingClaims: any[];
  
  // Statistics
  claimStats: any | null;
  
  // Customer specific data
  customerPolicies: any[];
  customerClaims: any[];
  
  // UI State
  loading: boolean;
  error: any | null;
  
  // Selected items
  selectedCustomer: any | null;
  selectedClaim: any | null;
}

export const initialAgentState: AgentState = {
  customers: [],
  claims: [],
  pendingClaims: [],
  claimStats: null,
  customerPolicies: [],
  customerClaims: [],
  loading: false,
  error: null,
  selectedCustomer: null,
  selectedClaim: null
};
