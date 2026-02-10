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
  
  const timeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Buscar direcciones con debounce
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

    // Solo buscar si tiene 3+ caracteres
    if (valor.trim().length < 3) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    // Debounce: esperar 300ms después de que el usuario deje de escribir
    setBuscando(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        abortControllerRef.current = new AbortController();

        // API de Nominatim - Totalmente gratis, sin API key
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(valor)}&format=json&limit=7&countrycodes=ec`,
          { signal: abortControllerRef.current.signal }
        );

        if (!response.ok) {
          throw new Error("Error en la búsqueda");
        }

        const data = await response.json();
        console.log("🔍 Resultados rápidos de Nominatim:", data.length);

        if (data.length > 0) {
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
        console.error("Error buscando direcciones:", err);
        setError("No se encontraron resultados. Intenta con otro término.");
        setSugerencias([]);
        setBuscando(false);
      }
    }, 300); // Debounce de 300ms
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
      {/* Búsqueda de dirección con Nominatim - Optimizada */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-lg">
          🔍 Busca tu Dirección <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Rápido</span>
        </h3>
        <p className="text-sm text-blue-800 mb-4">
          Empieza a escribir (mínimo 3 caracteres) y se mostrarán sugerencias
        </p>

        <div className="space-y-3">
          {/* Campo de búsqueda */}
          <div className="relative">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => handleBuscar(e.target.value)}
                placeholder="Ej: Calle Principal, Riobamba..."
                className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-700 font-semibold"
                autoComplete="off"
              />
              {buscando && (
                <div className="flex items-center px-4 py-3 bg-blue-100 rounded-lg">
                  <span className="animate-spin">⏳</span>
                </div>
              )}
            </div>

            {/* Dropdown de sugerencias - Rápido */}
            {mostrarSugerencias && sugerencias.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-blue-300 rounded-lg shadow-2xl z-50 max-h-64 overflow-y-auto">
                {sugerencias.map((sugerencia, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSeleccionar(sugerencia)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-100 border-b border-blue-200 last:border-b-0 transition cursor-pointer active:bg-blue-200"
                  >
                    <p className="text-gray-800 font-semibold text-sm line-clamp-2">
                      {sugerencia.display_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {parseFloat(sugerencia.lat).toFixed(4)}, {parseFloat(sugerencia.lon).toFixed(4)}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Sin resultados */}
            {!buscando && input.trim().length >= 3 && sugerencias.length === 0 && mostrarSugerencias === false && !error && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-3 text-center">
                <p className="text-sm text-gray-600">No se encontraron resultados</p>
              </div>
            )}
          </div>

          {/* Dirección seleccionada */}
          {direccionSeleccionada && (
            <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
              <p className="text-green-900 font-semibold mb-2">✅ Dirección seleccionada</p>
              <p className="text-sm text-green-800 font-mono break-words line-clamp-3">{direccionSeleccionada}</p>
            </div>
          )}

          {/* Referencia adicional */}
          {direccionSeleccionada && (
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                Referencia adicional (opcional)
              </label>
              <input
                type="text"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Ej: Casa color azul, Junto al supermercado"
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-700"
              />
            </div>
          )}

          {/* Errores */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 rounded-lg text-sm text-red-700 font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Créditos de Nominatim */}
          <p className="text-xs text-blue-700 text-center mt-2">
            Datos proporcionados por OpenStreetMap/Nominatim
          </p>
        </div>
      </div>
    </div>
  );
}
