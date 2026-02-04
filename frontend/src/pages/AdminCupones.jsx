import { useEffect, useState } from "react";
import { couponService } from "../services/couponService";

const initialForm = {
  codigo: "",
  tipo: "porcentaje",
  valor: 0,
  compraMinima: 0,
  descuentoMaximo: 0,
  fechaInicio: "",
  fechaFin: "",
  limiteUsos: 0,
  limitePorUsuario: 0,
  activo: true,
};

export default function AdminCupones() {
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const cargarCupones = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await couponService.listarCupones();
      setCupones(data);
    } catch (err) {
      setError(err.message || "Error al cargar cupones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCupones();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        codigo: form.codigo.trim().toUpperCase(),
        valor: Number(form.valor),
        compraMinima: Number(form.compraMinima) || 0,
        descuentoMaximo: Number(form.descuentoMaximo) || 0,
        limiteUsos: Number(form.limiteUsos) || 0,
        limitePorUsuario: Number(form.limitePorUsuario) || 0,
        fechaInicio: form.fechaInicio || undefined,
        fechaFin: form.fechaFin || undefined,
      };

      await couponService.crearCupon(payload);
      setForm(initialForm);
      await cargarCupones();
    } catch (err) {
      setError(err.message || "Error al crear cupón");
    } finally {
      setSaving(false);
    }
  };

  const toggleEstado = async (cupon) => {
    try {
      const actualizado = await couponService.actualizarEstado(cupon._id, !cupon.activo);
      setCupones((prev) => prev.map((c) => (c._id === cupon._id ? actualizado : c)));
    } catch (err) {
      setError(err.message || "Error al actualizar cupón");
    }
  };

  return (
    <div className="min-h-screen bg-fondo">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <img src="/logo.jpeg" alt="Licorería Al Pasito" className="h-12 object-contain" />
          <h1 className="text-3xl font-bold text-primary">Cupones y Descuentos</h1>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded bg-red-900/40 text-red-200 border border-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-secondary rounded-lg p-6 border border-primary/20">
            <h2 className="text-xl font-bold text-primary mb-4">Crear cupón</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-accent font-semibold mb-1">Código</label>
                <input
                  type="text"
                  className="input"
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-accent font-semibold mb-1">Tipo</label>
                <select
                  className="input"
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                >
                  <option value="porcentaje">Porcentaje</option>
                  <option value="monto">Monto fijo</option>
                </select>
              </div>

              <div>
                <label className="block text-accent font-semibold mb-1">Valor</label>
                <input
                  type="number"
                  className="input"
                  min="0"
                  step="0.01"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-accent font-semibold mb-1">Compra mínima</label>
                <input
                  type="number"
                  className="input"
                  min="0"
                  step="0.01"
                  value={form.compraMinima}
                  onChange={(e) => setForm({ ...form, compraMinima: e.target.value })}
                />
              </div>

              {form.tipo === "porcentaje" && (
                <div>
                  <label className="block text-accent font-semibold mb-1">Descuento máximo</label>
                  <input
                    type="number"
                    className="input"
                    min="0"
                    step="0.01"
                    value={form.descuentoMaximo}
                    onChange={(e) => setForm({ ...form, descuentoMaximo: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="block text-accent font-semibold mb-1">Fecha inicio</label>
                <input
                  type="date"
                  className="input"
                  value={form.fechaInicio}
                  onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-accent font-semibold mb-1">Fecha fin</label>
                <input
                  type="date"
                  className="input"
                  value={form.fechaFin}
                  onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-accent font-semibold mb-1">Límite de usos (0 = ilimitado)</label>
                <input
                  type="number"
                  className="input"
                  min="0"
                  value={form.limiteUsos}
                  onChange={(e) => setForm({ ...form, limiteUsos: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-accent font-semibold mb-1">Límite por usuario (0 = ilimitado)</label>
                <input
                  type="number"
                  className="input"
                  min="0"
                  value={form.limitePorUsuario}
                  onChange={(e) => setForm({ ...form, limitePorUsuario: e.target.value })}
                />
              </div>

              <label className="flex items-center gap-2 text-accent">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                />
                Cupón activo
              </label>

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Crear cupón"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-secondary rounded-lg p-6 border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary">Listado de cupones</h2>
              <button className="btn-secondary" onClick={cargarCupones}>
                Recargar
              </button>
            </div>

            {loading ? (
              <p className="text-accent">Cargando...</p>
            ) : cupones.length === 0 ? (
              <p className="text-accent">No hay cupones creados.</p>
            ) : (
              <div className="space-y-4">
                {cupones.map((cupon) => (
                  <div
                    key={cupon._id}
                    className="border border-primary/20 rounded-lg p-4 bg-fondo/40"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-primary font-bold text-lg">
                          {cupon.codigo}
                        </p>
                        <p className="text-accent text-sm">
                          {cupon.tipo === "porcentaje"
                            ? `${cupon.valor}%`
                            : `$${cupon.valor}`} · Usos {cupon.usosRealizados}/{cupon.limiteUsos || "∞"}
                        </p>
                        <p className="text-accent text-xs">
                          Vigencia: {cupon.fechaInicio ? new Date(cupon.fechaInicio).toLocaleDateString() : "-"} a {cupon.fechaFin ? new Date(cupon.fechaFin).toLocaleDateString() : "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            cupon.activo ? "bg-green-600/20 text-green-300" : "bg-red-600/20 text-red-300"
                          }`}
                        >
                          {cupon.activo ? "Activo" : "Inactivo"}
                        </span>
                        <button
                          className="btn-secondary"
                          onClick={() => toggleEstado(cupon)}
                        >
                          {cupon.activo ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
