import express from "express";
import {
  obtenerSettings,
  actualizarSettings,
  confirmarPago,
  rechazarPago,
  obtenerResumenPagos,
} from "../controllers/payment.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Configuración (public para obtener, admin para actualizar)
router.get("/settings", obtenerSettings);
router.put("/settings", auth, actualizarSettings); // Solo admin

// Pagos (admin only)
router.get("/resumen", auth, obtenerResumenPagos);
router.put("/:ordenId/confirmar", auth, confirmarPago);
router.put("/:ordenId/rechazar", auth, rechazarPago);

export default router;
