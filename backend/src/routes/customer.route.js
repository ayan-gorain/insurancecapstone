import express from "express";
import { authMiddleware } from "../authMiddleware.js";
import {
  getAvailablePolicies,
  buyPolicy,
  getMyPolicies,
  cancelPolicy,
  submitClaim,
  getMyClaims,
  getClaimDetails,
  getClaimStats,
} from "../controllers/customer.controller.js";

const router = express.Router();

router.use(authMiddleware); // All customer routes protected

// Policy routes
router.get("/policies", getAvailablePolicies);
router.post("/policies/:policyId/purchase", buyPolicy);
router.get("/my-policies", getMyPolicies);
router.put("/my-policies/:id/cancel", cancelPolicy);

// Claim routes
router.post("/claims", submitClaim);
router.get("/claims", getMyClaims);
router.get("/claims/:claimId", getClaimDetails);
router.get("/claims-stats", getClaimStats);


export default router;
