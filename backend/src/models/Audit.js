import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  usuarioNombre: {
    type: String,
    required: true
  },
  accion: {
    type: String,
    required: true,
    enum: [
      "LOGIN",
      "LOGOUT",
      "REGISTRO",
      "PRODUCTO_CREADO",
      "PRODUCTO_EDITADO",
      "PRODUCTO_ELIMINADO",
      "CLIENTE_CREADO",
      "CLIENTE_EDITADO",
      "CLIENTE_ELIMINADO",
      "USUARIO_EDITADO",
      "USUARIO_ELIMINADO",
      "COMPRA_REALIZADA",
      "CARRITO_ACTUALIZADO",
      "CREAR_PEDIDO",
      "ACTUALIZAR_ESTADO_PEDIDO",
      "CANCELAR_PEDIDO"
    ]
  },
  descripcion: {
    type: String,
    required: true
  },
  entidad: {
    tipo: String, // "producto", "cliente", "usuario", etc.
    id: String,
    nombre: String
  },
  ip: String,
  userAgent: String,
  detalles: mongoose.Schema.Types.Mixed
}, { 
  timestamps: true 
});

// Índices para búsquedas eficientes
auditSchema.index({ usuario: 1, createdAt: -1 });
auditSchema.index({ accion: 1, createdAt: -1 });
auditSchema.index({ createdAt: -1 });

export default mongoose.model("Audit", auditSchema);
