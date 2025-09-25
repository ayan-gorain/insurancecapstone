import { createReducer, on } from "@ngrx/store";
import { UserState, initialUserState } from "./user.state";
import * as UserActions from "./user.action";


export const userReducer = createReducer(
    initialUserState,
    on(UserActions.loadUsers, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(UserActions.loadUsersSuccess, (state, { users }) => ({
        ...state,
        loading: false,
        error: null,
        users,
        agents: users.filter(user => user.role === 'agent')
    })),
    on(UserActions.loadUsersFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error: error
    })),
    // agents
    on(UserActions.createAgent, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(UserActions.createAgentSuccess, (state, { agent }) => ({
        ...state,
        loading: false,
        error: null,
        createdAgent: agent
    })),
    on(UserActions.createAgentFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error: error
    })),
    on(UserActions.clearCreateAgent,(state)=>({
        ...state,
        loading:false,
        error:null,
        createdAgent:null
    }))
);