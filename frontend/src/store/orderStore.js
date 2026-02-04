import { create } from "zustand";
import { orderService } from "../services/orderService";

export const useOrderStore = create((set, get) => ({
  // Estado
  ordenes: [],
  ordenActual: null,
  estadisticas: null,
  cargando: false,
  error: null,

  // Acciones
  crearOrden: async (ordenData) => {
    set({ cargando: true, error: null });
    try {
      const resultado = await orderService.crearOrden(ordenData);
      set({ ordenActual: resultado.orden, cargando: false });
      return resultado;
    } catch (error) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  obtenerMisOrdenes: async () => {
    set({ cargando: true, error: null });
    try {
      const resultado = await orderService.obtenerMisOrdenes();
      set({ ordenes: resultado.ordenes, cargando: false });
      return resultado;
    } catch (error) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  obtenerOrdenes: async (filtros = {}) => {
    set({ cargando: true, error: null });
    try {
      const resultado = await orderService.obtenerOrdenes(filtros);
      set({ ordenes: resultado.ordenes, cargando: false });
      return resultado;
    } catch (error) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  obtenerOrden: async (ordenId) => {
    set({ cargando: true, error: null });
    try {
      const orden = await orderService.obtenerOrden(ordenId);
      set({ ordenActual: orden, cargando: false });
      return orden;
    } catch (error) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  actualizarEstado: async (ordenId, estado, fechaEntregaEstimada = null) => {
    set({ cargando: true, error: null });
    try {
      const resultado = await orderService.actualizarEstado(
        ordenId,
        estado,
        fechaEntregaEstimada
      );
      // Actualizar orden actual si es la misma
      if (get().ordenActual?._id === ordenId) {
        set({ ordenActual: resultado.orden });
      }
      // Actualizar en lista de órdenes
      const ordenes = get().ordenes.map((o) =>
        o._id === ordenId ? resultado.orden : o
      );
      set({ ordenes, cargando: false });
      return resultado;
    } catch (error) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  cancelarOrden: async (ordenId, motivo = "") => {
    set({ cargando: true, error: null });
    try {
      const resultado = await orderService.cancelarOrden(ordenId, motivo);
      // Actualizar orden actual si es la misma
      if (get().ordenActual?._id === ordenId) {
        set({ ordenActual: resultado.orden });
      }
      // Actualizar en lista de órdenes
      const ordenes = get().ordenes.map((o) =>
        o._id === ordenId ? resultado.orden : o
      );
      set({ ordenes, cargando: false });
      return resultado;
    } catch (error) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  obtenerEstadisticas: async (fechaInicio = null, fechaFin = null) => {
    set({ cargando: true, error: null });
    try {
      const resultado = await orderService.obtenerEstadisticas(
        fechaInicio,
        fechaFin
      );
      set({ estadisticas: resultado, cargando: false });
      return resultado;
    } catch (error) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  limpiarError: () => set({ error: null }),
  limpiarOrdenActual: () => set({ ordenActual: null }),
}));
