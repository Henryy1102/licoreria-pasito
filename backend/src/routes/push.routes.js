import express from "express";
import { auth } from "../middleware/auth.middleware.js";
import {
  obtenerVapidPublicKey,
  suscribirPush,
  desuscribirPush,
} from "../controllers/push.controller.js";

const router = express.Router();

router.get("/vapid-public-key", obtenerVapidPublicKey);
router.post("/subscribe", auth, suscribirPush);
router.post("/unsubscribe", auth, desuscribirPush);

export default router;
