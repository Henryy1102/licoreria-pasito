import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrderStore } from "../store/orderStore";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";

export default function AdminOrdenes() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { ordenes, obtenerOrdenes, actualizarEstado, cargando, error } = useOrderStore();
  const { notificaciones, noLeidas, obtenerNotificaciones } = useNotificationStore();
  const [filtroEstado, setFiltroEstado] = useState("");
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [actualizando, setActualizando] = useState(false);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      navigate("/");
      return;
    }

    cargarOrdenes();
    obtenerNotificaciones();

    // Recargar notificaciones cada 30 segundos
    const interval = setInterval(() => {
      obtenerNotificaciones();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, navigate]);

  const cargarOrdenes = async () => {
    const filtros = {};
    if (filtroEstado) filtros.estado = filtroEstado;
    await obtenerOrdenes(filtros);
  };

  useEffect(() => {
    cargarOrdenes();
  }, [filtroEstado]);

  const handleActualizarEstado = async () => {
    if (!ordenSeleccionada || !nuevoEstado) {
      return;
    }

    setActualizando(true);
    try {
      await actualizarEstado(
        ordenSeleccionada._id,
        nuevoEstado,
        fechaEntrega || null
      );
      
      // Actualizar la orden seleccionada inmediatamente
      const ordenActualizada = {
        ...ordenSeleccionada,
        estado: nuevoEstado,
        fechaEntregaEstimada: fechaEntrega || ordenSeleccionada.fechaEntregaEstimada
      };
      setOrdenSeleccionada(ordenActualizada);
      
      // Recargar la lista de órdenes
      await cargarOrdenes();
      
      setNuevoEstado("");
      setFechaEntrega("");
      // Recargar notificaciones después de actualizar
      obtenerNotificaciones();
    } catch (err) {
      console.error(err.message);
    } finally {
      setActualizando(false);
    }
  };

  const getEstadoBadgeInfo = (estado) => {
    const estadoInfo = {
      pendiente: { label: "Pendiente", color: "bg-yellow-500", icon: "⏱️", desc: "Esperando confirmación" },
      procesando: { label: "Procesando", color: "bg-blue-500", icon: "⏳", desc: "En preparación" },
      completado: { label: "Completado", color: "bg-green-500", icon: "✅", desc: "Entregado" },
      cancelado: { label: "Cancelado", color: "bg-red-500", icon: "❌", desc: "Cancelado" },
    };
    return estadoInfo[estado] || { label: estado, color: "bg-gray-500", icon: "🔔", desc: "" };
  };

  const getSiguienteEstado = (estadoActual) => {
    const flujo = {
      pendiente: "procesando",
      procesando: "completado",
      completado: null,
      cancelado: null,
    };
    return flujo[estadoActual];
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "completado":
        return "bg-green-100 text-green-800";
      case "procesando":
        return "bg-blue-100 text-blue-800";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUbicacionMapUrl = (ubicacion) => {
    if (!ubicacion) return "";
    if (ubicacion.link) return ubicacion.link;
    if (typeof ubicacion.latitud === "number" && typeof ubicacion.longitud === "number") {
      return `https://www.google.com/maps?q=${ubicacion.latitud},${ubicacion.longitud}`;
    }
    if (ubicacion.direccion) {
      return `https://www.google.com/maps?q=${encodeURIComponent(ubicacion.direccion)}`;
    }
    return "";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-SV", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const estadosDisponibles = ["pendiente", "procesando", "completado", "cancelado"];

  if (cargando && ordenes.length === 0) {
    return (
      <div className="min-h-screen bg-fondo flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-accent">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fondo">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Encabezado con notificaciones */}
        <div className="mb-6 sm:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <img src="/logo.jpeg" alt="Licorería Al Pasito" className="h-12 sm:h-14 object-contain" />
            <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">Gestión de Órdenes</h1>
              <p className="text-accent text-sm sm:text-base">
                Panel administrativo para controlar todas las órdenes de venta
              </p>
            </div>
          </div>
          
          {/* Botón de notificaciones */}
          <div className="relative">
            <button
              onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
              className="relative bg-secondary border border-primary/30 text-primary p-3 rounded-lg hover:bg-primary/10 transition"
            >
              <span className="text-2xl">🔔</span>
              {noLeidas > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {noLeidas}
                </span>
              )}
            </button>

            {/* Panel de notificaciones */}
            {mostrarNotificaciones && (
              <div className="absolute right-0 mt-2 w-80 bg-secondary border border-primary/30 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-primary/20">
                  <h3 className="text-lg font-bold text-primary">Notificaciones</h3>
                </div>
                {notificaciones.length === 0 ? (
                  <div className="p-4 text-center text-accent">
                    No hay notificaciones
                  </div>
                ) : (
                  <div>
                    {notificaciones.slice(0, 10).map((notif) => (
                      <div
                        key={notif._id}
                        className={`p-4 border-b border-primary/10 hover:bg-fondo/30 cursor-pointer ${
                          !notif.leida ? "bg-primary/5" : ""
                        }`}
                        onClick={() => {
                          if (notif.orden?._id) {
                            navigate(`/admin/ordenes`);
                            setMostrarNotificaciones(false);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{notif.icono}</span>
                          <div className="flex-1">
                            <p className={`font-semibold ${!notif.leida ? "text-primary" : "text-white"}`}>
                              {notif.titulo}
                            </p>
                            <p className="text-sm text-accent mt-1">{notif.mensaje}</p>
                            <p className="text-xs text-accent/70 mt-1">
                              {new Date(notif.createdAt).toLocaleString("es-SV")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Errores */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-secondary rounded-lg shadow-md p-6 mb-6 border border-primary/20">
          <h3 className="text-lg font-semibold text-primary mb-4">Filtrar por Estado</h3>
          <div className="flex flex-wrap gap-3">
            {["", "pendiente", "procesando", "completado", "cancelado"].map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filtroEstado === estado
                    ? "bg-primary text-fondo"
                    : "bg-fondo/50 text-accent hover:bg-fondo/70 border border-primary/30"
                }`}
              >
                {estado === "" ? "Todas" : estado.charAt(0).toUpperCase() + estado.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Resumen rápido */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-secondary rounded-lg shadow-md p-6 border border-primary/20">
            <p className="text-accent font-semibold text-sm">Total de Órdenes</p>
            <p className="text-3xl font-bold text-primary mt-2">{ordenes.length}</p>
          </div>
          <div className="bg-secondary rounded-lg shadow-md p-6 border border-yellow-500/20">
            <p className="text-accent font-semibold text-sm">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-500 mt-2">
              {ordenes.filter((o) => o.estado === "pendiente").length}
            </p>
          </div>
          <div className="bg-secondary rounded-lg shadow-md p-6 border border-blue-500/20">
            <p className="text-accent font-semibold text-sm">Procesando</p>
            <p className="text-3xl font-bold text-blue-500 mt-2">
              {ordenes.filter((o) => o.estado === "procesando").length}
            </p>
          </div>
          <div className="bg-secondary rounded-lg shadow-md p-6 border border-green-500/20">
            <p className="text-accent font-semibold text-sm">Completadas</p>
            <p className="text-3xl font-bold text-green-500 mt-2">
              {ordenes.filter((o) => o.estado === "completado").length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de órdenes */}
          <div className="lg:col-span-2">
            {ordenes.length === 0 ? (
              <div className="bg-secondary rounded-lg shadow-md p-12 text-center border border-primary/20">
                <p className="text-accent text-lg">No hay órdenes con este filtro</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ordenes.map((orden) => (
                  <div
                    key={orden._id}
                    className={`bg-secondary rounded-lg shadow-md p-6 cursor-pointer transition border ${
                      ordenSeleccionada?._id === orden._id
                        ? "ring-2 ring-primary border-primary"
                        : "border-primary/20 hover:shadow-lg hover:border-primary/40"
                    }`}
                    onClick={() => setOrdenSeleccionada(orden)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-primary">
                          {orden.numeroOrden}
                        </h3>
                        <p className="text-accent text-sm">
                          Cliente: {orden.cliente?.nombre || "N/A"}
                        </p>
                        <p className="text-accent text-sm">
                          {formatDate(orden.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-4 py-2 rounded-full font-semibold text-sm ${getEstadoColor(
                            orden.estado
                          )}`}
                        >
                          {orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1)}
                        </span>
                        <p className="text-2xl font-bold text-primary mt-2">
                          ${orden.total.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Resumen de productos */}
                    <div className="text-sm text-accent mt-3">
                      {orden.productos.length} producto(s):
                      {orden.productos.map((p, i) => (
                        <span key={i}>
                          {" "}
                          {p.nombre}
                          {i < orden.productos.length - 1 ? "," : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel de detalles */}
          {ordenSeleccionada ? (
            <div className="lg:col-span-1">
              <div className="bg-secondary rounded-lg shadow-md p-6 sticky top-4 border border-primary/20">
                <h3 className="text-xl font-bold text-primary mb-4">Detalles de la Orden</h3>

                {/* Número de orden */}
                <div className="mb-4 p-3 bg-fondo/50 rounded border border-primary/10">
                  <p className="text-accent font-semibold text-sm">Número de Orden</p>
                  <p className="text-lg font-bold text-primary">
                    {ordenSeleccionada.numeroOrden}
                  </p>
                </div>

                {/* Cliente */}
                <div className="mb-4 p-3 bg-fondo/50 rounded border border-primary/10">
                  <p className="text-accent font-semibold text-sm">Cliente</p>
                  <p className="text-white">{ordenSeleccionada.cliente?.nombre}</p>
                  <p className="text-accent text-sm">{ordenSeleccionada.cliente?.email}</p>
                </div>

                {/* Ubicación de Entrega */}
                {ordenSeleccionada.ubicacion && (
                  <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded">
                    <p className="text-accent font-semibold mb-3">📍 Ubicación de Entrega:</p>

                    {ordenSeleccionada.ubicacion.direccion && (
                      <div className="mb-3 p-3 bg-white/10 border border-blue-400/30 rounded">
                        <p className="text-blue-200 text-xs font-semibold mb-2">Dirección:</p>
                        <p className="text-gray-200 text-sm break-words">
                          {ordenSeleccionada.ubicacion.direccion}
                        </p>
                      </div>
                    )}

                    {typeof ordenSeleccionada.ubicacion.latitud === "number" &&
                      typeof ordenSeleccionada.ubicacion.longitud === "number" && (
                        <div className="mb-3 p-3 bg-white/10 border border-blue-400/30 rounded">
                          <p className="text-blue-200 text-xs font-semibold mb-2">Coordenadas:</p>
                          <p className="text-gray-200 text-sm">
                            {ordenSeleccionada.ubicacion.latitud.toFixed(5)}, {ordenSeleccionada.ubicacion.longitud.toFixed(5)}
                          </p>
                        </div>
                      )}

                    {/* Link para copiar (legacy) */}
                    {ordenSeleccionada.ubicacion.link && (
                      <div className="mb-3 p-3 bg-white/10 border border-blue-400/30 rounded">
                        <p className="text-blue-200 text-xs font-semibold mb-2">🔗 Link de Ubicación:</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={ordenSeleccionada.ubicacion.link}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-400 rounded text-xs bg-gray-700 text-gray-200"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(ordenSeleccionada.ubicacion.link);
                            }}
                            className="px-3 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition font-semibold whitespace-nowrap"
                          >
                            📋 Copiar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Botón para abrir en Google Maps */}
                    {getUbicacionMapUrl(ordenSeleccionada.ubicacion) && (
                      <a
                        href={getUbicacionMapUrl(ordenSeleccionada.ubicacion)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold text-sm"
                      >
                        🗺️ Ver Ubicación en Google Maps
                      </a>
                    )}
                  </div>
                )}

                {/* Seguimiento Visual del Estado */}
                <div className="mb-6 p-4 bg-fondo/50 rounded border border-primary/10">
                  <p className="text-accent font-semibold text-sm mb-4">Seguimiento del Pedido</p>
                  <div className="space-y-3">
                    {["pendiente", "procesando", "completado"].map((estado, index) => {
                      const estadoInfo = getEstadoBadgeInfo(estado);
                      const isActual = ordenSeleccionada.estado === estado;
                      const isPasado = ["pendiente", "procesando", "completado"].indexOf(ordenSeleccionada.estado) > index;
                      const isCancelado = ordenSeleccionada.estado === "cancelado";
                      
                      return (
                        <div key={estado} className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                            isActual ? estadoInfo.color + " shadow-lg scale-110" : 
                            isPasado ? "bg-green-600" : 
                            isCancelado ? "bg-gray-600" : "bg-gray-700"
                          } transition-all`}>
                            {isActual || isPasado ? estadoInfo.icon : "⚪"}
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold ${isActual ? "text-primary" : "text-white"}`}>
                              {estadoInfo.label}
                            </p>
                            <p className="text-xs text-accent">{estadoInfo.desc}</p>
                          </div>
                          {isActual && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                              Actual
                            </span>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Cancelado (si aplica) */}
                    {ordenSeleccionada.estado === "cancelado" && (
                      <div className="flex items-center gap-3 border-t border-red-500/30 pt-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-red-500 shadow-lg">
                          ❌
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-red-400">Cancelado</p>
                          <p className="text-xs text-accent">Pedido cancelado</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="mb-6 p-3 bg-primary/10 rounded border border-primary/30">
                  <p className="text-accent font-semibold text-sm">Total</p>
                  <p className="text-2xl font-bold text-primary mt-2">
                    ${ordenSeleccionada.total.toLocaleString()}
                  </p>
                </div>

                {/* Acciones Rápidas - Solo si no está completado o cancelado */}
                {ordenSeleccionada.estado !== "completado" && ordenSeleccionada.estado !== "cancelado" && (
                  <div className="mb-4">
                    <label className="block text-accent font-semibold mb-3">
                      Acciones Rápidas
                    </label>
                    
                    {/* Botón de siguiente estado */}
                    {getSiguienteEstado(ordenSeleccionada.estado) && (
                      <button
                        onClick={async () => {
                          const siguiente = getSiguienteEstado(ordenSeleccionada.estado);
                          setActualizando(true);
                          try {
                            await actualizarEstado(ordenSeleccionada._id, siguiente, null);
                            
                            // Actualizar la orden seleccionada inmediatamente
                            const ordenActualizada = {
                              ...ordenSeleccionada,
                              estado: siguiente
                            };
                            setOrdenSeleccionada(ordenActualizada);
                            
                            // Recargar la lista de órdenes
                            await cargarOrdenes();
                            obtenerNotificaciones();
                          } catch (err) {
                            console.error(err.message);
                          } finally {
                            setActualizando(false);
                          }
                        }}
                        disabled={actualizando}
                        className="w-full bg-primary text-fondo py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:bg-gray-600 mb-3 transition flex items-center justify-center gap-2"
                      >
                        <span>{getEstadoBadgeInfo(getSiguienteEstado(ordenSeleccionada.estado)).icon}</span>
                        <span>Cambiar a {getEstadoBadgeInfo(getSiguienteEstado(ordenSeleccionada.estado)).label}</span>
                      </button>
                    )}

                    {/* Botón de cancelar */}
                    <button
                      onClick={async () => {
                        if (confirm("¿Estás seguro de cancelar este pedido?")) {
                          setActualizando(true);
                          try {
                            await actualizarEstado(ordenSeleccionada._id, "cancelado", null);
                            
                            // Actualizar la orden seleccionada inmediatamente
                            const ordenActualizada = {
                              ...ordenSeleccionada,
                              estado: "cancelado"
                            };
                            setOrdenSeleccionada(ordenActualizada);
                            
                            // Recargar la lista de órdenes
                            await cargarOrdenes();
                            obtenerNotificaciones();
                          } catch (err) {
                            console.error(err.message);
                          } finally {
                            setActualizando(false);
                          }
                        }
                      }}
                      disabled={actualizando}
                      className="w-full bg-red-900/30 text-red-400 border border-red-500/50 py-3 rounded-lg font-semibold hover:bg-red-900/50 disabled:bg-gray-600 transition"
                    >
                      ❌ Cancelar Pedido
                    </button>
                  </div>
                )}

                {/* Cambio manual de estado (avanzado) */}
                <details className="mb-4">
                  <summary className="cursor-pointer text-accent font-semibold mb-2 hover:text-primary">
                    Cambio Manual de Estado
                  </summary>
                  <div className="mt-3">
                    <select
                      value={nuevoEstado}
                      onChange={(e) => setNuevoEstado(e.target.value)}
                      className="w-full px-3 py-2 bg-fondo border border-primary/30 rounded-lg focus:outline-none focus:border-primary text-white mb-3"
                    >
                      <option value="">Seleccionar estado</option>
                      {estadosDisponibles
                        .filter((e) => e !== ordenSeleccionada.estado)
                        .map((estado) => (
                          <option key={estado} value={estado}>
                            {getEstadoBadgeInfo(estado).icon} {getEstadoBadgeInfo(estado).label}
                          </option>
                        ))}
                    </select>

                    {(nuevoEstado === "procesando" || nuevoEstado === "completado") && (
                      <input
                        type="date"
                        value={fechaEntrega}
                        onChange={(e) => setFechaEntrega(e.target.value)}
                        className="w-full px-3 py-2 bg-fondo border border-primary/30 rounded-lg focus:outline-none focus:border-primary text-white mb-3"
                        placeholder="Fecha de entrega"
                      />
                    )}

                    <button
                      onClick={handleActualizarEstado}
                      disabled={!nuevoEstado || actualizando}
                      className="w-full bg-primary text-fondo py-2 rounded-lg font-semibold hover:bg-primary/90 disabled:bg-gray-600 disabled:text-gray-400 transition"
                    >
                      {actualizando ? "Actualizando..." : "Actualizar Estado"}
                    </button>
                  </div>
                </details>

                <button
                  onClick={() => navigate(`/orden/${ordenSeleccionada._id}`)}
                  className="w-full bg-fondo/50 border border-primary/30 text-accent py-2 rounded-lg font-semibold hover:bg-fondo/70 transition"
                >
                  Ver Detalles Completos
                </button>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-1">
              <div className="bg-secondary rounded-lg shadow-md p-6 text-center border border-primary/20">
                <p className="text-accent">
                  Selecciona una orden para ver sus detalles
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
