import { Router } from "express";
import { auth, adminOnly } from "../middleware/auth.middleware.js";
import { createClient, deleteClient, getClients, updateClient } from "../controllers/client.controller.js";

const router = Router();

// Admin: CRUD clientes
router.get("/", auth, adminOnly, getClients);
router.post("/", auth, adminOnly, createClient);
router.put("/:id", auth, adminOnly, updateClient);
router.delete("/:id", auth, adminOnly, deleteClient);

export default router;
