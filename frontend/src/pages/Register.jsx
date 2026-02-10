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
  const [terminosAceptados, setTerminosAceptados] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const validateForm = () => {
    const errors = {};

    if (!nombre.trim()) {
      errors.nombre = "El nombre completo es requerido";
    } else if (nombre.trim().length < 3) {
      errors.nombre = "El nombre debe tener al menos 3 caracteres";
    }

    if (!email.trim()) {
      errors.email = "El email es requerido";
    } else if (!validateEmail(email)) {
      errors.email = "El email no es válido";
    }

    if (!telefono.trim()) {
      errors.telefono = "El teléfono es requerido";
    } else if (!validatePhone(telefono)) {
      errors.telefono = "El teléfono debe tener al menos 10 dígitos";
    }

    if (!fecha_nacimiento) {
      errors.fecha_nacimiento = "La fecha de nacimiento es requerida";
    } else {
      const age = calculateAge(fecha_nacimiento);
      if (age < 18) {
        errors.fecha_nacimiento = "Debes ser mayor de 18 años para registrarte";
      }
    }

    if (!password) {
      errors.password = "La contraseña es requerida";
    } else if (password.length < 8) {
      errors.password = "La contraseña debe tener al menos 8 caracteres";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = "La contraseña debe contener mayúsculas, minúsculas y números";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!terminosAceptados) {
      errors.terminosAceptados = "Debes aceptar los términos y condiciones";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    const errors = validateForm();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await register({ 
        nombre, 
        email, 
        telefono, 
        fecha_nacimiento,
        password 
      });
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
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3 sm:mb-4">
            <label className="block text-primary font-bold mb-2 text-sm sm:text-base">
              Nombre Completo * 
            </label>
            <input
              type="text"
              className={`input ${validationErrors.nombre ? 'border-red-500' : ''}`}
              placeholder="Juan Pérez García"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={loading}
              required
            />
            {validationErrors.nombre && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.nombre}</p>
            )}
          </div>

          <div className="mb-3 sm:mb-4">
            <label className="block text-primary font-bold mb-2 text-sm sm:text-base">
              Email *
            </label>
            <input
              type="email"
              className={`input ${validationErrors.email ? 'border-red-500' : ''}`}
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            {validationErrors.email && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div className="mb-3 sm:mb-4">
            <label className="block text-primary font-bold mb-2 text-sm sm:text-base">
              Teléfono * <span className="text-xs text-subtext">(10 dígitos)</span>
            </label>
            <input
              type="tel"
              className={`input ${validationErrors.telefono ? 'border-red-500' : ''}`}
              placeholder="09 99 999 999"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              disabled={loading}
              required
            />
            {validationErrors.telefono && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.telefono}</p>
            )}
          </div>

          <div className="mb-3 sm:mb-4">
            <label className="block text-primary font-bold mb-2 text-sm sm:text-base">
              Fecha de Nacimiento * 
              <span className="text-xs text-subtext">(Debes ser mayor de 18 años)</span>
            </label>
            <input
              type="date"
              className={`input ${validationErrors.fecha_nacimiento ? 'border-red-500' : ''}`}
              value={fecha_nacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              disabled={loading}
              required
            />
            {validationErrors.fecha_nacimiento && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.fecha_nacimiento}</p>
            )}
          </div>

          <div className="mb-3 sm:mb-4">
            <label className="block text-primary font-bold mb-2 text-sm sm:text-base">
              Contraseña *
              <span className="text-xs text-subtext">(Min. 8 caracteres: mayús, minús, número)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`input pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
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
            {validationErrors.password && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
            )}
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-primary font-bold mb-2 text-sm sm:text-base">
              Confirmar Contraseña *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`input pr-10 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
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
            {validationErrors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={terminosAceptados}
                onChange={(e) => setTerminosAceptados(e.target.checked)}
                disabled={loading}
                className="mt-1"
                required
              />
              <span className="text-xs sm:text-sm text-subtext">
                Acepto los <Link to="#" className="text-primary hover:underline">términos y condiciones</Link> y la <Link to="#" className="text-primary hover:underline">política de privacidad</Link> de Licorería Al Pasito *
              </span>
            </label>
            {validationErrors.terminosAceptados && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.terminosAceptados}</p>
            )}
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
