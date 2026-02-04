// src/controllers/auth.controller.js
import User from "../models/Users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createAuditLog } from "./audit.controller.js";
import Order from "../models/Order.js";
import Invoice from "../models/Invoice.js";
import Product from "../models/Product.js";
import Client from "../models/Client.js";
import { generarXMLFactura } from "../utils/xmlGenerator.js";

export const register = async (req, res) => {
  try {
    const { nombre, email, password, telefono, fecha_nacimiento } = req.body;

    // Validaciones
    if (!nombre || !email || !password || !fecha_nacimiento) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Validar edad mínima 18 años
    const birthDate = new Date(fecha_nacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      return res.status(400).json({ message: "Debes ser mayor de 18 años para registrarte" });
    }

    const userExist = await User.findOne({ email });
    if (userExist)
      return res.status(400).json({ message: "El usuario ya existe" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      nombre,
      email,
      password: hash,
      telefono: telefono || "",
      fecha_nacimiento: birthDate,
    });

    const token = jwt.sign(
      { id: user._id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Crear orden y factura automáticamente para nuevos usuarios
    try {
      // Obtener productos disponibles
      const productos = await Product.find({ activo: true }).limit(2);
      console.log(`📦 Se encontraron ${productos.length} productos para crear orden de bienvenida`);
      
      if (productos.length > 0) {
        // Crear cliente asociado
        let cliente = await Client.findOne({ email: user.email });
        if (!cliente) {
          cliente = await Client.create({
            nombre: user.nombre,
            email: user.email,
            telefono: user.telefono || "",
            direccion: user.direccionFiscal || "",
            notas: "Cliente de bienvenida automático",
          });
          console.log(`👤 Cliente creado: ${cliente._id}`);
        }

        // Calcular subtotal con los productos disponibles
        let subtotalOrden = 0;
        const productosOrden = productos.map((p) => {
          const subtotal = p.precio * 2;
          subtotalOrden += subtotal;
          return {
            producto: p._id,
            nombre: p.nombre,
            cantidad: 2,
            precio: p.precio,
            subtotal: subtotal,
          };
        });

        // Crear orden completada
        const numeroOrden = `ORD-BIENVENIDA-${Date.now()}`;
        const orden = await Order.create({
          numeroOrden,
          cliente: cliente._id,
          usuario: user._id,
          productos: productosOrden,
          subtotal: subtotalOrden,
          descuento: 0,
          total: subtotalOrden,
          metodoPago: "cortesia",
          estado: "completado",
          fechaEmision: new Date(),
          fechaEntregaReal: new Date(),
        });
        console.log(`📋 Orden creada: ${orden._id}`);

        // Crear factura automáticamente
        const fecha = new Date();
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, "0");
        const day = String(fecha.getDate()).padStart(2, "0");
        const fechaStr = `${year}${month}${day}`;
        const numeroSecuencia = String(Math.floor(Math.random() * 99999)).padStart(5, "0");

        const datosFacturacion = user?.datosFacturacion || {};
        const razonSocial = datosFacturacion.razonSocial || user.nombre;
        const correo = datosFacturacion.correo || user.email;
        const telefonoFact = datosFacturacion.telefono || user.telefono || "";
        const direccion = datosFacturacion.direccion || user.direccionFiscal || "";
        const tipoIdentificacion = datosFacturacion.tipoIdentificacion || "";
        const numeroIdentificacion =
          datosFacturacion.numeroIdentificacion || user.nit || user.dui || "";

        const factura = new Invoice({
          numeroFactura: `INV-${fechaStr}-${numeroSecuencia}`,
          ordenId: orden._id,
          clienteId: user._id,
          datosFiscales: {
            nombre: razonSocial,
            email: correo,
            telefono: telefonoFact,
            nit: user.nit || "",
            dui: user.dui || "",
            direccionFiscal: user.direccionFiscal || "",
            tipoIdentificacion,
            numeroIdentificacion,
            razonSocial,
            direccion,
            correo,
          },
          productos: productosOrden.map((p) => ({
            productoId: p.producto,
            nombre: p.nombre,
            cantidad: p.cantidad,
            precioUnitario: p.precio,
            subtotal: p.subtotal,
          })),
          subtotal: orden.subtotal,
          descuento: 0,
          metodoPago: "cortesia",
          estado: "emitida",
        });

        factura.calcularTotal();
        await factura.save();

        const xmlContenido = generarXMLFactura(factura);
        factura.xmlContenido = xmlContenido;
        factura.xmlNombreArchivo = `Factura-${factura.numeroFactura}.xml`;
        factura.xmlGeneradoEn = new Date();
        await factura.save();
        console.log(`✅ Factura creada: ${factura.numeroFactura}`);

        // Actualizar orden con referencia a factura
        await Order.findByIdAndUpdate(orden._id, {
          factura: {
            generada: true,
            numeroFactura: factura.numeroFactura,
            generadaEn: factura.fechaEmision,
          },
        });

        console.log(`✅ Factura de bienvenida creada para ${user.nombre}: ${factura.numeroFactura}`);
      } else {
        console.log("⚠️ No hay productos disponibles para crear orden de bienvenida");
      }
    } catch (invoiceError) {
      console.error("⚠️ Error al crear factura de bienvenida:", invoiceError);
      console.error("Stack:", invoiceError.stack);
      // No fallar el registro si hay error en la factura
    }

    // Registrar en auditoría
    await createAuditLog({
      usuario: user._id,
      usuarioNombre: user.nombre,
      accion: "REGISTRO",
      descripcion: `Usuario ${user.nombre} se registró en el sistema`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      entidad: { tipo: "usuario", id: user._id.toString(), nombre: user.nombre }
    });

    res.status(201).json({ 
      message: "Usuario registrado correctamente",
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        fecha_nacimiento: user.fecha_nacimiento,
        rol: user.rol,
        datosFacturacion: user.datosFacturacion || {},
        puntos: user.puntos || 0,
        puntosAcumulados: user.puntosAcumulados || 0
      }
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    // Errores comunes: clave duplicada (email), validaciones, JWT secret faltante
    if (error?.code === 11000 || error?.name === "MongoServerError") {
      return res.status(400).json({ message: "El usuario ya existe" });
    }
    if (error?.name === "ValidationError") {
      return res.status(400).json({ message: "Datos inválidos de usuario" });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Configuración del servidor incompleta (JWT_SECRET)" });
    }
    res.status(500).json({ message: "Error al registrar usuario" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Credenciales incorrectas" });

    const token = jwt.sign(
      { id: user._id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Registrar en auditoría
    await createAuditLog({
      usuario: user._id,
      usuarioNombre: user.nombre,
      accion: "LOGIN",
      descripcion: `Usuario ${user.nombre} inició sesión`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      entidad: { tipo: "usuario", id: user._id.toString(), nombre: user.nombre }
    });

    res.json({ 
      token, 
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        fecha_nacimiento: user.fecha_nacimiento,
        rol: user.rol,
        datosFacturacion: user.datosFacturacion || {},
        puntos: user.puntos || 0,
        puntosAcumulados: user.puntosAcumulados || 0
      }
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};
