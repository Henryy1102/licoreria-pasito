import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: ["nueva_orden", "cambio_estado", "cancelacion", "sistema"],
      required: true,
    },
    titulo: {
      type: String,
      required: true,
    },
    mensaje: {
      type: String,
      required: true,
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    orden: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    leida: {
      type: Boolean,
      default: false,
    },
    // Si es para admin, no se asigna usuario específico
    paraAdmin: {
      type: Boolean,
      default: false,
    },
    icono: {
      type: String,
      default: "🔔",
    },
  },
  { timestamps: true }
);

// Índice para búsquedas eficientes
notificationSchema.index({ usuario: 1, leida: 1, createdAt: -1 });
notificationSchema.index({ paraAdmin: 1, leida: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
