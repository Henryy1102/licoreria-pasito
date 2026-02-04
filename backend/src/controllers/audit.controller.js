import Audit from "../models/Audit.js";

// Obtener todos los logs de auditoría (solo admin)
export const getAuditLogs = async (req, res) => {
  try {
    const { 
      usuario, 
      accion, 
      fechaInicio, 
      fechaFin, 
      page = 1, 
      limit = 50 
    } = req.query;

    const query = {};

    if (usuario) query.usuario = usuario;
    if (accion) query.accion = accion;
    
    if (fechaInicio || fechaFin) {
      query.createdAt = {};
      if (fechaInicio) query.createdAt.$gte = new Date(fechaInicio);
      if (fechaFin) query.createdAt.$lte = new Date(fechaFin);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      Audit.find(query)
        .populate("usuario", "nombre email rol")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Audit.countDocuments(query)
    ]);

    res.json({
      logs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error al obtener logs:", error);
    res.status(500).json({ message: "Error al obtener logs de auditoría" });
  }
};

// Obtener estadísticas de auditoría
export const getAuditStats = async (req, res) => {
  try {
    const [
      totalAcciones,
      accionesPorTipo,
      usuariosActivos
    ] = await Promise.all([
      Audit.countDocuments(),
      Audit.aggregate([
        { $group: { _id: "$accion", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Audit.aggregate([
        { $group: { _id: "$usuario", count: { $sum: 1 }, ultimaAccion: { $max: "$createdAt" } } },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "usuario" } },
        { $unwind: "$usuario" },
        { $project: { nombre: "$usuario.nombre", email: "$usuario.email", count: 1, ultimaAccion: 1 } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      totalAcciones,
      accionesPorTipo,
      usuariosActivos
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
};

// Crear log de auditoría (función auxiliar para usar en otros controladores)
export const createAuditLog = async (data) => {
  try {
    const log = new Audit(data);
    await log.save();
    return log;
  } catch (error) {
    console.error("Error al crear log de auditoría:", error);
  }
};
