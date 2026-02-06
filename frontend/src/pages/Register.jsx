import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha_nacimiento, setFechaNacimiento] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!nombre || !email || !fecha_nacimiento || !password || !confirmPassword) {
      return;
    }

    if (password.length < 6) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    try {
      await register({ nombre, email, telefono, fecha_nacimiento, password });
      navigate("/catalog");
    } catch (err) {
      console.error("Error al registrar:", err);
    }
  };

  return (
    <div className="min-h-screen bg-fondo flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8">
      <div className="max-w-md w-full bg-secondary rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 border border-primary/20 animate-[fadeIn_0.5s_ease-out]">
        <div className="text-center mb-4 sm:mb-6">
          <img src="/logo.jpeg" alt="Licorería Al Pasito" className="h-16 sm:h-20 mx-auto mb-3 sm:mb-4 object-contain" />
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">Crear Cuenta</h2>
          <p className="text-xs sm:text-sm text-subtext mt-2">Únete a Licorería Al Pasito</p>
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
              Nombre Completo *
            </label>
            <input
              type="text"
              className="input"
              placeholder="Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="mb-3 sm:mb-4">
            <label className="block text-primary font-bold mb-2 text-sm sm:text-base">
              Email *
            </label>
            <input
              type="email"
              className="input"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="mb-3 sm:mb-4">
            <label className="block text-primary font-bold mb-2 text-sm sm:text-base">
              Teléfono
            </label>
            <input
              type="tel"
              className="input"
              placeholder="999 999 999"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="mb-3 sm:mb-4">
            <label className="block text-primary font-bold mb-2 text-sm sm:text-base">
              Fecha de Nacimiento * (Debes ser mayor de 18 años)
            </label>
            <input
              type="date"
              className="input"
              value={fecha_nacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="mb-3 sm:mb-4">
            <label className="block text-primary font-bold mb-2 text-sm sm:text-base">
              Contraseña *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
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

          <div className="mb-4 sm:mb-6">
            <label className="block text-primary font-bold mb-2 text-sm sm:text-base">
              Confirmar Contraseña *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="input pr-10"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl"
                tabIndex={-1}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2.5 sm:py-3 px-4 rounded-lg hover:bg-primary/80 transition disabled:bg-primary/50 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Registrando...
              </>
            ) : (
              "Registrarse"
            )}
          </button>
        </form>

        <p className="text-center text-accent mt-4">
          ¿Ya tienes cuenta?{" "}
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
