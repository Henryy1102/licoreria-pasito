import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    tipo: {
      type: String,
      enum: ["porcentaje", "monto"],
      required: true,
    },
    valor: {
      type: Number,
      required: true,
      min: 0,
    },
    compraMinima: {
      type: Number,
      default: 0,
      min: 0,
    },
    descuentoMaximo: {
      type: Number,
      default: 0,
      min: 0,
    },
    fechaInicio: {
      type: Date,
      default: Date.now,
    },
    fechaFin: {
      type: Date,
    },
    limiteUsos: {
      type: Number,
      default: 0,
      min: 0,
    },
    usosRealizados: {
      type: Number,
      default: 0,
      min: 0,
    },
    limitePorUsuario: {
      type: Number,
      default: 0,
      min: 0,
    },
    usoPorUsuario: [
      {
        usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        usos: { type: Number, default: 0, min: 0 },
      },
    ],
    activo: {
      type: Boolean,
      default: true,
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

couponSchema.index({ codigo: 1, activo: 1 });

export default mongoose.model("Coupon", couponSchema);
