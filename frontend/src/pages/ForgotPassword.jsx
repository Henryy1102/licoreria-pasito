import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email) {
      setError("Por favor ingresa tu correo electrónico");
      setLoading(false);
      return;
    }

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
      setEmail("");
      
      // Redirigir a login después de 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-fondo flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-md w-full bg-secondary rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 border border-primary/20 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">¡Correo Enviado!</h2>
          <p className="text-accent mb-6">
            Se ha enviado un enlace de recuperación a tu correo electrónico. 
            Por favor revisa tu bandeja de entrada y sigue las instrucciones.
          </p>
          <p className="text-sm text-subtext">
            Serás redirigido a la página de inicio de sesión en 3 segundos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fondo flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8">
      <div className="max-w-md w-full bg-secondary rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 border border-primary/20">
        <div className="text-center mb-4 sm:mb-6">
          <img src="/logo.jpeg" alt="Licorería Al Pasito" className="h-16 sm:h-20 mx-auto mb-3 sm:mb-4 object-contain" />
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">Recuperar Contraseña</h2>
        </div>

        <p className="text-accent text-center text-sm mb-6">
          Ingresa tu correo electrónico y te enviaremos un enlace para recuperar tu contraseña
        </p>

        {error && (
          <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4 sm:mb-6">
            <label className="block text-primary font-bold mb-2 text-sm sm:text-base">
              Email
            </label>
            <input
              type="email"
              className="input"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2.5 sm:py-3 px-4 rounded-lg hover:bg-primary/80 transition disabled:bg-primary/50 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Enviando...
              </>
            ) : (
              "Enviar Enlace"
            )}
          </button>
        </form>

        <p className="text-center text-accent mt-4 text-sm">
          ¿Ya recuerdas tu contraseña?{" "}
          <Link to="/login" className="text-primary hover:text-subtext font-semibold">
            Inicia sesión aquí
          </Link>
        </p>

        <footer className="text-center mt-6 pt-4 border-t border-primary/20">
          <p className="text-xs text-subtext">
            © 2026 Licorería Al Pasito – Todos los derechos reservados
          </p>
        </footer>
      </div>
    </div>
  );
}
