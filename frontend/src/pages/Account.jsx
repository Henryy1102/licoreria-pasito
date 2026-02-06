import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import axios from "axios";
import { pushService } from "../services/pushService";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Account() {
  const { user, setUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nombre: user?.nombre || "",
    email: user?.email || "",
    telefono: user?.telefono || "",
    password: "",
  });
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loadingPush, setLoadingPush] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verificarPush = async () => {
      if (!("serviceWorker" in navigator)) return;
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      setPushEnabled(!!sub);
    };

    verificarPush();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const payload = { ...form };
      if (!payload.password) delete payload.password;

      const { data } = await axios.put(
        `${API_BASE}/api/users/${user.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Actualizar usuario en store
      const updatedUser = { ...user, ...data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      useAuthStore.setState({ user: updatedUser });

      setMessage("Datos actualizados correctamente");
      setEditing(false);
      setForm({ ...form, password: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Error al actualizar datos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fondo">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <img src="/logo.jpeg" alt="Licorería Al Pasito" className="h-14 object-contain" />
          <h1 className="text-3xl font-bold text-primary">Mi Cuenta</h1>
        </div>

        {message && (
          <div className={`mb-4 px-4 py-3 rounded ${message.includes("Error") ? "bg-red-900/50 text-red-200 border border-red-600" : "bg-green-900/50 text-green-200 border border-green-600"}`}>
            {message}
          </div>
        )}

        <div className="bg-secondary p-6 rounded-lg shadow border border-primary/20">
        {!editing ? (
          <>
            <div className="space-y-3 mb-6">
              <p className="text-accent"><strong className="text-primary">Nombre:</strong> {user?.nombre}</p>
              <p className="text-accent"><strong className="text-primary">Email:</strong> {user?.email}</p>
              <p className="text-accent"><strong className="text-primary">Teléfono:</strong> {user?.telefono || "No registrado"}</p>
              <p className="text-accent"><strong className="text-primary">Rol:</strong> <span className="capitalize text-primary">{user?.rol}</span></p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary" onClick={() => setEditing(true)}>
                Editar datos
              </button>
              {user?.rol === "cliente" && (
                <Link to="/facturas" className="btn-secondary">
                  Ver mis facturas
                </Link>
              )}
            </div>

            {user?.rol === "cliente" && (
              <div className="mt-6 border-t border-primary/20 pt-4">
                <h3 className="text-lg font-semibold text-primary mb-2">Notificaciones push</h3>
                <p className="text-accent text-sm mb-3">
                  Recibe alertas de pedidos y promociones.
                </p>
                <button
                  className="btn-secondary"
                  disabled={loadingPush}
                  onClick={async () => {
                    setLoadingPush(true);
                    try {
                      if (pushEnabled) {
                        await pushService.unsubscribe();
                        setPushEnabled(false);
                      } else {
                        await pushService.subscribe();
                        setPushEnabled(true);
                      }
                    } catch (err) {
                      setMessage(err.message || "Error con notificaciones push");
                    } finally {
                      setLoadingPush(false);
                    }
                  }}
                >
                  {loadingPush
                    ? "Procesando..."
                    : pushEnabled
                      ? "Desactivar"
                      : "Activar"}
                </button>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-primary font-semibold mb-2">Nombre</label>
              <input
                type="text"
                className="input"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-secondary font-semibold mb-2">Email</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-secondary font-semibold mb-2">Teléfono</label>
              <input
                type="tel"
                className="input"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </div>

            <div className="mb-6">
              <label className="block text-secondary font-semibold mb-2">Nueva Contraseña (opcional)</label>
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Dejar en blanco para no cambiar"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditing(false);
                  setForm({
                    nombre: user?.nombre || "",
                    email: user?.email || "",
                    telefono: user?.telefono || "",
                    password: "",
                  });
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
      </div>
    </div>
  );
};