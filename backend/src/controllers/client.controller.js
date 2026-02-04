import Client from "../models/Client.js";

export const createClient = async (req, res) => {
  try {
    const { nombre, email, telefono, direccion, notas } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ message: "Nombre y email son obligatorios" });
    }

    const exists = await Client.findOne({ email });
    if (exists) return res.status(400).json({ message: "El cliente ya existe" });

    const client = await Client.create({ nombre, email, telefono, direccion, notas });
    res.status(201).json(client);
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({ message: "Error al crear cliente" });
  }
};

export const getClients = async (_req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ message: "Error al obtener clientes" });
  }
};

export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Client.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json(updated);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({ message: "Error al actualizar cliente" });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Client.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json({ message: "Cliente eliminado" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({ message: "Error al eliminar cliente" });
  }
};
