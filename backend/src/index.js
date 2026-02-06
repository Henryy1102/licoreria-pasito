// src/index.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Cargar variables de entorno PRIMERO
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import clientRoutes from "./routes/client.routes.js";
import userRoutes from "./routes/user.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import reportRoutes from "./routes/report.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import pushRoutes from "./routes/push.routes.js";
import { connectDB } from "./config/db.js";

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'https://licoreria-pasito.vercel.app'],
  credentials: true
}));
// Aumentar límites para permitir comprobantes grandes en Base64
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/users", userRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/push", pushRoutes);

const PORT = process.env.PORT || 4000;

// Iniciar servidor solo cuando la DB esté conectada
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("No se pudo iniciar el servidor:", err?.message || err);
    process.exit(1);
  });
