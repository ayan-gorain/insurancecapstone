import jwt from "jsonwebtoken";
import User from "./models/User.js";

export const authMiddleware=async( req,res,next)=>{
    const token=req.headers.authorization?.split(" ")[1];
    console.log('Auth middleware - Token present:', !!token);
    console.log('Auth middleware - Request path:', req.path);
    
    if(!token){
        console.log('Auth middleware - No token provided');
        return res.status(401).json({message:"No token provided"});
    }
    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        console.log('Auth middleware - Token decoded for user:', decoded.userId);
        req.user=await User.findById(decoded.userId).select("-passwordHash");
        if(!req.user){
            console.log('Auth middleware - User not found for ID:', decoded.userId);
            return res.status(401).json({message:"Invalid token"});
        }
        console.log('Auth middleware - User authenticated:', req.user.email, req.user.role);
        next();
    } catch (error) {
        console.log('Auth middleware - Token verification failed:', error.message);
        return res.status(401).json({message:"Unauthorized"});
    }
}
export const isAdmin=async(req,res,next)=>{
    if(req.user.role!=="admin"){
        return res.status(403).json({message:"Admin access required"});
    }
    next();
}

export const isAgent=async(req,res,next)=>{
    if(req.user.role!=="agent"){
        return res.status(403).json({message:"Agent access required"});
    }
    next();
}

export const isCustomer=async(req,res,next)=>{
    if(req.user.role!=="customer"){
        return res.status(403).json({message:"Customer access required"});
    }
    next();
}
