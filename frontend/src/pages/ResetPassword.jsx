import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("Token inválido");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Todos los campos son requeridos");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, newPassword, confirmPassword);
      setSuccess(true);
      
      // Redirigir a login después de 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Error al resetear la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-fondo flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-md w-full bg-secondary rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 border border-primary/20 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">¡Listo!</h2>
          <p className="text-accent mb-6">
            Tu contraseña ha sido actualizada correctamente.
          </p>
          <p className="text-sm text-subtext">
            Serás redirigido a la página de inicio de sesión en 2 segundos...
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
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">Nueva Contraseña</h2>
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
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input pr-10"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

          <div className="mb-4 sm:mb-6">
            <label className="block text-primary font-bold mb-2 text-sm sm:text-base">
              Confirmar Contraseña
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className="input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                Procesando...
              </>
            ) : (
              "Actualizar Contraseña"
            )}
          </button>
        </form>

        <p className="text-center text-accent mt-4 text-sm">
          <Link to="/login" className="text-primary hover:text-subtext font-semibold">
            Volver a iniciar sesión
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
