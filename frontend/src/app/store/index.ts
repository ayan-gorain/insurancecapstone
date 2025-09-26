import { ActionReducerMap } from '@ngrx/store';
import { authReducer } from './auth/auth.reducer';
import { AuthState } from './auth/auth.state';
import { policyReducer } from './policy/policy.reducer';
import { PolicyState } from './policy/policy.state';
import { userReducer } from './user/user.reducer';
import { UserState } from './user/user.state';
import { customerReducer } from './customer/customer.reducer';
import { CustomerState } from './customer/customer.state';
import { agentReducer } from './agent/agent.reducer';
import { AgentState } from './agent/agent.state';

export interface AppState {
  auth: AuthState;
  policy: PolicyState;
  users: UserState;
  customer: CustomerState;
  agent: AgentState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  policy: policyReducer,
  users: userReducer,
  customer: customerReducer,
  agent: agentReducer
};
