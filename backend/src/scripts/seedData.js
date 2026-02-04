import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Users from "../models/Users.js";
import Invoice from "../models/Invoice.js";
import Client from "../models/Client.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado");

    // Limpiar solo órdenes e invoices (mantener productos y usuarios)
    await Order.deleteMany({});
    await Invoice.deleteMany({});
    console.log("🗑️ Órdenes e invoices limpias");

    // Obtener todos los usuarios de tipo cliente
    const usuarios = await Users.find({ rol: "cliente" });
    console.log(`📊 Se encontraron ${usuarios.length} usuarios cliente`);

    // Crear productos de prueba si no existen
    let productos = await Product.find({ activo: true });
    if (productos.length === 0) {
      productos = await Product.create([
        {
          nombre: "Ron Añejo Premium",
          descripcion: "Ron añejo de 12 años",
          categoria: "Ron",
          precio: 35.99,
          stock: 50,
          imagen: "https://images.unsplash.com/photo-1556742250-330f63602e9a?w=400&h=400&fit=crop",
          activo: true,
        },
        {
          nombre: "Vodka Clásica",
          descripcion: "Vodka Premium Clásica",
          categoria: "Vodka",
          precio: 28.50,
          stock: 30,
          imagen: "https://images.unsplash.com/photo-1608270861620-7d9d0cec75a3?w=400&h=400&fit=crop",
          activo: true,
        },
        {
          nombre: "Cerveza Artesanal",
          descripcion: "Cerveza artesanal local",
          categoria: "Cerveza",
          precio: 4.99,
          stock: 200,
          imagen: "https://images.unsplash.com/photo-1608270861620-7d9d0cec75a3?w=400&h=400&fit=crop",
          activo: true,
        },
        {
          nombre: "Whisky Escocés",
          descripcion: "Whisky escocés de exportación",
          categoria: "Whisky",
          precio: 45.00,
          stock: 25,
          imagen: "https://images.unsplash.com/photo-1556742250-330f63602e9a?w=400&h=400&fit=crop",
          activo: true,
        },
      ]);
      console.log("✅ Productos creados");
    } else {
      console.log(`📦 ${productos.length} productos ya existen`);
    }

    // Crear órdenes y facturas para CADA usuario
    let contadorFacturas = 0;
    for (const usuario of usuarios) {
      // Crear o obtener cliente
      let cliente = await Client.findOne({ email: usuario.email });
      if (!cliente) {
        cliente = await Client.create({
          nombre: usuario.nombre,
          email: usuario.email,
          telefono: usuario.telefono,
          direccion: usuario.direccionFiscal,
          notas: "Cliente automático",
        });
      }

      // Crear una orden de prueba para este usuario
      const numeroOrden = `ORD-${usuario._id.toString().slice(-6)}-${Date.now()}`;
      const subtotalOrden = productos[0].precio * 2 + productos[2].precio * 6;
      
      const orden = await Order.create({
        numeroOrden,
        cliente: cliente._id,
        usuario: usuario._id,
        productos: [
          {
            producto: productos[0]._id,
            nombre: productos[0].nombre,
            cantidad: 2,
            precio: productos[0].precio,
            subtotal: productos[0].precio * 2,
          },
          {
            producto: productos[2]._id,
            nombre: productos[2].nombre,
            cantidad: 6,
            precio: productos[2].precio,
            subtotal: productos[2].precio * 6,
          },
        ],
        subtotal: subtotalOrden,
        descuento: 0,
        total: subtotalOrden,
        metodoPago: "tarjeta",
        estado: "completado",
        fechaEmision: new Date(),
        fechaEntregaReal: new Date(),
      });

      // Crear factura automáticamente
      const fecha = new Date();
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, "0");
      const day = String(fecha.getDate()).padStart(2, "0");
      const fechaStr = `${year}${month}${day}`;
      const numeroSecuencia = String(contadorFacturas + 1).padStart(5, "0");
      
      const factura = new Invoice({
        numeroFactura: `INV-${fechaStr}-${numeroSecuencia}`,
        ordenId: orden._id,
        clienteId: usuario._id,
        datosFiscales: {
          nombre: usuario.nombre,
          email: usuario.email,
          telefono: usuario.telefono,
          nit: usuario.nit,
          dui: usuario.dui,
          direccionFiscal: usuario.direccionFiscal,
        },
        productos: orden.productos.map((p) => ({
          productoId: p.producto,
          nombre: p.nombre,
          cantidad: p.cantidad,
          precioUnitario: p.precio,
          subtotal: p.subtotal,
        })),
        subtotal: orden.subtotal,
        descuento: orden.descuento,
        metodoPago: orden.metodoPago,
        estado: "emitida",
      });

      try {
        factura.calcularTotal();
        await factura.save();
        contadorFacturas++;
        console.log(`✅ [${usuario.nombre}] Factura creada: ${factura.numeroFactura}`);
      } catch (err) {
        console.error(`❌ Error al crear factura para ${usuario.nombre}:`, err.message);
      }

      // Actualizar orden con referencia a factura
      await Order.findByIdAndUpdate(orden._id, {
        factura: {
          generada: true,
          numeroFactura: factura.numeroFactura,
          generadaEn: factura.fechaEmision,
        },
      });
    }

    console.log(`\n🎉 ¡Datos de prueba creados exitosamente!`);
    console.log(`📊 ${contadorFacturas} facturas generadas para ${usuarios.length} usuarios`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

seedData();
