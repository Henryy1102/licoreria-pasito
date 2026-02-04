import express from "express";
import { auth } from "../middleware/auth.middleware.js";
import {
  obtenerResenasProducto,
  crearResena,
  actualizarResena,
  eliminarResena,
} from "../controllers/review.controller.js";

const router = express.Router();

router.get("/product/:productId", obtenerResenasProducto);
router.post("/product/:productId", auth, crearResena);
router.put("/:reviewId", auth, actualizarResena);
router.delete("/:reviewId", auth, eliminarResena);

export default router;
