import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import AdminProducts from "./pages/AdminProducts";
import AdminClients from "./pages/AdminClients";
import AdminAudit from "./pages/AdminAudit";
import AdminSettings from "./pages/AdminSettings";
import AdminPagos from "./pages/AdminPagos";
import AdminReportes from "./pages/AdminReportes";
import Catalog from "./pages/Catalog";
import Cart from "./pages/Cart";
import Account from "./pages/Account";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrdenConfirmacion from "./pages/OrdenConfirmacion";
import MisOrdenes from "./pages/MisOrdenes";
import AdminOrdenes from "./pages/AdminOrdenes";
import Facturas from "./pages/Facturas";

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Componente para redirigir usuarios autenticados
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.rol !== "admin") return <Navigate to="/catalog" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-fondo">
        <Navbar />
        <Routes>
          {/* Página de inicio pública */}
          <Route path="/" element={<Home />} />
          
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          <Route
            path="/reset-password/:token"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/productos"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/clientes"
            element={
              <AdminRoute>
                <AdminClients />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/auditoria"
            element={
              <AdminRoute>
                <AdminAudit />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/configuracion"
            element={
              <AdminRoute>
                <AdminSettings />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/ordenes"
            element={
              <AdminRoute>
                <AdminOrdenes />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/pagos"
            element={
              <AdminRoute>
                <AdminPagos />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/reportes"
            element={
              <AdminRoute>
                <AdminReportes />
              </AdminRoute>
            }
          />


          <Route
            path="/catalog"
            element={
              <ProtectedRoute>
                <Catalog />
              </ProtectedRoute>
            }
          />

          <Route
            path="/product/:id"
            element={
              <ProtectedRoute>
                <ProductDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orden-confirmacion/:ordenId"
            element={
              <ProtectedRoute>
                <OrdenConfirmacion />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orden/:ordenId"
            element={
              <ProtectedRoute>
                <OrdenConfirmacion />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mis-ordenes"
            element={
              <ProtectedRoute>
                <MisOrdenes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/facturas"
            element={
              <ProtectedRoute>
                <Facturas />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
