import Invoice from "../models/Invoice.js";
import Order from "../models/Order.js";
import User from "../models/Users.js";
import { generarPDFFactura } from "../utils/pdfGenerator.js";

const construirDatosFiscales = ({ datosFiscales, usuario }) => {
  const datosUsuario = usuario?.datosFacturacion || {};
  const nombreFallback = usuario?.nombre || "";
  const emailFallback = usuario?.email || "";
  const telefonoFallback = usuario?.telefono || "";

  const razonSocial =
    datosFiscales?.razonSocial || datosUsuario.razonSocial || nombreFallback;
  const correo = datosFiscales?.correo || datosUsuario.correo || emailFallback;
  const telefono = datosFiscales?.telefono || datosUsuario.telefono || telefonoFallback;
  const direccion =
    datosFiscales?.direccion ||
    datosUsuario.direccion ||
    usuario?.direccionFiscal ||
    "";
  const tipoIdentificacion =
    datosFiscales?.tipoIdentificacion || datosUsuario.tipoIdentificacion || "";
  const numeroIdentificacion =
    datosFiscales?.numeroIdentificacion ||
    datosUsuario.numeroIdentificacion ||
    usuario?.nit ||
    usuario?.dui ||
    "";

  return {
    nombre: razonSocial,
    email: correo,
    telefono,
    nit: usuario?.nit || "",
    dui: usuario?.dui || "",
    direccionFiscal: usuario?.direccionFiscal || "",
    tipoIdentificacion,
    numeroIdentificacion,
    razonSocial,
    direccion,
    correo,
  };
};

// Crear factura manualmente o desde una orden
export const crearFactura = async (req, res) => {
  try {
    const { ordenId, datosFiscales, notas } = req.body;

    // Buscar la orden
    const orden = await Order.findById(ordenId)
      .populate("usuario")
      .populate("productos.producto");

    if (!orden) {
      return res.status(404).json({ mensaje: "Orden no encontrada" });
    }

    // Verificar que la orden esté completada
    if (orden.estado !== "completado") {
      return res.status(400).json({
        mensaje: "Solo se pueden facturar órdenes completadas",
      });
    }

    // Verificar si ya existe una factura para esta orden
    const facturaExistente = await Invoice.findOne({ ordenId });
    if (facturaExistente) {
      return res.status(400).json({
        mensaje: "Ya existe una factura para esta orden",
        factura: facturaExistente,
      });
    }

    // Obtener datos del cliente
    const cliente = await User.findById(orden.usuario);

    // Preparar datos fiscales (usar los proporcionados o los del usuario)
    const datosFiscalesFactura = construirDatosFiscales({
      datosFiscales,
      usuario: cliente,
    });

    if (datosFiscales) {
      await User.findByIdAndUpdate(cliente._id, {
        $set: {
          datosFacturacion: {
            tipoIdentificacion: datosFiscalesFactura.tipoIdentificacion || "",
            numeroIdentificacion: datosFiscalesFactura.numeroIdentificacion || "",
            razonSocial: datosFiscalesFactura.razonSocial || "",
            direccion: datosFiscalesFactura.direccion || "",
            telefono: datosFiscalesFactura.telefono || "",
            correo: datosFiscalesFactura.correo || "",
          },
        },
      });
    }

    // Crear la factura
    const factura = new Invoice({
      ordenId: orden._id,
      clienteId: orden.usuario,
      datosFiscales: datosFiscalesFactura,
      productos: orden.productos.map((p) => ({
        productoId: p.producto,
        nombre: p.nombre,
        cantidad: p.cantidad,
        precioUnitario: p.precio,
        subtotal: p.precio * p.cantidad,
      })),
      subtotal: orden.subtotal,
      descuento: orden.descuento || 0,
      metodoPago: orden.metodoPago,
      notas: notas || "",
    });

    // Calcular IVA y total
    factura.calcularTotal();

    // Guardar factura
    await factura.save();

    // Poblar datos para respuesta
    await factura.populate("clienteId ordenId");

    res.status(201).json({
      mensaje: "Factura creada exitosamente",
      factura,
    });
  } catch (error) {
    console.error("Error al crear factura:", error);
    res.status(500).json({
      mensaje: "Error al crear factura",
      error: error.message,
    });
  }
};

// Obtener todas las facturas (con filtros opcionales)
export const obtenerFacturas = async (req, res) => {
  try {
    const { estado, clienteId, fechaInicio, fechaFin } = req.query;

    let filtros = {};

    if (estado) filtros.estado = estado;
    if (clienteId) filtros.clienteId = clienteId;

    if (fechaInicio || fechaFin) {
      filtros.fechaEmision = {};
      if (fechaInicio) filtros.fechaEmision.$gte = new Date(fechaInicio);
      if (fechaFin) filtros.fechaEmision.$lte = new Date(fechaFin);
    }

    const facturas = await Invoice.find(filtros)
      .populate("clienteId", "nombre email telefono")
      .populate("ordenId", "numeroOrden estado")
      .sort({ fechaEmision: -1 });

    res.json(facturas);
  } catch (error) {
    console.error("Error al obtener facturas:", error);
    res.status(500).json({
      mensaje: "Error al obtener facturas",
      error: error.message,
    });
  }
};

// Debug: Obtener TODAS las facturas (sin filtro)
export const obtenerTodasFacturasDebug = async (req, res) => {
  try {
    console.log("🔍 DEBUG: Obteniendo TODAS las facturas");
    
    const todasFacturas = await Invoice.find({})
      .sort({ fechaEmision: -1 });

    console.log(`📊 Total de facturas en BD: ${todasFacturas.length}`);
    
    res.json({
      totalFacturasEnBD: todasFacturas.length,
      facturas: todasFacturas.map(f => ({
        _id: f._id,
        numeroFactura: f.numeroFactura,
        clienteId: f.clienteId,
        ordenId: f.ordenId,
        datosFiscales: {
          nombre: f.datosFiscales?.nombre,
          email: f.datosFiscales?.email,
        },
        estado: f.estado,
        fechaEmision: f.fechaEmision,
      })),
    });
  } catch (error) {
    console.error("Error en debug:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

// Debug: Comparar usuario con facturas
export const debugCompararFacturasDebug = async (req, res) => {
  try {
    console.log("🔍 DEBUG: Comparando facturas");
    
    const todasFacturas = await Invoice.find({});
    
    res.json({
      totalFacturasEnBD: todasFacturas.length,
      facturas: todasFacturas.map(f => ({
        numeroFactura: f.numeroFactura,
        clienteId: f.clienteId.toString(),
        clienteNombre: f.datosFiscales?.nombre,
        clienteEmail: f.datosFiscales?.email,
      })),
      nota: "Compara estos IDs con el que ves en Mis Facturas después de loguearte",
    });
  } catch (error) {
    console.error("Error en debug:", error);
    res.status(500).json({ error: error.message });
  }
};

// Debug: Ver usuario autenticado
export const debugFacturaUsuario = async (req, res) => {
  try {
    return res.json({
      user: req.user,
      nota: "Este endpoint requiere token y muestra el usuario autenticado",
    });
  } catch (error) {
    console.error("Error en debugFacturaUsuario:", error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener facturas del cliente autenticado
export const obtenerMisFacturas = async (req, res) => {
  try {
    const clienteId = req.user._id || req.user.id;
    console.log("🔍 Buscando facturas para cliente:", clienteId, "tipo:", typeof clienteId);
    console.log("   req.user:", req.user);

    const facturas = await Invoice.find({ clienteId })
      .populate("ordenId", "numeroOrden estado fechaEntregaReal")
      .sort({ fechaEmision: -1 });

    console.log(`✅ Se encontraron ${facturas.length} facturas`);
    if (facturas.length > 0) {
      console.log("   Primera factura:", facturas[0]);
    }
    
    res.json(facturas);
  } catch (error) {
    console.error("Error al obtener facturas:", error);
    res.status(500).json({
      mensaje: "Error al obtener facturas",
      error: error.message,
    });
  }
};

// Obtener factura por ID
export const obtenerFacturaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const factura = await Invoice.findById(id)
      .populate("clienteId", "nombre email telefono nit dui")
      .populate("ordenId")
      .populate("productos.productoId", "nombre categoria");

    if (!factura) {
      return res.status(404).json({ mensaje: "Factura no encontrada" });
    }

    // Verificar permisos: admin o dueño de la factura
    if (
      req.user.rol !== "admin" &&
      factura.clienteId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        mensaje: "No tienes permisos para ver esta factura",
      });
    }

    res.json(factura);
  } catch (error) {
    console.error("Error al obtener factura:", error);
    res.status(500).json({
      mensaje: "Error al obtener factura",
      error: error.message,
    });
  }
};

// Obtener factura por orden
export const obtenerFacturaPorOrden = async (req, res) => {
  try {
    const { ordenId } = req.params;

    const factura = await Invoice.findOne({ ordenId })
      .populate("clienteId", "nombre email telefono nit dui")
      .populate("ordenId");

    if (!factura) {
      return res.status(404).json({
        mensaje: "No se encontró factura para esta orden",
      });
    }

    // Verificar permisos
    if (
      req.user.rol !== "admin" &&
      factura.clienteId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        mensaje: "No tienes permisos para ver esta factura",
      });
    }

    res.json(factura);
  } catch (error) {
    console.error("Error al obtener factura:", error);
    res.status(500).json({
      mensaje: "Error al obtener factura",
      error: error.message,
    });
  }
};

// Marcar factura como pagada
export const marcarComoPagada = async (req, res) => {
  try {
    const { id } = req.params;

    const factura = await Invoice.findById(id);

    if (!factura) {
      return res.status(404).json({ mensaje: "Factura no encontrada" });
    }

    if (factura.estado === "pagada") {
      return res.status(400).json({ mensaje: "La factura ya está pagada" });
    }

    if (factura.estado === "anulada") {
      return res.status(400).json({
        mensaje: "No se puede marcar como pagada una factura anulada",
      });
    }

    await factura.marcarComoPagada();

    res.json({ mensaje: "Factura marcada como pagada", factura });
  } catch (error) {
    console.error("Error al marcar factura como pagada:", error);
    res.status(500).json({
      mensaje: "Error al actualizar factura",
      error: error.message,
    });
  }
};

// Anular factura
export const anularFactura = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    if (!motivo) {
      return res.status(400).json({
        mensaje: "Debe proporcionar un motivo para anular la factura",
      });
    }

    const factura = await Invoice.findById(id);

    if (!factura) {
      return res.status(404).json({ mensaje: "Factura no encontrada" });
    }

    if (factura.estado === "anulada") {
      return res.status(400).json({ mensaje: "La factura ya está anulada" });
    }

    await factura.anular(motivo);

    res.json({ mensaje: "Factura anulada exitosamente", factura });
  } catch (error) {
    console.error("Error al anular factura:", error);
    res.status(500).json({
      mensaje: "Error al anular factura",
      error: error.message,
    });
  }
};

// Obtener estadísticas de facturación
export const obtenerEstadisticas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    let filtros = { estado: { $ne: "anulada" } };

    if (fechaInicio || fechaFin) {
      filtros.fechaEmision = {};
      if (fechaInicio) filtros.fechaEmision.$gte = new Date(fechaInicio);
      if (fechaFin) filtros.fechaEmision.$lte = new Date(fechaFin);
    }

    const facturas = await Invoice.find(filtros);

    const totalFacturas = facturas.length;
    const totalFacturado = facturas.reduce((sum, f) => sum + f.total, 0);
    const totalIVA = facturas.reduce((sum, f) => sum + f.iva, 0);
    const totalPagadas = facturas.filter((f) => f.estado === "pagada").length;
    const totalEmitidas = facturas.filter((f) => f.estado === "emitida").length;

    const facturacionPorMetodo = facturas.reduce((acc, f) => {
      if (!acc[f.metodoPago]) {
        acc[f.metodoPago] = { cantidad: 0, total: 0 };
      }
      acc[f.metodoPago].cantidad++;
      acc[f.metodoPago].total += f.total;
      return acc;
    }, {});

    res.json({
      totalFacturas,
      totalFacturado,
      totalIVA,
      totalPagadas,
      totalEmitidas,
      facturacionPorMetodo,
      promedioFactura: totalFacturas > 0 ? totalFacturado / totalFacturas : 0,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      mensaje: "Error al obtener estadísticas",
      error: error.message,
    });
  }
};

// Descargar PDF de factura
export const descargarPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const factura = await Invoice.findById(id)
      .populate("clienteId", "nombre email telefono nit dui direccionFiscal")
      .populate("ordenId")
      .populate("productos.productoId", "nombre");

    if (!factura) {
      return res.status(404).json({ mensaje: "Factura no encontrada" });
    }

    // Verificar permisos
    if (
      req.user.rol !== "admin" &&
      factura.clienteId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        mensaje: "No tienes permisos para descargar esta factura",
      });
    }

    // Generar PDF
    const pdfBuffer = await generarPDFFactura(factura);

    // Configurar headers para descarga
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Factura-${factura.numeroFactura}.pdf`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    // Enviar PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error al generar PDF:", error);
    res.status(500).json({
      mensaje: "Error al generar PDF",
      error: error.message,
    });
  }
};


// Nota: XML ya no se genera, solo se genera PDF

