import { create } from "zustand";

const loadCart = () => {
  try {
    const data = localStorage.getItem("cart");
    return data ? JSON.parse(data) : [];
  } catch (_) {
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem("cart", JSON.stringify(items));
};

export const useCartStore = create((set, get) => ({
  carrito: loadCart(),
  items: loadCart(), // Para compatibilidad

  addToCart: (product, quantity = 1) => {
    const existing = get().carrito.find((i) => i._id === product._id);
    let updated;
    if (existing) {
      updated = get().carrito.map((i) =>
        i._id === product._id
          ? { ...i, cantidad: i.cantidad + quantity }
          : i
      );
    } else {
      updated = [...get().carrito, { ...product, cantidad: quantity }];
    }
    saveCart(updated);
    set({ carrito: updated, items: updated });
  },

  removeFromCart: (productId) => {
    const updated = get().carrito.filter((i) => i._id !== productId);
    saveCart(updated);
    set({ carrito: updated, items: updated });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) return;
    const updated = get().carrito.map((i) =>
      i._id === productId ? { ...i, cantidad: quantity } : i
    );
    saveCart(updated);
    set({ carrito: updated, items: updated });
  },

  clearCart: () => {
    saveCart([]);
    set({ carrito: [], items: [] });
  },

  limpiarCarrito: () => {
    saveCart([]);
    set({ carrito: [], items: [] });
  },

  total: () => {
    return get().carrito.reduce(
      (acc, item) => acc + item.precio * item.cantidad,
      0
    );
  },
}));
