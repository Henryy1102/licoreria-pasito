import { useState, useRef, useEffect } from "react";

export default function LocationSelector({ onLocationSelect, initialLocation }) {
  const [input, setInput] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [error, setError] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(initialLocation?.direccion || "");
  const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);
  const [referencia, setReferencia] = useState(initialLocation?.referencia || "");
  const [opcionEntrega, setOpcionEntrega] = useState(initialLocation?.direccion ? "entrega" : "retirar"); // 'entrega' o 'retirar'
  
  const timeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  const cacheRef = useRef({}); // Caché de búsquedas

  // Cambiar opción de entrega
  const handleOpcionEntrega = (opcion) => {
    setOpcionEntrega(opcion);
    setError("");
    
    if (opcion === "retirar") {
      // No requiere ubicación para retirar
      setInput("");
      setSugerencias([]);
      setMostrarSugerencias(false);
      setDireccionSeleccionada("");
      setUbicacionConfirmada(true);
      
      // Notificar al padre que es retiro en tienda
      onLocationSelect({
        tipoEntrega: "retirar",
        direccion: "Retiro en tienda",
        latitud: null,
        longitud: null,
        referencia: "",
        modoUbicacion: "retirar",
      });
    } else {
      setUbicacionConfirmada(false);
      setDireccionSeleccionada("");
    }
  };

  // Buscar direcciones - Búsqueda flexible en Riobamba
  const handleBuscar = (valor) => {
    setInput(valor);
    setError("");

    // Cancelar búsquedas previas
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!valor.trim()) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      setBuscando(false);
      return;
    }

    // Solo buscar si tiene 2+ caracteres
    if (valor.trim().length < 2) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    // Debounce: 150ms
    setBuscando(true);
    timeoutRef.current = setTimeout(async () => {
      const searchTerm = valor.trim();

      // Verificar caché
      if (cacheRef.current[searchTerm]) {
        console.log("📦 Resultados del caché");
        setSugerencias(cacheRef.current[searchTerm]);
        setMostrarSugerencias(true);
        setBuscando(false);
        return;
      }

      try {
        abortControllerRef.current = new AbortController();

        // Búsqueda amplia en Ecuador, prioriza Riobamba
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)},Riobamba&format=json&limit=15&countrycodes=ec`,
          { 
            signal: abortControllerRef.current.signal,
            headers: { 'Accept-Language': 'es' }
          }
        );

        if (!response.ok) {
          throw new Error("Error en la búsqueda");
        }

        const data = await response.json();
        console.log("🔍 Búsqueda en Riobamba:", data.length, "resultados");

        // Guardar en caché
        if (data.length > 0) {
          cacheRef.current[searchTerm] = data;
          setSugerencias(data);
          setMostrarSugerencias(true);
        } else {
          setSugerencias([]);
          setMostrarSugerencias(false);
        }
        setBuscando(false);
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("Búsqueda cancelada");
          return;
        }
        console.error("Error buscando:", err);
        setError("No se encontraron resultados");
        setSugerencias([]);
        setBuscando(false);
      }
    }, 150); // Debounce de 150ms
  };

  // Seleccionar una sugerencia
  const handleSeleccionar = (sugerencia) => {
    const direccion = sugerencia.display_name;
    const latitud = parseFloat(sugerencia.lat);
    const longitud = parseFloat(sugerencia.lon);

    console.log("✅ Dirección seleccionada:", { direccion, latitud, longitud });

    setDireccionSeleccionada(direccion);
    setInput("");
    setSugerencias([]);
    setMostrarSugerencias(false);
    setError("");
    setBuscando(false);

    // Enviar al componente padre
    onLocationSelect({
      direccion,
      latitud,
      longitud,
      referencia: referencia.trim(),
      modoUbicacion: "nominatim",
    });

    setUbicacionConfirmada(true);
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);


  return (
    <div className="space-y-4">
      {/* Opciones de Entrega */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Entrega a Domicilio */}
        <button
          onClick={() => handleOpcionEntrega("entrega")}
          className={`p-4 rounded-lg border-2 transition font-semibold flex items-center justify-center gap-2 ${
            opcionEntrega === "entrega"
              ? "border-green-500 bg-green-100 text-green-900"
              : "border-gray-300 bg-gray-50 text-gray-700 hover:border-green-400"
          }`}
        >
          🚗 Entrega a Domicilio
        </button>

        {/* Retirar en Tienda */}
        <button
          onClick={() => handleOpcionEntrega("retirar")}
          className={`p-4 rounded-lg border-2 transition font-semibold flex items-center justify-center gap-2 ${
            opcionEntrega === "retirar"
              ? "border-blue-500 bg-blue-100 text-blue-900"
              : "border-gray-300 bg-gray-50 text-gray-700 hover:border-blue-400"
          }`}
        >
          🏪 Retirar en Tienda
        </button>
      </div>

      {/* Búsqueda de dirección - Solo si selecciona Entrega */}
      {opcionEntrega === "entrega" && (
        <div className="space-y-3">
          {/* Campo de búsqueda */}
          <div className="relative">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => handleBuscar(e.target.value)}
                placeholder="Buscar dirección..."
                className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-700"
                autoComplete="off"
              />
              {buscando && (
                <div className="flex items-center px-4 py-3 bg-blue-100 rounded-lg">
                  <span className="animate-spin">⏳</span>
                </div>
              )}
            </div>

            {/* Dropdown de sugerencias */}
            {mostrarSugerencias && sugerencias.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-blue-300 rounded-lg shadow-2xl z-50 max-h-64 overflow-y-auto">
                {sugerencias.map((sugerencia, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSeleccionar(sugerencia)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-100 border-b border-blue-200 last:border-b-0 transition cursor-pointer"
                  >
                    <p className="text-gray-800 text-sm">{sugerencia.display_name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dirección seleccionada */}
          {direccionSeleccionada && (
            <div className="p-3 bg-green-50 border-2 border-green-300 rounded-lg">
              <p className="text-gray-800 text-sm">{direccionSeleccionada}</p>
            </div>
          )}
        </div>
      )}

      {/* Confirmación de Retiro en Tienda */}
      {opcionEntrega === "retirar" && (
        <div className="p-3 bg-green-50 border-2 border-green-300 rounded-lg">
          <p className="text-gray-800 text-sm">Retiro en tienda</p>
        </div>
      )}
    </div>
  );
}
