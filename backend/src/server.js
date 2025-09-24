import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServer } from "@apollo/server";
import { userTypeDefs } from "./graphql/userTypeDefs.js";
import { userResolvers } from "./graphql/userResolvers.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config();
const port = process.env.PORT || 4000;
const app = express();
app.use(cors());
app.use(express.json({limit:"70mb"}));

app.use("/api/v1/admin", adminRoutes);

const server = new ApolloServer({typeDefs:userTypeDefs,resolvers:userResolvers});

await server.start();

app.use("/graphql", expressMiddleware(server));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT, () => {
      console.log(
        `Server is running at http://localhost:${process.env.PORT}/graphql`
      );
    });
  })
  .catch((err) => console.log("MongoDB connection error:", err));
