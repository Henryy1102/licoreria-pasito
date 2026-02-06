import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useClientStore } from "../store/clientStore";
import { useOrderStore } from "../store/orderStore";
import { usePaymentStore } from "../store/paymentStore";
import GoogleMapsLocation from "../components/GoogleMapsLocation";
import { actualizarUsuario } from "../services/userService";

export default function Checkout() {
  const navigate = useNavigate();
  const { carrito, limpiarCarrito } = useCartStore();
  const { user } = useAuthStore();
  const { cliente, obtenerCliente } = useClientStore();
  const { crearOrden, cargando, error: errorOrden } = useOrderStore();
  const { settings, obtenerSettings } = usePaymentStore();

  const [paso, setPaso] = useState(1); // 1: Carrito, 2: Facturación, 3: Ubicación, 4: Pago
  const [error, setError] = useState("");
  const [requiereFactura, setRequiereFactura] = useState(null); // null: no seleccionado, true: factura, false: consumidor final
  const [ubicacion, setUbicacion] = useState({
    link: "",
    latitud: null,
    longitud: null,
    direccion: "",
  });
  const [datosFacturacion, setDatosFacturacion] = useState({
    tipoIdentificacion: user?.datosFacturacion?.tipoIdentificacion || "",
    numeroIdentificacion: user?.datosFacturacion?.numeroIdentificacion || "",
    razonSocial: user?.datosFacturacion?.razonSocial || user?.nombre || "",
    direccion: user?.datosFacturacion?.direccion || "",
    telefono: user?.datosFacturacion?.telefono || user?.telefono || "",
    correo: user?.datosFacturacion?.correo || user?.email || "",
  });
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [notas, setNotas] = useState("");
  const [comprobante, setComprobante] = useState(null);

  // Handler para ubicación con logging
  const handleUbicacionSelect = (location) => {
    console.log("🗺️ Ubicación seleccionada en Checkout:", location);
    setUbicacion(location);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setDatosFacturacion((prev) => ({
      ...prev,
      tipoIdentificacion: user?.datosFacturacion?.tipoIdentificacion || prev.tipoIdentificacion,
      numeroIdentificacion: user?.datosFacturacion?.numeroIdentificacion || prev.numeroIdentificacion,
      razonSocial: user?.datosFacturacion?.razonSocial || user?.nombre || prev.razonSocial,
      direccion: user?.datosFacturacion?.direccion || prev.direccion,
      telefono: user?.datosFacturacion?.telefono || user?.telefono || prev.telefono,
      correo: user?.datosFacturacion?.correo || user?.email || prev.correo,
    }));

    const prepararCliente = async () => {
      try {
        setError("");
        const userId = user?._id || user?.id;
        if (!userId) return;

        try {
          await obtenerCliente(userId);
        } catch (err) {
          // Si no existe cliente, el backend lo creará al confirmar la orden
          if (err?.response?.status === 404 || err?.message?.includes("404")) {
            return;
          }
          throw err;
        }
      } catch (err) {
        console.error("Error preparando cliente:", err);
        setError("Error al cargar los datos del cliente");
      }
    };

    // Obtener settings de pago
    const cargarSettings = async () => {
      try {
        await obtenerSettings();
      } catch (err) {
        console.error("Error cargando settings de pago:", err);
      }
    };

    prepararCliente();
    cargarSettings();

  }, [user, navigate, obtenerCliente, obtenerSettings]);

  if (carrito.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Carrito Vacío</h1>
          <p className="text-gray-600 mb-8">Agrega productos antes de continuar</p>
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

  const calcularSubtotal = () => {
    return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
  };

  const subtotal = calcularSubtotal();
  const total = subtotal;

  const handleCrearOrden = async () => {
    if (paso === 1) {
      setPaso(2);
      return;
    }

    if (paso === 2) {
      // Si es consumidor final, pasar al paso 3 sin validar
      if (requiereFactura === false) {
        setPaso(3);
        return;
      }

      // Si requiere factura, validar datos de facturación
      if (requiereFactura === true) {
        if (!datosFacturacion.tipoIdentificacion || !datosFacturacion.numeroIdentificacion || !datosFacturacion.razonSocial || !datosFacturacion.direccion || !datosFacturacion.telefono || !datosFacturacion.correo) {
          setError("Completa todos los datos de facturación");
          return;
        }

        try {
          const userId = user?._id || user?.id;
          if (userId) {
            const actualizado = await actualizarUsuario(userId, {
              datosFacturacion,
            });
            const updatedUser = { ...user, ...actualizado };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            useAuthStore.setState({ user: updatedUser });
          }
        } catch (err) {
          console.error("Error al actualizar datos de facturación:", err);
          setError("No se pudieron guardar los datos de facturación");
          return;
        }

        setPaso(3);
        return;
      }

      // Si no seleccionó ninguna opción
      setError("Selecciona si necesitas factura o eres consumidor final");
      return;
    }

    if (paso === 3) {
      // Validar ubicación - ahora solo validamos que tenga el link
      if (!ubicacion || !ubicacion.link || ubicacion.link.trim() === "") {
        setError("Por favor pega tu link de ubicación de Google Maps");
        return;
      }
      
      setPaso(4);
      return;
    }

    if (paso === 4) {
      try {
        setError("");

        // Validar comprobante si es transferencia
        if (metodoPago === "transferencia" && !comprobante) {
          setError("Por favor sube el comprobante de tu transferencia");
          return;
        }

        const productos = carrito.map((item) => ({
          productoId: item._id,
          cantidad: item.cantidad,
        }));

        // Validar que ubicación tiene link
        if (!ubicacion || !ubicacion.link || ubicacion.link.trim() === "") {
          setError("Por favor pega tu link de ubicación de Google Maps antes de confirmar");
          return;
        }

        const ordenData = {
          clienteId: cliente?._id,
          productos,
          impuesto: 0,
          metodoPago,
          ubicacion,
          requiereFactura: requiereFactura === true,
          datosFacturacion: requiereFactura ? datosFacturacion : null, // Solo enviar si requiere factura
          notas,
          comprobante: comprobante ? {
            base64: comprobante.data,
            nombre: comprobante.nombre,
          } : null,
        };
        
        console.log("📤 Orden enviada al backend:", ordenData);

        const resultado = await crearOrden(ordenData);

        // Limpiar carrito y redirigir
        limpiarCarrito();
        navigate(`/orden-confirmacion/${resultado.orden._id}`);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-fondo">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Checkout</h1>
          <p className="text-accent">
            Paso {paso} de 4: {paso === 1 && "Resumen del Carrito"}{paso === 2 && "Datos de Facturación"}
            {paso === 3 && "Ubicación de Entrega"}
            {paso === 4 && "Método de Pago"}
          </p>
        </div>

        {/* Errores */}
        {(error || errorOrden) && (
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error || errorOrden}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="md:col-span-2">
            {/* Paso 1: Confirmación del Carrito */}
            {paso === 1 && (
              <div className="bg-secondary rounded-lg shadow-md p-6 border border-primary/20">
                <h2 className="text-2xl font-bold text-primary mb-6">Resumen del Carrito</h2>

                <div className="space-y-4">
                  {carrito.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center pb-4 border-b border-primary/20"
                    >
                      <div className="flex items-center gap-4">
                        {item.imagen && (
                          <img
                            src={item.imagen}
                            alt={item.nombre}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-primary">{item.nombre}</p>
                          <p className="text-accent">
                            ${item.precio.toLocaleString()} x {item.cantidad}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-primary">
                        ${(item.precio * item.cantidad).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* Paso 2: Datos de facturación */}
            {paso === 2 && (
              <div className="bg-secondary rounded-lg shadow-md p-6 border border-primary/20">
                <h2 className="text-2xl font-bold text-primary mb-6">¿Necesitas Factura?</h2>

                {/* Selector de tipo */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRequiereFactura(false)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      requiereFactura === false
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-primary/20 hover:border-amber-500/50"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">🧾</div>
                      <h3 className="text-xl font-bold text-primary mb-2">Consumidor Final</h3>
                      <p className="text-accent text-sm">No necesito factura</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequiereFactura(true)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      requiereFactura === true
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-primary/20 hover:border-amber-500/50"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">📄</div>
                      <h3 className="text-xl font-bold text-primary mb-2">Factura</h3>
                      <p className="text-accent text-sm">Necesito factura electrónica</p>
                    </div>
                  </button>
                </div>

                {/* Formulario de facturación - solo si requiere factura */}
                {requiereFactura === true && (
                  <div className="border-t border-primary/20 pt-6">
                    <h3 className="text-lg font-semibold text-primary mb-4">Datos de Facturación</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-accent font-semibold mb-2">Tipo de Identificación *</label>
                        <select
                          className="input"
                          value={datosFacturacion.tipoIdentificacion}
                          onChange={(e) =>
                            setDatosFacturacion({
                              ...datosFacturacion,
                              tipoIdentificacion: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Selecciona</option>
                          <option value="RUC">RUC</option>
                          <option value="CEDULA">Cédula</option>
                          <option value="PASAPORTE">Pasaporte</option>
                          <option value="NIT">NIT</option>
                          <option value="DUI">DUI</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-accent font-semibold mb-2">Número de Identificación *</label>
                        <input
                          type="text"
                          className="input"
                          value={datosFacturacion.numeroIdentificacion}
                          onChange={(e) =>
                            setDatosFacturacion({
                              ...datosFacturacion,
                              numeroIdentificacion: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-accent font-semibold mb-2">Nombre del Cliente *</label>
                        <input
                          type="text"
                          className="input"
                          value={datosFacturacion.razonSocial}
                          onChange={(e) =>
                            setDatosFacturacion({
                              ...datosFacturacion,
                              razonSocial: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-accent font-semibold mb-2">Dirección *</label>
                        <input
                          type="text"
                          className="input"
                          value={datosFacturacion.direccion}
                          onChange={(e) =>
                            setDatosFacturacion({
                              ...datosFacturacion,
                              direccion: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-accent font-semibold mb-2">Teléfono *</label>
                        <input
                          type="tel"
                          className="input"
                          value={datosFacturacion.telefono}
                          onChange={(e) =>
                            setDatosFacturacion({
                              ...datosFacturacion,
                              telefono: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-accent font-semibold mb-2">Correo Electrónico *</label>
                        <input
                          type="email"
                          className="input"
                          value={datosFacturacion.correo}
                          onChange={(e) =>
                            setDatosFacturacion({
                              ...datosFacturacion,
                              correo: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Paso 3: Ubicación con Google Maps */}
            {paso === 3 && (
              <div className="bg-secondary rounded-lg shadow-md p-6 border border-primary/20">
                <h2 className="text-2xl font-bold text-primary mb-6">📍 Selecciona tu Ubicación de Entrega</h2>

                <GoogleMapsLocation
                  onLocationSelect={handleUbicacionSelect}
                  initialLocation={ubicacion}
                />
              </div>
            )}

            {/* Paso 4: Método de Pago */}
            {paso === 4 && (
              <div className="bg-secondary rounded-lg shadow-md p-6 border border-primary/20">
                <h2 className="text-2xl font-bold text-primary mb-6">Método de Pago</h2>

                <div className="space-y-4">
                  {/* Efectivo */}
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      metodoPago === "efectivo"
                        ? "border-green-500 bg-green-500/10"
                        : "border-primary/30 hover:bg-fondo/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="metodoPago"
                      value="efectivo"
                      checked={metodoPago === "efectivo"}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className="mr-4"
                    />
                    <div>
                      <p className="font-semibold text-primary">💵 Efectivo</p>
                      <p className="text-sm text-accent">Paga al momento de la entrega</p>
                    </div>
                  </label>

                  {/* Transferencia */}
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      metodoPago === "transferencia"
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-primary/30 hover:bg-fondo/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="metodoPago"
                      value="transferencia"
                      checked={metodoPago === "transferencia"}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className="mr-4"
                    />
                    <div>
                      <p className="font-semibold text-primary">🏦 Transferencia</p>
                      <p className="text-sm text-accent">Transferencia bancaria</p>
                    </div>
                  </label>
                </div>

                {/* Mostrar instrucciones según el método */}
                <div className="mt-8 space-y-4">
                  {/* Instrucciones de Efectivo */}
                  {metodoPago === "efectivo" && (
                    <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">💵</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-green-900 text-lg mb-3">
                            Pago en Efectivo
                          </h3>
                          <div className="text-green-800 space-y-2 text-sm">
                            <p>✅ El repartidor llegará a tu domicilio</p>
                            <p>✅ Confirma tu pedido completamente</p>
                            <p>✅ Realiza el pago en ese momento</p>
                            {settings?.instrucciones?.efectivo?.horario && (
                              <p>
                                📅 <span className="font-semibold">Horario disponible:</span>{" "}
                                {settings.instrucciones.efectivo.horario}
                              </p>
                            )}
                            {settings?.contacto?.telefonoAtencion && (
                              <p>
                                ☎️ <span className="font-semibold">Contacto:</span>{""}
                                {settings.contacto.telefonoAtencion}
                              </p>
                            )}
                            {settings?.instrucciones?.efectivo?.descripcion && (
                              <p className="mt-2 italic text-green-700">
                                {settings.instrucciones.efectivo.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Instrucciones de Transferencia */}
                  {metodoPago === "transferencia" && (
                    <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">🏦</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-blue-900 text-lg mb-3">
                            Instrucciones de Transferencia
                          </h3>
                          <div className="text-blue-800 space-y-3 text-sm">
                            {settings?.datosBancarios?.banco ? (
                              <>
                                <div className="bg-white rounded p-3 border border-blue-300">
                                  <p className="text-gray-600">Banco</p>
                                  <p className="font-bold text-lg text-blue-900">
                                    {settings.datosBancarios.banco}
                                  </p>
                                </div>
                                <div className="bg-white rounded p-3 border border-blue-300">
                                  <p className="text-gray-600">Número de Cuenta</p>
                                  <p className="font-mono font-bold text-lg text-blue-900">
                                    {settings.datosBancarios.numeroCuenta}
                                  </p>
                                </div>
                                <div className="bg-white rounded p-3 border border-blue-300">
                                  <p className="text-gray-600">Titular</p>
                                  <p className="font-bold text-blue-900">
                                    {settings.datosBancarios.titular}
                                  </p>
                                </div>
                              </>
                            ) : (
                              <p className="text-blue-700">
                                Los datos bancarios no están disponibles
                              </p>
                            )}
                            <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded p-3">
                              <p className="text-sm font-semibold text-yellow-900">
                                📌 Referencia: Orden #{Date.now().toString().slice(-6)}
                              </p>
                              <p className="text-xs text-yellow-800 mt-1">
                                Incluye esta referencia en tu transferencia
                              </p>
                            </div>
                            {settings?.instrucciones?.transferencia?.tiempoConfirmacion && (
                              <p className="text-blue-700 mt-2">
                                ⏱️ <span className="font-semibold">Tiempo de confirmación:</span>{" "}
                                {settings.instrucciones.transferencia.tiempoConfirmacion}
                              </p>
                            )}
                            {settings?.instrucciones?.transferencia?.descripcion && (
                              <p className="mt-2 italic text-blue-700">
                                {settings.instrucciones.transferencia.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Upload Comprobante */}
                      <div className="mt-6 border-t border-blue-300 pt-6">
                        <h4 className="font-bold text-blue-900 mb-3">📸 Subir Comprobante</h4>
                        <p className="text-sm text-blue-800 mb-3">
                          Por favor, sube una captura o foto de tu comprobante de transferencia para verificación
                        </p>
                        <div className="bg-white rounded-lg border-2 border-dashed border-blue-300 p-4">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Limitar tamaño de archivo a 5MB
                                if (file.size > 5 * 1024 * 1024) {
                                  setError("El archivo es muy grande (máximo 5MB). Por favor comprime la imagen.");
                                  return;
                                }
                                
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  let data = event.target.result;
                                  
                                  // Si es imagen, comprimir
                                  if (file.type.startsWith("image/") && file.type !== "image/pdf") {
                                    const img = new Image();
                                    img.onload = () => {
                                      const canvas = document.createElement("canvas");
                                      let width = img.width;
                                      let height = img.height;
                                      
                                      // Reducir tamaño si es muy grande
                                      if (width > 1200) {
                                        height = (height * 1200) / width;
                                        width = 1200;
                                      }
                                      
                                      canvas.width = width;
                                      canvas.height = height;
                                      const ctx = canvas.getContext("2d");
                                      ctx.drawImage(img, 0, 0, width, height);
                                      
                                      // Convertir a Base64 con compresión
                                      data = canvas.toDataURL("image/jpeg", 0.7);
                                      
                                      setComprobante({
                                        data,
                                        nombre: file.name,
                                      });
                                    };
                                    img.src = event.target.result;
                                  } else {
                                    // Para PDFs, usar directamente
                                    setComprobante({
                                      data,
                                      nombre: file.name,
                                    });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full"
                          />
                          {comprobante && (
                            <div className="mt-3 p-2 bg-green-50 rounded border border-green-300">
                              <p className="text-sm text-green-700">
                                ✅ Archivo seleccionado: {comprobante.nombre}
                              </p>
                            </div>
                          )}
                        </div>
                        {metodoPago === "transferencia" && !comprobante && (
                          <p className="text-sm text-yellow-600 mt-2">⚠️ Debes subir el comprobante para continuar</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 p-4 bg-fondo/30 rounded-lg border border-primary/30">
                  <h3 className="font-semibold text-primary mb-4">Resumen del Pedido</h3>
                  <div className="space-y-2 text-accent">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-primary">
                      <span>Total:</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resumen lateral */}
          <div className="md:col-span-1">
            <div className="bg-secondary rounded-lg shadow-md p-6 sticky top-4 border border-primary/20">
              <h3 className="text-xl font-bold text-primary mb-4">Resumen</h3>



              <div className="border-t-2 border-primary/30 pt-3 mb-6">
                <div className="flex justify-between text-accent mb-1">
                  <span>Subtotal:</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>Total:</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCrearOrden}
                disabled={cargando}
                className="w-full bg-primary text-fondo py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:bg-gray-600 disabled:text-gray-300 mb-3"
              >
                {cargando ? "Procesando..." : paso === 4 ? "Confirmar Pedido" : "Continuar"}
              </button>

              {paso > 1 && (
                <button
                  onClick={() => setPaso(paso - 1)}
                  disabled={cargando}
                  className="w-full bg-fondo/50 text-accent py-2 rounded-lg font-semibold hover:bg-fondo/70 border border-primary/30 disabled:bg-gray-700"
                >
                  Atrás
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
