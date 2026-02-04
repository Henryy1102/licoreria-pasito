import { useState, useEffect } from "react";

export default function GoogleMapsLocation({ onLocationSelect, initialLocation }) {
  const [linkUbicacion, setLinkUbicacion] = useState(initialLocation?.link || "");
  const [error, setError] = useState("");

  // Enviar ubicación al componente padre cuando cambia el link
  useEffect(() => {
    if (linkUbicacion && linkUbicacion.trim() !== "") {
      // Validar que sea un link de Google Maps (más flexible)
      const esLinkValido = 
        linkUbicacion.includes("google.com/maps") || 
        linkUbicacion.includes("maps.google.com") ||
        linkUbicacion.includes("goo.gl") || 
        linkUbicacion.includes("maps.app.goo.gl");
      
      if (esLinkValido) {
        onLocationSelect({
          link: linkUbicacion,
          latitud: null,
          longitud: null,
          direccion: "Ubicación compartida desde Google Maps",
        });
        setError("");
      } else {
        setError("⚠️ Por favor, pega un link válido de Google Maps");
      }
    }
  }, [linkUbicacion, onLocationSelect]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-accent font-semibold mb-2">
          📍 Tu Ubicación de Entrega
        </label>
        
        <div className="mb-4 p-4 bg-blue-50 border border-blue-300 rounded">
          <p className="text-sm text-gray-700 mb-3">
            <strong>📱 ¿Cómo obtener tu ubicación?</strong>
          </p>
          <ol className="text-xs text-gray-600 space-y-1 ml-4 list-decimal mb-4">
            <li>Abre <strong>Google Maps</strong> en tu celular</li>
            <li>Mantén presionado en el lugar donde estás</li>
            <li>Aparecerá un pin rojo con la ubicación</li>
            <li>Haz clic en <strong>"Compartir"</strong></li>
            <li>Copia el link</li>
            <li>Pégalo aquí abajo ⬇️</li>
          </ol>
          <button
            type="button"
            onClick={() => window.open("https://maps.google.com", "_blank")}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition text-sm"
          >
            🗺️ Abrir Google Maps
          </button>
        </div>

        {/* Campo para pegar el link */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🔗 Pega aquí tu link de ubicación:
          </label>
          <textarea
            value={linkUbicacion}
            onChange={(e) => setLinkUbicacion(e.target.value)}
            placeholder="Ejemplo: https://maps.google.com/?q=-0.9219,-78.4678 o https://goo.gl/maps/abc123"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-700 placeholder-gray-400"
            rows="3"
          />
        </div>

        {/* Mostrar error */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-300 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Confirmación */}
        {linkUbicacion && !error && linkUbicacion.trim() !== "" && (
          <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded">
            <p className="text-sm font-semibold text-green-900 mb-2">✅ Ubicación Recibida</p>
            <p className="text-xs text-gray-700 mb-3">
              El repartidor recibirá este link para encontrarte.
            </p>
            {/* Preview del link */}
            <a
              href={linkUbicacion}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition font-semibold"
            >
              🗺️ Ver mi ubicación
            </a>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
        <p className="text-xs text-yellow-800">
          <strong>💡 Importante:</strong> El link de ubicación es para que el repartidor pueda encontrarte fácilmente. 
          Asegúrate de compartir la ubicación correcta donde quieres recibir tu pedido.
        </p>
      </div>
    </div>
  );
}
