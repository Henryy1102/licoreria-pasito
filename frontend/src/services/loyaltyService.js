const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const loyaltyService = {
  async obtenerPuntos() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/loyalty/points`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error("Error al obtener puntos");
    }
    return response.json();
  },

  async redimirPuntos(puntos) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/loyalty/redeem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ puntos }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al redimir puntos");
    }
    return response.json();
  },
};
