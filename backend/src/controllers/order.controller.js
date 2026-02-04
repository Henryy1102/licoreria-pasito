import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Client from "../models/Client.js";
import User from "../models/Users.js";
import Invoice from "../models/Invoice.js";
import { createAuditLog } from "./audit.controller.js";
import { crearNotificacion } from "./notification.controller.js";
import { registrarUsoCupon, validarCupon } from "./coupon.controller.js";

// Crear nueva orden
export const crearOrden = async (req, res) => {
  try {
    const { clienteId: clienteIdFromBody, productos, descuento, impuesto, metodoPago, ubicacion, notas, comprobante, datosFacturacion, requiereFactura, couponCode } = req.body;
    const usuarioId = req.user._id; // Del middleware de autenticación
    
    // Debug: Log para verificar que se recibe la ubicación
    console.log("\n========== CREAR ORDEN - INICIO ==========");
    console.log("[DEBUG] requiereFactura:", requiereFactura, "tipo:", typeof requiereFactura);
    console.log("[DEBUG] datosFacturacion:", datosFacturacion);
    console.log("[DEBUG] Ubicacion recibida:", ubicacion);
    console.log("==========================================\n");
    let clienteId = clienteIdFromBody;

    // Validar datos de facturación si el cliente requiere factura
    if (requiereFactura === true) {
      const camposObligatorios = [
        "tipoIdentificacion",
        "numeroIdentificacion",
        "razonSocial",
        "direccion",
        "telefono",
        "correo",
      ];
      const faltantes = camposObligatorios.filter((campo) => !datosFacturacion?.[campo]);
      if (faltantes.length > 0) {
        return res.status(400).json({
          error: "Faltan datos de facturación obligatorios",
          camposFaltantes: faltantes,
        });
      }
    }

    // Actualizar datos de facturación del usuario si llegan en la orden
    if (datosFacturacion && requiereFactura === true) {
      await User.findByIdAndUpdate(usuarioId, {
        $set: { datosFacturacion },
      });
    }

    // Validar que exista el cliente
    let cliente = clienteId ? await Client.findById(clienteId) : null;
    if (!cliente) {
      const usuarioDb = await User.findById(usuarioId);
      if (!usuarioDb) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }


      // Reutilizar cliente existente por email para evitar duplicados
      cliente = await Client.findOne({ email: usuarioDb.email });

      if (!cliente) {
        cliente = await Client.create({
          nombre: usuarioDb.nombre,
          email: usuarioDb.email,
          telefono: usuarioDb.telefono || "",
        });
      }

      clienteId = cliente._id;
    }

    // Validar y procesar productos
    let subtotal = 0;
    const productosData = [];

    for (const item of productos) {
      const producto = await Product.findById(item.productoId);
      if (!producto) {
        return res.status(404).json({ error: `Producto ${item.productoId} no encontrado` });
      }

      if (producto.stock < item.cantidad) {
        return res.status(400).json({
          error: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`,
        });
      }

      const itemSubtotal = producto.precio * item.cantidad;
      subtotal += itemSubtotal;

      productosData.push({
        producto: producto._id,
        nombre: producto.nombre,
        categoria: producto.categoria,
        precio: producto.precio,
        cantidad: item.cantidad,
        subtotal: itemSubtotal,
      });
    }

    // Calcular totales
    const descuentoManual = Number(descuento) || 0;
    let descuentoCupon = 0;
    let cuponAplicado = null;

    if (couponCode) {
      const resultadoCupon = await validarCupon({
        codigo: couponCode,
        subtotal,
        usuarioId,
      });

      if (!resultadoCupon.valido) {
        return res.status(400).json({ error: resultadoCupon.error });
      }

      descuentoCupon = resultadoCupon.descuento;
      cuponAplicado = resultadoCupon.cupon;
    }

    const descuentoAmount = Math.max(0, descuentoManual + descuentoCupon);
    // Los precios ya incluyen IVA; no aplicar impuesto adicional
    const impuestoAmount = impuesto ?? 0;
    const total = Math.max(0, subtotal - descuentoAmount + impuestoAmount);

    // Generar número de orden
    const count = await Order.countDocuments();
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    const numeroOrden = `ORD-${año}${mes}${dia}-${String(count + 1).padStart(5, "0")}`;

    // Crear la orden
    const nuevaOrden = new Order({
      numeroOrden,
      cliente: clienteId,
      usuario: usuarioId,
      productos: productosData,
      subtotal,
      descuento: descuentoAmount,
      impuesto: impuestoAmount,
      total,
      cupon: cuponAplicado
        ? {
            codigo: cuponAplicado.codigo,
            tipo: cuponAplicado.tipo,
            valor: cuponAplicado.valor,
            descuentoAplicado: descuentoCupon,
          }
        : undefined,
      metodoPago,
      ubicacion: ubicacion || {},
      datosFacturacion: datosFacturacion || undefined,
      notas,
      estado: "pendiente",
    });

    // Si es transferencia y hay comprobante, agregarlo
    if (metodoPago === "transferencia" && comprobante) {
      nuevaOrden.comprobante = {
        url: comprobante.base64,
        nombreArchivo: comprobante.nombre,
        cargadoEn: new Date(),
      };
    }

    await nuevaOrden.save();

    if (cuponAplicado) {
      await registrarUsoCupon({
        cuponId: cuponAplicado._id,
        usuarioId,
      });
    }
    
    // Debug: Verificar que se guardó correctamente
    console.log("[OK] Orden guardada con ubicacion:", nuevaOrden.ubicacion);

    // GENERAR FACTURA SOLO SI EL CLIENTE SOLICITÓ FACTURA
    if (requiereFactura === true) {
      try {
        console.log("\n========== GENERANDO FACTURA ==========");
        console.log("[INFO] Cliente proporciono datos de facturacion, generando factura...");
        
        const clienteData = await User.findById(usuarioId);
        console.log("[DEBUG] Usuario encontrado:", !!clienteData, "ID:", usuarioId);
        
        // Generar numeroFactura si no existe
        let numeroFactura = "";
        const countFacturas = await Invoice.countDocuments();
        const fecha = new Date();
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate()).padStart(2, "0");
        numeroFactura = `FAC-${año}${mes}${dia}-${String(countFacturas + 1).padStart(5, "0")}`;
        console.log("[DEBUG] Numero de factura generado:", numeroFactura);
        
        const factura = new Invoice({
          numeroFactura: numeroFactura,
          ordenId: nuevaOrden._id,
          clienteId: usuarioId,
          datosFiscales: {
            nombre: datosFacturacion.razonSocial,
            email: datosFacturacion.correo || clienteData?.email || "",
            telefono: datosFacturacion.telefono || clienteData?.telefono || "",
            nit: clienteData?.nit || "",
            dui: clienteData?.dui || "",
            direccionFiscal: clienteData?.direccionFiscal || "",
            tipoIdentificacion: datosFacturacion.tipoIdentificacion,
            numeroIdentificacion: datosFacturacion.numeroIdentificacion,
            razonSocial: datosFacturacion.razonSocial,
            direccion: datosFacturacion.direccion,
            correo: datosFacturacion.correo,
          },
          productos: productosData.map((p) => ({
            productoId: p.producto,
            nombre: p.nombre,
            cantidad: p.cantidad,
            precioUnitario: p.precio,
            subtotal: p.subtotal,
          })),
          subtotal: nuevaOrden.subtotal,
          descuento: nuevaOrden.descuento || 0,
          metodoPago: nuevaOrden.metodoPago,
          estado: "emitida",
        });

        factura.calcularTotal();
        console.log("[DEBUG] Factura antes de guardar:", {
          ordenId: factura.ordenId,
          clienteId: factura.clienteId,
          numeroFactura: factura.numeroFactura,
          total: factura.total,
          estado: factura.estado
        });
        
        await factura.save();
        console.log("[OK] Factura guardada:", factura._id, factura.numeroFactura);

        nuevaOrden.factura = {
          generada: true,
          numeroFactura: factura.numeroFactura,
          generadaEn: factura.fechaEmision || new Date(),
        };

        await nuevaOrden.save();

        console.log("[EXITO] Factura generada: " + factura.numeroFactura);
        console.log("==========================================\n");
      } catch (invoiceError) {
        console.error(
          "[ERROR CRITICO] Error al generar factura:",
          invoiceError.message,
          invoiceError.stack
        );
        // No fallar la creación de la orden si hay error en factura
      }
    } else {
      console.log("\n[INFO] No se genero factura - requiereFactura:", requiereFactura);
    }

    // Actualizar stock de productos
    for (const item of productos) {
      await Product.findByIdAndUpdate(
        item.productoId,
        { $inc: { stock: -item.cantidad } },
        { new: true }
      );
    }

    // Poblar referencias y retornar
    await nuevaOrden.populate("cliente");
    await nuevaOrden.populate("usuario");
    await nuevaOrden.populate("productos.producto");

    // Registrar en auditoría
    const productosDescripcion = productosData.map(p => `${p.nombre} (${p.cantidad})`).join(", ");
    await createAuditLog({
      usuario: usuarioId,
      usuarioNombre: req.user.nombre || "Sistema",
      accion: "CREAR_PEDIDO",
      descripcion: `Se creó el pedido ${nuevaOrden.numeroOrden} con productos: ${productosDescripcion}. Total: $${nuevaOrden.total}`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      entidad: { tipo: "orden", id: nuevaOrden._id.toString(), nombre: nuevaOrden.numeroOrden }
    });

    // Crear notificación para el usuario
    await crearNotificacion({
      tipo: "nueva_orden",
      titulo: "Pedido creado exitosamente",
      mensaje: `Tu pedido ${nuevaOrden.numeroOrden} ha sido creado. Total: $${nuevaOrden.total.toLocaleString()}`,
      usuario: usuarioId,
      orden: nuevaOrden._id,
      icono: "OK",
    });

    // Crear notificación para administradores
    await crearNotificacion({
      tipo: "nueva_orden",
      titulo: "Nueva orden recibida",
      mensaje: `Nuevo pedido ${nuevaOrden.numeroOrden} de ${cliente.nombre}. Total: $${nuevaOrden.total.toLocaleString()}`,
      paraAdmin: true,
      orden: nuevaOrden._id,
      icono: "OK",
    });

    console.log("\n[EXITO] ORDEN CREADA EXITOSAMENTE:", {
      numeroOrden: nuevaOrden.numeroOrden,
      usuarioId: usuarioId,
      requiereFactura: requiereFactura,
      datosFacturacion: !!datosFacturacion,
      total: nuevaOrden.total,
      facturaGenerada: !!nuevaOrden.factura?.generada
    });
    console.log("========== FIN CREAR ORDEN ==========\n");

    res.status(201).json({
      mensaje: "Orden creada exitosamente",
      orden: nuevaOrden,
    });
  } catch (error) {
    console.error("Error al crear orden:", error);
    res.status(500).json({ error: "Error al crear la orden" });
  }
};

// Obtener todas las órdenes (admin)
export const obtenerOrdenes = async (req, res) => {
  try {
    const { estado, clienteId } = req.query;

    let filtro = {};
    if (estado) filtro.estado = estado;
    if (clienteId) filtro.cliente = clienteId;

    const ordenes = await Order.find(filtro)
      .populate("cliente", "nombre email telefono")
      .populate("usuario", "nombre email")
      .populate("productos.producto", "nombre precio")
      .sort({ createdAt: -1 });

    res.json({
      total: ordenes.length,
      ordenes,
    });
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    res.status(500).json({ error: "Error al obtener órdenes" });
  }
};

// Obtener órdenes del cliente autenticado
export const obtenerMisOrdenes = async (req, res) => {
  try {
    const usuarioId = req.user._id;
    const { clienteId } = req.query;

    // Si es cliente, usar su clienteId
    // Si es admin, puede filtrar por clienteId específico
    let filtro = { usuario: usuarioId };
    if (clienteId) {
      filtro.cliente = clienteId;
    }

    const ordenes = await Order.find(filtro)
      .populate("cliente", "nombre email telefono")
      .populate("usuario", "nombre email")
      .populate("productos.producto", "nombre precio imagen")
      .sort({ createdAt: -1 });

    res.json({
      total: ordenes.length,
      ordenes,
    });
  } catch (error) {
    console.error("Error al obtener mis órdenes:", error);
    res.status(500).json({ error: "Error al obtener órdenes" });
  }
};

// Obtener orden por ID
export const obtenerOrden = async (req, res) => {
  try {
    const { ordenId } = req.params;

    const orden = await Order.findById(ordenId)
      .populate("cliente")
      .populate("usuario", "nombre email")
      .populate("productos.producto");

    if (!orden) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    res.json(orden);
  } catch (error) {
    console.error("Error al obtener orden:", error);
    res.status(500).json({ error: "Error al obtener la orden" });
  }
};

// Actualizar estado de orden (admin)
export const actualizarEstadoOrden = async (req, res) => {
  try {
    const { ordenId } = req.params;
    const { estado, fechaEntregaEstimada } = req.body;

    const estadosValidos = ["pendiente", "procesando", "completado", "cancelado"];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: "Estado de orden inválido" });
    }

    const actualizacion = { estado };

    if (estado === "completado") {
      actualizacion.fechaEntregaReal = new Date();

      // Generar factura automáticamente
      try {
        const orden = await Order.findById(ordenId)
          .populate("usuario")
          .populate("productos.producto");

        // Evitar duplicados
        const facturaExistente = await Invoice.findOne({ ordenId: orden._id });
        if (facturaExistente) {
          actualizacion.factura = {
            generada: true,
            numeroFactura: facturaExistente.numeroFactura,
            generadaEn: facturaExistente.fechaEmision || new Date(),
          };
        } else {
          // Obtener cliente
          const cliente = await User.findById(orden.usuario._id);

          const datosFacturacion = orden.datosFacturacion || cliente?.datosFacturacion || {};
          const razonSocial =
            datosFacturacion.razonSocial || cliente?.nombre || "";
          const correo = datosFacturacion.correo || cliente?.email || "";
          const telefono = datosFacturacion.telefono || cliente?.telefono || "";
          const direccion =
            datosFacturacion.direccion || cliente?.direccionFiscal || "";
          const tipoIdentificacion = datosFacturacion.tipoIdentificacion || "";
          const numeroIdentificacion =
            datosFacturacion.numeroIdentificacion || cliente?.nit || cliente?.dui || "";

          // Generar numeroFactura
          const countFacturas = await Invoice.countDocuments();
          const fecha = new Date();
          const año = fecha.getFullYear();
          const mes = String(fecha.getMonth() + 1).padStart(2, "0");
          const dia = String(fecha.getDate()).padStart(2, "0");
          const numeroFactura = `FAC-${año}${mes}${dia}-${String(countFacturas + 1).padStart(5, "0")}`;

          // Preparar datos de factura
          const factura = new Invoice({
            numeroFactura: numeroFactura,
            ordenId: orden._id,
            clienteId: orden.usuario._id,
            datosFiscales: {
              nombre: razonSocial,
              email: correo,
              telefono,
              nit: cliente?.nit || "",
              dui: cliente?.dui || "",
              direccionFiscal: cliente?.direccionFiscal || "",
              tipoIdentificacion,
              numeroIdentificacion,
              razonSocial,
              direccion,
              correo,
            },
            productos: orden.productos.map((p) => ({
              productoId: p.producto,
              nombre: p.nombre,
              cantidad: p.cantidad,
              precioUnitario: p.precio,
              subtotal: p.subtotal,
            })),
            subtotal: orden.subtotal,
            descuento: orden.descuento || 0,
            metodoPago: orden.metodoPago,
          });

          factura.calcularTotal();
          await factura.save();

          actualizacion.factura = {
            generada: true,
            numeroFactura: factura.numeroFactura,
            generadaEn: factura.fechaEmision || new Date(),
          };

          console.log(`✅ Factura generada automáticamente: ${factura.numeroFactura}`);
        }
      } catch (invoiceError) {
        console.error(
          "⚠️ Error al generar factura automáticamente:",
          invoiceError.message
        );
        // No fallar la actualización si hay error en factura
      }
    }

    if (estado === "cancelado") {
      // Revertir stock cuando se cancela
      const orden = await Order.findById(ordenId);
      for (const item of orden.productos) {
        await Product.findByIdAndUpdate(
          item.producto,
          { $inc: { stock: item.cantidad } },
          { new: true }
        );
      }
      actualizacion.canceladoEn = new Date();
    }

    if (fechaEntregaEstimada) {
      actualizacion.fechaEntregaEstimada = fechaEntregaEstimada;
    }

    const ordenActualizada = await Order.findByIdAndUpdate(ordenId, actualizacion, {
      new: true,
    })
      .populate("cliente")
      .populate("usuario", "nombre email")
      .populate("productos.producto");

    if (estado === "completado" && ordenActualizada?.puntosGanados === 0) {
      const puntosGanados = Math.max(0, Math.floor(ordenActualizada.total || 0));
      if (puntosGanados > 0) {
        await User.findByIdAndUpdate(ordenActualizada.usuario._id, {
          $inc: { puntos: puntosGanados, puntosAcumulados: puntosGanados },
        });
        ordenActualizada.puntosGanados = puntosGanados;
        await ordenActualizada.save();
      }
    }

    // Registrar en auditoría
    await createAuditLog({
      usuario: req.user._id,
      usuarioNombre: req.user.nombre || "Sistema",
      accion: "ACTUALIZAR_ESTADO_PEDIDO",
      descripcion: `Se actualizó el estado del pedido ${ordenActualizada.numeroOrden} a "${estado}"`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      entidad: { tipo: "orden", id: ordenActualizada._id.toString(), nombre: ordenActualizada.numeroOrden }
    });

    // Crear notificación para el usuario del pedido
    const estadoMensajes = {
      procesando: { texto: "está siendo procesado", icono: "⏳" },
      completado: { texto: "ha sido completado y está en camino", icono: "🎉" },
      cancelado: { texto: "ha sido cancelado", icono: "❌" },
      pendiente: { texto: "está pendiente de confirmación", icono: "⏱️" },
    };

    const estadoInfo = estadoMensajes[estado] || { texto: `cambió a ${estado}`, icono: "🔔" };
    
    await crearNotificacion({
      tipo: "cambio_estado",
      titulo: `Actualización de pedido ${ordenActualizada.numeroOrden}`,
      mensaje: `Tu pedido ${estadoInfo.texto}`,
      usuario: ordenActualizada.usuario._id,
      orden: ordenActualizada._id,
      icono: estadoInfo.icono,
    });

    res.json({
      mensaje: "Estado de orden actualizado",
      orden: ordenActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar orden:", error);
    res.status(500).json({ error: "Error al actualizar la orden" });
  }
};

// Cancelar orden
export const cancelarOrden = async (req, res) => {
  try {
    const { ordenId } = req.params;
    const { motivo } = req.body;

    const orden = await Order.findById(ordenId);
    if (!orden) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    if (orden.estado === "completado") {
      return res.status(400).json({ error: "No se puede cancelar una orden completada" });
    }

    if (orden.estado === "cancelado") {
      return res.status(400).json({ error: "La orden ya está cancelada" });
    }

    // Revertir stock
    for (const item of orden.productos) {
      await Product.findByIdAndUpdate(
        item.producto,
        { $inc: { stock: item.cantidad } },
        { new: true }
      );
    }

    const ordenCancelada = await Order.findByIdAndUpdate(
      ordenId,
      {
        estado: "cancelado",
        canceladoEn: new Date(),
        motivoCancelacion: motivo || "Cancelado por usuario",
      },
      { new: true }
    )
      .populate("cliente")
      .populate("usuario")
      .populate("productos.producto");

    // Registrar en auditoría
    await createAuditLog({
      usuario: req.user._id,
      usuarioNombre: req.user.nombre || "Sistema",
      accion: "CANCELAR_PEDIDO",
      descripcion: `Se canceló el pedido ${ordenCancelada.numeroOrden}. Motivo: ${motivo || "Sin especificar"}`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      entidad: { tipo: "orden", id: ordenCancelada._id.toString(), nombre: ordenCancelada.numeroOrden }
    });

    // Crear notificación de cancelación
    await crearNotificacion({
      tipo: "cancelacion",
      titulo: `Pedido ${ordenCancelada.numeroOrden} cancelado`,
      mensaje: `El pedido ha sido cancelado. ${motivo ? `Motivo: ${motivo}` : ""}`,
      usuario: ordenCancelada.usuario._id,
      orden: ordenCancelada._id,
      icono: "🚫",
    });

    // Notificar a administradores si fue cancelado por el usuario
    if (req.user._id.toString() === ordenCancelada.usuario._id.toString()) {
      await crearNotificacion({
        tipo: "cancelacion",
        titulo: `Pedido ${ordenCancelada.numeroOrden} cancelado por cliente`,
        mensaje: `El cliente canceló su pedido. ${motivo ? `Motivo: ${motivo}` : ""}`,
        paraAdmin: true,
        orden: ordenCancelada._id,
        icono: "⚠️",
      });
    }

    res.json({
      mensaje: "Orden cancelada exitosamente",
      orden: ordenCancelada,
    });
  } catch (error) {
    console.error("Error al cancelar orden:", error);
    res.status(500).json({ error: "Error al cancelar la orden" });
  }
};

// Obtener estadísticas de ventas
export const obtenerEstadisticas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    let filtro = {};
    if (fechaInicio || fechaFin) {
      filtro.createdAt = {};
      if (fechaInicio) filtro.createdAt.$gte = new Date(fechaInicio);
      if (fechaFin) filtro.createdAt.$lte = new Date(fechaFin);
    }

    // Órdenes totales
    const totalOrdenes = await Order.countDocuments(filtro);

    // Órdenes por estado
    const ordenesPorEstado = await Order.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: "$estado",
          cantidad: { $sum: 1 },
          total: { $sum: "$total" },
        },
      },
    ]);

    // Ingresos totales
    const ingresosTotales = await Order.aggregate([
      { $match: { ...filtro, estado: "completado" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);

    // Productos más vendidos
    const productosMasVendidos = await Order.aggregate([
      { $match: filtro },
      { $unwind: "$productos" },
      {
        $group: {
          _id: "$productos.nombre",
          cantidad: { $sum: "$productos.cantidad" },
          ingresos: { $sum: "$productos.subtotal" },
        },
      },
      { $sort: { cantidad: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      totalOrdenes,
      ordenesPorEstado,
      ingresosTotales: ingresosTotales[0]?.total || 0,
      productosMasVendidos,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
};

// Subir comprobante de transferencia
export const subirComprobanteTransferencia = async (req, res) => {
  try {
    const { ordenId } = req.params;
    const { comprobanteBase64, nombreArchivo } = req.body;

    if (!comprobanteBase64 || !nombreArchivo) {
      return res.status(400).json({ error: "Comprobante y nombre de archivo requeridos" });
    }

    const orden = await Order.findById(ordenId);
    if (!orden) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    // En producción, guardarías esto en S3 o similar
    // Por ahora, almacenaremos en base64 en la BD (no recomendado para producción)
    orden.comprobante = {
      url: comprobanteBase64,
      nombreArchivo: nombreArchivo,
      cargadoEn: new Date(),
    };

    await orden.save();

    // Crear notificación para admin
    await crearNotificacion({
      usuarioId: orden.usuario,
      tipo: "transferencia",
      titulo: "Nuevo comprobante de transferencia",
      mensaje: `Orden ${orden.numeroOrden} - Comprobante recibido, pendiente de confirmación`,
      ordenId: orden._id,
    });

    res.json({
      mensaje: "Comprobante cargado exitosamente",
      orden,
    });
  } catch (error) {
    console.error("Error al subir comprobante:", error);
    res.status(500).json({ error: "Error al subir comprobante" });
  }
};

// Confirmar transferencia (solo admin)
export const confirmarTransferencia = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "Solo administradores pueden confirmar transferencias" });
    }

    const { ordenId } = req.params;
    const { notas } = req.body;

    console.log("🔍 Confirmando transferencia para orden:", ordenId);

    const orden = await Order.findById(ordenId);
    if (!orden) {
      console.error("❌ Orden no encontrada:", ordenId);
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    if (!orden.comprobante || !orden.comprobante.url) {
      console.error("❌ La orden no tiene comprobante");
      return res.status(400).json({ error: "La orden no tiene comprobante de transferencia" });
    }

    console.log("✅ Orden encontrada, actualizando...");

    // Confirmar transferencia
    orden.confirmaacionTransferencia = {
      confirmado: true,
      confirmadoPor: req.user._id,
      confirmadoEn: new Date(),
      notas: notas || "",
    };

    orden.estadoPago = "confirmado";
    orden.estado = "procesando";

    console.log("📝 Datos a guardar:", {
      confirmaacionTransferencia: orden.confirmaacionTransferencia,
      estadoPago: orden.estadoPago,
      estado: orden.estado
    });

    await orden.save();

    console.log("✅ Orden guardada correctamente");
    console.log("🔍 Datos guardados en BD:", orden.confirmaacionTransferencia);

    // Responder inmediatamente (sin esperar notificaciones)
    res.json({
      mensaje: "Transferencia confirmada exitosamente",
      orden,
    });

    // Crear notificación para cliente (en background)
    try {
      await crearNotificacion({
        usuarioId: orden.usuario,
        tipo: "confirmacion",
        titulo: "Transferencia confirmada",
        mensaje: `Tu transferencia para la orden ${orden.numeroOrden} ha sido confirmada. Se está procesando tu pedido.`,
        ordenId: orden._id,
      });
    } catch (error) {
      console.error("⚠️ Error creando notificación:", error.message);
    }

    // Crear log de auditoría (en background)
    try {
      await createAuditLog({
        usuario: req.user._id,
        accion: "Confirmar transferencia",
        detalles: `Orden ${orden.numeroOrden}`,
        modelo: "Order",
        documentoId: orden._id,
      });
    } catch (error) {
      console.error("⚠️ Error creando audit log:", error.message);
    }
  } catch (error) {
    console.error("❌ Error al confirmar transferencia:", error);
    res.status(500).json({ error: "Error al confirmar transferencia", detalles: error.message });
  }
};

// Rechazar transferencia (solo admin)
export const rechazarTransferencia = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "Solo administradores pueden rechazar transferencias" });
    }

    const { ordenId } = req.params;
    const { notas } = req.body;

    console.log("🔍 Rechazando transferencia para orden:", ordenId);

    const orden = await Order.findById(ordenId);
    if (!orden) {
      console.error("❌ Orden no encontrada:", ordenId);
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    orden.estadoPago = "rechazado";
    orden.estado = "cancelado";
    orden.motivoCancelacion = notas || "Comprobante de transferencia rechazado";
    orden.canceladoEn = new Date();

    console.log("✅ Guardando cambios...");
    await orden.save();
    console.log("✅ Orden rechazada correctamente");

    // Responder inmediatamente (sin esperar notificaciones)
    res.json({
      mensaje: "Transferencia rechazada",
      orden,
    });

    // Crear notificación para cliente (en background)
    try {
      await crearNotificacion({
        usuarioId: orden.usuario,
        tipo: "rechazo",
        titulo: "Transferencia rechazada",
        mensaje: `Tu transferencia para la orden ${orden.numeroOrden} ha sido rechazada. ${notas || "Contacta al administrador para más detalles."}`,
        ordenId: orden._id,
      });
    } catch (error) {
      console.error("⚠️ Error creando notificación:", error.message);
    }

    // Crear log de auditoría (en background)
    try {
      await createAuditLog({
        usuario: req.user._id,
        accion: "Rechazar transferencia",
        detalles: `Orden ${orden.numeroOrden} - ${notas}`,
        modelo: "Order",
        documentoId: orden._id,
      });
    } catch (error) {
      console.error("⚠️ Error creando audit log:", error.message);
    }
  } catch (error) {
    console.error("Error al rechazar transferencia:", error);
    res.status(500).json({ error: "Error al rechazar transferencia" });
  }
};

// Actualizar ubicación (Google Maps)
export const actualizarUbicacion = async (req, res) => {
  try {
    const { ordenId } = req.params;
    const { latitud, longitud, direccion } = req.body;

    if (!latitud || !longitud) {
      return res.status(400).json({ error: "Latitud y longitud requeridas" });
    }

    const orden = await Order.findById(ordenId);
    if (!orden) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    orden.ubicacion = {
      latitud,
      longitud,
      direccion: direccion || "",
    };

    await orden.save();

    res.json({
      mensaje: "Ubicación actualizada exitosamente",
      ubicacion: orden.ubicacion,
    });
  } catch (error) {
    console.error("Error al actualizar ubicación:", error);
    res.status(500).json({ error: "Error al actualizar ubicación" });
  }
};

// Generar factura (solo admin)
export const generarFactura = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "Solo administradores pueden generar facturas" });
    }

    const { ordenId } = req.params;

    const orden = await Order.findById(ordenId)
      .populate("cliente")
      .populate("usuario")
      .populate("productos.producto");

    if (!orden) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    if (orden.estadoPago !== "confirmado") {
      return res.status(400).json({ error: "La orden debe tener pago confirmado para generar factura" });
    }

    // Generar número de factura
    const count = await Order.countDocuments({ "factura.generada": true });
    const numeroFactura = `FAC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(count + 1).padStart(5, "0")}`;

    // En producción, usar jsPDF o similar para generar PDF
    // Por ahora, solo registramos la generación
    orden.factura = {
      generada: true,
      numeroFactura: numeroFactura,
      urlPDF: `/facturas/${numeroFactura}.pdf`,
      generadaEn: new Date(),
    };

    await orden.save();

    // Crear notificación para cliente
    await crearNotificacion({
      usuarioId: orden.usuario,
      tipo: "factura",
      titulo: "Factura generada",
      mensaje: `Tu factura ${numeroFactura} ha sido generada. Puedes descargarla desde tu cuenta.`,
      ordenId: orden._id,
    });

    res.json({
      mensaje: "Factura generada exitosamente",
      factura: orden.factura,
    });
  } catch (error) {
    console.error("Error al generar factura:", error);
    res.status(500).json({ error: "Error al generar factura" });
  }
};

// Obtener órdenes pendientes de confirmación de transferencia (admin)
export const obtenerOrdenesTransferenciaPendiente = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "Solo administradores pueden ver esto" });
    }

    const ordenes = await Order.find({
      metodoPago: "transferencia",
      "comprobante.url": { $exists: true, $ne: null },
      $or: [
        { "confirmaacionTransferencia.confirmado": false },
        { "confirmaacionTransferencia.confirmado": { $exists: false } },
        { confirmaacionTransferencia: { $exists: false } }
      ]
    })
      .populate("cliente", "nombre email telefono")
      .populate("usuario", "nombre email")
      .populate("productos.producto", "nombre precio")
      .sort({ createdAt: -1 });

    // Debug: Log para verificar las ubicaciones que se devuelven
    console.log("📊 Órdenes pendientes encontradas:", ordenes.length);
    ordenes.forEach((orden, idx) => {
      console.log(`Orden ${idx + 1} - ubicacion:`, orden.ubicacion);
      console.log(`Orden ${idx + 1} - confirmacion:`, orden.confirmaacionTransferencia);
    });

    // Asegurar que la ubicación esté incluida en la respuesta
    res.json(ordenes);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    res.status(500).json({ error: "Error al obtener órdenes" });
  }
};

// DEBUG: Obtener todas las órdenes sin autenticación
export const debugObtenerTodasOrdenes = async (req, res) => {
  try {
    const ordenes = await Order.find()
      .populate("cliente", "nombre email")
      .populate("usuario", "nombre email")
      .sort({ createdAt: -1 })
      .limit(10);

    const ordenesSimplificadas = ordenes.map(orden => ({
      _id: orden._id,
      numeroOrden: orden.numeroOrden,
      usuarioId: orden.usuario?._id,
      usuarioNombre: orden.usuario?.nombre,
      clienteId: orden.cliente?._id,
      clienteNombre: orden.cliente?.nombre,
      total: orden.total,
      estado: orden.estado,
      metodoPago: orden.metodoPago,
      tieneDatosFacturacion: !!orden.datosFacturacion,
      tieneFactura: !!orden.factura?.generada,
      numeroFactura: orden.factura?.numeroFactura || "No generada",
      createdAt: orden.createdAt,
    }));

    res.json({
      totalOrdenesEnBD: await Order.countDocuments(),
      ultimasOrdenes: ordenesSimplificadas,
      nota: "Verifica si las órdenes tienen factura generada",
    });
  } catch (error) {
    console.error("Error en debug órdenes:", error);
    res.status(500).json({ error: error.message });
  }
};


