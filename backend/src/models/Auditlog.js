import mongoose from "mongoose";

const auditlogSchema=new mongoose.Schema({
   action:{type:String,required:true},
   actorId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
   details:Object,
   ip:String,
   timestamp:{type:Date,default:Date.now},
})

export default mongoose.model("AuditLog",auditlogSchema);