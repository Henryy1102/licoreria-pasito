import axios from "axios";

const API_URL = "http://localhost:4000/api/audit";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getAuditLogs = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.usuario) params.append('usuario', filters.usuario);
  if (filters.accion) params.append('accion', filters.accion);
  if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
  if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const response = await axios.get(`${API_URL}/logs?${params.toString()}`, getAuthHeader());
  return response.data;
};

export const getAuditStats = async () => {
  const response = await axios.get(`${API_URL}/stats`, getAuthHeader());
  return response.data;
};
