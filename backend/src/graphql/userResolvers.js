import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cloudinary from "../config/cloudinary.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const userResolvers = {
  Query: {
    users: async () => await User.find(),
    user: async (_, { _id }) => await User.findById(_id),
  },
  Mutation: {
    signup: async (_, { input }) => {
      const { name, email, password, role, photo, address } = input;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User already exists");
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      let photoUrl = "";
      
      // Handle image upload if photo is provided
      if (photo) {
        try {
          // Check if Cloudinary is configured
          if (!process.env.CLOUDINARY_CLOUD_NAME) {
            console.warn("Cloudinary not configured, storing base64 image directly");
            photoUrl = photo; // Store the base64 string directly
          } else {
            const result = await cloudinary.uploader.upload(photo, {
              folder: "users",
              transformation: [
                { width: 500, height: 500, crop: "limit" }
              ]
            });
            photoUrl = result.secure_url;
          }
        } catch (error) {
          console.error("Image upload error:", error);
          // Store base64 as fallback
          photoUrl = photo;
        }
      }

      const newUser = await User.create({
        name,
        email,
        passwordHash: hashedPassword,
        role,
        photo: photoUrl,
        address,
      });

      const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "1h" });

      return { token, user: newUser };
    },
    login:async(_,{input})=>{
        const {email,password}=input;
        const user=await User.findOne({email});
        if(!user){
            throw new Error("User not found");
        }

        const validPassword=await bcrypt.compare(password,user.passwordHash);
        if(!validPassword){
            throw new Error("Invalid credentials");
        }
        const token =jwt.sign({userId:user._id},JWT_SECRET,{expiresIn:"1h"});
        return {token,user};
    },
  },
};
