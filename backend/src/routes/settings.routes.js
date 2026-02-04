import express from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Obtener configuración (público)
router.get("/", getSettings);

// Actualizar configuración (solo admin)
router.put("/", auth, updateSettings);

export default router;
