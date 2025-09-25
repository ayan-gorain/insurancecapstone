import express from "express";
import { authMiddleware, isAdmin } from "../authMiddleware.js";
import {
  createPolicy,
  listPolicies,
  updatePolicy,
  deletePolicy,
  listUsers,
  createAgent,
  listClaims,
  updateClaimStatus,
  listAuditLogs,
  summary,
  assignAgentToCustomer,
  getAgentCustomers
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(authMiddleware, isAdmin);

router.post("/policies", createPolicy);
router.get("/policies", listPolicies);
router.put("/policies/:policyId", updatePolicy);
router.delete("/policies/:policyId", deletePolicy);


router.get("/users", listUsers);
router.post("/agents", createAgent);

// Agent assignment routes
router.post("/assign-agent", assignAgentToCustomer);
router.get("/agents/:agentId/customers", getAgentCustomers);

router.get("/claims", listClaims);
router.put("/claims/:id/status", updateClaimStatus);


router.get("/audit", listAuditLogs);
router.get("/summary", summary);

export default router;
