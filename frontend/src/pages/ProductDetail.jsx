import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProductStore } from "../store/productStore";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { reviewService } from "../services/reviewService";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, fetchProducts, loading } = useProductStore();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products, fetchProducts]);

  useEffect(() => {
    const cargarResenas = async () => {
      if (!id) return;
      setReviewLoading(true);
      setReviewError("");
      try {
        const data = await reviewService.obtenerResenas(id, 20);
        setReviews(data);
      } catch (err) {
        setReviewError(err.message || "Error al cargar reseñas");
      } finally {
        setReviewLoading(false);
      }
    };

    cargarResenas();
  }, [id]);

  const product = products.find((p) => p._id === id);
  const relatedProducts = products.filter(
    (p) => p._id !== id && p.categoria === product?.categoria
  ).slice(0, 4);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-subtext text-lg">Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-400">Producto no encontrado</p>
        <Link to="/catalog" className="text-primary hover:underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setReviewLoading(true);
    setReviewError("");
    try {
      await reviewService.crearResena(id, {
        calificacion: reviewRating,
        comentario: reviewComment,
      });
      const data = await reviewService.obtenerResenas(id, 20);
      setReviews(data);
      setReviewComment("");
      setReviewRating(5);
    } catch (err) {
      setReviewError(err.message || "No se pudo guardar la reseña");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fondo">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <img src="/logo.jpeg" alt="Licorería Al Pasito" className="h-10 object-contain" />
          <div className="text-sm text-accent">
            <Link to="/catalog" className="hover:text-primary transition">
              Catálogo
            </Link>
            <span className="mx-2">/</span>
            <span className="text-primary">{product.nombre}</span>
          </div>
        </div>

        {/* Producto Principal */}
        <div className="bg-secondary rounded-lg shadow-lg p-8 mb-12 border border-primary/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Imagen */}
            <div className="flex items-center justify-center bg-gray-900 rounded-lg p-8">
              {product.imagen ? (
                <img
                  src={product.imagen}
                  alt={product.nombre}
                  className="max-h-96 max-w-full object-contain"
                />
              ) : (
                <div className="h-96 w-full bg-gray-800 rounded-md flex items-center justify-center text-sm text-accent uppercase tracking-wide">
                  Sin imagen
                </div>
              )}
            </div>

            {/* Información */}
            <div className="flex flex-col">
              {/* Precio */}
              <div className="mb-4">
                <p className="text-sm text-accent uppercase mb-1">Precio</p>
                <p className="text-5xl font-bold text-primary">
                  ${product.precio?.toFixed(2)}
                </p>
                <p className="text-sm text-accent">Inc. IVA</p>
              </div>

              {/* Nombre */}
              <h1 className="text-3xl font-bold text-textMain mb-4">
                {product.nombre}
              </h1>

              {/* Categoría y Código */}
              <div className="flex gap-4 mb-6">
              {product.categoria && (
                <span className="text-sm font-semibold uppercase bg-primary text-secondary px-4 py-2 rounded-full">
                  {product.categoria}
                </span>
              )}
              <span className="text-sm text-accent">Cód: {product._id.slice(-8)}</span>
            </div>

            {/* Descripción */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-primary">Descripción</h3>
              <p className="text-accent">
                {product.descripcion || "Sin descripción disponible"}
              </p>
            </div>

            {/* Calificación */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-primary">Calificación</h3>
              <div className="flex items-center gap-3 text-accent">
                <span className="text-yellow-400 text-xl">★</span>
                <span className="text-lg font-semibold text-primary">
                  {product.ratingPromedio?.toFixed(1) || "0.0"}
                </span>
                <span className="text-sm text-accent/80">
                  ({product.ratingCantidad || 0} reseñas)
                </span>
              </div>
            </div>

            {/* Stock */}
            <div className="mb-6 flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <span className="text-lg text-green-500">🟢</span>
                  <span className="text-sm font-semibold text-accent">
                    Disponible ({product.stock} unidades)
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg text-red-500">🔴</span>
                  <span className="text-sm font-semibold text-red-400">Sin stock</span>
                </>
              )}
            </div>

            {/* Cantidad y Agregar al Carrito */}
            {product.stock > 0 && (
              <div className="space-y-4 mt-auto">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-primary">
                    Cantidad:
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      className="bg-primary hover:bg-primary/90 text-secondary w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.max(1, Math.min(product.stock, Number(e.target.value)))
                        )
                      }
                      className="w-20 border-2 border-primary rounded-lg px-4 py-2 text-center font-semibold text-lg bg-gray-900 text-textMain"
                    />
                    <button
                      className="bg-primary hover:bg-primary/90 text-secondary w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg"
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    className={`flex-1 py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                      added
                        ? "bg-green-600 text-white"
                        : "bg-primary hover:bg-primary/90 text-secondary"
                    }`}
                    onClick={handleAddToCart}
                  >
                    {added ? "✓ Agregado al carrito" : "🛒 Comprar"}
                  </button>
                  <Link
                    to="/cart"
                    className="bg-accent hover:bg-accent/90 text-secondary py-4 px-6 rounded-lg font-bold text-lg transition"
                  >
                    Ir al carrito
                  </Link>
                </div>
              </div>
            )}

            {product.stock === 0 && (
              <div className="mt-auto">
                <button
                  className="w-full bg-gray-700 text-gray-400 py-4 px-6 rounded-lg font-bold text-lg cursor-not-allowed"
                  disabled
                >
                  Sin stock
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reseñas */}
      <div className="container mx-auto px-4 pb-8">
        <div className="bg-secondary rounded-lg shadow-lg p-8 border border-primary/20">
          <h2 className="text-2xl font-bold text-primary mb-4">Reseñas</h2>

          {reviewError && (
            <div className="mb-4 bg-red-900/20 border border-red-500 text-red-200 px-4 py-2 rounded">
              {reviewError}
            </div>
          )}

          {user && (
            <div className="mb-6 border border-primary/20 rounded-lg p-4 bg-fondo/40">
              <h3 className="text-lg font-semibold text-primary mb-3">Escribe tu reseña</h3>
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <select
                  className="input sm:w-40"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} estrellas
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Comparte tu experiencia"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
                <button
                  className="btn-primary"
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={reviewLoading}
                >
                  {reviewLoading ? "Enviando..." : "Publicar"}
                </button>
              </div>
              <p className="text-xs text-accent/80">
                Solo puedes reseñar productos comprados.
              </p>
            </div>
          )}

          {reviewLoading && reviews.length === 0 && (
            <p className="text-accent">Cargando reseñas...</p>
          )}

          {reviews.length === 0 && !reviewLoading ? (
            <p className="text-accent">Aún no hay reseñas.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div
                  key={r._id}
                  className="border border-primary/20 rounded-lg p-4 bg-fondo/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-primary">
                      {r.usuario?.nombre || "Cliente"}
                    </p>
                    <span className="text-yellow-400">{"★".repeat(r.calificacion)}</span>
                  </div>
                  <p className="text-accent text-sm">{r.comentario || "Sin comentario"}</p>
                  <p className="text-xs text-accent/70 mt-2">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Productos Relacionados */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">
            Productos relacionados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <Link
                key={p._id}
                to={`/product/${p._id}`}
                className="bg-secondary rounded-lg shadow hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 flex flex-col border border-primary/20"
              >
                {/* Imagen */}
                <div className="p-4 bg-gray-900 rounded-t-lg">
                  {p.imagen ? (
                    <div className="h-48 w-full flex items-center justify-center overflow-hidden">
                      <img
                        src={p.imagen}
                        alt={p.nombre}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gray-800 rounded-md flex items-center justify-center text-xs text-accent uppercase tracking-wide">
                      Sin imagen
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-2">
                    <p className="text-xs text-accent uppercase">Precio</p>
                    <p className="text-2xl font-bold text-primary">
                      ${p.precio?.toFixed(2)}
                    </p>
                    <p className="text-xs text-accent">Inc. IVA</p>
                  </div>

                  <h3 className="text-sm font-semibold text-textMain mb-2 line-clamp-2 min-h-[40px]">
                    {p.nombre}
                  </h3>

                  {p.categoria && (
                    <span className="text-xs font-semibold uppercase bg-primary text-secondary px-3 py-1 rounded-full inline-block mb-2">
                      {p.categoria}
                    </span>
                  )}

                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-green-500 text-xs">🟢</span>
                    <span className="text-xs text-accent">
                      Disponible
                    </span>
                  </div>

                  <button className="w-full bg-primary hover:bg-primary/90 text-secondary py-2 px-4 rounded-lg font-bold text-sm transition mt-auto">
                    🛒 Comprar
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      </div>    </div>
  );
}