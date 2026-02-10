import { useState, useEffect, useRef } from "react";

export default function LocationSelector({ onLocationSelect, initialLocation }) {
  const [direccion, setDireccion] = useState(initialLocation?.direccion || "");
  const [error, setError] = useState("");
  const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);
  const [latLng, setLatLng] = useState(initialLocation?.latitud && initialLocation?.longitud ? { lat: initialLocation.latitud, lng: initialLocation.longitud } : null);
  const [modoAlternativo, setModoAlternativo] = useState(false);
  const [linkGoogle, setLinkGoogle] = useState(initialLocation?.link || "");
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Inicializar Google Places Autocomplete
  useEffect(() => {
    if (!inputRef.current) return;

    if (window.google && window.google.maps && window.google.maps.places) {
      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ["address"],
          componentRestrictions: { country: "ec" }, // Ecuador
        });

        // Escuchar cambios cuando el usuario selecciona una dirección
        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();

          if (!place.geometry) {
            setError("Por favor selecciona una dirección de las sugerencias");
            return;
          }

          const latitud = place.geometry.location.lat();
          const longitud = place.geometry.location.lng();
          const formattedAddress = place.formatted_address;

          console.log("📍 Ubicación seleccionada:", { latitud, longitud, formattedAddress });

          setDireccion(formattedAddress);
          setLatLng({ lat: latitud, lng: longitud });
          setError("");

          // Enviar al componente padre
          onLocationSelect({
            direccion: formattedAddress,
            latitud,
            longitud,
            modoUbicacion: "autocomplete",
          });

          setUbicacionConfirmada(true);
        });
      } catch (err) {
        console.error("Error inicializando Autocomplete:", err);
        setError("No se pudo inicializar el autocompletado de ubicación");
      }
    } else {
      console.warn("Google Maps no está cargado");
      setError("Google Maps no está disponible");
    }
  }, [onLocationSelect]);

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
          {/* Campo de entrada con autocomplete nativo de Google */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej: Calle Principal 123, Riobamba..."
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-700 font-semibold"
            />
            <p className="text-xs text-blue-600 mt-2">Google sugiere automáticamente mientras escribes ↓</p>
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
