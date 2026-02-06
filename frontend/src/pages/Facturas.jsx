import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useInvoiceStore } from "../store/invoiceStore";

export default function Facturas() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    facturas,
    cargando,
    error,
    obtenerFacturas,
    obtenerMisFacturas,
    descargarPDF,
    limpiarError,
  } = useInvoiceStore();

  const [filtroEstado, setFiltroEstado] = useState("");
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Cargar facturas según el rol
    if (user.rol === "admin") {
      obtenerFacturas({ estado: filtroEstado });
    } else {
      obtenerMisFacturas();
    }
  }, [user, navigate, filtroEstado]);

  useEffect(() => {
    if (error) {
      setTimeout(() => limpiarError(), 5000);
    }
  }, [error, limpiarError]);

  const handleDescargarPDF = async (factura) => {
    try {
      await descargarPDF(factura._id, factura.numeroFactura);
    } catch (error) {
      console.error("Error al descargar PDF:", error);
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      emitida: "bg-blue-100 text-blue-800 border-blue-300",
      pagada: "bg-green-100 text-green-800 border-green-300",
      cancelada: "bg-red-100 text-red-800 border-red-300",
      anulada: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colores[estado] || "bg-gray-100 text-gray-800";
  };

  const getEstadoIcono = (estado) => {
    const iconos = {
      emitida: "📄",
      pagada: "✅",
      cancelada: "❌",
      anulada: "🚫",
    };
    return iconos[estado] || "📄";
  };

  if (cargando && facturas.length === 0) {
    return (
      <div className="min-h-screen bg-fondo flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-accent">Cargando facturas...</p>
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
            <h1 className="text-4xl font-bold text-primary mb-2">
              {user?.rol === "admin" ? "Gestión de Facturas" : "Mis Facturas"}
            </h1>
            <p className="text-accent">
              {user?.rol === "admin"
                ? "Administración de facturas del sistema"
                : "Historial de tus facturas emitidas"}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-200 px-4 py-3 rounded mb-6 border border-red-600">
            {error}
          </div>
        )}

        {/* Filtros (solo admin) */}
        {user?.rol === "admin" && (
          <div className="bg-secondary p-6 rounded-lg shadow-md mb-6 border border-primary/20">
            <h3 className="text-lg font-semibold text-primary mb-4">Filtros</h3>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-accent font-semibold mb-2">
                  Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="px-4 py-2 bg-fondo border border-primary/30 rounded-lg text-white"
                >
                  <option value="">Todos</option>
                  <option value="emitida">Emitida</option>
                  <option value="pagada">Pagada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="anulada">Anulada</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Lista de facturas */}
        {facturas.length === 0 ? (
          <div className="bg-secondary p-12 rounded-lg text-center border border-primary/20">
            <p className="text-2xl text-accent mb-2">📭</p>
            <p className="text-accent text-lg">No hay facturas disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {facturas.map((factura) => (
              <div
                key={factura._id}
                className="bg-secondary p-6 rounded-lg shadow-md border border-primary/20 hover:border-primary/40 transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-primary">
                        {factura.numeroFactura}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(
                          factura.estado
                        )}`}
                      >
                        {getEstadoIcono(factura.estado)} {factura.estado.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-accent text-sm mb-1">
                      <span className="font-semibold">Cliente:</span>{" "}
                      {factura.datosFiscales.razonSocial || factura.datosFiscales.nombre}
                    </p>
                    <p className="text-accent text-sm mb-1">
                      <span className="font-semibold">Email:</span>{" "}
                      {factura.datosFiscales.correo || factura.datosFiscales.email}
                    </p>
                    {(factura.datosFiscales.tipoIdentificacion || factura.datosFiscales.numeroIdentificacion || factura.datosFiscales.nit || factura.datosFiscales.dui) && (
                      <p className="text-accent text-sm mb-1">
                        <span className="font-semibold">Identificación:</span>{" "}
                        {(factura.datosFiscales.tipoIdentificacion || "") + " " + (factura.datosFiscales.numeroIdentificacion || factura.datosFiscales.nit || factura.datosFiscales.dui || "")}
                      </p>
                    )}
                    <p className="text-accent text-sm">
                      <span className="font-semibold">Fecha:</span>{" "}
                      {new Date(factura.fechaEmision).toLocaleDateString("es-SV")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-accent text-sm mb-1">Subtotal:</p>
                    <p className="text-white text-lg mb-2">
                      ${factura.subtotal.toFixed(2)}
                    </p>
                    <p className="text-accent text-sm mb-1">IVA (15%):</p>
                    <p className="text-white text-lg mb-2">
                      ${factura.iva.toFixed(2)}
                    </p>
                    <p className="text-primary text-sm font-semibold mb-1">
                      TOTAL:
                    </p>
                    <p className="text-primary text-2xl font-bold">
                      ${factura.total.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[150px]">
                    <button
                      onClick={() =>
                        setFacturaSeleccionada(
                          facturaSeleccionada?._id === factura._id
                            ? null
                            : factura
                        )
                      }
                      className="bg-primary/20 border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary/30 transition font-semibold"
                    >
                      {facturaSeleccionada?._id === factura._id
                        ? "Ocultar"
                        : "Ver Detalles"}
                    </button>
                    <button
                      onClick={() => handleDescargarPDF(factura)}
                      className="bg-primary text-fondo px-4 py-2 rounded-lg hover:bg-primary/90 transition font-semibold"
                    >
                      📥 Descargar PDF
                    </button>
                  </div>
                </div>

                {/* Detalles expandibles */}
                {facturaSeleccionada?._id === factura._id && (
                  <div className="mt-6 pt-6 border-t border-primary/20">
                    <h4 className="text-lg font-bold text-primary mb-4">
                      Productos Facturados
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-primary/20">
                            <th className="text-left py-2 px-3 text-accent text-sm">
                              Producto
                            </th>
                            <th className="text-center py-2 px-3 text-accent text-sm">
                              Cantidad
                            </th>
                            <th className="text-right py-2 px-3 text-accent text-sm">
                              Precio Unit.
                            </th>
                            <th className="text-right py-2 px-3 text-accent text-sm">
                              Subtotal
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {factura.productos.map((producto, index) => (
                            <tr
                              key={index}
                              className="border-b border-primary/10"
                            >
                              <td className="py-2 px-3 text-white">
                                {producto.nombre}
                              </td>
                              <td className="py-2 px-3 text-center text-white">
                                {producto.cantidad}
                              </td>
                              <td className="py-2 px-3 text-right text-white">
                                ${producto.precioUnitario.toFixed(2)}
                              </td>
                              <td className="py-2 px-3 text-right text-primary font-semibold">
                                ${producto.subtotal.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {factura.notas && (
                      <div className="mt-4 p-4 bg-fondo/50 rounded border border-primary/10">
                        <p className="text-accent text-sm font-semibold mb-1">
                          Notas:
                        </p>
                        <p className="text-white text-sm">{factura.notas}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
