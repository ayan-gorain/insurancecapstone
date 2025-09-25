export interface UserState{
    users:any[];
    agents:any[];
    loading:boolean;
    error:string|null;
    createdAgent:any|null
}

export  const initialUserState:UserState={
    users:[],
    agents:[],
    loading:false,
    error:null,
    createdAgent:null
}