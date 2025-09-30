import express from "express";
import { authMiddleware, isAgent } from "../authMiddleware.js";
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


router.use(authMiddleware);
router.use(isAgent);


router.get("/profile", getMyProfile);
router.put("/profile", updateMyProfile);


router.get("/customers", getMyCustomers);
router.get("/customers/:customerId/policies", getCustomerPolicies);
router.get("/customers/:customerId/claims", getCustomerClaims);


router.get("/claims", getMyCustomersClaims);
router.get("/claims/pending", getPendingClaims);
router.get("/claims/:claimId", getClaimDetails);
router.put("/claims/:claimId/review", reviewClaim);


router.get("/stats", getMyClaimStats);

export default router;
