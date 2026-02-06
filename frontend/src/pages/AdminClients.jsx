import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const USERS_API = `${API_BASE}/api/users`;

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${USERS_API}/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const startEdit = (client) => {
    setForm({
      nombre: client.nombre,
      email: client.email,
      telefono: client.telefono || "",
    });
    setEditingId(client._id);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${USERS_API}/${editingId}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClients();
      setEditingId(null);
      setForm({ nombre: "", email: "", telefono: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Error al actualizar");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este cliente?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${USERS_API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClients();
    } catch (err) {
      alert(err.response?.data?.message || "Error al eliminar");
    }
  };

  return (
    <div className="min-h-screen bg-fondo">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <img src="/logo.jpeg" alt="Licorería Al Pasito" className="h-12 sm:h-14 object-contain" />
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Clientes Registrados</h1>
        </div>

        {error && <div className="bg-red-900/50 text-red-200 px-3 sm:px-4 py-2 rounded mb-4 border border-red-600 text-sm sm:text-base">{error}</div>}

        {editingId && (
          <div className="bg-secondary p-4 sm:p-6 rounded shadow mb-4 sm:mb-6 border border-primary/20">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-primary">Editar cliente</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4" onSubmit={handleUpdate}>
            <input className="input text-sm sm:text-base" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            <input className="input text-sm sm:text-base" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className="input text-sm sm:text-base" placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-2">
              <button className="btn-primary text-sm sm:text-base" type="submit">Guardar</button>
              <button type="button" className="btn-secondary text-sm sm:text-base" onClick={() => { setEditingId(null); setForm({ nombre: "", email: "", telefono: "" }); }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-secondary p-4 sm:p-6 rounded shadow border border-primary/20">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-primary">Listado</h2>
          {loading && <span className="text-xs sm:text-sm text-subtext">Cargando...</span>}
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-primary/30">
                <th className="py-2 px-2 sm:px-3 text-primary text-xs sm:text-sm md:text-base">Nombre</th>
                <th className="py-2 px-2 sm:px-3 text-primary text-xs sm:text-sm md:text-base">Email</th>
                <th className="py-2 px-2 sm:px-3 text-primary text-xs sm:text-sm md:text-base">Teléfono</th>
                <th className="py-2 px-2 sm:px-3 text-primary text-xs sm:text-sm md:text-base">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c._id} className="border-b border-primary/10 hover:bg-secondary/80 transition">
                  <td className="py-2 px-2 sm:px-3 text-textMain text-xs sm:text-sm md:text-base">{c.nombre}</td>
                  <td className="py-2 px-2 sm:px-3 text-accent text-xs sm:text-sm md:text-base break-all">{c.email}</td>
                  <td className="py-2 px-2 sm:px-3 text-accent text-xs sm:text-sm md:text-base">{c.telefono || "-"}</td>
                  <td className="py-2 px-2 sm:px-3 flex flex-col sm:flex-row gap-1 sm:gap-2">
                    <button className="btn-secondary text-xs sm:text-sm" onClick={() => startEdit(c)}>Editar</button>
                    <button className="btn-danger text-xs sm:text-sm" onClick={() => handleDelete(c._id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && !loading && (
                <tr>
                  <td className="py-4 px-2 sm:px-3 text-subtext text-xs sm:text-sm" colSpan={4}>No hay clientes registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
