import { createAuditLog } from "../controllers/audit.controller.js";

// Middleware para registrar acciones automáticamente
export const auditAction = (accion, getDescripcion) => {
  return async (req, res, next) => {
    // Guardar el método send original
    const originalSend = res.send;

    res.send = function (data) {
      // Solo registrar si la respuesta fue exitosa (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const descripcion = typeof getDescripcion === 'function' 
          ? getDescripcion(req, res) 
          : getDescripcion;

        createAuditLog({
          usuario: req.user.id,
          usuarioNombre: req.user.nombre || req.user.email,
          accion,
          descripcion,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          detalles: {
            method: req.method,
            url: req.originalUrl,
            body: req.method !== 'GET' ? req.body : undefined
          }
        }).catch(err => console.error("Error en auditoría:", err));
      }

      // Llamar al send original
      originalSend.call(this, data);
    };

    next();
  };
};
