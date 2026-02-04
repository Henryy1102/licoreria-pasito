import { create } from "zustand";
import { paymentService } from "../services/paymentService";

export const usePaymentStore = create((set, get) => ({
  // Estado
  settings: null,
  resumenPagos: null,
  cargando: false,
  error: null,

  // Acciones
  obtenerSettings: async () => {
    set({ cargando: true, error: null });
    try {
      const resultado = await paymentService.obtenerSettings();
      set({ settings: resultado, cargando: false });
      return resultado;
    } catch (error) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  confirmarPago: async (ordenId, notas = "") => {
    set({ cargando: true, error: null });
    try {
      const resultado = await paymentService.confirmarPago(ordenId, notas);
      set({ cargando: false });
      return resultado;
    } catch (error) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  rechazarPago: async (ordenId, motivo = "") => {
    set({ cargando: true, error: null });
    try {
      const resultado = await paymentService.rechazarPago(ordenId, motivo);
      set({ cargando: false });
      return resultado;
    } catch (error) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  obtenerResumenPagos: async (fechaInicio = null, fechaFin = null) => {
    set({ cargando: true, error: null });
    try {
      const resultado = await paymentService.obtenerResumenPagos(fechaInicio, fechaFin);
      set({ resumenPagos: resultado, cargando: false });
      return resultado;
    } catch (error) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  limpiarError: () => set({ error: null }),
}));
