import { create } from "zustand";
import clientService from "../services/clientService";

export const useClientStore = create((set, get) => ({
  clients: [],
  cliente: null,
  loading: false,
  error: null,

  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const data = await clientService.getAll();
      set({ clients: data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || "Error al obtener clientes", loading: false });
    }
  },

  obtenerCliente: async (clienteId) => {
    set({ loading: true, error: null });
    try {
      const cliente = await clientService.getById(clienteId);
      set({ cliente, loading: false });
      return cliente;
    } catch (error) {
      set({ error: error.response?.data?.message || "Error al obtener cliente", loading: false });
      throw error;
    }
  },

  createClient: async (payload) => {
    set({ loading: true, error: null });
    try {
      const client = await clientService.create(payload);
      set({ clients: [client, ...get().clients], loading: false });
      return client;
    } catch (error) {
      set({ error: error.response?.data?.message || "Error al crear cliente", loading: false });
      throw error;
    }
  },

  updateClient: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const client = await clientService.update(id, payload);
      set({
        clients: get().clients.map((c) => (c._id === id ? client : c)),
        loading: false,
      });
      return client;
    } catch (error) {
      set({ error: error.response?.data?.message || "Error al actualizar cliente", loading: false });
      throw error;
    }
  },

  removeClient: async (id) => {
    set({ loading: true, error: null });
    try {
      await clientService.remove(id);
      set({ clients: get().clients.filter((c) => c._id !== id), loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || "Error al eliminar cliente", loading: false });
      throw error;
    }
  },

  limpiarCliente: () => set({ cliente: null }),
}));
