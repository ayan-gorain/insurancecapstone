import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServer } from "@apollo/server";
import { userTypeDefs } from "./graphql/userTypeDefs.js";
import { userResolvers } from "./graphql/userResolvers.js";
import adminRoutes from "./routes/admin.routes.js";
import customerRoutes from "./routes/customer.route.js";
import agentRoutes from "./routes/agent.routes.js";
import { authMiddleware } from "./authMiddleware.js";
import PolicyProduct from "./models/PolicyProduct.js";

dotenv.config();
const port = process.env.PORT || 4000;
const app = express();
app.use(cors());
app.use(express.json({limit:"70mb"}));

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/customer", customerRoutes);
app.use("/api/v1/agent", agentRoutes);

// Public route for policies (no authentication required)
app.get("/public/policies", async (req, res) => {
  try {
    const policies = await PolicyProduct.find({});
    res.json(policies);
  } catch (error) {
    console.error("Error fetching public policies:", error);
    res.status(500).json({ error: "Failed to fetch policies" });
  }
});


const server = new ApolloServer({typeDefs:userTypeDefs,resolvers:userResolvers});

await server.start();

app.use("/graphql", expressMiddleware(server, {
  context: async ({ req }) => {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    
    if (token) {
      try {
        const jwt = await import("jsonwebtoken");
        const User = (await import("./models/User.js")).default;
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-passwordHash");
        return { user };
      } catch (error) {
        // Token is invalid, but we don't throw here
        // Let individual resolvers handle authentication
        return { user: null };
      }
    }
    
    return { user: null };
  }
}));

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
