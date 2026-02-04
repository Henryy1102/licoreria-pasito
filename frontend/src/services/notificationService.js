const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const notificationService = {
  // Obtener notificaciones
  async obtenerNotificaciones(limite = 20, soloNoLeidas = false) {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({ 
      limite: limite.toString(),
      soloNoLeidas: soloNoLeidas.toString()
    });

    const response = await fetch(`${API_URL}/api/notifications?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener notificaciones");
    }

    return response.json();
  },

  // Marcar como leída
  async marcarComoLeida(notificacionId) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/notifications/${notificacionId}/leer`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al marcar como leída");
    }

    return response.json();
  },

  // Marcar todas como leídas
  async marcarTodasLeidas() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/notifications/leer-todas`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al marcar todas como leídas");
    }

    return response.json();
  },

  // Eliminar notificación
  async eliminarNotificacion(notificacionId) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/notifications/${notificacionId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al eliminar notificación");
    }

    return response.json();
  },
};
