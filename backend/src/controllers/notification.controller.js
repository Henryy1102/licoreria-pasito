import Notification from "../models/Notification.js";

// Crear notificación
export const crearNotificacion = async (data) => {
  try {
    const notificacion = new Notification(data);
    await notificacion.save();

    return notificacion;
  } catch (error) {
    console.error("Error al crear notificación:", error);
    throw error;
  }
};

// Obtener notificaciones del usuario/admin
export const obtenerNotificaciones = async (req, res) => {
  try {
    const usuarioId = req.user._id;
    const esAdmin = req.user.rol === "admin";
    const { limite = 20, soloNoLeidas = false } = req.query;

    let filtro = {};
    
    if (esAdmin) {
      // Admin ve sus notificaciones y las notificaciones para admin
      filtro = {
        $or: [
          { usuario: usuarioId },
          { paraAdmin: true }
        ]
      };
    } else {
      // Usuario normal solo ve sus notificaciones
      filtro = { usuario: usuarioId };
    }

    if (soloNoLeidas === "true") {
      filtro.leida = false;
    }

    const notificaciones = await Notification.find(filtro)
      .populate("orden", "numeroOrden estado total")
      .sort({ createdAt: -1 })
      .limit(parseInt(limite));

    const noLeidas = await Notification.countDocuments({
      ...filtro,
      leida: false,
    });

    res.json({
      notificaciones,
      noLeidas,
      total: notificaciones.length,
    });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
};

// Marcar notificación como leída
export const marcarComoLeida = async (req, res) => {
  try {
    const { notificacionId } = req.params;
    const usuarioId = req.user._id;
    const esAdmin = req.user.rol === "admin";

    const filtro = { _id: notificacionId };
    
    // Validar que la notificación pertenezca al usuario o sea admin
    const notificacion = await Notification.findById(notificacionId);
    if (!notificacion) {
      return res.status(404).json({ error: "Notificación no encontrada" });
    }

    if (!esAdmin && notificacion.usuario?.toString() !== usuarioId.toString()) {
      return res.status(403).json({ error: "No autorizado" });
    }

    const notificacionActualizada = await Notification.findByIdAndUpdate(
      notificacionId,
      { leida: true },
      { new: true }
    );

    res.json({
      mensaje: "Notificación marcada como leída",
      notificacion: notificacionActualizada,
    });
  } catch (error) {
    console.error("Error al marcar notificación:", error);
    res.status(500).json({ error: "Error al actualizar notificación" });
  }
};

// Marcar todas las notificaciones como leídas
export const marcarTodasLeidas = async (req, res) => {
  try {
    const usuarioId = req.user._id;
    const esAdmin = req.user.rol === "admin";

    let filtro = {};
    if (esAdmin) {
      filtro = {
        $or: [
          { usuario: usuarioId },
          { paraAdmin: true }
        ]
      };
    } else {
      filtro = { usuario: usuarioId };
    }

    await Notification.updateMany(
      { ...filtro, leida: false },
      { leida: true }
    );

    res.json({ mensaje: "Todas las notificaciones marcadas como leídas" });
  } catch (error) {
    console.error("Error al marcar todas como leídas:", error);
    res.status(500).json({ error: "Error al actualizar notificaciones" });
  }
};

// Eliminar notificación
export const eliminarNotificacion = async (req, res) => {
  try {
    const { notificacionId } = req.params;
    const usuarioId = req.user._id;
    const esAdmin = req.user.rol === "admin";

    const notificacion = await Notification.findById(notificacionId);
    if (!notificacion) {
      return res.status(404).json({ error: "Notificación no encontrada" });
    }

    if (!esAdmin && notificacion.usuario?.toString() !== usuarioId.toString()) {
      return res.status(403).json({ error: "No autorizado" });
    }

    await Notification.findByIdAndDelete(notificacionId);

    res.json({ mensaje: "Notificación eliminada" });
  } catch (error) {
    console.error("Error al eliminar notificación:", error);
    res.status(500).json({ error: "Error al eliminar notificación" });
  }
};
