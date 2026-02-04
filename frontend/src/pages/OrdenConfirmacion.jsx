import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrderStore } from "../store/orderStore";

export default function OrdenConfirmacion() {
  const navigate = useNavigate();
  const { ordenId } = useParams();
  const { ordenActual, obtenerOrden, cargando, error, limpiarOrdenActual } =
    useOrderStore();
  const [imprimiendoCopia, setImprimiendoCopia] = useState(false);

  useEffect(() => {
    const cargarOrden = async () => {
      try {
        await obtenerOrden(ordenId);
      } catch (err) {
        console.error("Error al cargar la orden:", err);
      }
    };

    cargarOrden();

    return () => {
      limpiarOrdenActual();
    };
  }, [ordenId, obtenerOrden, limpiarOrdenActual]);

  const handleImprimirCopia = () => {
    setImprimiendoCopia(true);
    setTimeout(() => {
      window.print();
      setImprimiendoCopia(false);
    }, 100);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando confirmación...</p>
        </div>
      </div>
    );
  }

  if (error || !ordenActual) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-8">{error || "No se encontró la orden"}</p>
          <button
            onClick={() => navigate("/catalog")}
            className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700"
          >
            Volver al Catálogo
          </button>
        </div>
      </div>
    );
  }

  const { numeroOrden, cliente, productos, subtotal, descuento, impuesto, total, estado, metodoPago, direccionEntrega, createdAt } = ordenActual;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-SV", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8 print:bg-white">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Éxito */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 print:hidden">
            <svg
              className="w-8 h-8 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ¡Pedido Confirmado!
          </h1>
          <p className="text-gray-600 mb-4">Gracias por tu compra en Licorería Al Pasito</p>
          <p className="text-2xl font-bold text-amber-600">{numeroOrden}</p>
        </div>

        {/* Estado del pedido */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4 print:mb-2">
            <h2 className="text-xl font-bold text-gray-800">Estado del Pedido</h2>
            <span
              className={`px-4 py-2 rounded-full font-semibold text-sm ${getEstadoColor(
                estado
              )}`}
            >
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Pedido realizado el {formatDate(createdAt)}
          </p>
        </div>

        {/* Información del cliente */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Información del Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 font-semibold">Nombre</p>
              <p className="text-gray-800">{cliente?.nombre || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Email</p>
              <p className="text-gray-800">{cliente?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Teléfono</p>
              <p className="text-gray-800">{cliente?.telefono || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Método de Pago</p>
              <p className="text-gray-800 capitalize">{metodoPago}</p>
            </div>
          </div>
        </div>

        {/* Dirección de envío */}
        {direccionEntrega && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Dirección de Entrega</h2>
            <p className="text-gray-800">
              {direccionEntrega.calle} {direccionEntrega.numero}
              <br />
              {direccionEntrega.ciudad}, {direccionEntrega.departamento}
              <br />
              {direccionEntrega.codigoPostal}
            </p>
          </div>
        )}

        {/* Productos */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Productos</h2>
          <div className="space-y-4">
            {productos.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-start pb-4 border-b border-gray-200 last:border-b-0"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {item.nombre}
                  </p>
                  <p className="text-sm text-gray-600">
                    ${item.precio.toLocaleString()} x {item.cantidad}
                  </p>
                </div>
                <p className="font-semibold text-gray-800">
                  ${item.subtotal.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen de pago */}
        <div className="bg-amber-50 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen de Pago</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            {descuento > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento:</span>
                <span>-${descuento.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>IVA (13%):</span>
              <span>${impuesto.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-amber-200">
              <span>Total a Pagar:</span>
              <span className="text-amber-600">${total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4 print:hidden mb-8">
          <button
            onClick={handleImprimirCopia}
            disabled={imprimiendoCopia}
            className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-400"
          >
            📄 Imprimir Copia
          </button>
          <button
            onClick={() => navigate("/mis-ordenes")}
            className="flex-1 bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700"
          >
            Ver Mis Pedidos
          </button>
        </div>

        {/* Mensaje de información */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
          <p className="text-blue-800 text-sm">
            <strong>📧 Confirmación:</strong> Se ha enviado un resumen de tu pedido al correo{" "}
            <strong>{cliente?.email}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
