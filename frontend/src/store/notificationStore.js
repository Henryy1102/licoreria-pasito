import { create } from "zustand";
import { notificationService } from "../services/notificationService";

export const useNotificationStore = create((set, get) => ({
  // Estado
  notificaciones: [],
  noLeidas: 0,
  cargando: false,
  error: null,

  // Acciones
  obtenerNotificaciones: async (limite = 20, soloNoLeidas = false) => {
    set({ cargando: true, error: null });
    try {
      const resultado = await notificationService.obtenerNotificaciones(limite, soloNoLeidas);
      set({ 
        notificaciones: resultado.notificaciones, 
        noLeidas: resultado.noLeidas,
        cargando: false 
      });
      return resultado;
    } catch (error) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  marcarComoLeida: async (notificacionId) => {
    try {
      await notificationService.marcarComoLeida(notificacionId);
      const notificaciones = get().notificaciones.map((n) =>
        n._id === notificacionId ? { ...n, leida: true } : n
      );
      const noLeidas = notificaciones.filter(n => !n.leida).length;
      set({ notificaciones, noLeidas });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  marcarTodasLeidas: async () => {
    try {
      await notificationService.marcarTodasLeidas();
      const notificaciones = get().notificaciones.map((n) => ({ ...n, leida: true }));
      set({ notificaciones, noLeidas: 0 });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  eliminarNotificacion: async (notificacionId) => {
    try {
      await notificationService.eliminarNotificacion(notificacionId);
      const notificaciones = get().notificaciones.filter((n) => n._id !== notificacionId);
      const noLeidas = notificaciones.filter(n => !n.leida).length;
      set({ notificaciones, noLeidas });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  limpiarError: () => set({ error: null }),
}));
