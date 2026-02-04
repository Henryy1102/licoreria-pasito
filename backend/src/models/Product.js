import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      default: "",
      trim: true,
    },
    categoria: {
      type: String,
      default: "general",
      trim: true,
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    imagen: {
      type: String,
      default: "",
    },
    activo: {
      type: Boolean,
      default: true,
    },
    ratingPromedio: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCantidad: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
