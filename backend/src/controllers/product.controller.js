import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { createAuditLog } from "./audit.controller.js";

export const createProduct = async (req, res) => {
  try {
    const { nombre, descripcion, categoria, precio, stock, imagen } = req.body;

    if (!nombre || precio == null || stock == null) {
      return res.status(400).json({ message: "Nombre, precio y stock son obligatorios" });
    }

    const product = await Product.create({
      nombre,
      descripcion,
      categoria,
      precio,
      stock,
      imagen,
    });

    // Registrar en auditoría
    await createAuditLog({
      usuario: req.user._id,
      usuarioNombre: req.user.nombre || "Sistema",
      accion: "CREAR_PRODUCTO",
      descripcion: `Se creó el producto "${nombre}" con precio $${precio}`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      entidad: { tipo: "producto", id: product._id.toString(), nombre: product.nombre }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ message: "Error al crear producto" });
  }
};

export const getProducts = async (_req, res) => {
  try {
    const products = await Product.find({ activo: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Producto no encontrado" });
    
    // Registrar en auditoría
    await createAuditLog({
      usuario: req.user._id,
      usuarioNombre: req.user.nombre || "Sistema",
      accion: "ACTUALIZAR_PRODUCTO",
      descripcion: `Se actualizó el producto "${updated.nombre}"`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      entidad: { tipo: "producto", id: updated._id.toString(), nombre: updated.nombre }
    });
    
    res.json(updated);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ message: "Error al actualizar producto" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndUpdate(id, { activo: false }, { new: true });
    if (!deleted) return res.status(404).json({ message: "Producto no encontrado" });
    
    // Registrar en auditoría
    await createAuditLog({
      usuario: req.user._id,
      usuarioNombre: req.user.nombre || "Sistema",
      accion: "ELIMINAR_PRODUCTO",
      descripcion: `Se eliminó el producto "${deleted.nombre}"`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      entidad: { tipo: "producto", id: deleted._id.toString(), nombre: deleted.nombre }
    });
    
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ message: "Error al eliminar producto" });
  }
};

export const obtenerRecomendaciones = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 6;
    const userId = req.user?._id;
    let categorias = [];

    if (userId) {
      const ultimaOrden = await Order.findOne({ usuario: userId, estado: "completado" })
        .sort({ createdAt: -1 })
        .populate("productos.producto", "categoria");

      if (ultimaOrden) {
        categorias = Array.from(
          new Set(
            ultimaOrden.productos
              .map((p) => p.producto?.categoria)
              .filter(Boolean)
          )
        );
      }
    }

    const filtro = { activo: true };
    if (categorias.length > 0) {
      filtro.categoria = { $in: categorias };
    }

    const recomendados = await Product.find(filtro)
      .sort({ ratingPromedio: -1, createdAt: -1 })
      .limit(limit);

    if (recomendados.length < limit) {
      const faltantes = await Product.find({
        activo: true,
        _id: { $nin: recomendados.map((p) => p._id) },
      })
        .sort({ createdAt: -1 })
        .limit(limit - recomendados.length);

      return res.json([...recomendados, ...faltantes]);
    }

    res.json(recomendados);
  } catch (error) {
    console.error("Error al obtener recomendaciones:", error);
    res.status(500).json({ message: "Error al obtener recomendaciones" });
  }
};
