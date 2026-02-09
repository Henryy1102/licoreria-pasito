import { useEffect, useState } from "react";
import { useProductStore } from "../store/productStore";
import { useCartStore } from "../store/cartStore";
import { Link } from "react-router-dom";
import productService from "../services/productService";

const CATEGORIAS = ["licor", "snacks", "bebidas sin alcohol", "cigarrillos", "dulces", "extras"];

export default function Catalog() {
  const { products, fetchProducts, loading, error } = useProductStore();
  const { addToCart } = useCartStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [addedProduct, setAddedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [recomendados, setRecomendados] = useState([]);
  const [loadingRecomendados, setLoadingRecomendados] = useState(false);
  const [searchMode, setSearchMode] = useState("nombre"); // "nombre" o "codigo"

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const cargarRecomendados = async () => {
      setLoadingRecomendados(true);
      try {
        const data = await productService.getRecommendations(6);
        setRecomendados(data || []);
      } catch (err) {
        console.error("Error cargando recomendaciones:", err);
      } finally {
        setLoadingRecomendados(false);
      }
    };

    cargarRecomendados();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedProduct(product._id);
    setTimeout(() => setAddedProduct(null), 1500);
  };

  const getCategoryColor = (categoria) => {
    const colors = {
      'licor': 'bg-orange-100 text-orange-800 border-orange-300',
      'bebidas sin alcohol': 'bg-blue-100 text-blue-800 border-blue-300',
      'cigarrillos': 'bg-red-100 text-red-800 border-red-300',
      'snacks': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'dulces': 'bg-pink-100 text-pink-800 border-pink-300',
      'extras': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[categoria?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  let filteredProducts = products.filter((p) => {
    // Búsqueda por nombre o categoría
    const matchesSearchName = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Búsqueda por código
    const matchesSearchCode = p.codigo ? 
      p.codigo.toLowerCase().includes(searchCode.toLowerCase()) : 
      false;
    
    // Si hay búsqueda activa, aplicarla según el modo
    if (searchTerm && searchMode === "nombre") {
      return matchesSearchName;
    }
    if (searchCode && searchMode === "codigo") {
      return matchesSearchCode;
    }
    
    // Si no hay búsqueda específica, mostrar todos
    if (!searchTerm && !searchCode) {
      return true;
    }
    
    // Si hay ambas búsquedas, combinar
    if (searchTerm && searchCode) {
      return matchesSearchName && matchesSearchCode;
    }
    
    return matchesSearchName || matchesSearchCode;
  });

  // Filtrar por categoría
  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(p => p.categoria?.toLowerCase() === selectedCategory.toLowerCase());
  }

  // Filtrar solo disponibles
  if (onlyAvailable) {
    filteredProducts = filteredProducts.filter(p => p.stock > 0);
  }

  // Ordenar
  if (sortBy === 'precio-asc') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.precio - b.precio);
  } else if (sortBy === 'precio-desc') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.precio - a.precio);
  } else if (sortBy === 'nombre') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  return (
    <div className="min-h-screen bg-fondo">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
        <div className="bg-secondary border border-slate-700 rounded-card p-8 sm:p-12 mb-8 sm:mb-12 text-center">
          <img src="/logo.jpeg" alt="Licorería Al Pasito" className="h-16 sm:h-20 mx-auto mb-4 object-contain rounded-lg" />
          <h1 className="text-3xl sm:text-4xl font-semibold text-textMain mb-2">Catálogo de Productos</h1>
          <p className="text-subtext text-sm sm:text-base">Descubre nuestra selección premium</p>
        </div>

        {/* Recomendaciones */}
        {recomendados.length > 0 && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-textMain">Recomendados</h2>
              {loadingRecomendados && (
                <span className="text-subtext text-sm">Cargando...</span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recomendados.map((p) => (
                <Link
                  key={p._id}
                  to={`/product/${p._id}`}
                  className="bg-fondo border border-slate-700 rounded-card p-3 hover:border-primary/40 transition-all group"
                >
                  <div className="h-24 sm:h-28 flex items-center justify-center mb-3">
                    {p.imagen ? (
                      <img
                        src={p.imagen}
                        alt={p.nombre}
                        className="max-h-20 sm:max-h-24 object-contain group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="h-20 sm:h-24 w-full bg-secondary rounded flex items-center justify-center text-xs text-subtext">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-textMain line-clamp-2 min-h-[32px] mb-2">
                    {p.nombre}
                  </p>
                  <p className="text-primary font-semibold text-sm sm:text-base">${p.precio?.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Barra de búsqueda mejorada */}
        <div className="card mb-8">
          <div className="flex flex-col gap-4 mb-6">
            {/* Búsqueda por nombre */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-textMain mb-2">
                🔍 Buscar por nombre o categoría
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-fondo border border-slate-700 rounded-card focus:outline-none focus:border-primary text-textMain placeholder-subtext transition-all text-sm sm:text-base"
                placeholder="Ej: Ron, Whisky, Cerveza..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Búsqueda por código */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-textMain mb-2">
                📦 Buscar por código de producto
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-fondo border border-slate-700 rounded-card focus:outline-none focus:border-primary text-textMain placeholder-subtext transition-all text-sm sm:text-base"
                placeholder="Ej: SKU-001, PROD-123..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-slate-700 rounded-card focus:outline-none focus:border-primary bg-fondo text-textMain text-sm transition-all"
            >
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-slate-700 rounded-card focus:outline-none focus:border-primary bg-fondo text-textMain text-sm transition-all"
            >
              <option value="">Ordenar por</option>
              <option value="precio-asc">Precio: Menor a Mayor</option>
              <option value="precio-desc">Precio: Mayor a Menor</option>
              <option value="nombre">Nombre A-Z</option>
            </select>

            <label className="flex items-center gap-2 px-4 py-2.5 border border-slate-700 rounded-card bg-fondo cursor-pointer hover:border-primary/40 text-textMain text-sm transition-all">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 text-primary border-slate-700 rounded focus:ring-primary"
              />
              <span>Solo disponibles</span>
            </label>

            <div className="flex-1 flex justify-start sm:justify-end items-center text-sm text-subtext">
              <span>{filteredProducts.length} productos</span>
            </div>
          </div>
        </div>

      {loading && <p className="text-subtext">Cargando productos...</p>}
      {error && <div className="bg-orange-900 text-orange-200 px-4 py-2 rounded mb-4 border border-orange-600">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredProducts.map((p) => (
          <div
            key={p._id}
            className="card-hover flex flex-col group"
          >
            {/* Imagen del producto */}
            <Link to={`/product/${p._id}`} className="relative">
              <div className="p-4 bg-fondo rounded-t-card overflow-hidden">
                {p.imagen ? (
                  <div className="h-48 w-full flex items-center justify-center overflow-hidden">
                    <img 
                      src={p.imagen} 
                      alt={p.nombre} 
                      className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-secondary rounded flex items-center justify-center text-sm text-subtext">
                    Sin imagen
                  </div>
                )}
              </div>
              {/* Badge de oferta */}
            </Link>
            
            {/* Información del producto */}
            <div className="p-4 flex flex-col flex-1">
              {/* Código del producto */}
              {p.codigo && (
                <div className="mb-2">
                  <span className="text-xs font-mono text-subtext bg-fondo px-2 py-1 rounded border border-slate-700">
                    Código: {p.codigo}
                  </span>
                </div>
              )}
              
              {/* Categoría */}
              {p.categoria && (
                <div className="mb-3">
                  <span className="text-xs font-medium text-primary uppercase px-2 py-1 bg-primary/10 rounded border border-primary/20">
                    {p.categoria}
                  </span>
                </div>
              )}

              {/* Nombre */}
              <Link to={`/product/${p._id}`}>
                <h3 className="text-sm font-semibold text-textMain mb-2 line-clamp-2 min-h-[40px] hover:text-primary transition">
                  {p.nombre}
                </h3>
              </Link>
              
              {/* Precio */}
              <div className="mb-3">
                <p className="text-2xl font-semibold text-primary">${p.precio?.toFixed(2)}</p>
              </div>

              {/* Stock visual */}
              <div className="mb-4 flex items-center gap-2">
                {p.stock > 0 ? (
                  <span className="text-xs text-subtext">
                    {p.stock} disponibles
                  </span>
                ) : (
                  <span className="text-xs text-red-500 font-medium">Agotado</span>
                )}
              </div>
              
              {/* Botón */}
              <div className="mt-auto">
                <button
                  className={`w-full py-3 px-4 rounded-card font-medium text-sm transition-all ${
                    p.stock === 0
                        ? "bg-secondary text-subtext cursor-not-allowed border border-slate-700"
                        : "btn-primary"
                    }`}
                  disabled={p.stock === 0}
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart(p);
                  }}
                >
                  {addedProduct === p._id ? (
                    "Agregado"
                  ) : p.stock === 0 ? (
                    "Sin stock"
                  ) : (
                    "Agregar al carrito"
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12 card">
          <p className="text-textMain text-lg">
            {searchTerm ? "No se encontraron productos" : "No hay productos disponibles"}
          </p>
        </div>
      )}

      {/* Footer de la tienda */}
      <footer className="mt-12 sm:mt-16 card">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <h3 className="font-semibold text-base sm:text-lg text-textMain mb-3">Ubicación</h3>
            <p className="text-xs sm:text-sm text-subtext">Av. Principal Leonidas Plaza</p>
            <p className="text-xs sm:text-sm text-subtext">Riobamba, Ecuador</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-base sm:text-lg text-textMain mb-3">Horario</h3>
            <p className="text-xs sm:text-sm text-subtext">Lun - Dom: 14:00 PM - 02:00 AM</p>
            <p className="text-xs sm:text-sm text-subtext">Atención 24 horas</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-base sm:text-lg text-textMain mb-3">Contacto</h3>
            <p className="text-xs sm:text-sm text-subtext">WhatsApp: +593 99 550 8392</p>
            <p className="text-xs sm:text-sm text-subtext break-all">Email: janethchavez@gmail.com</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-base sm:text-lg text-textMain mb-3">Redes Sociales</h3>
            <div className="flex gap-3 text-subtext">
              <a href="#" className="hover:text-primary transition">Facebook</a>
              <a href="#" className="hover:text-primary transition">Instagram</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-6 pt-6 text-center">
          <p className="text-xs sm:text-sm text-subtext">
            © 2026 Licorería Al Pasito – Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
    </div>
  );
}
