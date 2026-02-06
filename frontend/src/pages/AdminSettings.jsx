import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = `${API_BASE}/api/settings`;

export default function AdminSettings() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState({
    datosBancarios: {
      banco: "",
      numeroCuenta: "",
      titular: "",
      activo: true,
    },
    contacto: {
      telefonoDueña: "",
      telefonoAtencion: "",
      email: "",
    },
    instrucciones: {
      efectivo: "",
      transferencia: "",
      tiempoConfirmacion: "",
    },
    nombreEmpresa: "",
    nit: "",
    direccion: "",
    ciudad: "",
    pais: "",
    logo: "",
    horarioAtencion: "",
    diasEntrega: [],
    tiempoEntregaEstimado: "",
  });

  const [diasDisponibles] = useState([
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
    "domingo",
  ]);

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      navigate("/");
      return;
    }
    fetchSettings();
  }, [user, navigate]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      setMessage("Error al cargar configuración: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleMainInputChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleDia = (dia) => {
    setSettings((prev) => ({
      ...prev,
      diasEntrega: prev.diasEntrega.includes(dia)
        ? prev.diasEntrega.filter((d) => d !== dia)
        : [...prev.diasEntrega, dia],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage("✅ Configuración guardada correctamente");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const error = await response.json();
        setMessage("❌ Error al guardar: " + error.message);
      }
    } catch (error) {
      setMessage("❌ Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-fondo flex items-center justify-center">
        <p className="text-accent text-xl">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fondo">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Configuración</h1>
          <p className="text-accent">Gestiona los datos de tu negocio</p>
        </div>

        {/* Mensaje */}
        {message && (
          <div className="mb-6 p-4 bg-secondary border border-primary/20 rounded-lg text-accent">
            {message}
          </div>
        )}

        {/* Formulario */}
        <div className="grid gap-6">
          {/* Datos Bancarios */}
          <div className="bg-secondary p-6 rounded-lg shadow border border-primary/20">
            <h2 className="text-2xl font-bold text-primary mb-4">💳 Datos Bancarios</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-accent font-semibold mb-2">
                  Banco
                </label>
                <input
                  type="text"
                  value={settings.datosBancarios.banco}
                  onChange={(e) =>
                    handleInputChange("datosBancarios", "banco", e.target.value)
                  }
                  className="w-full bg-fondo text-accent border border-primary/30 rounded px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="Ej: Banco Pichincha"
                />
              </div>

              <div>
                <label className="block text-accent font-semibold mb-2">
                  Número de Cuenta
                </label>
                <input
                  type="text"
                  value={settings.datosBancarios.numeroCuenta}
                  onChange={(e) =>
                    handleInputChange(
                      "datosBancarios",
                      "numeroCuenta",
                      e.target.value
                    )
                  }
                  className="w-full bg-fondo text-accent border border-primary/30 rounded px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="Ej: 1234567890"
                />
              </div>

              <div>
                <label className="block text-accent font-semibold mb-2">
                  Titular de Cuenta
                </label>
                <input
                  type="text"
                  value={settings.datosBancarios.titular}
                  onChange={(e) =>
                    handleInputChange(
                      "datosBancarios",
                      "titular",
                      e.target.value
                    )
                  }
                  className="w-full bg-fondo text-accent border border-primary/30 rounded px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="Nombre del titular"
                />
              </div>

              <div>
                <label className="flex items-center text-accent font-semibold">
                  <input
                    type="checkbox"
                    checked={settings.datosBancarios.activo}
                    onChange={(e) =>
                      handleInputChange(
                        "datosBancarios",
                        "activo",
                        e.target.checked
                      )
                    }
                    className="mr-2 w-4 h-4"
                  />
                  Método de pago activo
                </label>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="bg-secondary p-6 rounded-lg shadow border border-primary/20">
            <h2 className="text-2xl font-bold text-primary mb-4">📞 Datos de Contacto</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-accent font-semibold mb-2">
                  Teléfono Dueña
                </label>
                <input
                  type="text"
                  value={settings.contacto.telefonoDueña}
                  onChange={(e) =>
                    handleInputChange("contacto", "telefonoDueña", e.target.value)
                  }
                  className="w-full bg-fondo text-accent border border-primary/30 rounded px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="Ej: +593912345678"
                />
              </div>

              <div>
                <label className="block text-accent font-semibold mb-2">
                  Teléfono Atención al Cliente
                </label>
                <input
                  type="text"
                  value={settings.contacto.telefonoAtencion}
                  onChange={(e) =>
                    handleInputChange(
                      "contacto",
                      "telefonoAtencion",
                      e.target.value
                    )
                  }
                  className="w-full bg-fondo text-accent border border-primary/30 rounded px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="Ej: +593987654321"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-accent font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.contacto.email}
                  onChange={(e) =>
                    handleInputChange("contacto", "email", e.target.value)
                  }
                  className="w-full bg-fondo text-accent border border-primary/30 rounded px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="Ej: contacto@licoreria.com"
                />
              </div>
            </div>
          </div>

          {/* Instrucciones de Pago */}
          <div className="bg-secondary p-6 rounded-lg shadow border border-primary/20">
            <h2 className="text-2xl font-bold text-primary mb-4">
              💬 Instrucciones de Pago
            </h2>

            <div className="grid gap-4">
              <div>
                <label className="block text-accent font-semibold mb-2">
                  Instrucción para Pago en Efectivo
                </label>
                <textarea
                  value={settings.instrucciones.efectivo}
                  onChange={(e) =>
                    handleInputChange("instrucciones", "efectivo", e.target.value)
                  }
                  className="w-full bg-fondo text-accent border border-primary/30 rounded px-3 py-2 focus:outline-none focus:border-primary h-20 resize-none"
                  placeholder="Mensaje mostrado para pago en efectivo"
                />
              </div>

              <div>
                <label className="block text-accent font-semibold mb-2">
                  Instrucción para Transferencia
                </label>
                <textarea
                  value={settings.instrucciones.transferencia}
                  onChange={(e) =>
                    handleInputChange(
                      "instrucciones",
                      "transferencia",
                      e.target.value
                    )
                  }
                  className="w-full bg-fondo text-accent border border-primary/30 rounded px-3 py-2 focus:outline-none focus:border-primary h-20 resize-none"
                  placeholder="Mensaje mostrado para transferencia"
                />
              </div>

              <div>
                <label className="block text-accent font-semibold mb-2">
                  Tiempo de Confirmación
                </label>
                <input
                  type="text"
                  value={settings.instrucciones.tiempoConfirmacion}
                  onChange={(e) =>
                    handleInputChange(
                      "instrucciones",
                      "tiempoConfirmacion",
                      e.target.value
                    )
                  }
                  className="w-full bg-fondo text-accent border border-primary/30 rounded px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="Ej: Se procesará cuando se confirme el pago (máximo 2 horas)"
                />
              </div>
            </div>
          </div>

          {/* Información General */}
          <div className="bg-secondary p-6 rounded-lg shadow border border-primary/20">
            <h2 className="text-2xl font-bold text-primary mb-4">🏪 Información General</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-accent font-semibold mb-2">
                  Nombre de la Empresa
                </label>
                <input
                  type="text"
                  value={settings.nombreEmpresa}
                  onChange={(e) =>
                    handleMainInputChange("nombreEmpresa", e.target.value)
                  }
                  className="w-full bg-fondo text-accent border border-primary/30 rounded px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="Licorería Al Pasito"
                />
              </div>

              <div>
                <label className="block text-accent font-semibold mb-2">
                  NIT
                </label>
                <input
                  type="text"
                  value={settings.nit}
                  onChange={(e) =>
                    handleMainInputChange("nit", e.target.value)
                  }
                  className="w-full bg-fondo text-accent border border-primary/30 rounded px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="1234-567890-123-4"
                />
              </div>

              <div>
                <label className="block text-accent font-semibold mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={settings.direccion}
                  onChange={(e) =>
                    handleMainInputChange("direccion", e.target.value)
                  }
                  className="w-full bg-fondo text-accent border border-primary/30 rounded px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="San Salvador, El Salvador"
                />
              </div>

              <div>
                <label className="block text-accent font-semibold mb-2">
                  Horario de Atención
                </label>
                <input
                  type="text"
                  value={settings.horarioAtencion}
                  onChange={(e) =>
                    handleMainInputChange("horarioAtencion", e.target.value)
                  }
                  className="w-full bg-fondo text-accent border border-primary/30 rounded px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="Ej: 08:00 - 20:00"
                />
              </div>

              <div>
                <label className="block text-accent font-semibold mb-2">
                  Tiempo de Entrega Estimado
                </label>
                <input
                  type="text"
                  value={settings.tiempoEntregaEstimado}
                  onChange={(e) =>
                    handleMainInputChange("tiempoEntregaEstimado", e.target.value)
                  }
                  className="w-full bg-fondo text-accent border border-primary/30 rounded px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="Ej: 30-60 minutos"
                />
              </div>

              <div>
                <label className="block text-accent font-semibold mb-2">
                  Días de Entrega
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {diasDisponibles.map((dia) => (
                    <label
                      key={dia}
                      className="flex items-center text-accent cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={settings.diasEntrega.includes(dia)}
                        onChange={() => toggleDia(dia)}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="capitalize text-sm">{dia}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-fondo px-6 py-3 rounded font-semibold hover:bg-primary/90 transition disabled:bg-primary/50"
            >
              {saving ? "Guardando..." : "💾 Guardar Cambios"}
            </button>
            <button
              onClick={fetchSettings}
              disabled={saving}
              className="bg-accent text-fondo px-6 py-3 rounded font-semibold hover:bg-accent/90 transition"
            >
              🔄 Recargar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
