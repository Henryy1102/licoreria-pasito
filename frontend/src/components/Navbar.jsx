import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useNotificationStore } from "../store/notificationStore";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items, carrito } = useCartStore();
  const { notificaciones, noLeidas, obtenerNotificaciones, marcarComoLeida } = useNotificationStore();
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  // Cargar notificaciones al inicio y cada minuto
  useEffect(() => {
    if (isAuthenticated) {
      obtenerNotificaciones();
      const interval = setInterval(() => {
        obtenerNotificaciones();
      }, 60000); // Cada minuto
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleNotificationClick = async (notif) => {
    if (!notif.leida) {
      await marcarComoLeida(notif._id);
    }
    setMostrarNotificaciones(false);
    
    if (notif.orden?._id) {
      if (user?.rol === "admin") {
        navigate("/admin/ordenes");
      } else {
        navigate("/mis-ordenes");
      }
    }
  };

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-card block transition-all text-sm font-medium ${isActive ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-secondary/80 text-subtext hover:text-textMain"}`;

  // Variante para los enlaces de cliente (Catálogo, Carrito) que siempre deben verse blancos
  const navLinkClassWhite = ({ isActive }) =>
    `px-4 py-2 rounded-card relative block transition-all text-sm font-medium ${isActive ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-secondary/80 text-textMain"}`;

  return (
    <nav className="bg-secondary border-b border-slate-700 sticky top-0 z-50 backdrop-blur-sm bg-secondary/95">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/logo.jpeg" alt="Licorería Al Pasito" className="h-10 sm:h-11 object-contain rounded" />
            <div className="flex flex-col text-left">
              <span className="text-primary text-sm font-semibold tracking-wide">Licorería</span>
              <span className="text-textMain text-xs font-light tracking-wider">El Pasito</span>
            </div>
          </Link>
        
        {isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Menú desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {user?.rol === "admin" ? (
                <>
                  <NavLink to="/dashboard" className={navLinkClass}>Menú</NavLink>
                  <NavLink to="/admin/productos" className={navLinkClass}>Productos</NavLink>
                  <NavLink to="/admin/clientes" className={navLinkClass}>Clientes</NavLink>
                  <NavLink to="/admin/ordenes" className={navLinkClass}>Órdenes</NavLink>
                  <NavLink to="/admin/pagos" className={navLinkClass}>Pagos</NavLink>
                  <NavLink to="/facturas" className={navLinkClass}>Facturas</NavLink>
                  <NavLink to="/admin/reportes" className={navLinkClass}>Reportes</NavLink>
                  <NavLink to="/admin/auditoria" className={navLinkClass}>Auditoría</NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/catalog" className={navLinkClassWhite}>
                    📚 Catálogo
                  </NavLink>
                  <NavLink to="/cart" className={navLinkClassWhite}>
                    <span className="relative inline-flex items-center">
                      🛒 Carrito
                      {totalItems > 0 && (
                        <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-secondary">
                          {totalItems > 99 ? "99+" : totalItems}
                        </span>
                      )}
                    </span>
                  </NavLink>
                  <NavLink to="/mis-ordenes" className={navLinkClass}>📦 Mis Pedidos</NavLink>
                  <NavLink to="/account" className={navLinkClass}>👤 Mi cuenta</NavLink>
                </>
              )}
            </div>

            {/* Botón de notificaciones */}
            <div className="relative">
              <button
                onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
                className="relative p-2 hover:bg-secondary/80 rounded-card transition-all"
              >
                <span className="text-xl sm:text-2xl">🔔</span>
                {noLeidas > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-fondo text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {noLeidas > 9 ? "9+" : noLeidas}
                  </span>
                )}
              </button>

              {/* Panel de notificaciones */}
              {mostrarNotificaciones && (
                <div className="fixed sm:absolute left-0 right-0 sm:right-0 sm:left-auto mt-2 w-full sm:w-96 bg-secondary border border-slate-700 rounded-card shadow-2xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-slate-700 sticky top-0 bg-secondary">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-semibold text-textMain">Notificaciones</h3>
                      <button 
                        onClick={() => setMostrarNotificaciones(false)}
                        className="sm:hidden text-subtext hover:text-textMain text-xl"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {notificaciones.length === 0 ? (
                    <div className="p-6 text-center text-subtext text-sm">
                      No hay notificaciones
                    </div>
                  ) : (
                    <div>
                      {notificaciones.slice(0, 10).map((notif) => (
                        <div
                          key={notif._id}
                          className={`p-4 border-b border-slate-700 hover:bg-fondo/30 cursor-pointer transition-all ${
                            !notif.leida ? "bg-primary/5" : ""
                          }`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-lg flex-shrink-0">{notif.icono}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm ${!notif.leida ? "text-primary" : "text-textMain"}`}>
                                {notif.titulo}
                              </p>
                              <p className="text-xs text-subtext mt-1 break-words">{notif.mensaje}</p>
                              <p className="text-xs text-subtext/70 mt-1">
                                {new Date(notif.createdAt).toLocaleString("es-SV", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <span className="hidden md:flex text-sm text-subtext items-center gap-2">
              <span className="text-textMain font-medium truncate max-w-[120px]">{user?.nombre}</span>
              {user?.rol === "admin" && <span className="bg-primary/20 text-primary px-2 py-1 rounded-card text-xs font-medium border border-primary/30">Admin</span>}
            </span>
            <button
              onClick={logout}
              className="hidden sm:block bg-secondary border border-slate-700 hover:border-primary/30 text-textMain px-4 py-2 rounded-card transition-all text-sm font-medium"
            >
              Cerrar Sesión
            </button>
            
            {/* Botón hamburguesa para móvil */}
            <button
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
              className="lg:hidden p-2 text-textMain hover:bg-secondary/80 rounded-card transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuMovilAbierto ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="hover:text-primary transition-all text-subtext font-medium text-sm">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="bg-primary text-fondo px-5 py-2 rounded-card hover:bg-primary/90 transition-all font-medium text-sm">
              Registrarse
            </Link>
          </div>
        )}
        </div>

        {/* Menú móvil */}
        {isAuthenticated && menuMovilAbierto && (
          <div className="lg:hidden mt-4 pb-4 border-t border-slate-700 pt-4">
            <div className="flex flex-col space-y-2">
              {user?.rol === "admin" ? (
                <>
                  <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMenuMovilAbierto(false)}>Menú</NavLink>
                  <NavLink to="/admin/productos" className={navLinkClass} onClick={() => setMenuMovilAbierto(false)}>Productos</NavLink>
                  <NavLink to="/admin/clientes" className={navLinkClass} onClick={() => setMenuMovilAbierto(false)}>Clientes</NavLink>
                  <NavLink to="/admin/ordenes" className={navLinkClass} onClick={() => setMenuMovilAbierto(false)}>Órdenes</NavLink>
                  <NavLink to="/admin/pagos" className={navLinkClass} onClick={() => setMenuMovilAbierto(false)}>Pagos</NavLink>
                  <NavLink to="/facturas" className={navLinkClass} onClick={() => setMenuMovilAbierto(false)}>Facturas</NavLink>
                  <NavLink to="/admin/reportes" className={navLinkClass} onClick={() => setMenuMovilAbierto(false)}>Reportes</NavLink>
                  <NavLink to="/admin/auditoria" className={navLinkClass} onClick={() => setMenuMovilAbierto(false)}>Auditoría</NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/catalog" className={navLinkClassWhite} onClick={() => setMenuMovilAbierto(false)}>
                    📚 Catálogo
                  </NavLink>
                  <NavLink to="/cart" className={navLinkClassWhite} onClick={() => setMenuMovilAbierto(false)}>
                    <span className="relative">
                      🛒 Carrito
                      {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {totalItems}
                        </span>
                      )}
                    </span>
                  </NavLink>
                  <NavLink to="/mis-ordenes" className={navLinkClass} onClick={() => setMenuMovilAbierto(false)}>📦 Mis Pedidos</NavLink>
                  <NavLink to="/account" className={navLinkClass} onClick={() => setMenuMovilAbierto(false)}>👤 Mi cuenta</NavLink>
                </>
              )}
              <div className="pt-3 border-t border-slate-700 mt-3">
                <span className="block text-sm text-subtext px-4 py-2">
                  <strong className="text-textMain">{user?.nombre}</strong>
                  {user?.rol === "admin" && <span className="ml-2 bg-primary/20 text-primary px-2 py-1 rounded-card text-xs font-medium border border-primary/30">Admin</span>}
                </span>
                <button
                  onClick={() => { logout(); setMenuMovilAbierto(false); }}
                  className="w-full bg-secondary border border-slate-700 hover:border-primary/30 text-textMain px-4 py-2.5 rounded-card transition-all font-medium text-sm mt-2"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
