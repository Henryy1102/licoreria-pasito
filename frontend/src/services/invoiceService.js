import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = `${API_BASE}/api/invoices`;

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

// Crear factura
export const crearFactura = async (ordenId, datosFiscales = null, notas = "") => {
  const response = await axios.post(
    API_URL,
    { ordenId, datosFiscales, notas },
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Obtener todas las facturas (admin)
export const obtenerFacturas = async (filtros = {}) => {
  const params = new URLSearchParams(filtros).toString();
  const response = await axios.get(`${API_URL}?${params}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Obtener mis facturas (cliente)
export const obtenerMisFacturas = async () => {
  try {
    const response = await axios.get(`${API_URL}/mis-facturas`, {
      headers: getAuthHeader(),
    });
    console.log("📄 Respuesta de mis facturas:", response);
    return response.data;
  } catch (error) {
    console.error("❌ Error en obtenerMisFacturas:", error.response || error.message);
    throw error;
  }
};

// Obtener factura por ID
export const obtenerFacturaPorId = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Obtener factura por orden
export const obtenerFacturaPorOrden = async (ordenId) => {
  const response = await axios.get(`${API_URL}/orden/${ordenId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Marcar factura como pagada (admin)
export const marcarComoPagada = async (id) => {
  const response = await axios.put(
    `${API_URL}/${id}/pagar`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Anular factura (admin)
export const anularFactura = async (id, motivo) => {
  const response = await axios.put(
    `${API_URL}/${id}/anular`,
    { motivo },
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Obtener estadísticas de facturación (admin)
export const obtenerEstadisticas = async (filtros = {}) => {
  const params = new URLSearchParams(filtros).toString();
  const response = await axios.get(
    `${API_URL}/estadisticas/facturacion?${params}`,
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Descargar PDF de factura
export const descargarPDFFactura = async (id, numeroFactura) => {
  try {
    const response = await axios.get(`${API_URL}/${id}/pdf`, {
      headers: getAuthHeader(),
      responseType: "blob", // Importante para archivos binarios
    });

    // Crear un link temporal para descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Factura-${numeroFactura}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al descargar PDF:", error);
    throw error;
  }
};

