import User from "../models/Users.js";
import bcrypt from "bcryptjs";

// Solo para admin: obtener usuarios que son clientes
export const getClients = async (_req, res) => {
  try {
    const clients = await User.find({ rol: "cliente" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ message: "Error al obtener clientes" });
  }
};

// Actualizar perfil de usuario (por admin o el mismo usuario)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono, fecha_nacimiento, password, datosFacturacion } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Solo permitir que admin o el mismo usuario modifique
    if (req.user.rol !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    if (nombre) user.nombre = nombre;
    if (email) user.email = email;
    if (telefono !== undefined) user.telefono = telefono;
    if (fecha_nacimiento) user.fecha_nacimiento = new Date(fecha_nacimiento);
    if (datosFacturacion) user.datosFacturacion = datosFacturacion;
    
    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono,
      fecha_nacimiento: user.fecha_nacimiento,
      rol: user.rol,
      datosFacturacion: user.datosFacturacion || {},
      puntos: user.puntos || 0,
      puntosAcumulados: user.puntosAcumulados || 0,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
};

// Solo admin: eliminar usuario cliente
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};
