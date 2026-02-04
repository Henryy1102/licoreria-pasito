import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    // Datos Bancarios
    datosBancarios: {
      banco: {
        type: String,
        default: "Banco Pichincha",
      },
      numeroCuenta: {
        type: String,
        required: true,
      },
      titular: {
        type: String,
        required: true,
      },
      activo: {
        type: Boolean,
        default: true,
      },
    },

    // Contacto
    contacto: {
      telefonoDueña: {
        type: String,
        required: true,
      },
      telefonoAtencion: {
        type: String,
      },
      email: {
        type: String,
        required: true,
      },
    },

    // Instrucciones de Pago
    instrucciones: {
      efectivo: {
        type: String,
        default: "El repartidor te cobrará al momento de la entrega",
      },
      transferencia: {
        type: String,
        default: "Incluye el número de orden en la referencia de tu transferencia",
      },
      tiempoConfirmacion: {
        type: String,
        default: "Se procesará cuando se confirme el pago (máximo 2 horas)",
      },
    },

    // Datos de Facturación (Fase 2)
    facturacion: {
      razonSocial: String,
      nit: String,
      giro: String,
      direccion: String,
      telefonoFacturacion: String,
      emailFacturacion: String,
      logoUrl: String,
      activo: {
        type: Boolean,
        default: false,
      },
    },

    // Configuración General
    nombreEmpresa: {
      type: String,
      default: "Licorería Al Pasito",
    },
    horarioAtencion: String,
    diasEntrega: [String], // ["lunes", "martes", "miércoles", etc]
    tiempoEntregaEstimado: String, // "30-60 minutos"
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
