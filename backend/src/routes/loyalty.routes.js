import express from "express";
import { auth } from "../middleware/auth.middleware.js";
import { obtenerPuntos, redimirPuntos } from "../controllers/loyalty.controller.js";

const router = express.Router();

router.get("/points", auth, obtenerPuntos);
router.post("/redeem", auth, redimirPuntos);

export default router;
