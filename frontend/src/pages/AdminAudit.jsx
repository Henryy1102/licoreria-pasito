import { useEffect, useState } from "react";
import { getAuditLogs, getAuditStats } from "../services/auditService";

const ACCIONES = [
  "LOGIN",
  "LOGOUT",
  "REGISTRO",
  "PRODUCTO_CREADO",
  "PRODUCTO_EDITADO",
  "PRODUCTO_ELIMINADO",
  "CLIENTE_CREADO",
  "CLIENTE_EDITADO",
  "CLIENTE_ELIMINADO",
  "USUARIO_EDITADO",
  "USUARIO_ELIMINADO",
  "COMPRA_REALIZADA",
  "CARRITO_ACTUALIZADO"
];

const ACCIONES_LABELS = {
  "LOGIN": "Inicio de sesión",
  "LOGOUT": "Cierre de sesión",
  "REGISTRO": "Registro de usuario",
  "PRODUCTO_CREADO": "Producto creado",
  "PRODUCTO_EDITADO": "Producto editado",
  "PRODUCTO_ELIMINADO": "Producto eliminado",
  "CLIENTE_CREADO": "Cliente creado",
  "CLIENTE_EDITADO": "Cliente editado",
  "CLIENTE_ELIMINADO": "Cliente eliminado",
  "USUARIO_EDITADO": "Usuario editado",
  "USUARIO_ELIMINADO": "Usuario eliminado",
  "COMPRA_REALIZADA": "Compra realizada",
  "CARRITO_ACTUALIZADO": "Carrito actualizado"
};

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    accion: "",
    fechaInicio: "",
    fechaFin: "",
    limit: 50
  });

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [page, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs({ ...filters, page });
      setLogs(data.logs);
      setTotalPages(data.pages);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getAuditStats();
      setStats(data);
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getAccionColor = (accion) => {
    if (accion.includes("LOGIN") || accion.includes("REGISTRO")) return "bg-green-600/15 text-green-300 border border-green-600/30";
    if (accion.includes("ELIMINADO")) return "bg-red-600/15 text-red-300 border border-red-600/30";
    if (accion.includes("EDITADO") || accion.includes("ACTUALIZADO")) return "bg-blue-600/15 text-blue-300 border border-blue-600/30";
    if (accion.includes("CREADO")) return "bg-purple-600/15 text-purple-300 border border-purple-600/30";
    if (accion.includes("COMPRA")) return "bg-orange-600/15 text-orange-300 border border-orange-600/30";
    return "bg-slate-700/40 text-subtext border border-slate-700";
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-fondo">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
        {/* Header */}
        <div className="bg-secondary border border-slate-700 rounded-card p-8 sm:p-12 mb-8 text-center">
          <img src="/logo.jpeg" alt="Licorería Al Pasito" className="h-16 sm:h-20 mx-auto mb-4 object-contain rounded-lg" />
          <h1 className="text-3xl sm:text-4xl font-semibold text-textMain mb-2">Auditoría del Sistema</h1>
          <p className="text-subtext text-sm sm:text-base">Registro de todas las acciones de usuarios</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card-hover">
              <h3 className="text-lg font-semibold text-textMain mb-2">Total de Acciones</h3>
              <p className="text-4xl font-semibold text-primary">{stats.totalAcciones}</p>
            </div>

            <div className="card-hover">
              <h3 className="text-lg font-semibold text-textMain mb-2">Acciones Más Comunes</h3>
              <div className="space-y-2">
                {stats.accionesPorTipo.slice(0, 3).map(item => (
                  <div key={item._id} className="flex justify-between items-center">
                    <span className="text-sm text-subtext">{ACCIONES_LABELS[item._id] || item._id}</span>
                    <span className="font-semibold text-textMain">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-hover">
              <h3 className="text-lg font-semibold text-textMain mb-2">Usuarios Más Activos</h3>
              <div className="space-y-2">
                {stats.usuariosActivos.slice(0, 3).map(user => (
                  <div key={user._id} className="flex justify-between items-center">
                    <span className="text-sm text-subtext truncate">{user.nombre}</span>
                    <span className="font-semibold text-textMain">{user.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="card mb-6">
        <h3 className="text-lg font-semibold text-textMain mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-subtext mb-2">Tipo de Acción</label>
            <select
              className="input"
              value={filters.accion}
              onChange={(e) => handleFilterChange('accion', e.target.value)}
            >
              <option value="">Todas</option>
              {ACCIONES.map(accion => (
                <option key={accion} value={accion}>{ACCIONES_LABELS[accion] || accion}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-subtext mb-2">Fecha Inicio</label>
            <input
              type="date"
              className="input"
              value={filters.fechaInicio}
              onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-subtext mb-2">Fecha Fin</label>
            <input
              type="date"
              className="input"
              value={filters.fechaFin}
              onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-subtext mb-2">Registros por página</label>
            <select
              className="input"
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

        {/* Tabla de Logs */}
        <div className="bg-secondary rounded-card overflow-hidden border border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textMain">Fecha y Hora</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textMain">Usuario</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textMain">Acción</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textMain">Descripción</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textMain">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-subtext">
                    Cargando logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-subtext">
                    No se encontraron registros
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-fondo/40 transition">
                    <td className="px-4 py-3 text-sm text-textMain whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <div className="font-semibold text-textMain">{log.usuarioNombre}</div>
                        <div className="text-xs text-subtext">{log.usuario?.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getAccionColor(log.accion)}`}>
                        {ACCIONES_LABELS[log.accion] || log.accion}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-subtext">
                      {log.descripcion}
                    </td>
                    <td className="px-4 py-3 text-sm text-subtext whitespace-nowrap">
                      {log.ip || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-secondary px-4 py-3 border-t border-slate-700 flex items-center justify-between">
              <div className="text-sm text-subtext">
                Página {page} de {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-primary px-4 py-2 disabled:bg-subtext disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-primary px-4 py-2 disabled:bg-subtext disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
    </div>
  );
}
