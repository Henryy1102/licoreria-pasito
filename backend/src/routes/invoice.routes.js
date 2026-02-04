import express from "express";
import {
  crearFactura,
  obtenerFacturas,
  obtenerMisFacturas,
  obtenerTodasFacturasDebug,
  debugCompararFacturasDebug,
  debugFacturaUsuario,
  obtenerFacturaPorId,
  obtenerFacturaPorOrden,
  marcarComoPagada,
  anularFactura,
  obtenerEstadisticas,
  descargarPDF,
} from "../controllers/invoice.controller.js";
import { auth, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// ENDPOINT DE DEBUG (sin autenticación)
router.get("/debug/todas", obtenerTodasFacturasDebug);
router.get("/debug/comparar", debugCompararFacturasDebug);

// Rutas protegidas - requieren autenticación
router.use(auth);

// Debug autenticado
router.get("/debug/yo", debugFacturaUsuario);

// Crear factura (admin o desde una orden completada)
router.post("/", crearFactura);

// Rutas específicas (ANTES de rutas parametrizadas)
router.get("/mis-facturas", obtenerMisFacturas);
router.get("/orden/:ordenId", obtenerFacturaPorOrden);
router.get("/:id/pdf", descargarPDF);

// Rutas solo para administradores
router.get("/", isAdmin, obtenerFacturas);
router.put("/:id/pagar", isAdmin, marcarComoPagada);
router.put("/:id/anular", isAdmin, anularFactura);
router.get("/estadisticas/facturacion", isAdmin, obtenerEstadisticas);

// Rutas parametrizadas (DESPUÉS de rutas específicas)
router.get("/:id", obtenerFacturaPorId);

export default router;
