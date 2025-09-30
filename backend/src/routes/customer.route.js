import express from "express";
import { authMiddleware } from "../authMiddleware.js";
import {
  getAvailablePolicies,
  buyPolicy,
  getMyPolicies,
  cancelPolicy,
  submitClaim,
  submitClaimWithoutPolicy,
  getMyClaims,
  getClaimDetails,
  getClaimStats,
  recordPayment,
  getUserPayments,
  checkAgentAssignment,
} from "../controllers/customer.controller.js";

const router = express.Router();

router.use(authMiddleware); 


router.get("/policies", getAvailablePolicies);
router.post("/policies/:policyId/purchase", buyPolicy);
router.get("/my-policies", getMyPolicies);
router.put("/my-policies/:id/cancel", cancelPolicy);


router.post("/claims", submitClaim);
router.post("/claims/without-policy", submitClaimWithoutPolicy);
router.get("/claims", getMyClaims);
router.get("/claims/:claimId", getClaimDetails);
router.get("/claims-stats", getClaimStats);


router.post("/payments", recordPayment);
router.get("/payments/user", getUserPayments);


router.get("/agent-assignment", checkAgentAssignment);



export default router;
