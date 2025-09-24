import mongoose from "mongoose";

const claimSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    userPolicyId:{type:mongoose.Schema.Types.ObjectId},
    incidentDate:{type:Date,required:true},
    incidentLocation:{type:String,required:true},
    description:{type:String,required:true},
    amountClaimed:{type:Number,required:true},
    proofImage:[String],
    status:{type:String,required:true,enum:["PENDING","APPROVED","REJECTED"],default:"PENDING"},
    decisionNotes:{type:String},
    decidedByAgentId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},

   
},{timestamps:true})

export default mongoose.model("Claim",claimSchema);
