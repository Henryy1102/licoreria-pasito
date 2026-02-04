import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const API = axios.create({
  baseURL: `${API_URL}/api/products`,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const productService = {
  getAll: async () => {
    const { data } = await API.get("/");
    return data;
  },
  getRecommendations: async (limit = 6) => {
    const { data } = await API.get(`/recommendations?limit=${limit}`);
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

export default productService;
