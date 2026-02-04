import express from "express";
import { 
  obtenerReportesVentas, 
  obtenerReporteCliente,
  analisisInventario,
  clientesFrecuentes,
  tendenciasVentas
} from "../controllers/report.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Obtener reportes generales de ventas
router.get("/ventas", auth, obtenerReportesVentas);

// Obtener reporte de cliente específico
router.get("/cliente/:clienteId", auth, obtenerReporteCliente);

// Análisis de inventario
router.get("/inventario", auth, analisisInventario);

// Clientes frecuentes
router.get("/clientes-frecuentes", auth, clientesFrecuentes);

// Tendencias de ventas
router.get("/tendencias", auth, tendenciasVentas);

export default router;
