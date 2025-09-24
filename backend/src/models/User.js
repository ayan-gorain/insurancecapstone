import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{type:String,required:true,unique:true},
    email:{type:String,required:true,unique:true},
    passwordHash:{type:String,required:true},
    role:{type:String,required:true,enum:["admin","customer","agent"],default:"customer"},
    photo:{type:String,default:""},
    address:{type:String,default:""},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now},
})

const User = mongoose.model("User",userSchema);

export default User;
