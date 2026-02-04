import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const recalcularRating = async (productoId) => {
  const stats = await Review.aggregate([
    { $match: { producto: productoId } },
    {
      $group: {
        _id: "$producto",
        promedio: { $avg: "$calificacion" },
        cantidad: { $sum: 1 },
      },
    },
  ]);

  const promedio = stats[0]?.promedio || 0;
  const cantidad = stats[0]?.cantidad || 0;

  await Product.findByIdAndUpdate(productoId, {
    ratingPromedio: Number(promedio.toFixed(2)),
    ratingCantidad: cantidad,
  });
};

export const obtenerResenasProducto = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limite = 20 } = req.query;

    const resenas = await Review.find({ producto: productId })
      .populate("usuario", "nombre")
      .sort({ createdAt: -1 })
      .limit(Number(limite));

    res.json(resenas);
  } catch (error) {
    console.error("Error al obtener reseñas:", error);
    res.status(500).json({ message: "Error al obtener reseñas" });
  }
};

export const crearResena = async (req, res) => {
  try {
    const { productId } = req.params;
    const { calificacion, comentario } = req.body;
    const usuarioId = req.user._id;

    if (!calificacion || calificacion < 1 || calificacion > 5) {
      return res.status(400).json({ message: "Calificación inválida" });
    }

    const producto = await Product.findById(productId);
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const ordenCompletada = await Order.findOne({
      usuario: usuarioId,
      estado: "completado",
      "productos.producto": productId,
    });

    if (!ordenCompletada) {
      return res.status(403).json({
        message: "Solo puedes reseñar productos que hayas comprado",
      });
    }

    const resena = await Review.create({
      producto: productId,
      usuario: usuarioId,
      calificacion,
      comentario,
    });

    await recalcularRating(resena.producto);

    res.status(201).json(resena);
  } catch (error) {
    console.error("Error al crear reseña:", error);
    if (error?.code === 11000) {
      return res
        .status(400)
        .json({ message: "Ya has reseñado este producto" });
    }
    res.status(500).json({ message: "Error al crear reseña" });
  }
};

export const actualizarResena = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { calificacion, comentario } = req.body;
    const usuarioId = req.user._id;
    const esAdmin = req.user.rol === "admin";

    const resena = await Review.findById(reviewId);
    if (!resena) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    if (!esAdmin && resena.usuario.toString() !== usuarioId.toString()) {
      return res.status(403).json({ message: "No autorizado" });
    }

    if (calificacion) {
      resena.calificacion = calificacion;
    }
    if (comentario !== undefined) {
      resena.comentario = comentario;
    }

    await resena.save();
    await recalcularRating(resena.producto);

    res.json(resena);
  } catch (error) {
    console.error("Error al actualizar reseña:", error);
    res.status(500).json({ message: "Error al actualizar reseña" });
  }
};

export const eliminarResena = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const usuarioId = req.user._id;
    const esAdmin = req.user.rol === "admin";

    const resena = await Review.findById(reviewId);
    if (!resena) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    if (!esAdmin && resena.usuario.toString() !== usuarioId.toString()) {
      return res.status(403).json({ message: "No autorizado" });
    }

    await Review.findByIdAndDelete(reviewId);
    await recalcularRating(resena.producto);

    res.json({ message: "Reseña eliminada" });
  } catch (error) {
    console.error("Error al eliminar reseña:", error);
    res.status(500).json({ message: "Error al eliminar reseña" });
  }
};
