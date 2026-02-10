import { useState } from "react";

export default function LocationSelector({ onLocationSelect, initialLocation }) {
  const [direccion, setDireccion] = useState(initialLocation?.direccion || "");
  const [referencia, setReferencia] = useState(initialLocation?.referencia || "");
  const [error, setError] = useState("");
  const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);
  const [modoAlternativo, setModoAlternativo] = useState(false);
  const [linkGoogle, setLinkGoogle] = useState(initialLocation?.link || "");

  // Confirmar dirección manual
  const handleConfirmarDireccion = () => {
    setError("");
    
    if (!direccion.trim()) {
      setError("Por favor ingresa tu dirección de entrega");
      return;
    }
    
    if (direccion.trim().length < 10) {
      setError("La dirección debe tener al menos 10 caracteres");
      return;
    }

    onLocationSelect({
      direccion: direccion.trim(),
      referencia: referencia.trim(),
      link: null,
      modoUbicacion: "manual",
    });

    setUbicacionConfirmada(true);
  };

  // Confirmar link de Google Maps
  const handleConfirmarLink = () => {
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
      {/* Modo manual - Dirección de texto */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-lg">
          📝 Ingresa tu Dirección <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Rápido</span>
        </h3>
        <p className="text-sm text-blue-800 mb-4">
          Escribe tu dirección completa incluyendo calle, número y sector
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-2">
              Dirección completa *
            </label>
            <textarea
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej: Calle Principal #123, Apto 4B, Sector Centro, Riobamba"
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-700"
              rows="3"
            />
            <p className="text-xs text-blue-700 mt-1">
              Incluye: Calle, número, apartamento (si aplica), y sector
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-2">
              Referencia adicional (ej: Casa color azul, Junto al supermercado)
            </label>
            <input
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              placeholder="Marca de referencia para el repartidor"
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-700"
            />
          </div>

          {error && !modoAlternativo && (
            <div className="p-3 bg-red-100 border border-red-400 rounded-lg text-sm text-red-700 font-semibold">
              ⚠️ {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleConfirmarDireccion}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            ✅ Confirmar Dirección
          </button>
        </div>

        {ubicacionConfirmada && !modoAlternativo && (
          <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg">
            <p className="text-green-900 font-semibold mb-2">✅ Ubicación confirmada</p>
            <p className="text-sm text-green-800">
              {direccion}
              {referencia ? ` (${referencia})` : ""}
            </p>
          </div>
        )}
      </div>

      {/* Opción alternativa: Link de Google Maps */}
      <button
        type="button"
        onClick={() => {
          setModoAlternativo(!modoAlternativo);
          setError("");
          setUbicacionConfirmada(false);
        }}
        className="w-full text-sm text-blue-600 hover:text-blue-800 font-semibold py-2 flex items-center justify-center gap-2 transition"
      >
        {modoAlternativo ? "✕ Usar dirección manual" : "+ Usar link de Google Maps"}
      </button>

      {modoAlternativo && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
          <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2 text-lg">
            🗺️ Link de Google Maps
          </h3>
          <p className="text-sm text-green-800 mb-4">
            Comparte tu ubicación exacta desde Google Maps
          </p>

          <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-green-900 mb-2">📱 Cómo obtenerlo:</p>
            <ol className="text-xs text-green-800 space-y-2 ml-4 list-decimal">
              <li>Abre <strong>Google Maps</strong></li>
              <li>Busca o navega a tu ubicación</li>
              <li>Haz clic en <strong>"Compartir"</strong></li>
              <li>Copia el link</li>
              <li>Pégalo aquí abajo</li>
            </ol>
          </div>

          <div className="space-y-3">
            <textarea
              value={linkGoogle}
              onChange={(e) => setLinkGoogle(e.target.value)}
              placeholder="Ej: https://maps.google.com/?q=-0.9219,-78.4678"
              className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 bg-white text-gray-700"
              rows="2"
            />

            {error && modoAlternativo && (
              <div className="p-3 bg-red-100 border border-red-400 rounded-lg text-sm text-red-700 font-semibold">
                ⚠️ {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => window.open("https://maps.google.com", "_blank")}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold text-sm"
              >
                🗺️ Abrir Google Maps
              </button>
              <button
                type="button"
                onClick={handleConfirmarLink}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
              >
                ✅ Confirmar Link
              </button>
            </div>
          </div>

          {ubicacionConfirmada && modoAlternativo && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded-lg">
              <p className="text-green-900 font-semibold">✅ Link confirmado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
