import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrderStore } from "../store/orderStore";
import { useAuthStore } from "../store/authStore";
import { useInvoiceStore } from "../store/invoiceStore";

export default function MisOrdenes() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { ordenes, obtenerMisOrdenes, cancelarOrden, cargando, error } = useOrderStore();
  const { crearFactura } = useInvoiceStore();
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);
  const [ordenACancelar, setOrdenACancelar] = useState(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    obtenerMisOrdenes();
  }, [user, navigate]);

  const ordenesFiltradas = filtroEstado === "todos"
    ? ordenes
    : ordenes.filter((o) => o.estado === filtroEstado);

  const handleCancelarOrden = async () => {
    if (!ordenACancelar) return;

    try {
      await cancelarOrden(ordenACancelar._id, motivoCancelacion);
      setMostrarModalCancelar(false);
      setOrdenACancelar(null);
      setMotivoCancelacion("");
      obtenerMisOrdenes();
    } catch (err) {
      console.error(err.message);
    }
  };

  const abrirModalCancelar = (orden) => {
    setOrdenACancelar(orden);
    setMostrarModalCancelar(true);
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-SV", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (cargando && ordenes.length === 0) {
    return (
      <div className="min-h-screen bg-fondo flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-accent">Cargando mis pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fondo">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Mis Pedidos</h1>
          <p className="text-accent">
            Aquí puedes ver el historial y estado de tus compras
          </p>
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
            {["todos", "pendiente", "procesando", "completado", "cancelado"].map(
              (estado) => (
                <button
                  key={estado}
                  onClick={() => setFiltroEstado(estado)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    filtroEstado === estado
                      ? "bg-primary text-fondo"
                      : "bg-fondo/50 text-accent hover:bg-fondo/70 border border-primary/30"
                  }`}
                >
                  {estado === "todos" ? "Todos" : estado.charAt(0).toUpperCase() + estado.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        {/* Lista de órdenes */}
        {ordenesFiltradas.length === 0 ? (
          <div className="bg-secondary rounded-lg shadow-md p-12 text-center border border-primary/20">
            <p className="text-accent text-lg mb-4">No hay pedidos en esta categoría</p>
            <button
              onClick={() => navigate("/catalog")}
              className="bg-primary text-fondo px-8 py-3 rounded-lg hover:bg-primary/90 font-semibold transition"
            >
              Ir al Catálogo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {ordenesFiltradas.map((orden) => (
              <div
                key={orden._id}
                className="bg-secondary rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer border border-primary/20 hover:border-primary/40"
                onClick={() => setOrdenSeleccionada(orden._id === ordenSeleccionada ? null : orden._id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      {orden.numeroOrden}
                    </h3>
                    <p className="text-accent text-sm">
                      {formatDate(orden.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-4 py-2 rounded-full font-semibold text-sm ${getEstadoColor(
                        orden.estado
                      )}`}
                    >
                      {orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1)}
                    </span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ${orden.total.toLocaleString()}
                      </p>
                      <p className="text-accent text-sm">
                        {orden.productos.length} producto{orden.productos.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detalles expandibles */}
                {ordenSeleccionada === orden._id && (
                  <div className="border-t border-primary/20 pt-6 mt-6">
                    {/* Productos */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-primary mb-3">Productos</h4>
                      <div className="space-y-3">
                        {orden.productos.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-white">
                                {item.nombre}
                              </p>
                              <p className="text-sm text-accent">
                                ${item.precio.toLocaleString()} x {item.cantidad}
                              </p>
                            </div>
                            <p className="font-semibold text-primary">
                              ${item.subtotal.toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resumen de pago */}
                    <div className="bg-primary/10 p-4 rounded-lg mb-6 border border-primary/30">
                      <div className="space-y-2 text-accent">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${orden.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>IVA (13%):</span>
                          <span>${orden.impuesto.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-primary/30 text-primary">
                          <span>Total:</span>
                          <span>${orden.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-accent font-semibold">Método de Pago</p>
                        <p className="text-white capitalize">{orden.metodoPago}</p>
                      </div>
                      {orden.direccionEntrega && (
                        <div>
                          <p className="text-accent font-semibold">Dirección de Entrega</p>
                          <p className="text-white text-sm">
                            {orden.direccionEntrega.calle} {orden.direccionEntrega.numero}
                            <br />
                            {orden.direccionEntrega.ciudad}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Ubicación de entrega */}
                    {orden.ubicacion && orden.ubicacion.link && (
                      <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded">
                        <p className="text-accent font-semibold mb-3">📍 Ubicación de Entrega:</p>
                        <a
                          href={orden.ubicacion.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold text-sm"
                        >
                          🗺️ Ver mi Ubicación en Google Maps
                        </a>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/orden/${orden._id}`);
                        }}
                        className="flex-1 bg-primary text-fondo py-2 rounded-lg font-semibold hover:bg-primary/90 transition"
                      >
                        Ver Detalles Completos
                      </button>
                      {orden.estado === "completado" && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await crearFactura(orden._id);
                            } catch (err) {
                              // Si ya existe, igualmente permitir ver facturas
                            }
                            navigate("/facturas");
                          }}
                          className="px-4 py-2 bg-fondo/50 text-accent border border-primary/30 rounded-lg font-semibold hover:bg-fondo/70 transition"
                        >
                          Ver Factura
                        </button>
                      )}
                      {(orden.estado === "pendiente" || orden.estado === "procesando") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirModalCancelar(orden);
                          }}
                          className="px-4 py-2 bg-red-900/30 text-red-400 border border-red-500/50 rounded-lg font-semibold hover:bg-red-900/50 transition"
                        >
                          Cancelar Pedido
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal de cancelación */}
        {mostrarModalCancelar && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-secondary rounded-lg shadow-xl max-w-md w-full p-6 border border-primary/20">
              <h3 className="text-2xl font-bold text-primary mb-4">
                Cancelar Pedido
              </h3>
              
              <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded">
                <p className="text-yellow-400 font-semibold mb-2">
                  ¿Estás seguro de cancelar este pedido?
                </p>
                <p className="text-accent text-sm">
                  Pedido: <span className="text-primary font-semibold">{ordenACancelar?.numeroOrden}</span>
                </p>
                <p className="text-accent text-sm">
                  Total: <span className="text-primary font-semibold">${ordenACancelar?.total.toLocaleString()}</span>
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-accent font-semibold mb-2">
                  Motivo de cancelación (opcional)
                </label>
                <textarea
                  value={motivoCancelacion}
                  onChange={(e) => setMotivoCancelacion(e.target.value)}
                  className="w-full px-3 py-2 bg-fondo border border-primary/30 rounded-lg focus:outline-none focus:border-primary text-white resize-none"
                  rows="3"
                  placeholder="Ej: Cambio de opinión, demora en entrega, etc."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMostrarModalCancelar(false);
                    setOrdenACancelar(null);
                    setMotivoCancelacion("");
                  }}
                  className="flex-1 bg-fondo/50 border border-primary/30 text-accent py-2 rounded-lg font-semibold hover:bg-fondo/70 transition"
                >
                  No, Mantener Pedido
                </button>
                <button
                  onClick={handleCancelarOrden}
                  className="flex-1 bg-red-900/30 text-red-400 border border-red-500/50 py-2 rounded-lg font-semibold hover:bg-red-900/50 transition"
                >
                  Sí, Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
