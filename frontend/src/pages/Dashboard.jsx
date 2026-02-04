import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-fondo">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
        {/* Banner de bienvenida */}
        <div className="bg-secondary border border-slate-700 rounded-card p-8 sm:p-12 mb-8 sm:mb-12">
          <div className="flex items-center gap-4 mb-6">
            <img src="/logo.jpeg" alt="Licorería Al Pasito" className="h-16 sm:h-20 object-contain rounded-lg" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-textMain mb-1">Panel de Control</h1>
              <p className="text-subtext text-sm">Licorería El Pasito</p>
            </div>
          </div>
        </div>
        
        <div className="bg-secondary border border-slate-700 rounded-card p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-textMain">Bienvenido, {user?.nombre}</h2>
          <div className="space-y-2 text-sm">
            <p className="text-subtext">Email: <span className="text-textMain">{user?.email}</span></p>
            <p className="text-subtext">Rol: <span className="text-primary font-medium">{user?.rol}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="card-hover group cursor-pointer">
            <h3 className="text-lg font-semibold text-textMain mb-3">Productos</h3>
            <p className="text-subtext text-sm mb-6">Gestiona el inventario de productos</p>
            <Link to={user?.rol === "admin" ? "/admin/productos" : "/catalog"} className="inline-block bg-primary/10 text-primary px-5 py-2.5 rounded-card hover:bg-primary hover:text-fondo font-medium transition-all text-sm border border-primary/20">
              {user?.rol === "admin" ? "Administrar" : "Ver catálogo"}
            </Link>
          </div>

          <div className="card-hover group cursor-pointer">
            <h3 className="text-lg font-semibold text-textMain mb-3">Catálogo</h3>
            <p className="text-subtext text-sm mb-6">Explora nuestros productos</p>
            <Link to="/catalog" className="inline-block bg-primary/10 text-primary px-5 py-2.5 rounded-card hover:bg-primary hover:text-fondo font-medium transition-all text-sm border border-primary/20">
              Ir al catálogo
            </Link>
          </div>

          <div className="card-hover group cursor-pointer">
            <h3 className="text-lg font-semibold text-textMain mb-3">Clientes</h3>
            <p className="text-subtext text-sm mb-6">Administra tus clientes</p>
            <Link to={user?.rol === "admin" ? "/admin/clientes" : "/account"} className="inline-block bg-primary/10 text-primary px-5 py-2.5 rounded-card hover:bg-primary hover:text-fondo font-medium transition-all text-sm border border-primary/20">
              {user?.rol === "admin" ? "Gestionar clientes" : "Mi cuenta"}
            </Link>
          </div>
        </div>

        {user?.rol === "admin" && (
          <div className="mt-10 bg-secondary border border-slate-700 rounded-card p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-textMain mb-2">Panel de Administrador</h3>
            <p className="text-subtext mb-6 text-sm">Funciones exclusivas para administradores</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <Link to="/admin/productos" className="bg-secondary border border-slate-700 hover:border-primary/30 text-textMain px-4 py-3 rounded-card transition-all text-sm font-medium text-center">Productos</Link>
              <Link to="/admin/clientes" className="bg-secondary border border-slate-700 hover:border-primary/30 text-textMain px-4 py-3 rounded-card transition-all text-sm font-medium text-center">Clientes</Link>
              <Link to="/admin/ordenes" className="bg-secondary border border-slate-700 hover:border-primary/30 text-textMain px-4 py-3 rounded-card transition-all text-sm font-medium text-center">Órdenes</Link>
              <Link to="/admin/pagos" className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-card hover:bg-primary/20 transition-all text-sm font-medium text-center">Pagos</Link>
              <Link to="/admin/reportes" className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-card hover:bg-primary/20 transition-all text-sm font-medium text-center">Reportes</Link>
              <Link to="/admin/auditoria" className="bg-secondary border border-slate-700 hover:border-primary/30 text-textMain px-4 py-3 rounded-card transition-all text-sm font-medium text-center">Auditoría</Link>
              <Link to="/admin/configuracion" className="bg-secondary border border-slate-700 hover:border-primary/30 text-textMain px-4 py-3 rounded-card transition-all text-sm font-medium text-center">Configuración</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
