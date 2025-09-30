import mongoose from "mongoose";

const claimSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    userPolicyId:{type:mongoose.Schema.Types.ObjectId,ref:"UserPolicy", required: false}, 
    incidentDate:{type:Date,required:true},
    incidentLocation:{type:String,required:true},
    description:{type:String,required:true},
    amountClaimed:{type:Number,required:true},
    approvedAmount:{type:Number,default:null}, 
    proofImage:[String],
    status:{type:String,required:true,enum:["PENDING","APPROVED","REJECTED"],default:"PENDING"},
    decisionNotes:{type:String},
    decidedByAgentId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    decidedAt:{type:Date,default:null}, 
    priority:{type:String,enum:["LOW","MEDIUM","HIGH"],default:"MEDIUM"}, 
    category:{type:String,enum:["ACCIDENT","THEFT","DAMAGE","MEDICAL","OTHER"],default:"OTHER"},
    policyType:{type:String,default:"GENERAL"},
    isWithoutPolicy:{type:Boolean,default:false}, 
   
},{timestamps:true})

export default mongoose.model("Claim",claimSchema);
