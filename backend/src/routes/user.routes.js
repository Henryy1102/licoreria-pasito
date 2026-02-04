import { Router } from "express";
import { auth, adminOnly } from "../middleware/auth.middleware.js";
import { deleteUser, getClients, updateUser } from "../controllers/user.controller.js";

const router = Router();

// Admin: ver clientes registrados
router.get("/clients", auth, adminOnly, getClients);

// Actualizar usuario (admin o el mismo usuario)
router.put("/:id", auth, updateUser);

// Admin: eliminar usuario
router.delete("/:id", auth, adminOnly, deleteUser);

export default router;
