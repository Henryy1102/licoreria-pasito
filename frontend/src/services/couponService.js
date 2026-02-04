const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const couponService = {
  async validarCupon(codigo, subtotal) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/coupons/validar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ codigo, subtotal }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Cupón inválido");
    }

    return response.json();
  },
  async listarCupones() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/coupons`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error("Error al obtener cupones");
    }
    return response.json();
  },
  async crearCupon(payload) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/coupons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al crear cupón");
    }
    return response.json();
  },
  async actualizarEstado(id, activo) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/coupons/${id}/estado`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ activo }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al actualizar cupón");
    }
    return response.json();
  },
};
