import express from "express";
import { authMiddleware } from "../authMiddleware.js";
import {
  getMyCustomers,
  getMyCustomersClaims,
  getPendingClaims,
  reviewClaim,
  getClaimDetails,
  getMyClaimStats,
  getCustomerPolicies,
  getCustomerClaims,
  getMyProfile,
  updateMyProfile
} from "../controllers/agent.controller.js";

const router = express.Router();

// All agent routes require authentication
router.use(authMiddleware);

// Agent profile routes
router.get("/profile", getMyProfile);
router.put("/profile", updateMyProfile);

// Customer management routes
router.get("/customers", getMyCustomers);
router.get("/customers/:customerId/policies", getCustomerPolicies);
router.get("/customers/:customerId/claims", getCustomerClaims);

// Claim management routes
router.get("/claims", getMyCustomersClaims);
router.get("/claims/pending", getPendingClaims);
router.get("/claims/:claimId", getClaimDetails);
router.put("/claims/:claimId/review", reviewClaim);

// Statistics and analytics
router.get("/stats", getMyClaimStats);

export default router;
