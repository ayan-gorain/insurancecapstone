import express from "express";
import { authMiddleware, isAdmin } from "../authMiddleware.js";
import {
  createPolicy,
  listPolicies,
  listUsers,
  createAgent,
  listClaims,
  updateClaimStatus,
  listAuditLogs,
  summary
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(authMiddleware, isAdmin);

router.post("/policies", createPolicy);
router.get("/policies", listPolicies);


router.get("/users", listUsers);
router.post("/agents", createAgent);


router.get("/claims", listClaims);
router.put("/claims/:id/status", updateClaimStatus);


router.get("/audit", listAuditLogs);
router.get("/summary", summary);

export default router;
