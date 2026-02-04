import { useCartStore } from "../store/cartStore";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();
  const { carrito, items, removeFromCart, updateQuantity, clearCart, total } = useCartStore();
  
  // Usar carrito si existe, sino items para compatibilidad
  const cartItems = carrito.length > 0 ? carrito : (items || []);

  return (
    <div className="min-h-screen bg-fondo">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">🛍️ Mi Carrito</h1>
          <button 
            onClick={() => navigate("/catalog")}
            className="text-primary font-semibold hover:text-primary/80 transition text-sm sm:text-base self-start md:self-auto"
          >
            ← Seguir comprando
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-secondary rounded-lg shadow p-8 sm:p-12 text-center border border-primary/20">
            <p className="text-accent text-base sm:text-lg mb-4">Tu carrito está vacío</p>
            <button 
              onClick={() => navigate("/catalog")}
              className="bg-primary text-fondo px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-primary/90 transition font-semibold text-sm sm:text-base"
            >
              Ir al catálogo
            </button>
          </div>
        ) : (
          <>
            <div className="bg-secondary rounded-lg shadow mb-4 sm:mb-6 border border-primary/20">
              {cartItems.map((item) => {
                // Compatibilidad con estructura antigua {product, quantity}
                const product = item.product || item;
                const quantity = item.quantity || item.cantidad || 1;
                const productId = item.product?._id || item._id;
                
                return (
                  <div key={productId} className="p-3 sm:p-4 md:p-6 border-b border-primary/20 last:border-b-0 hover:bg-fondo/30 transition">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4">
                      {product.imagen && (
                        <img src={product.imagen} alt={product.nombre} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded self-start" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-primary truncate">{product.nombre}</h3>
                        <p className="text-xs sm:text-sm text-accent">{product.categoria}</p>
                        <p className="text-primary font-semibold text-base sm:text-lg">${product.precio?.toLocaleString()} c/u</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 bg-fondo/50 rounded-lg p-2 border border-primary/20">
                          <button
                            className="bg-primary hover:bg-primary/90 text-fondo w-8 h-8 rounded flex items-center justify-center font-bold transition text-sm"
                            onClick={() => updateQuantity(productId, quantity - 1)}
                            disabled={quantity <= 1}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={product.stock}
                            value={quantity}
                            onChange={(e) => updateQuantity(productId, Number(e.target.value) || 1)}
                            className="w-10 sm:w-12 border-0 bg-transparent text-center text-white font-semibold text-sm"
                          />
                          <button
                            className="bg-primary hover:bg-primary/90 text-fondo w-8 h-8 rounded flex items-center justify-center font-bold transition text-sm"
                            onClick={() => updateQuantity(productId, quantity + 1)}
                            disabled={quantity >= product.stock}
                          >
                            +
                          </button>
                        </div>
                        
                        <span className="font-bold text-base sm:text-lg text-center sm:w-24 sm:text-right text-primary">${(product.precio * quantity).toLocaleString()}</span>
                        
                        <button
                          className="bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-500/50 px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-xs sm:text-sm"
                          onClick={() => removeFromCart(productId)}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6">
                <span className="text-lg sm:text-xl font-medium text-subtext">
                  Subtotal ({cartItems.length} producto{cartItems.length !== 1 ? 's' : ''}):
                </span>
                <span className="text-3xl sm:text-4xl font-semibold text-primary">${total().toLocaleString()}</span>
              </div>
              
              <p className="text-xs sm:text-sm text-subtext mb-6">
                El IVA (13%) y otros cargos se calcularán en el checkout
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => navigate("/checkout")}
                  className="btn-primary flex-1 text-base sm:text-lg"
                >
                  Proceder al Checkout
                </button>
                <button
                  className="btn-secondary text-sm sm:text-base"
                  onClick={clearCart}
                >
                  Vaciar Carrito
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
