const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = `${API_BASE}/api/settings`;

export const settingsService = {
  async getSettings() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Error al obtener configuración");
      return await response.json();
    } catch (error) {
      console.error("Error en getSettings:", error);
      throw error;
    }
  },

  async updateSettings(settings) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Error al actualizar configuración");
      return await response.json();
    } catch (error) {
      console.error("Error en updateSettings:", error);
      throw error;
    }
  },
};
