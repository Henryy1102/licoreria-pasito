import express from "express";
import {
  crearOrden,
  obtenerOrdenes,
  obtenerMisOrdenes,
  obtenerOrden,
  actualizarEstadoOrden,
  cancelarOrden,
  obtenerEstadisticas,
  subirComprobanteTransferencia,
  confirmarTransferencia,
  rechazarTransferencia,
  actualizarUbicacion,
  generarFactura,
  obtenerOrdenesTransferenciaPendiente,
  debugObtenerTodasOrdenes,
} from "../controllers/order.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

// DEBUG: Ver todas las órdenes
router.get("/debug/todas", debugObtenerTodasOrdenes);

// Crear orden
router.post("/", auth, crearOrden);

// Obtener mis órdenes (usuario autenticado)
router.get("/mis-ordenes/historial", auth, obtenerMisOrdenes);

// Obtener órdenes con transferencia pendiente de confirmación (admin) - DEBE IR ANTES DE /:ordenId
router.get("/transferencia/pendiente", auth, obtenerOrdenesTransferenciaPendiente);

// Obtener estadísticas de ventas
router.get("/estadisticas/ventas", auth, obtenerEstadisticas);

// Obtener todas las órdenes (admin)
router.get("/", auth, obtenerOrdenes);

// Obtener orden por ID
router.get("/:ordenId", auth, obtenerOrden);

// Subir comprobante de transferencia
router.post("/:ordenId/comprobante", auth, subirComprobanteTransferencia);

// Confirmar transferencia (admin)
router.put("/:ordenId/confirmar-transferencia", auth, confirmarTransferencia);

// Rechazar transferencia (admin)
router.put("/:ordenId/rechazar-transferencia", auth, rechazarTransferencia);

// Actualizar ubicación (Google Maps)
router.put("/:ordenId/ubicacion", auth, actualizarUbicacion);

// Generar factura (admin)
router.post("/:ordenId/generar-factura", auth, generarFactura);

// Actualizar estado de orden (admin)
router.put("/:ordenId/estado", auth, actualizarEstadoOrden);

// Cancelar orden
router.put("/:ordenId/cancelar", auth, cancelarOrden);

export default router;
