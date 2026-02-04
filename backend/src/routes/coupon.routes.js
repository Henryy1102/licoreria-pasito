import express from "express";
import { auth, adminOnly } from "../middleware/auth.middleware.js";
import {
  crearCupon,
  listarCupones,
  validarCuponEndpoint,
  actualizarEstadoCupon,
} from "../controllers/coupon.controller.js";

const router = express.Router();

router.post("/validar", auth, validarCuponEndpoint);

router.get("/", auth, adminOnly, listarCupones);
router.post("/", auth, adminOnly, crearCupon);
router.put("/:id/estado", auth, adminOnly, actualizarEstadoCupon);

export default router;
