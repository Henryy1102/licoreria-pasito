import PushSubscription from "../models/PushSubscription.js";

export const obtenerVapidPublicKey = (_req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(500).json({ message: "VAPID public key no configurada" });
  }
  res.json({ publicKey });
};

export const suscribirPush = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription?.endpoint) {
      return res.status(400).json({ message: "Suscripción inválida" });
    }

    const existente = await PushSubscription.findOne({
      endpoint: subscription.endpoint,
    });

    if (existente) {
      existente.usuario = req.user._id;
      existente.subscription = subscription;
      await existente.save();
      return res.json({ message: "Suscripción actualizada" });
    }

    await PushSubscription.create({
      usuario: req.user._id,
      endpoint: subscription.endpoint,
      subscription,
    });

    res.status(201).json({ message: "Suscripción creada" });
  } catch (error) {
    console.error("Error al suscribir push:", error);
    res.status(500).json({ message: "Error al suscribir push" });
  }
};

export const desuscribirPush = async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ message: "Endpoint requerido" });
    }

    await PushSubscription.deleteOne({ endpoint, usuario: req.user._id });
    res.json({ message: "Suscripción eliminada" });
  } catch (error) {
    console.error("Error al desuscribir push:", error);
    res.status(500).json({ message: "Error al desuscribir push" });
  }
};
