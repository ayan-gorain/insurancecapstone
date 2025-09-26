import mongoose from "mongoose";

const claimSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    userPolicyId:{type:mongoose.Schema.Types.ObjectId,ref:"UserPolicy", required: false}, // Made optional
    incidentDate:{type:Date,required:true},
    incidentLocation:{type:String,required:true},
    description:{type:String,required:true},
    amountClaimed:{type:Number,required:true},
    approvedAmount:{type:Number,default:null}, // Amount approved by agent
    proofImage:[String],
    status:{type:String,required:true,enum:["PENDING","APPROVED","REJECTED"],default:"PENDING"},
    decisionNotes:{type:String},
    decidedByAgentId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    decidedAt:{type:Date,default:null}, // When the decision was made
    priority:{type:String,enum:["LOW","MEDIUM","HIGH"],default:"MEDIUM"}, // Claim priority
    category:{type:String,enum:["ACCIDENT","THEFT","DAMAGE","MEDICAL","OTHER"],default:"OTHER"}, // Claim category
    policyType:{type:String,default:"GENERAL"}, // Type of policy this claim is for
    isWithoutPolicy:{type:Boolean,default:false}, // Flag to indicate claim without active policy
   
},{timestamps:true})

export default mongoose.model("Claim",claimSchema);
