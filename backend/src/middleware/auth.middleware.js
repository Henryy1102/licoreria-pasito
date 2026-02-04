import jwt from "jsonwebtoken";
import User from "../models/Users.js";

export const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No autorizado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let userPayload = { ...decoded, _id: decoded.id };
    try {
      const usuario = await User.findById(decoded.id).select("rol nombre email");
      if (usuario) {
        userPayload = {
          ...userPayload,
          rol: (usuario.rol || "").toLowerCase(),
          nombre: usuario.nombre,
          email: usuario.email,
        };
      }
    } catch {
      // Si falla la consulta, usamos los datos del token
    }

    if (userPayload?.rol) {
      userPayload.rol = String(userPayload.rol).toLowerCase();
    }

    req.user = userPayload;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido" });
  }
};

export const authOptional = async (req, _res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let userPayload = { ...decoded, _id: decoded.id };
    try {
      const usuario = await User.findById(decoded.id).select("rol nombre email");
      if (usuario) {
        userPayload = {
          ...userPayload,
          rol: (usuario.rol || "").toLowerCase(),
          nombre: usuario.nombre,
          email: usuario.email,
        };
      }
    } catch {
      // Ignorar errores y continuar sin usuario completo
    }

    if (userPayload?.rol) {
      userPayload.rol = String(userPayload.rol).toLowerCase();
    }

    req.user = userPayload;
  } catch {
    // Token inválido: continuar sin usuario
  }

  next();
};

export const protect = auth; // Alias para compatibilidad

export const adminOnly = (req, res, next) => {
  const rol = (req.user?.rol || "").toLowerCase();
  if (rol !== "admin") {
    return res.status(403).json({ message: "Acceso solo para admin" });
  }
  next();
};

export const isAdmin = adminOnly; // Alias para compatibilidad
