export interface CustomerState{
    availablePolicies:any[];
    myPolicies:any[];
    myClaims:any[];
    claimDetails:any;
    claimStats:any;
    loading:boolean;
    error:any
}
export const initialCustomerState:CustomerState={
    availablePolicies:[],
    myPolicies:[],
    myClaims:[],
    claimDetails:null,
    claimStats:null,
    loading:false,
    error:null
}