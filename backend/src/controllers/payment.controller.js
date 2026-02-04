import Settings from "../models/Settings.js";
import Order from "../models/Order.js";

// Obtener configuración general
export const obtenerSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Crear configuración por defecto si no existe
      settings = await Settings.create({
        datosBancarios: {
          numeroCuenta: "12345-6789-0123",
          titular: "Maria García",
        },
        contacto: {
          telefonoDueña: "+503 7123-4567",
          telefonoAtencion: "+503 7987-6543",
          email: "info@licoreria.sv",
        },
      });
    }

    res.json(settings);
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    res.status(500).json({ error: "Error al obtener configuración" });
  }
};

// Actualizar configuración (solo admin)
export const actualizarSettings = async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true }
    );

    res.json({
      mensaje: "Configuración actualizada",
      settings,
    });
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.status(500).json({ error: "Error al actualizar configuración" });
  }
};

// Confirmar pago de orden
export const confirmarPago = async (req, res) => {
  try {
    const { ordenId } = req.params;
    const { notas } = req.body;

    const orden = await Order.findById(ordenId);
    if (!orden) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    const ordenActualizada = await Order.findByIdAndUpdate(
      ordenId,
      {
        estadoPago: "confirmado",
        fechaConfirmacionPago: new Date(),
        notasPago: notas || "",
      },
      { new: true }
    )
      .populate("cliente")
      .populate("usuario");

    res.json({
      mensaje: "Pago confirmado",
      orden: ordenActualizada,
    });
  } catch (error) {
    console.error("Error al confirmar pago:", error);
    res.status(500).json({ error: "Error al confirmar pago" });
  }
};

// Rechazar pago de orden
export const rechazarPago = async (req, res) => {
  try {
    const { ordenId } = req.params;
    const { motivo } = req.body;

    const orden = await Order.findByIdAndUpdate(
      ordenId,
      {
        estadoPago: "rechazado",
        notasPago: `Rechazado: ${motivo || "Sin especificar"}`,
      },
      { new: true }
    )
      .populate("cliente")
      .populate("usuario");

    res.json({
      mensaje: "Pago rechazado",
      orden,
    });
  } catch (error) {
    console.error("Error al rechazar pago:", error);
    res.status(500).json({ error: "Error al rechazar pago" });
  }
};

// Obtener resumen de pagos
export const obtenerResumenPagos = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    let filtro = {};
    if (fechaInicio || fechaFin) {
      filtro.createdAt = {};
      if (fechaInicio) filtro.createdAt.$gte = new Date(fechaInicio);
      if (fechaFin) filtro.createdAt.$lte = new Date(fechaFin);
    }

    // Órdenes pendientes de pago
    const pendientes = await Order.find({
      ...filtro,
      estadoPago: "pendiente",
    }).countDocuments();

    // Órdenes con pago confirmado
    const confirmados = await Order.find({
      ...filtro,
      estadoPago: "confirmado",
    });

    // Total recaudado
    const totalRecaudado = confirmados.reduce((sum, orden) => sum + orden.total, 0);

    // Órdenes rechazadas
    const rechazados = await Order.find({
      ...filtro,
      estadoPago: "rechazado",
    }).countDocuments();

    // Por método de pago
    const porMetodo = await Order.aggregate([
      { $match: { ...filtro, estadoPago: "confirmado" } },
      {
        $group: {
          _id: "$metodoPago",
          cantidad: { $sum: 1 },
          total: { $sum: "$total" },
        },
      },
    ]);

    res.json({
      pendientes,
      confirmados: confirmados.length,
      rechazados,
      totalRecaudado,
      porMetodo,
      ordenesPendientes: pendientes > 0 
        ? await Order.find({ ...filtro, estadoPago: "pendiente" })
            .populate("cliente", "nombre email")
            .populate("usuario", "nombre")
            .limit(10)
        : [],
    });
  } catch (error) {
    console.error("Error al obtener resumen de pagos:", error);
    res.status(500).json({ error: "Error al obtener resumen de pagos" });
  }
};
