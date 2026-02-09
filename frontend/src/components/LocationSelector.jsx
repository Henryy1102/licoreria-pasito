import { useState } from "react";

export default function LocationSelector({ onLocationSelect, initialLocation }) {
  const [inputMode, setInputMode] = useState("simple"); // "simple" o "google"
  const [direccion, setDireccion] = useState(initialLocation?.direccion || "");
  const [referencia, setReferencia] = useState(initialLocation?.referencia || "");
  const [linkGoogle, setLinkGoogle] = useState(initialLocation?.link || "");
  const [error, setError] = useState("");

  const handleSimpleSubmit = () => {
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
      modoUbicacion: "simple",
    });
  };

  const handleGoogleSubmit = () => {
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
      direccion: "Ubicación compartida desde Google Maps",
      referencia: "",
      link: linkGoogle.trim(),
      modoUbicacion: "google",
    });
  };

  return (
    <div className="space-y-4">
      {/* Selector de modo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => {
            setInputMode("simple");
            setError("");
          }}
          className={`p-4 rounded-lg border-2 transition-all ${
            inputMode === "simple"
              ? "border-green-500 bg-green-500/10"
              : "border-slate-700 hover:border-green-500/50 bg-fondo"
          }`}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">📝</div>
            <h3 className="font-bold text-primary mb-1">Ingreso Manual</h3>
            <p className="text-xs text-subtext">Rápido y simple</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setInputMode("google");
            setError("");
          }}
          className={`p-4 rounded-lg border-2 transition-all ${
            inputMode === "google"
              ? "border-blue-500 bg-blue-500/10"
              : "border-slate-700 hover:border-blue-500/50 bg-fondo"
          }`}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">🗺️</div>
            <h3 className="font-bold text-primary mb-1">Google Maps</h3>
            <p className="text-xs text-subtext">Más preciso</p>
          </div>
        </button>
      </div>

      {/* Modo Simple */}
      {inputMode === "simple" && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-6">
          <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
            📝 Ingresa tu Dirección de Entrega
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-green-900 mb-2">
                Dirección completa *
              </label>
              <textarea
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ej: Calle Principal #123, Apto 4B, Sector Centro, Riobamba"
                className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:border-green-500 bg-white text-gray-700"
                rows="3"
              />
              <p className="text-xs text-green-700 mt-1">
                Incluye: Calle, número, apartamento (si aplica), y referencia del sector
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-green-900 mb-2">
                Referencia adicional (ej: "Casa color azul", "Junto al supermercado")
              </label>
              <input
                type="text"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Marca de referencia para el repartidor"
                className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:border-green-500 bg-white text-gray-700"
              />
            </div>

            {error && inputMode === "simple" && (
              <div className="p-3 bg-red-100 border border-red-400 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSimpleSubmit}
              className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              ✅ Confirmar Dirección
            </button>
          </div>

          <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded text-xs text-green-800">
            <p className="font-semibold mb-1">💡 Ventaja:</p>
            <p>✓ Muy rápido de llenar</p>
            <p>✓ Sin necesidad de aplicaciones externas</p>
          </div>
        </div>
      )}

      {/* Modo Google Maps */}
      {inputMode === "google" && (
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
            🗺️ Ubicación desde Google Maps
          </h3>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">📱 Cómo obtener tu ubicación:</p>
            <ol className="text-xs text-blue-800 space-y-2 ml-4 list-decimal">
              <li>Abre <strong>Google Maps</strong></li>
              <li>Busca o navega a tu ubicación</li>
              <li>Mantén presionado en el punto exacto</li>
              <li>Haz clic en <strong>"Compartir"</strong></li>
              <li>Copia el link</li>
              <li>Pégalo aquí abajo</li>
            </ol>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                Link de Google Maps *
              </label>
              <textarea
                value={linkGoogle}
                onChange={(e) => setLinkGoogle(e.target.value)}
                placeholder="Ej: https://maps.google.com/?q=-0.9219,-78.4678 o https://goo.gl/maps/abc123"
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-700"
                rows="3"
              />
            </div>

            {error && inputMode === "google" && (
              <div className="p-3 bg-red-100 border border-red-400 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => window.open("https://maps.google.com", "_blank")}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
              >
                🗺️ Abrir Google Maps
              </button>
              <button
                type="button"
                onClick={handleGoogleSubmit}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                ✅ Confirmar Link
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-100 border border-blue-400 rounded text-xs text-blue-800">
            <p className="font-semibold mb-1">💡 Ventaja:</p>
            <p>✓ Ubicación más precisa</p>
            <p>✓ El repartidor ve exactamente dónde es</p>
          </div>
        </div>
      )}

      {/* Confirmación visual */}
      {(direccion || linkGoogle) && !error && (
        <div className="p-4 bg-green-50 border border-green-400 rounded-lg">
          <p className="text-green-900 font-semibold mb-2">✅ Ubicación confirmada</p>
          <p className="text-sm text-green-800">
            {inputMode === "simple" 
              ? `${direccion}${referencia ? ` (${referencia})` : ""}`
              : "Link de Google Maps proporcionado"}
          </p>
        </div>
      )}
    </div>
  );
}
