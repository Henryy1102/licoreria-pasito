import { create } from "zustand";
import * as invoiceService from "../services/invoiceService";

export const useInvoiceStore = create((set, get) => ({
  facturas: [],
  facturaActual: null,
  estadisticas: null,
  cargando: false,
  error: null,

  // Crear factura
  crearFactura: async (ordenId, datosFiscales = null, notas = "") => {
    set({ cargando: true, error: null });
    try {
      const factura = await invoiceService.crearFactura(ordenId, datosFiscales, notas);
      set((state) => ({
        facturas: [factura.factura, ...state.facturas],
        facturaActual: factura.factura,
        cargando: false,
      }));
      return factura.factura;
    } catch (error) {
      set({ 
        error: error.response?.data?.mensaje || "Error al crear factura",
        cargando: false 
      });
      throw error;
    }
  },

  // Obtener todas las facturas (admin)
  obtenerFacturas: async (filtros = {}) => {
    set({ cargando: true, error: null });
    try {
      const facturas = await invoiceService.obtenerFacturas(filtros);
      set({ facturas, cargando: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.mensaje || error.response?.data?.message || error.response?.data?.error || error.message || "Error al obtener facturas",
        cargando: false 
      });
    }
  },

  // Obtener mis facturas (cliente)
  obtenerMisFacturas: async () => {
    set({ cargando: true, error: null });
    try {
      const data = await invoiceService.obtenerMisFacturas();
      console.log("📄 Facturas obtenidas:", data);
      const facturas = Array.isArray(data) ? data : data.facturas || [];
      set({ facturas, cargando: false });
    } catch (error) {
      console.error("❌ Error al obtener facturas:", error);
      set({ 
        error: error.response?.data?.mensaje || error.response?.data?.message || error.response?.data?.error || error.message || "Error al obtener facturas",
        cargando: false 
      });
    }
  },

  // Obtener factura por ID
  obtenerFacturaPorId: async (id) => {
    set({ cargando: true, error: null });
    try {
      const factura = await invoiceService.obtenerFacturaPorId(id);
      set({ facturaActual: factura, cargando: false });
      return factura;
    } catch (error) {
      set({ 
        error: error.response?.data?.mensaje || "Error al obtener factura",
        cargando: false 
      });
      throw error;
    }
  },

  // Obtener factura por orden
  obtenerFacturaPorOrden: async (ordenId) => {
    set({ cargando: true, error: null });
    try {
      const factura = await invoiceService.obtenerFacturaPorOrden(ordenId);
      set({ facturaActual: factura, cargando: false });
      return factura;
    } catch (error) {
      set({ 
        error: error.response?.data?.mensaje || "No hay factura para esta orden",
        cargando: false 
      });
      return null;
    }
  },

  // Marcar como pagada
  marcarComoPagada: async (id) => {
    set({ cargando: true, error: null });
    try {
      const { factura } = await invoiceService.marcarComoPagada(id);
      set((state) => ({
        facturas: state.facturas.map((f) => (f._id === id ? factura : f)),
        facturaActual: factura,
        cargando: false,
      }));
    } catch (error) {
      set({ 
        error: error.response?.data?.mensaje || "Error al marcar factura como pagada",
        cargando: false 
      });
      throw error;
    }
  },

  // Anular factura
  anularFactura: async (id, motivo) => {
    set({ cargando: true, error: null });
    try {
      const { factura } = await invoiceService.anularFactura(id, motivo);
      set((state) => ({
        facturas: state.facturas.map((f) => (f._id === id ? factura : f)),
        facturaActual: factura,
        cargando: false,
      }));
    } catch (error) {
      set({ 
        error: error.response?.data?.mensaje || "Error al anular factura",
        cargando: false 
      });
      throw error;
    }
  },

  // Obtener estadísticas
  obtenerEstadisticas: async (filtros = {}) => {
    set({ cargando: true, error: null });
    try {
      const estadisticas = await invoiceService.obtenerEstadisticas(filtros);
      set({ estadisticas, cargando: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.mensaje || "Error al obtener estadísticas",
        cargando: false 
      });
    }
  },

  // Descargar PDF
  descargarPDF: async (id, numeroFactura) => {
    try {
      await invoiceService.descargarPDFFactura(id, numeroFactura);
    } catch (error) {
      set({ error: "Error al descargar PDF" });
      throw error;
    }
  },
  // Limpiar error
  limpiarError: () => set({ error: null }),
}));
