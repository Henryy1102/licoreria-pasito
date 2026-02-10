import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useClientStore } from "../store/clientStore";
import { useOrderStore } from "../store/orderStore";
import { usePaymentStore } from "../store/paymentStore";
import LocationSelector from "../components/LocationSelector";
import { actualizarUsuario } from "../services/userService";

export default function Checkout() {
  const navigate = useNavigate();
  const { carrito, limpiarCarrito } = useCartStore();
  const { user } = useAuthStore();
  const { cliente, obtenerCliente } = useClientStore();
  const { crearOrden, cargando, error: errorOrden } = useOrderStore();
  const { settings, obtenerSettings } = usePaymentStore();

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
    try {
      setError("");

      // Validar que seleccionó factura o no
      if (requiereFactura === null) {
        setError("Selecciona si necesitas factura o eres consumidor final");
        return;
      }

      // Validar datos de facturación si requiere
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
      }

      // Validar ubicación
      if (!ubicacion || (!ubicacion.direccion && !ubicacion.link) || 
          (ubicacion.direccion && ubicacion.direccion.trim() === "") ||
          (ubicacion.link && ubicacion.link.trim() === "")) {
        setError("Por favor ingresa tu ubicación de entrega");
        return;
      }

      // Validar comprobante si es transferencia
      if (metodoPago === "transferencia" && !comprobante) {
        setError("Por favor sube el comprobante de tu transferencia");
        return;
      }

      const productos = carrito.map((item) => ({
        productoId: item._id,
        cantidad: item.cantidad,
      }));

      const ordenData = {
        clienteId: cliente?._id,
        productos,
        impuesto: 0,
        metodoPago,
        ubicacion,
        requiereFactura: requiereFactura === true,
        datosFacturacion: requiereFactura ? datosFacturacion : null,
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
      const errorMsg = err.message || "Error al crear la orden";
      
      // Detectar errores de autenticación
      if (errorMsg.includes("expirado") || errorMsg.includes("sesión") || errorMsg.includes("No estás autenticado")) {
        setError("Tu sesión ha expirado. Redirigiendo a iniciar sesión...");
        setTimeout(() => {
          useAuthStore.getState().logout();
          navigate("/login");
        }, 2000);
      } else {
        setError(errorMsg);
      }
    }
  };

  return (
    <div className="min-h-screen bg-fondo">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Checkout</h1>
          <p className="text-accent">Completa tu pedido en un solo paso</p>
        </div>

        {/* Errores */}
        {(error || errorOrden) && (
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error || errorOrden}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Contenido principal - 3 columnas */}
          <div className="lg:col-span-3">
            {/* Resumen del Carrito */}
            <div className="bg-secondary rounded-lg shadow-md p-6 border border-primary/20 mb-6">
              <h2 className="text-2xl font-bold text-primary mb-6">📦 Resumen del Carrito</h2>

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

            {/* Tipo de Cliente */}
            <div className="bg-secondary rounded-lg shadow-md p-6 border border-primary/20 mb-6">
              <h2 className="text-2xl font-bold text-primary mb-6">¿Necesitas Factura?</h2>

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

            {/* Ubicación de Entrega */}
            <div className="bg-secondary rounded-lg shadow-md p-6 border border-primary/20 mb-6">
              <h2 className="text-2xl font-bold text-primary mb-6">📍 Ubicación de Entrega</h2>

              <LocationSelector
                onLocationSelect={handleUbicacionSelect}
                initialLocation={ubicacion}
              />
            </div>

            {/* Método de Pago */}
            <div className="bg-secondary rounded-lg shadow-md p-6 border border-primary/20">
              <h2 className="text-2xl font-bold text-primary mb-6">Método de Pago</h2>

              <div className="space-y-4 mb-6">
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
                    <h4 className="font-bold text-blue-900 mb-2">📸 Subir Comprobante de Pago</h4>
                    <p className="text-sm text-blue-800 mb-4">
                      📝 Por favor, sube una captura o foto de tu comprobante de transferencia (mostrar: número de referencia, monto, fecha y banco)
                    </p>
                    
                    <div className="bg-white rounded-lg border-3 border-dashed border-blue-300 p-6 hover:bg-blue-50 transition">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📄</div>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const validTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf", "image/webp"];
                              if (!validTypes.includes(file.type)) {
                                setError("Formato no válido. Acepta: JPG, PNG, GIF, PDF");
                                return;
                              }

                              if (file.size > 10 * 1024 * 1024) {
                                setError("El archivo es muy grande (máximo 10MB)");
                                return;
                              }
                              
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                let data = event.target.result;
                                
                                if (file.type.startsWith("image/")) {
                                  const img = new Image();
                                  img.onload = () => {
                                    const canvas = document.createElement("canvas");
                                    let width = img.width;
                                    let height = img.height;
                                    
                                    if (width > 1200) {
                                      height = (height * 1200) / width;
                                      width = 1200;
                                    }
                                    
                                    canvas.width = width;
                                    canvas.height = height;
                                    const ctx = canvas.getContext("2d");
                                    ctx.drawImage(img, 0, 0, width, height);
                                    
                                    data = canvas.toDataURL("image/jpeg", 0.75);
                                    
                                    setComprobante({
                                      data,
                                      nombre: file.name,
                                      tipo: file.type,
                                    });
                                    setError("");
                                  };
                                  img.src = event.target.result;
                                } else {
                                  setComprobante({
                                    data,
                                    nombre: file.name,
                                    tipo: file.type,
                                  });
                                  setError("");
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                          id="comprobante-input"
                        />
                        <label htmlFor="comprobante-input" className="cursor-pointer block">
                          <p className="text-sm font-semibold text-blue-700 mb-2">Haz clic para seleccionar o arrastra un archivo</p>
                          <p className="text-xs text-blue-600">JPG, PNG, GIF o PDF (máx. 10MB)</p>
                        </label>
                      </div>
                      
                      {comprobante && (
                        <div className="mt-4 pt-4 border-t border-blue-300">
                          {comprobante.tipo?.startsWith("image/") ? (
                            <div className="flex gap-4 items-start">
                              <img 
                                src={comprobante.data} 
                                alt="Comprobante" 
                                className="h-20 w-20 object-cover rounded border border-blue-300"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-green-700">✅ Imagen cargada</p>
                                <p className="text-xs text-gray-600 break-all mt-1">{comprobante.nombre}</p>
                                <button
                                  type="button"
                                  onClick={() => setComprobante(null)}
                                  className="text-xs text-red-600 hover:text-red-800 mt-2 font-semibold"
                                >
                                  🗑️ Eliminar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-4 items-start">
                              <div className="h-20 w-20 rounded border border-blue-300 flex items-center justify-center bg-blue-50">
                                <span className="text-2xl">📄</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-green-700">✅ PDF cargado</p>
                                <p className="text-xs text-gray-600 break-all mt-1">{comprobante.nombre}</p>
                                <button
                                  type="button"
                                  onClick={() => setComprobante(null)}
                                  className="text-xs text-red-600 hover:text-red-800 mt-2 font-semibold"
                                >
                                  🗑️ Eliminar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {metodoPago === "transferencia" && !comprobante && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-400 rounded">
                        <p className="text-sm text-yellow-800">
                          <strong>⚠️ Importante:</strong> Debes subir el comprobante para continuar con tu pedido
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-300 rounded text-xs text-blue-800">
                      <p className="font-semibold mb-1">💡 Consejos para tu comprobante:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Asegúrate de que sea legible</li>
                        <li>Incluya número de referencia y fecha</li>
                        <li>Muestre el monto transferido</li>
                        <li>Sea una foto con buena iluminación</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel lateral - Resumen y botón confirmación */}
          <div className="lg:col-span-1">
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
                className="w-full bg-primary text-fondo py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:bg-gray-600 disabled:text-gray-300 mb-3 transition"
              >
                {cargando ? "Procesando..." : "Confirmar Pedido"}
              </button>

              <button
                onClick={() => navigate("/cart")}
                className="w-full bg-fondo/50 text-accent py-2 rounded-lg font-semibold hover:bg-fondo/70 border border-primary/30 transition"
              >
                Volver al Carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
