import Settings from "../models/Settings.js";

// Obtener configuración
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      // Crear configuración por defecto si no existe
      settings = await Settings.create({
        datosBancarios: {
          banco: "Banco Pichincha",
          numeroCuenta: "12345-6789-0123",
          titular: "Maria García",
          activo: true,
        },
        contacto: {
          telefonoDueña: "+503 7123-4567",
          telefonoAtencion: "+503 7987-6543",
          email: "info@licoreria.sv",
        },
        instrucciones: {
          efectivo: "El repartidor te cobrará al momento de la entrega",
          transferencia: "Incluye el número de orden en la referencia de tu transferencia",
          tiempoConfirmacion: "Se procesará cuando se confirme el pago (máximo 2 horas)",
        },
        nombreEmpresa: "Licorería Al Pasito",
      });
    }

    res.json(settings);
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    res.status(500).json({ error: "Error al obtener configuración" });
  }
};

// Actualizar configuración
export const updateSettings = async (req, res) => {
  try {
    // Verificar que el usuario sea admin
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "No tienes permiso para actualizar la configuración" });
    }

    const {
      datosBancarios,
      contacto,
      instrucciones,
      nombreEmpresa,
      horarioAtencion,
      diasEntrega,
      tiempoEntregaEstimado,
    } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    // Actualizar campos
    if (datosBancarios) settings.datosBancarios = datosBancarios;
    if (contacto) settings.contacto = contacto;
    if (instrucciones) settings.instrucciones = instrucciones;
    if (nombreEmpresa) settings.nombreEmpresa = nombreEmpresa;
    if (horarioAtencion) settings.horarioAtencion = horarioAtencion;
    if (diasEntrega) settings.diasEntrega = diasEntrega;
    if (tiempoEntregaEstimado) settings.tiempoEntregaEstimado = tiempoEntregaEstimado;

    await settings.save();

    res.json({
      mensaje: "Configuración actualizada correctamente",
      settings,
    });
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.status(500).json({ error: "Error al actualizar configuración" });
  }
};
