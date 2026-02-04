import { Router } from "express";
import { auth, adminOnly, authOptional } from "../middleware/auth.middleware.js";
import { createProduct, deleteProduct, getProducts, updateProduct, obtenerRecomendaciones } from "../controllers/product.controller.js";

const router = Router();

// Público: catálogo
router.get("/", getProducts);

// Recomendaciones (usuario opcional)
router.get("/recommendations", authOptional, obtenerRecomendaciones);

// Admin: CRUD
router.post("/", auth, adminOnly, createProduct);
router.put("/:id", auth, adminOnly, updateProduct);
router.delete("/:id", auth, adminOnly, deleteProduct);

export default router;
