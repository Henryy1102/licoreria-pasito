import { useState, useEffect, useRef } from "react";

export default function LocationSelector({ onLocationSelect, initialLocation }) {
  const [direccion, setDireccion] = useState(initialLocation?.direccion || "");
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [error, setError] = useState("");
  const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);
  const [latLng, setLatLng] = useState(initialLocation?.latitud && initialLocation?.longitud ? { lat: initialLocation.latitud, lng: initialLocation.longitud } : null);
  const [modoAlternativo, setModoAlternativo] = useState(false);
  const [linkGoogle, setLinkGoogle] = useState(initialLocation?.link || "");
  const inputRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const geocoderRef = useRef(null);

  // Inicializar Google Places Autocomplete y Geocoder
  useEffect(() => {
    if (window.google && window.google.maps) {
      if (window.google.maps.places) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      }
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, []);

  // Manejar búsqueda con autocompletado
  const handleInputChange = (value) => {
    setDireccion(value);
    setUbicacionConfirmada(false);
    setSugerencias([]);
    
    if (!value.trim()) {
      setMostrarSugerencias(false);
      return;
    }

    if (!autocompleteServiceRef.current) {
      console.error("Google Places no está disponible");
      setError("Google Places no está disponible. Recarga la página.");
      return;
    }

    const request = {
      input: value,
      componentRestrictions: { country: 'ec' },
    };

    // Usar callback en lugar de await
    autocompleteServiceRef.current.getPlacePredictions(request, (predictions, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        console.log("📍 Sugerencias obtenidas:", predictions);
        setSugerencias(predictions);
        setMostrarSugerencias(true);
        setError("");
      } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        console.log("Sin resultados");
        setSugerencias([]);
        setMostrarSugerencias(false);
      } else {
        console.error("Error en autocomplete:", status);
        setSugerencias([]);
        setMostrarSugerencias(false);
      }
    });
  };

  // Seleccionar una sugerencia y obtener detalles
  const handleSelectSugerencia = (placeId, descripcion) => {
    setDireccion(descripcion);
    setMostrarSugerencias(false);
    
    console.log("🔍 Obteniendo detalles del lugar:", placeId);

    if (!geocoderRef.current) {
      setError("Geocoder no está disponible");
      return;
    }

    // Usar Geocoder para obtener coordenadas
    geocoderRef.current.geocode({ address: descripcion }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK && results && results.length > 0) {
        const location = results[0].geometry.location;
        const latitud = location.lat();
        const longitud = location.lng();
        
        console.log("✅ Coordenadas obtenidas:", { latitud, longitud });
        
        setLatLng({ lat: latitud, lng: longitud });
        setError("");

        // Enviar al componente padre
        onLocationSelect({
          direccion: results[0].formatted_address || descripcion,
          latitud,
          longitud,
          modoUbicacion: "autocomplete",
        });
        
        setUbicacionConfirmada(true);
      } else {
        console.error("Error al geocodificar:", status);
        setError("No se pudo confirmar la ubicación. Intenta de nuevo.");
      }
    });
  };

  // Modo alternativo: Link de Google Maps
  const handleGoogleMapsLink = () => {
    setError("");
    
    if (!linkGoogle.trim()) {
      setError("Por favor pega un link de Google Maps válido");
      return;
    }

    const esLinkValido = 
      linkGoogle.includes("google.com/maps") || 
      linkGoogle.includes("maps.google.com") ||
      linkGoogle.includes("goo.gl") || 
      linkGoogle.includes("maps.app.goo.gl");
    
    if (!esLinkValido) {
      setError("El link debe ser de Google Maps");
      return;
    }

    onLocationSelect({
      direccion: "Ubicación desde Google Maps",
      link: linkGoogle.trim(),
      modoUbicacion: "google-link",
    });
    
    setUbicacionConfirmada(true);
  };


  return (
    <div className="space-y-4">
      {/* Modo principal: Google Places Autocomplete */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-lg">
          🔍 Google Maps Autocomplete <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Recomendada</span>
        </h3>
        <p className="text-sm text-blue-800 mb-4">
          Empieza a escribir tu dirección y Google sugiere opciones. ¡Muy rápido y preciso!
        </p>

        <div className="space-y-3">
          {/* Campo de entrada con autocomplete */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={direccion}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Ej: Calle Principal 123, Riobamba..."
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-700 font-semibold"
            />
            
            {/* Sugerencias de Google */}
            {mostrarSugerencias && sugerencias.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-blue-300 rounded-lg shadow-2xl z-50 max-h-64 overflow-y-auto">
                {sugerencias.map((suggestion, index) => (
                  <button
                    key={`${suggestion.place_id}-${index}`}
                    type="button"
                    onClick={() => {
                      console.log("🖱️ Seleccionado:", suggestion.description);
                      handleSelectSugerencia(suggestion.place_id, suggestion.description);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-100 border-b border-blue-200 last:border-b-0 transition cursor-pointer"
                  >
                    <p className="text-gray-800 font-semibold text-sm">{suggestion.main_text}</p>
                    <p className="text-xs text-gray-600">{suggestion.secondary_text}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Indicador de posición */}
          {latLng && (
            <div className="p-3 bg-green-50 border border-green-300 rounded-lg flex items-start gap-3">
              <span className="text-xl">📍</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900">Ubicación confirmada</p>
                <p className="text-xs text-green-800 mt-1">{direccion}</p>
                <p className="text-xs text-green-700 mt-1">Coordenadas: {latLng.lat.toFixed(4)}, {latLng.lng.toFixed(4)}</p>
              </div>
              <span className="text-xl">✅</span>
            </div>
          )}
        </div>

        {/* Ventajas */}
        <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 mb-2">✨ Ventajas:</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>✓ 1 solo campo (muy rápido)</li>
            <li>✓ Google sugiere automáticamente</li>
            <li>✓ Dirección validada y precisa</li>
            <li>✓ Captura coordenadas exactas</li>
            <li>✓ Menos errores de tipeo</li>
          </ul>
        </div>
      </div>

      {/* Modo alternativo: Pegar link de Google Maps */}
      <button
        type="button"
        onClick={() => setModoAlternativo(!modoAlternativo)}
        className="w-full text-sm text-blue-600 hover:text-blue-800 font-semibold py-2 flex items-center justify-center gap-2 transition"
      >
        {modoAlternativo ? "✕ Cerrar" : "+ Usar link de Google Maps"}
      </button>

      {modoAlternativo && (
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-6">
          <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
            🗺️ Pegar Link de Google Maps
          </h3>
          <p className="text-sm text-slate-700 mb-4">
            Si prefieres, puedes pegar directamente un link de Google Maps.
          </p>

          <div className="space-y-3">
            <textarea
              value={linkGoogle}
              onChange={(e) => setLinkGoogle(e.target.value)}
              placeholder="Ej: https://maps.google.com/?q=-0.9219,-78.4678"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 bg-white text-gray-700"
              rows="2"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => window.open("https://maps.google.com", "_blank")}
                className="flex-1 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition font-semibold text-sm"
              >
                🗺️ Abrir Google Maps
              </button>
              <button
                type="button"
                onClick={handleGoogleMapsLink}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
              >
                ✅ Confirmar Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Errores */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 rounded-lg text-sm text-red-700 font-semibold">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
