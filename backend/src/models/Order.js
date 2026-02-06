import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    numeroOrden: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productos: [
      {
        producto: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        nombre: String,
        precio: Number,
        cantidad: {
          type: Number,
          required: true,
          min: 1,
        },
        subtotal: Number,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    descuento: {
      type: Number,
      default: 0,
      min: 0,
    },
    impuesto: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    puntosGanados: {
      type: Number,
      default: 0,
      min: 0,
    },
    estado: {
      type: String,
      enum: ["pendiente", "procesando", "completado", "cancelado"],
      default: "pendiente",
    },
    estadoPago: {
      type: String,
      enum: ["pendiente", "confirmado", "rechazado"],
      default: "pendiente",
    },
    metodoPago: {
      type: String,
      enum: ["efectivo", "tarjeta", "transferencia", "otro"],
      required: true,
    },
    direccionEntrega: {
      calle: String,
      numero: String,
      ciudad: String,
      departamento: String,
      codigoPostal: String,
    },
    // Google Maps Location
    ubicacion: {
      latitud: Number,
      longitud: Number,
      direccion: String,
      link: String,
    },
    // Datos de facturación (capturados en checkout)
    datosFacturacion: {
      tipoIdentificacion: String,
      numeroIdentificacion: String,
      razonSocial: String,
      direccion: String,
      telefono: String,
      correo: String,
    },
    // Comprobante de Transferencia
    comprobante: {
      url: String,
      nombreArchivo: String,
      cargadoEn: Date,
    },
    // Confirmación de Transferencia por Admin
    confirmaacionTransferencia: {
      confirmado: {
        type: Boolean,
        default: false,
      },
      confirmadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      confirmadoEn: Date,
      notas: String,
    },
    // Factura Generada
    factura: {
      generada: {
        type: Boolean,
        default: false,
      },
      urlPDF: String,
      numeroFactura: String,
      generadaEn: Date,
    },
    notas: {
      type: String,
      default: "",
    },
    fechaEntregaEstimada: Date,
    fechaEntregaReal: Date,
    fechaConfirmacionPago: Date,
    notasPago: String,
    canceladoEn: Date,
    motivoCancelacion: String,
  },
  { timestamps: true }
);

// Generar número de orden automáticamente
orderSchema.pre("save", async function (next) {
  if (!this.numeroOrden) {
    const count = await mongoose.model("Order").countDocuments();
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    this.numeroOrden = `ORD-${año}${mes}${dia}-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

export default mongoose.model("Order", orderSchema);
