import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const API = axios.create({
  baseURL: `${API_URL}/api/clients`,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const clientService = {
  getAll: async () => {
    const { data } = await API.get("/");
    return data;
  },
  getById: async (id) => {
    const { data } = await API.get(`/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await API.post("/", payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await API.put(`/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await API.delete(`/${id}`);
    return data;
  },
};

export default clientService;
