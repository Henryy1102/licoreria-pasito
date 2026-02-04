const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const reviewService = {
  async obtenerResenas(productId, limite = 20) {
    const response = await fetch(
      `${API_URL}/api/reviews/product/${productId}?limite=${limite}`
    );
    if (!response.ok) {
      throw new Error("Error al obtener reseñas");
    }
    return response.json();
  },

  async crearResena(productId, payload) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/reviews/product/${productId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al crear reseña");
    }
    return response.json();
  },

  async actualizarResena(reviewId, payload) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al actualizar reseña");
    }
    return response.json();
  },

  async eliminarResena(reviewId) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al eliminar reseña");
    }
    return response.json();
  },
};
