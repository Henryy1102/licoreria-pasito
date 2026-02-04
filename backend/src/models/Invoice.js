import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    numeroFactura: {
      type: String,
      required: true,
      unique: true,
      // Formato: INV-YYYYMMDD-#####
    },
    ordenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    clienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Datos fiscales del cliente (capturados al momento de facturar)
    datosFiscales: {
      nombre: { type: String, required: true },
      email: { type: String, required: true },
      telefono: String,
      nit: String,
      dui: String,
      direccionFiscal: String,
      // Datos de facturación electrónica (ECU)
      tipoIdentificacion: String,
      numeroIdentificacion: String,
      razonSocial: String,
      direccion: String,
      correo: String,
    },
    // Productos facturados
    productos: [
      {
        productoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        nombre: { type: String, required: true },
        cantidad: { type: Number, required: true, min: 1 },
        precioUnitario: { type: Number, required: true, min: 0 },
        subtotal: { type: Number, required: true, min: 0 },
      },
    ],
    // Cálculos financieros
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
    iva: {
      type: Number,
      default: 0,
      min: 0,
      // 13% IVA en El Salvador
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    // Método de pago
    metodoPago: {
      type: String,
      enum: ["efectivo", "tarjeta", "transferencia"],
      required: true,
    },
    // Estado de la factura
    estado: {
      type: String,
      enum: ["emitida", "pagada", "cancelada", "anulada"],
      default: "emitida",
    },
    // Fechas importantes
    fechaEmision: {
      type: Date,
      default: Date.now,
    },
    fechaPago: Date,
    fechaAnulacion: Date,
    // Notas adicionales
    notas: String,
    motivoAnulacion: String,
  },
  {
    timestamps: true,
  }
);

// Middleware para generar número de factura antes de guardar
invoiceSchema.pre("save", async function (next) {
  if (this.isNew && !this.numeroFactura) {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    const fechaStr = `${year}${month}${day}`;

    // Buscar la última factura del día
    const ultimaFactura = await this.constructor
      .findOne({
        numeroFactura: new RegExp(`^INV-${fechaStr}-`),
      })
      .sort({ numeroFactura: -1 })
      .limit(1);

    let numeroSecuencial = 1;
    if (ultimaFactura) {
      const ultimoNumero = parseInt(
        ultimaFactura.numeroFactura.split("-")[2]
      );
      numeroSecuencial = ultimoNumero + 1;
    }

    this.numeroFactura = `INV-${fechaStr}-${String(numeroSecuencial).padStart(
      5,
      "0"
    )}`;
  }
  next();
});

// Método para calcular IVA (13% en El Salvador)
invoiceSchema.methods.calcularIVA = function () {
  const baseImponible = this.subtotal - this.descuento;
  this.iva = baseImponible * 0.13;
  return this.iva;
};

// Método para calcular total
invoiceSchema.methods.calcularTotal = function () {
  this.calcularIVA();
  this.total = this.subtotal - this.descuento + this.iva;
  return this.total;
};

// Método para marcar como pagada
invoiceSchema.methods.marcarComoPagada = function () {
  this.estado = "pagada";
  this.fechaPago = new Date();
  return this.save();
};

// Método para anular factura
invoiceSchema.methods.anular = function (motivo) {
  this.estado = "anulada";
  this.fechaAnulacion = new Date();
  this.motivoAnulacion = motivo;
  return this.save();
};

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
