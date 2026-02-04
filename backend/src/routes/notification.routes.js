import express from "express";
import {
  obtenerNotificaciones,
  marcarComoLeida,
  marcarTodasLeidas,
  eliminarNotificacion,
} from "../controllers/notification.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Obtener notificaciones
router.get("/", auth, obtenerNotificaciones);

// Marcar como leída
router.put("/:notificacionId/leer", auth, marcarComoLeida);

// Marcar todas como leídas
router.put("/leer-todas", auth, marcarTodasLeidas);

// Eliminar notificación
router.delete("/:notificacionId", auth, eliminarNotificacion);

export default router;
