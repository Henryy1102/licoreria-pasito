import { useState } from "react";

export default function LocationSelector({ onLocationSelect, initialLocation }) {
  const [input, setInput] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [error, setError] = useState("");
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(initialLocation?.direccion || "");
  const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);
  const [referencia, setReferencia] = useState(initialLocation?.referencia || "");

  // Buscar direcciones con Nominatim (OpenStreetMap)
  const handleBuscar = async (valor) => {
    setInput(valor);
    setError("");

    if (!valor.trim()) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    try {
      // API de Nominatim - Totalmente gratis, sin API key
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(valor)}&format=json&limit=5&countrycodes=ec`
      );

      if (!response.ok) {
        throw new Error("Error en la búsqueda");
      }

      const data = await response.json();
      console.log("🔍 Sugerencias de Nominatim:", data);

      if (data.length > 0) {
        setSugerencias(data);
        setMostrarSugerencias(true);
      } else {
        setSugerencias([]);
        setMostrarSugerencias(false);
      }
    } catch (err) {
      console.error("Error buscando direcciones:", err);
      setError("Error al buscar direcciones. Intenta de nuevo.");
      setSugerencias([]);
    }
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


  return (
    <div className="space-y-4">
      {/* Búsqueda de dirección con Nominatim */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-lg">
          🔍 Busca tu Dirección <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Presisa</span>
        </h3>
        <p className="text-sm text-blue-800 mb-4">
          Empieza a escribir para ver sugerencias de direcciones
        </p>

        <div className="space-y-3">
          {/* Campo de búsqueda */}
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => handleBuscar(e.target.value)}
              placeholder="Ej: Calle Principal 123, Riobamba..."
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-700 font-semibold"
              autoComplete="off"
            />

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
                    <p className="text-gray-800 font-semibold text-sm line-clamp-2">
                      {sugerencia.display_name}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      📍 {sugerencia.lat}, {sugerencia.lon}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dirección seleccionada */}
          {direccionSeleccionada && (
            <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
              <p className="text-green-900 font-semibold mb-2">✅ Dirección seleccionada</p>
              <p className="text-sm text-green-800 font-mono break-words">{direccionSeleccionada}</p>
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
          <p className="text-xs text-blue-700 text-center mt-4">
            Datos proporcionados por OpenStreetMap/Nominatim
          </p>
        </div>
      </div>
    </div>
  );
}
