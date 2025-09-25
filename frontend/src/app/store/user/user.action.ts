import { createAction,props } from "@ngrx/store";

export const loadUsers=createAction('[User] Load Users');
export const loadUsersSuccess=createAction('[User] Load Users Success',props<{users:any[]}>())

export const loadUsersFailure=createAction('[User] Load Users Faliure',props<{error:string}>())

export const loadAgent=createAction('[User] Load Agents');
export const loadAgentSuccess=createAction('[User] Load Agents Success',props<{agents:any[]}>())

export const loadAgentFailure=createAction('[User] Load Agents Faliure',props<{error:string}>())

export const createAgent=createAction('[User] Create Agent',props<{name:string,email:string,password:string,role:string,photo:string,address:string}>())
export const createAgentSuccess=createAction('[User] Create Agent Success',props<{agent:any}>())
export const createAgentFailure=createAction('[User] Create Agent Failure',props<{error:string}>())

export const clearCreateAgent=createAction('[User] Clear Create Agent')