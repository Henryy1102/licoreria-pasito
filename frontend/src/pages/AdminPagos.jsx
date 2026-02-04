import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { usePaymentStore } from "../store/paymentStore";
import { useOrderStore } from "../store/orderStore";

export default function AdminPagos() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { obtenerResumenPagos, confirmarPago, rechazarPago, resumenPagos, cargando } = usePaymentStore();
  const { ordenes, obtenerOrdenes } = useOrderStore();
  
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [mostrarFormConfirmar, setMostrarFormConfirmar] = useState(null);
  const [notasConfirm, setNotasConfirm] = useState("");
  const [actualizando, setActualizando] = useState(false);
  const [ordenesTransferencia, setOrdenesTransferencia] = useState([]);
  const [pestaña, setPestaña] = useState("resumen"); // resumen, transferencias
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const REFRESH_MS = 15000; // 15s

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      navigate("/");
      return;
    }

    cargarResumen();
    cargarTransferenciasC();
  }, [user, navigate]);

  // Auto-actualización por polling
  useEffect(() => {
    if (!user || user.rol !== "admin") return;
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      // Actualiza según la pestaña para evitar trabajo innecesario
      if (pestaña === "transferencias") {
        await cargarTransferenciasC();
      }
      await cargarResumen();
      setLastUpdated(new Date());
    }, REFRESH_MS);

    return () => clearInterval(interval);
  }, [user, autoRefresh, pestaña, fechaInicio, fechaFin]);

  const cargarResumen = async () => {
    try {
      await obtenerResumenPagos(fechaInicio || null, fechaFin || null);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error al cargar resumen:", error);
    }
  };

  const cargarTransferenciasC = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/orders/transferencia/pendiente", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("📊 Transferencias cargadas:", data);
        data.forEach((orden, idx) => {
          console.log(`Orden ${idx + 1} - ubicacion:`, orden.ubicacion);
        });
        setOrdenesTransferencia(data);
        setLastUpdated(new Date());
        return true;
      } else {
        console.error("Error cargando transferencias:", response.status);
        return false;
      }
    } catch (error) {
      console.error("Error al cargar transferencias:", error);
      return false;
    }
  };

  const handleConfirmarTransferencia = async (ordenId) => {
    setActualizando(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4000/api/orders/${ordenId}/confirmar-transferencia`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notas: notasConfirm }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Transferencia confirmada:", result);
        
        // Resetear formulario
        setMostrarFormConfirmar(null);
        setNotasConfirm("");
        
        // Recargar datos y esperar a que se complete
        await new Promise(resolve => setTimeout(resolve, 500)); // Pequeño delay para asegurar que el backend procesó
        await cargarTransferenciasC();
        await cargarResumen();
        setLastUpdated(new Date());
      } else {
        const error = await response.json();
        console.error("Error en confirmación:", error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setActualizando(false);
    }
  };

  const handleRechazarTransferencia = async (ordenId) => {
    if (!window.confirm("¿Confirma que desea rechazar esta transferencia?")) return;

    setActualizando(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4000/api/orders/${ordenId}/rechazar-transferencia`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notas: "Comprobante rechazado" }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("❌ Transferencia rechazada:", result);
        
        // Recargar datos
        await new Promise(resolve => setTimeout(resolve, 500));
        await cargarTransferenciasC();
        await cargarResumen();
        setLastUpdated(new Date());
      } else {
        const error = await response.json();
        console.error("Error:", error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setActualizando(false);
    }
  };

  const handleConfirmarPago = async (ordenId) => {
    setActualizando(true);
    try {
      await confirmarPago(ordenId, notasConfirm);
      setMostrarFormConfirmar(null);
      setNotasConfirm("");
      await cargarResumen();
      await cargarTransferenciasC(); // Recargar transferencias pendientes
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setActualizando(false);
    }
  };

  const handleRechazarPago = async (ordenId, motivo) => {
    if (confirm("¿Estás seguro de rechazar este pago?")) {
      setActualizando(true);
      try {
        await rechazarPago(ordenId, motivo);
        await cargarResumen();
        await cargarTransferenciasC(); // Recargar transferencias pendientes
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setActualizando(false);
      }
    }
  };

  if (cargando && !resumenPagos) {
    return (
      <div className="min-h-screen bg-fondo flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-accent">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fondo">
      <div className="container mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="mb-8 flex items-center gap-4">
          <img src="/logo.jpeg" alt="Licorería Al Pasito" className="h-14 object-contain" />
          <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Gestión de Pagos</h1>
            <p className="text-accent">
              Panel para confirmar y rechazar pagos de órdenes
            </p>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex gap-4 mb-6 items-center flex-wrap">
          <button
            onClick={() => setPestaña("resumen")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              pestaña === "resumen"
                ? "bg-primary text-fondo"
                : "bg-secondary text-accent border border-primary/20 hover:bg-secondary/80"
            }`}
          >
            📊 Resumen de Pagos
          </button>
          <button
            onClick={() => setPestaña("transferencias")}
            className={`px-6 py-2 rounded-lg font-semibold transition relative ${
              pestaña === "transferencias"
                ? "bg-primary text-fondo"
                : "bg-secondary text-accent border border-primary/20 hover:bg-secondary/80"
            }`}
          >
            💳 Transferencias Pendientes
            {ordenesTransferencia.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {ordenesTransferencia.length}
              </span>
            )}
          </button>

          {/* Auto-actualización toggle + última actualización */}
          <div className="flex items-center gap-3 ml-auto">
            <label className="flex items-center gap-2 text-accent text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-actualizar cada {Math.floor(REFRESH_MS / 1000)}s
            </label>
            <span className="text-xs text-accent/70">
              {lastUpdated ? `Actualizado: ${new Date(lastUpdated).toLocaleTimeString("es-SV")}` : ""}
            </span>
          </div>
        </div>

        {/* Contenido por pestaña */}
        {pestaña === "resumen" && (
          <>
            <h3 className="text-lg font-semibold text-primary mb-4">Filtrar por Fecha</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-accent font-semibold mb-2">Desde</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="px-3 py-2 bg-fondo border border-primary/30 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-accent font-semibold mb-2">Hasta</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="px-3 py-2 bg-fondo border border-primary/30 rounded-lg text-white"
                />
              </div>
              <button
                onClick={cargarResumen}
                className="bg-primary text-fondo px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition mt-6"
              >
                Buscar
              </button>
              <button
                onClick={() => {
                  setFechaInicio("");
                  setFechaFin("");
                }}
                className="bg-fondo/50 border border-primary/30 text-accent px-6 py-2 rounded-lg font-semibold hover:bg-fondo/70 transition mt-6"
              >
                Limpiar
              </button>
            </div>

            {/* Resumen */}
            {resumenPagos && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-secondary rounded-lg shadow-md p-6 border border-yellow-500/20">
                <p className="text-accent font-semibold text-sm">Pendientes de Pago</p>
                <p className="text-3xl font-bold text-yellow-500 mt-2">
                  {resumenPagos.pendientes}
                </p>
              </div>
              <div className="bg-secondary rounded-lg shadow-md p-6 border border-green-500/20">
                <p className="text-accent font-semibold text-sm">Pagos Confirmados</p>
                <p className="text-3xl font-bold text-green-500 mt-2">
                  {resumenPagos.confirmados}
                </p>
              </div>
              <div className="bg-secondary rounded-lg shadow-md p-6 border border-red-500/20">
                <p className="text-accent font-semibold text-sm">Pagos Rechazados</p>
                <p className="text-3xl font-bold text-red-500 mt-2">
                  {resumenPagos.rechazados}
                </p>
              </div>
              <div className="bg-secondary rounded-lg shadow-md p-6 border border-primary/20">
                <p className="text-accent font-semibold text-sm">Total Recaudado</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  ${resumenPagos.totalRecaudado?.toLocaleString() || "0"}
                </p>
              </div>
            </div>

            {/* Pagos por método */}
            {resumenPagos.porMetodo && resumenPagos.porMetodo.length > 0 && (
              <div className="bg-secondary rounded-lg shadow-md p-6 mb-8 border border-primary/20">
                <h3 className="text-lg font-semibold text-primary mb-4">Ingresos por Método de Pago</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary/20">
                        <th className="text-left py-3 px-4 text-accent">Método</th>
                        <th className="text-left py-3 px-4 text-accent">Cantidad</th>
                        <th className="text-left py-3 px-4 text-accent">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumenPagos.porMetodo.map((metodo) => (
                        <tr key={metodo._id} className="border-b border-primary/10 hover:bg-fondo/50">
                          <td className="py-3 px-4 text-white capitalize">{metodo._id}</td>
                          <td className="py-3 px-4 text-primary font-semibold">{metodo.cantidad}</td>
                          <td className="py-3 px-4 text-green-500 font-bold">
                            ${metodo.total?.toLocaleString() || "0"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Órdenes pendientes de pago */}
            {resumenPagos.ordenesPendientes && resumenPagos.ordenesPendientes.length > 0 && (
              <div className="bg-secondary rounded-lg shadow-md p-6 border border-primary/20">
                <h3 className="text-lg font-semibold text-primary mb-4">
                  ⏱️ Órdenes Pendientes de Confirmación ({resumenPagos.ordenesPendientes.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary/20">
                        <th className="text-left py-3 px-4 text-accent">Orden</th>
                        <th className="text-left py-3 px-4 text-accent">Cliente</th>
                        <th className="text-left py-3 px-4 text-accent">Método</th>
                        <th className="text-left py-3 px-4 text-accent">Monto</th>
                        <th className="text-left py-3 px-4 text-accent">Fecha</th>
                        <th className="text-center py-3 px-4 text-accent">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumenPagos.ordenesPendientes.map((orden) => (
                        <tr key={orden._id} className="border-b border-primary/10 hover:bg-fondo/50">
                          <td className="py-3 px-4">
                            <span className="text-primary font-semibold">{orden.numeroOrden}</span>
                          </td>
                          <td className="py-3 px-4 text-white">{orden.cliente?.nombre}</td>
                          <td className="py-3 px-4 text-accent capitalize">{orden.metodoPago}</td>
                          <td className="py-3 px-4 text-green-500 font-bold">${orden.total?.toLocaleString()}</td>
                          <td className="py-3 px-4 text-accent text-sm">
                            {new Date(orden.createdAt).toLocaleDateString("es-SV")}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => setMostrarFormConfirmar(orden._id)}
                                className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-500/50 rounded text-sm hover:bg-green-900/50 transition"
                              >
                                ✓ Confirmar
                              </button>
                              <button
                                onClick={() => handleRechazarPago(orden._id, "Rechazo manual")}
                                className="px-3 py-1 bg-red-900/30 text-red-400 border border-red-500/50 rounded text-sm hover:bg-red-900/50 transition"
                              >
                                ✕ Rechazar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
          </>
        )}

        {/* Pestaña Transferencias */}
        {pestaña === "transferencias" && (
          <div className="bg-secondary rounded-lg shadow-md p-6 border border-primary/20">
            <h3 className="text-2xl font-bold text-primary mb-6">
              💳 Transferencias Pendientes de Confirmación
            </h3>

            {ordenesTransferencia.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-accent text-lg">✅ No hay transferencias pendientes de confirmación</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {ordenesTransferencia
                  .filter(orden => !orden.confirmaacionTransferencia?.confirmado) // Filtrar confirmadas
                  .map((orden) => (
                    <div key={orden._id} className="bg-fondo/50 border border-blue-500/30 rounded-lg p-6 hover:border-blue-500/50 transition">
                    {/* Encabezado */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-primary">Orden {orden.numeroOrden}</h4>
                        <p className="text-accent text-sm">
                          Cliente: <span className="text-white font-semibold">{orden.cliente?.nombre}</span>
                        </p>
                        <p className="text-accent text-sm">
                          Fecha: {new Date(orden.createdAt).toLocaleDateString("es-SV")} {new Date(orden.createdAt).toLocaleTimeString("es-SV")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">
                          ${orden.total?.toLocaleString()}
                        </p>
                        <p className="text-accent text-sm">Total de la orden</p>
                      </div>
                    </div>

                    {/* Ubicación de entrega */}
                    {orden.ubicacion && orden.ubicacion.link && (
                      <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded">
                        <p className="text-accent font-semibold mb-3">📍 Ubicación de Entrega:</p>

                        {/* Link para copiar */}
                        <div className="mb-3 p-3 bg-white/10 border border-blue-400/30 rounded">
                          <p className="text-blue-200 text-xs font-semibold mb-2">🔗 Link de Ubicación:</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={orden.ubicacion.link}
                              readOnly
                              className="flex-1 px-3 py-2 border border-gray-400 rounded text-xs bg-gray-700 text-gray-200"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(orden.ubicacion.link);
                              }}
                              className="px-3 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition font-semibold whitespace-nowrap"
                            >
                              📋 Copiar
                            </button>
                          </div>
                        </div>

                        {/* Botón para abrir en Google Maps */}
                        <a
                          href={orden.ubicacion.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold text-sm"
                        >
                          🗺️ Ver Ubicación en Google Maps
                        </a>
                      </div>
                    )}

                    {/* Comprobante */}
                    {orden.comprobante && orden.comprobante.url && (
                      <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
                        <p className="text-accent font-semibold mb-2">📸 Comprobante de Transferencia:</p>
                        <p className="text-white text-sm mb-2">
                          Archivo: <span className="text-yellow-400">{orden.comprobante.nombreArchivo}</span>
                        </p>
                        {orden.comprobante.url.startsWith("data:image") && (
                          <img
                            src={orden.comprobante.url}
                            alt="Comprobante"
                            className="max-w-xs h-auto rounded border border-yellow-500/50 cursor-pointer hover:border-yellow-500"
                            onClick={() => window.open(orden.comprobante.url, "_blank")}
                          />
                        )}
                        {orden.comprobante.url.startsWith("data:application") && (
                          <button
                            onClick={() => window.open(orden.comprobante.url, "_blank")}
                            className="px-4 py-2 bg-yellow-900/30 text-yellow-400 border border-yellow-500/50 rounded hover:bg-yellow-900/50 transition"
                          >
                            📄 Ver PDF
                          </button>
                        )}
                      </div>
                    )}

                    {/* Detalles de productos */}
                    <div className="mb-4 p-3 bg-fondo/80 border border-primary/20 rounded">
                      <p className="text-accent font-semibold mb-2">🛍️ Productos:</p>
                      <ul className="space-y-1">
                        {orden.productos.map((prod, idx) => (
                          <li key={idx} className="text-white text-sm">
                            • {prod.nombre} x {prod.cantidad} = ${(prod.cantidad * prod.precio).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setMostrarFormConfirmar(orden._id)}
                        disabled={actualizando}
                        className="flex-1 px-4 py-2 bg-green-900/30 text-green-400 border border-green-500/50 rounded font-semibold hover:bg-green-900/50 disabled:bg-gray-600 transition"
                      >
                        ✓ Confirmar Transferencia
                      </button>
                      <button
                        onClick={() => handleRechazarTransferencia(orden._id)}
                        disabled={actualizando}
                        className="flex-1 px-4 py-2 bg-red-900/30 text-red-400 border border-red-500/50 rounded font-semibold hover:bg-red-900/50 disabled:bg-gray-600 transition"
                      >
                        ✕ Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {mostrarFormConfirmar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-lg shadow-xl max-w-md w-full p-6 border border-primary/20">
            <h3 className="text-2xl font-bold text-primary mb-4">
              {pestaña === "transferencias" ? "Confirmar Transferencia" : "Confirmar Pago"}
            </h3>
            
            <div className="mb-4">
              <label className="block text-accent font-semibold mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={notasConfirm}
                onChange={(e) => setNotasConfirm(e.target.value)}
                className="w-full px-3 py-2 bg-fondo border border-primary/30 rounded-lg focus:outline-none focus:border-primary text-white resize-none"
                rows="3"
                placeholder="Ej: Pago verificado en cuenta bancaria"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMostrarFormConfirmar(null)}
                className="flex-1 bg-fondo/50 border border-primary/30 text-accent py-2 rounded-lg font-semibold hover:bg-fondo/70 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (pestaña === "transferencias") {
                    handleConfirmarTransferencia(mostrarFormConfirmar);
                  } else {
                    handleConfirmarPago(mostrarFormConfirmar);
                  }
                }}
                disabled={actualizando}
                className="flex-1 bg-green-900/30 text-green-400 border border-green-500/50 py-2 rounded-lg font-semibold hover:bg-green-900/50 disabled:bg-gray-600 transition"
              >
                {actualizando ? "Confirmando..." : (pestaña === "transferencias" ? "Confirmar Transferencia" : "Confirmar Pago")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
