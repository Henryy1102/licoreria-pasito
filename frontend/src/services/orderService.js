const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const orderService = {
  // Crear nueva orden
  async crearOrden(ordenData) {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("No estás autenticado. Por favor inicia sesión nuevamente.");
    }

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ordenData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Error desconocido" }));
        
        // Si es error de autenticación, limpiar token y notificar
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          throw new Error("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
        }
        
        throw new Error(error.error || error.message || "Error al crear la orden");
      }

      return response.json();
    } catch (error) {
      // Re-lanzar errores de red u otros
      throw error;
    }
  },

  // Obtener mis órdenes
  async obtenerMisOrdenes() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/orders/mis-ordenes/historial`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener las órdenes");
    }

    return response.json();
  },

  // Obtener todas las órdenes (admin)
  async obtenerOrdenes(filtros = {}) {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams(filtros);

    const response = await fetch(`${API_URL}/api/orders?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener las órdenes");
    }

    return response.json();
  },

  // Obtener orden por ID
  async obtenerOrden(ordenId) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/orders/${ordenId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener la orden");
    }

    return response.json();
  },

  // Actualizar estado de orden
  async actualizarEstado(ordenId, estado, fechaEntregaEstimada = null) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/orders/${ordenId}/estado`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        estado,
        fechaEntregaEstimada,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al actualizar el estado");
    }

    return response.json();
  },

  // Cancelar orden
  async cancelarOrden(ordenId, motivo = "") {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/orders/${ordenId}/cancelar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ motivo }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al cancelar la orden");
    }

    return response.json();
  },

  // Obtener estadísticas de ventas
  async obtenerEstadisticas(fechaInicio = null, fechaFin = null) {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    if (fechaInicio) params.append("fechaInicio", fechaInicio);
    if (fechaFin) params.append("fechaFin", fechaFin);

    const response = await fetch(`${API_URL}/api/orders/estadisticas/ventas?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener estadísticas");
    }

    return response.json();
  },
};
