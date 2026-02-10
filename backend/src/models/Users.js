import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    telefono: {
      type: String,
      default: "",
    },
    fecha_nacimiento: {
      type: Date,
      required: true,
    },
    // Campos fiscales para facturación
    nit: {
      type: String,
      default: "",
    },
    dui: {
      type: String,
      default: "",
    },
    direccionFiscal: {
      type: String,
      default: "",
    },
    // Datos de facturación electrónica (reutilizables)
    datosFacturacion: {
      tipoIdentificacion: { type: String, default: "" },
      numeroIdentificacion: { type: String, default: "" },
      razonSocial: { type: String, default: "" },
      direccion: { type: String, default: "" },
      telefono: { type: String, default: "" },
      correo: { type: String, default: "" },
    },
    puntos: {
      type: Number,
      default: 0,
      min: 0,
    },
    puntosAcumulados: {
      type: Number,
      default: 0,
      min: 0,
    },
    rol: {
      type: String,
      enum: ["admin", "cliente"],
      default: "cliente",
    },
    // Campos para recuperación de contraseña
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
