const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const paymentService = {
  // Obtener configuración de pagos
  async obtenerSettings() {
    const response = await fetch(`${API_URL}/api/payments/settings`);
    if (!response.ok) {
      throw new Error("Error al obtener configuración");
    }
    return response.json();
  },

  // Confirmar pago (admin)
  async confirmarPago(ordenId, notas = "") {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/payments/${ordenId}/confirmar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ notas }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al confirmar pago");
    }

    return response.json();
  },

  // Rechazar pago (admin)
  async rechazarPago(ordenId, motivo = "") {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/payments/${ordenId}/rechazar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ motivo }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al rechazar pago");
    }

    return response.json();
  },

  // Obtener resumen de pagos
  async obtenerResumenPagos(fechaInicio = null, fechaFin = null) {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    if (fechaInicio) params.append("fechaInicio", fechaInicio);
    if (fechaFin) params.append("fechaFin", fechaFin);

    const response = await fetch(`${API_URL}/api/payments/resumen?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener resumen de pagos");
    }

    return response.json();
  },
};
