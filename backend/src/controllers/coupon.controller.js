import Coupon from "../models/Coupon.js";

const normalizarCodigo = (codigo = "") => codigo.trim().toUpperCase();

export const validarCupon = async ({ codigo, subtotal, usuarioId }) => {
  const codigoNormalizado = normalizarCodigo(codigo);
  if (!codigoNormalizado) {
    return { valido: false, error: "Código de cupón inválido" };
  }

  const cupon = await Coupon.findOne({ codigo: codigoNormalizado, activo: true });
  if (!cupon) return { valido: false, error: "Cupón no encontrado" };

  const ahora = new Date();
  if (cupon.fechaInicio && ahora < cupon.fechaInicio) {
    return { valido: false, error: "Cupón aún no está vigente" };
  }
  if (cupon.fechaFin && ahora > cupon.fechaFin) {
    return { valido: false, error: "Cupón expirado" };
  }
  if (cupon.limiteUsos > 0 && cupon.usosRealizados >= cupon.limiteUsos) {
    return { valido: false, error: "Cupón agotado" };
  }
  if (cupon.compraMinima > 0 && subtotal < cupon.compraMinima) {
    return {
      valido: false,
      error: `Compra mínima requerida: $${cupon.compraMinima}`,
    };
  }

  if (usuarioId && cupon.limitePorUsuario > 0) {
    const registro = cupon.usoPorUsuario.find(
      (u) => u.usuario.toString() === usuarioId.toString()
    );
    if (registro && registro.usos >= cupon.limitePorUsuario) {
      return { valido: false, error: "Límite de uso por usuario alcanzado" };
    }
  }

  let descuento = 0;
  if (cupon.tipo === "porcentaje") {
    descuento = (subtotal * cupon.valor) / 100;
    if (cupon.descuentoMaximo > 0) {
      descuento = Math.min(descuento, cupon.descuentoMaximo);
    }
  } else {
    descuento = cupon.valor;
  }

  descuento = Math.min(descuento, subtotal);

  return {
    valido: true,
    cupon,
    descuento,
  };
};

export const crearCupon = async (req, res) => {
  try {
    const {
      codigo,
      tipo,
      valor,
      compraMinima = 0,
      descuentoMaximo = 0,
      fechaInicio,
      fechaFin,
      limiteUsos = 0,
      limitePorUsuario = 0,
      activo = true,
    } = req.body;

    if (!codigo || !tipo || valor == null) {
      return res
        .status(400)
        .json({ message: "Código, tipo y valor son obligatorios" });
    }

    const cupon = await Coupon.create({
      codigo: normalizarCodigo(codigo),
      tipo,
      valor,
      compraMinima,
      descuentoMaximo,
      fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin) : undefined,
      limiteUsos,
      limitePorUsuario,
      activo,
      creadoPor: req.user?._id,
    });

    res.status(201).json(cupon);
  } catch (error) {
    console.error("Error al crear cupón:", error);
    res.status(500).json({ message: "Error al crear cupón" });
  }
};

export const listarCupones = async (_req, res) => {
  try {
    const cupones = await Coupon.find().sort({ createdAt: -1 });
    res.json(cupones);
  } catch (error) {
    console.error("Error al listar cupones:", error);
    res.status(500).json({ message: "Error al listar cupones" });
  }
};

export const validarCuponEndpoint = async (req, res) => {
  try {
    const { codigo, subtotal = 0 } = req.body;
    const resultado = await validarCupon({
      codigo,
      subtotal: Number(subtotal) || 0,
      usuarioId: req.user?._id,
    });

    if (!resultado.valido) {
      return res.status(400).json({ message: resultado.error });
    }

    res.json({
      codigo: resultado.cupon.codigo,
      tipo: resultado.cupon.tipo,
      valor: resultado.cupon.valor,
      descuento: resultado.descuento,
    });
  } catch (error) {
    console.error("Error al validar cupón:", error);
    res.status(500).json({ message: "Error al validar cupón" });
  }
};

export const actualizarEstadoCupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    const cupon = await Coupon.findByIdAndUpdate(
      id,
      { activo: Boolean(activo) },
      { new: true }
    );

    if (!cupon) {
      return res.status(404).json({ message: "Cupón no encontrado" });
    }

    res.json(cupon);
  } catch (error) {
    console.error("Error al actualizar cupón:", error);
    res.status(500).json({ message: "Error al actualizar cupón" });
  }
};

export const registrarUsoCupon = async ({ cuponId, usuarioId }) => {
  if (!cuponId) return;

  await Coupon.findByIdAndUpdate(cuponId, { $inc: { usosRealizados: 1 } });

  if (!usuarioId) return;

  const cupon = await Coupon.findById(cuponId).select("usoPorUsuario");
  if (!cupon) return;

  const existe = cupon.usoPorUsuario.some(
    (u) => u.usuario.toString() === usuarioId.toString()
  );

  if (!existe) {
    await Coupon.findByIdAndUpdate(cuponId, {
      $push: { usoPorUsuario: { usuario: usuarioId, usos: 1 } },
    });
  } else {
    await Coupon.findOneAndUpdate(
      { _id: cuponId, "usoPorUsuario.usuario": usuarioId },
      { $inc: { "usoPorUsuario.$.usos": 1 } }
    );
  }
};
