import express from "express";
import { getAuditLogs, getAuditStats } from "../controllers/audit.controller.js";
import { protect, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Solo administradores pueden acceder
router.get("/logs", protect, isAdmin, getAuditLogs);
router.get("/stats", protect, isAdmin, getAuditStats);

export default router;
