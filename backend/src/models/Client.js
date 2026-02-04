import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    telefono: {
      type: String,
      default: "",
    },
    direccion: {
      type: String,
      default: "",
    },
    notas: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
