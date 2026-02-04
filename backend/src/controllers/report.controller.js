import Order from "../models/Order.js";
import Client from "../models/Client.js";
import Product from "../models/Product.js";
import User from "../models/Users.js";
import Invoice from "../models/Invoice.js";

// Obtener reportes de ventas completos
export const obtenerReportesVentas = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "Solo administradores pueden ver reportes" });
    }

    const { fechaInicio, fechaFin } = req.query;

    // Construir filtro de fechas
    const filtro = {};
    if (fechaInicio || fechaFin) {
      filtro.createdAt = {};
      if (fechaInicio) {
        filtro.createdAt.$gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        const fecha = new Date(fechaFin);
        fecha.setHours(23, 59, 59, 999);
        filtro.createdAt.$lte = fecha;
      }
    }

    // 1. RESUMEN GENERAL
    const ordenes = await Order.find(filtro)
      .populate("cliente", "nombre email")
      .populate("usuario", "nombre")
      .populate("productos.producto", "nombre precio");

    const totalOrdenes = ordenes.length;
    const totalVentas = ordenes.reduce((sum, o) => sum + (o.total || 0), 0);
    const ordenesPendientes = ordenes.filter(o => o.estado === "pendiente").length;
    const ordenesCompletadas = ordenes.filter(o => o.estado === "completado").length;
    const pagosConfirmados = ordenes.filter(o => o.estadoPago === "confirmado").length;

    // 2. TOP 5 CLIENTES (QUIÉN COMPRA MÁS)
    const clienteCompras = {};
    ordenes.forEach(orden => {
      const clienteNombre = orden.cliente?.nombre || "Cliente desconocido";
      const clienteEmail = orden.cliente?.email || "";
      if (!clienteCompras[clienteEmail]) {
        clienteCompras[clienteEmail] = {
          nombre: clienteNombre,
          email: clienteEmail,
          cantidad: 0,
          total: 0,
          ordenes: 0
        };
      }
      clienteCompras[clienteEmail].cantidad += ordenes.reduce((sum, o) => sum + (o.productos?.length || 0), 0);
      clienteCompras[clienteEmail].total += orden.total || 0;
      clienteCompras[clienteEmail].ordenes += 1;
    });

    const topClientes = Object.values(clienteCompras)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // 3. TOP 5 PRODUCTOS (MÁS VENDIDOS)
    const productoVentas = {};
    ordenes.forEach(orden => {
      orden.productos?.forEach(prod => {
        const prodNombre = prod.nombre;
        if (!productoVentas[prodNombre]) {
          productoVentas[prodNombre] = {
            nombre: prodNombre,
            cantidad: 0,
            ingresos: 0
          };
        }
        productoVentas[prodNombre].cantidad += prod.cantidad || 0;
        productoVentas[prodNombre].ingresos += (prod.subtotal || prod.cantidad * prod.precio);
      });
    });

    const topProductos = Object.values(productoVentas)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    // 4. GANANCIAS POR MES
    const gananciasPorMes = {};
    ordenes.forEach(orden => {
      const fecha = new Date(orden.createdAt);
      const mesAño = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
      if (!gananciasPorMes[mesAño]) {
        gananciasPorMes[mesAño] = {
          mes: mesAño,
          total: 0,
          ordenes: 0
        };
      }
      gananciasPorMes[mesAño].total += orden.total || 0;
      gananciasPorMes[mesAño].ordenes += 1;
    });

    const gananciasOrdenadas = Object.values(gananciasPorMes)
      .sort((a, b) => a.mes.localeCompare(b.mes));

    // 5. GANANCIAS POR DÍA (últimos 30 días)
    const gananciasPorDia = {};
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    ordenes.filter(o => o.createdAt >= hace30Dias).forEach(orden => {
      const fecha = orden.createdAt.toISOString().split("T")[0];
      if (!gananciasPorDia[fecha]) {
        gananciasPorDia[fecha] = {
          fecha,
          total: 0,
          ordenes: 0
        };
      }
      gananciasPorDia[fecha].total += orden.total || 0;
      gananciasPorDia[fecha].ordenes += 1;
    });

    const gananciasporDiaOrdenadas = Object.values(gananciasPorDia)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    // 6. MÉTODOS DE PAGO
    const metodosPago = {};
    ordenes.forEach(orden => {
      const metodo = orden.metodoPago || "sin especificar";
      if (!metodosPago[metodo]) {
        metodosPago[metodo] = {
          metodo,
          cantidad: 0,
          total: 0
        };
      }
      metodosPago[metodo].cantidad += 1;
      metodosPago[metodo].total += orden.total || 0;
    });

    // 7. RESUMEN DE ESTADOS
    const estadoOrdenes = {};
    ["pendiente", "procesando", "completado", "cancelado"].forEach(estado => {
      const count = ordenes.filter(o => o.estado === estado).length;
      estadoOrdenes[estado] = count;
    });

    console.log("📊 Reportes generados correctamente");

    res.json({
      resumen: {
        totalOrdenes,
        totalVentas: parseFloat(totalVentas.toFixed(2)),
        ordenesPendientes,
        ordenesCompletadas,
        pagosConfirmados,
        promedioPorOrden: totalOrdenes > 0 ? parseFloat((totalVentas / totalOrdenes).toFixed(2)) : 0
      },
      topClientes,
      topProductos,
      gananciasPorMes: gananciasOrdenadas,
      gananciasPorDia: gananciasporDiaOrdenadas,
      metodosPago: Object.values(metodosPago),
      estadoOrdenes,
      periodo: {
        desde: fechaInicio || "Sin filtro",
        hasta: fechaFin || "Sin filtro"
      }
    });
  } catch (error) {
    console.error("Error al generar reportes:", error);
    res.status(500).json({ error: "Error al generar reportes", detalles: error.message });
  }
};

// Obtener reporte de cliente específico
export const obtenerReporteCliente = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "Solo administradores pueden ver reportes" });
    }

    const { clienteId } = req.params;

    const ordenes = await Order.find({ cliente: clienteId })
      .populate("cliente", "nombre email telefono")
      .populate("productos.producto", "nombre precio");

    const totalOrdenes = ordenes.length;
    const totalGastado = ordenes.reduce((sum, o) => sum + (o.total || 0), 0);
    const promedio = totalOrdenes > 0 ? totalGastado / totalOrdenes : 0;

    const productosMasComprados = {};
    ordenes.forEach(orden => {
      orden.productos?.forEach(prod => {
        const prodNombre = prod.nombre;
        if (!productosMasComprados[prodNombre]) {
          productosMasComprados[prodNombre] = {
            nombre: prodNombre,
            cantidad: 0
          };
        }
        productosMasComprados[prodNombre].cantidad += prod.cantidad || 0;
      });
    });

    const topProductos = Object.values(productosMasComprados)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    res.json({
      cliente: ordenes[0]?.cliente,
      estadisticas: {
        totalOrdenes,
        totalGastado: parseFloat(totalGastado.toFixed(2)),
        promedioPorOrden: parseFloat(promedio.toFixed(2)),
        ultimaCompra: ordenes[ordenes.length - 1]?.createdAt
      },
      topProductos,
      ordenes: ordenes.slice(0, 10) // Últimas 10 órdenes
    });
  } catch (error) {
    console.error("Error al generar reporte del cliente:", error);
    res.status(500).json({ error: "Error al generar reporte" });
  }
};

// Análisis de inventario
export const analisisInventario = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "Solo administradores pueden ver reportes" });
    }

    const productos = await Product.find();

    const stockBajo = productos.filter(p => p.stock < 10);
    const sinStock = productos.filter(p => p.stock === 0);
    const stockAlto = productos.filter(p => p.stock >= 50);

    const valorInventario = productos.reduce((sum, p) => sum + (p.precio * p.stock), 0);

    const productosPorCategoria = {};
    productos.forEach(p => {
      if (!productosPorCategoria[p.categoria]) {
        productosPorCategoria[p.categoria] = {
          categoria: p.categoria,
          cantidad: 0,
          valorTotal: 0,
          stockTotal: 0
        };
      }
      productosPorCategoria[p.categoria].cantidad += 1;
      productosPorCategoria[p.categoria].valorTotal += p.precio * p.stock;
      productosPorCategoria[p.categoria].stockTotal += p.stock;
    });

    res.json({
      resumen: {
        totalProductos: productos.length,
        valorInventario: parseFloat(valorInventario.toFixed(2)),
        stockBajo: stockBajo.length,
        sinStock: sinStock.length
      },
      alertas: {
        stockBajo: stockBajo.map(p => ({ nombre: p.nombre, stock: p.stock })),
        sinStock: sinStock.map(p => ({ nombre: p.nombre }))
      },
      porCategoria: Object.values(productosPorCategoria),
      stockAlto: stockAlto.map(p => ({ nombre: p.nombre, stock: p.stock }))
    });
  } catch (error) {
    console.error("Error al analizar inventario:", error);
    res.status(500).json({ error: "Error al analizar inventario" });
  }
};

// Clientes frecuentes (mejores clientes)
export const clientesFrecuentes = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "Solo administradores pueden ver reportes" });
    }

    const { fechaInicio, fechaFin, limite = 10 } = req.query;

    const filtro = {};
    if (fechaInicio || fechaFin) {
      filtro.createdAt = {};
      if (fechaInicio) filtro.createdAt.$gte = new Date(fechaInicio);
      if (fechaFin) {
        const fecha = new Date(fechaFin);
        fecha.setHours(23, 59, 59, 999);
        filtro.createdAt.$lte = fecha;
      }
    }

    const ordenes = await Order.find(filtro).populate("usuario", "nombre email telefono");

    const clienteStats = {};
    ordenes.forEach(orden => {
      const clienteId = orden.usuario?._id?.toString();
      if (!clienteId) return;

      if (!clienteStats[clienteId]) {
        clienteStats[clienteId] = {
          cliente: {
            id: clienteId,
            nombre: orden.usuario.nombre,
            email: orden.usuario.email,
            telefono: orden.usuario.telefono
          },
          totalOrdenes: 0,
          totalGastado: 0,
          ultimaCompra: null,
          primeraCompra: null
        };
      }

      clienteStats[clienteId].totalOrdenes += 1;
      clienteStats[clienteId].totalGastado += orden.total || 0;

      const fechaOrden = new Date(orden.createdAt);
      if (!clienteStats[clienteId].ultimaCompra || fechaOrden > clienteStats[clienteId].ultimaCompra) {
        clienteStats[clienteId].ultimaCompra = fechaOrden;
      }
      if (!clienteStats[clienteId].primeraCompra || fechaOrden < clienteStats[clienteId].primeraCompra) {
        clienteStats[clienteId].primeraCompra = fechaOrden;
      }
    });

    const topClientes = Object.values(clienteStats)
      .sort((a, b) => b.totalGastado - a.totalGastado)
      .slice(0, parseInt(limite))
      .map(c => ({
        ...c,
        promedioOrden: c.totalOrdenes > 0 ? c.totalGastado / c.totalOrdenes : 0
      }));

    res.json({
      topClientes,
      totalClientes: Object.keys(clienteStats).length
    });
  } catch (error) {
    console.error("Error al obtener clientes frecuentes:", error);
    res.status(500).json({ error: "Error al obtener clientes frecuentes" });
  }
};

// Tendencias de ventas (por día de la semana, por hora)
export const tendenciasVentas = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "Solo administradores pueden ver reportes" });
    }

    const ordenes = await Order.find({ estado: "completado" });

    // Ventas por día de la semana
    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const ventasPorDia = Array(7).fill(0).map((_, i) => ({ dia: diasSemana[i], total: 0, ordenes: 0 }));

    ordenes.forEach(orden => {
      const dia = new Date(orden.createdAt).getDay();
      ventasPorDia[dia].total += orden.total || 0;
      ventasPorDia[dia].ordenes += 1;
    });

    // Ventas por hora del día
    const ventasPorHora = Array(24).fill(0).map((_, i) => ({ hora: i, total: 0, ordenes: 0 }));

    ordenes.forEach(orden => {
      const hora = new Date(orden.createdAt).getHours();
      ventasPorHora[hora].total += orden.total || 0;
      ventasPorHora[hora].ordenes += 1;
    });

    // Categorías más vendidas
    const categorias = {};
    ordenes.forEach(orden => {
      orden.productos?.forEach(prod => {
        const cat = prod.categoria || "Sin categoría";
        if (!categorias[cat]) {
          categorias[cat] = { categoria: cat, cantidad: 0, ingresos: 0 };
        }
        categorias[cat].cantidad += prod.cantidad || 0;
        categorias[cat].ingresos += prod.subtotal || 0;
      });
    });

    res.json({
      ventasPorDiaSemana: ventasPorDia,
      ventasPorHora,
      categoriasMasVendidas: Object.values(categorias).sort((a, b) => b.ingresos - a.ingresos)
    });
  } catch (error) {
    console.error("Error al obtener tendencias:", error);
    res.status(500).json({ error: "Error al obtener tendencias" });
  }
};
