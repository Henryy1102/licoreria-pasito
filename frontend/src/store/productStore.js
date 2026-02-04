import { create } from "zustand";
import productService from "../services/productService";

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const data = await productService.getAll();
      set({ products: data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || "Error al obtener productos", loading: false });
    }
  },

  createProduct: async (payload) => {
    set({ loading: true, error: null });
    try {
      const product = await productService.create(payload);
      set({ products: [product, ...get().products], loading: false });
      return product;
    } catch (error) {
      set({ error: error.response?.data?.message || "Error al crear producto", loading: false });
      throw error;
    }
  },

  updateProduct: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const product = await productService.update(id, payload);
      set({
        products: get().products.map((p) => (p._id === id ? product : p)),
        loading: false,
      });
      return product;
    } catch (error) {
      set({ error: error.response?.data?.message || "Error al actualizar producto", loading: false });
      throw error;
    }
  },

  removeProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await productService.remove(id);
      set({ products: get().products.filter((p) => p._id !== id), loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || "Error al eliminar producto", loading: false });
      throw error;
    }
  },
}));
