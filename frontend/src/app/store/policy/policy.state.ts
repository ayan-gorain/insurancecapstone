export interface PolicyState {
  policies: any[];
  loading: boolean;
  error: string | null;
  createdPolicy: any | null;
}

export const initialPolicyState: PolicyState = {
  policies: [],
  loading: false,
  error: null,
  createdPolicy: null
};
