export interface AuthState {
    user: any | null;
    token: string | null;
    loading: boolean;
    error: string | null;
  }
  
  export const initialAuthState: AuthState = {
    user: null,
    token: null,
    loading: true, // Start with loading true to wait for initialization
    error: null,
  };
  