import User from "../models/Users.js";
import Coupon from "../models/Coupon.js";

const POINT_TO_CURRENCY = 0.01; // 100 puntos = $1
const MIN_POINTS_REDEEM = 100;
const COUPON_EXP_DAYS = 30;

const generarCodigoCupon = () => {
  const fecha = new Date();
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PTS-${yyyy}${mm}${dd}-${rand}`;
};

export const obtenerPuntos = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "puntos puntosAcumulados"
    );
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({
      puntos: user.puntos,
      puntosAcumulados: user.puntosAcumulados,
    });
  } catch (error) {
    console.error("Error al obtener puntos:", error);
    res.status(500).json({ message: "Error al obtener puntos" });
  }
};

export const redimirPuntos = async (req, res) => {
  try {
    const { puntos } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const puntosSolicitados = puntos ? Number(puntos) : user.puntos;
    if (!puntosSolicitados || puntosSolicitados < MIN_POINTS_REDEEM) {
      return res.status(400).json({
        message: `Mínimo ${MIN_POINTS_REDEEM} puntos para redimir`,
      });
    }

    if (puntosSolicitados > user.puntos) {
      return res
        .status(400)
        .json({ message: "Puntos insuficientes" });
    }

    const valorDescuento = Number((puntosSolicitados * POINT_TO_CURRENCY).toFixed(2));
    if (valorDescuento <= 0) {
      return res.status(400).json({ message: "Valor de cupón inválido" });
    }

    const codigo = generarCodigoCupon();
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + COUPON_EXP_DAYS);

    const cupon = await Coupon.create({
      codigo,
      tipo: "monto",
      valor: valorDescuento,
      compraMinima: 0,
      descuentoMaximo: 0,
      fechaInicio: new Date(),
      fechaFin,
      limiteUsos: 1,
      limitePorUsuario: 1,
      activo: true,
      creadoPor: req.user._id,
    });

    user.puntos -= puntosSolicitados;
    await user.save();

    res.json({
      message: "Cupón generado correctamente",
      cupon: {
        codigo: cupon.codigo,
        valor: cupon.valor,
        fechaFin: cupon.fechaFin,
      },
      puntosRestantes: user.puntos,
    });
  } catch (error) {
    console.error("Error al redimir puntos:", error);
    res.status(500).json({ message: "Error al redimir puntos" });
  }
};
