import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      return;
    }

    try {
      await login({ email, password });
      navigate("/catalog");
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
    }
  };

  return (
    <div className="min-h-screen bg-fondo flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8">
      <div className="max-w-md w-full bg-secondary rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 border border-primary/20 animate-[fadeIn_0.5s_ease-out]">
        <div className="text-center mb-4 sm:mb-6">
          <img src="/logo.jpeg" alt="Licorería Al Pasito" className="h-16 sm:h-20 mx-auto mb-3 sm:mb-4 object-contain" />
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">Iniciar Sesión</h2>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3 sm:mb-4">
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

          <div className="mb-3 sm:mb-4">
            <label className="block text-primary font-bold mb-2 text-sm sm:text-base">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl"
                tabIndex={-1}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="mb-4 sm:mb-6 flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="rememberMe" className="ml-2 text-xs sm:text-sm text-white">
              Recordarme
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2.5 sm:py-3 px-4 rounded-lg hover:bg-primary/80 transition disabled:bg-primary/50 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Ingresando...
              </>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>

        <p className="text-center text-accent mt-4">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-primary hover:text-subtext font-semibold">
            Regístrate aquí
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
