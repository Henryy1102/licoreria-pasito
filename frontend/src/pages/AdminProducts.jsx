import { useEffect, useState } from "react";
import { useProductStore } from "../store/productStore";

const CATEGORIAS = ["licor", "snacks", "bebidas sin alcohol", "cigarrillos", "dulces", "extras"];

export default function AdminProducts() {
  const { products, fetchProducts, createProduct, updateProduct, removeProduct, loading, error } = useProductStore();
  const [form, setForm] = useState({ nombre: "", descripcion: "", categoria: "licor", precio: 0, stock: 0, imagen: "" });
  const [imagenPreview, setImagenPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProduct(editingId, form);
      } else {
        await createProduct(form);
      }
      setForm({ nombre: "", descripcion: "", categoria: "licor", precio: 0, stock: 0, imagen: "" });
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImagenChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es muy grande (máximo 5MB)");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        setForm({ ...form, imagen: base64 });
        setImagenPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEdit = (product) => {
    setForm({
      nombre: product.nombre,
      descripcion: product.descripcion,
      categoria: product.categoria,
      precio: product.precio,
      stock: product.stock,
      imagen: product.imagen,
    });
    setImagenPreview(product.imagen);
    setEditingId(product._id);
  };

  return (
    <div className="min-h-screen bg-fondo">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <img src="/logo.jpeg" alt="Licorería Al Pasito" className="h-12 sm:h-14 object-contain" />
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Gestión de Productos</h1>
        </div>

        {error && <div className="bg-red-900/50 text-red-200 px-3 sm:px-4 py-2 rounded mb-4 border border-red-600 text-sm sm:text-base">{error}</div>}

        <div className="bg-secondary p-4 sm:p-6 rounded shadow mb-4 sm:mb-6 border border-primary/20">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-primary">{editingId ? "Editar producto" : "Nuevo producto"}</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4" onSubmit={handleSubmit}>
          <input className="input text-sm sm:text-base" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          
          <select 
            className="input text-sm sm:text-base" 
            value={form.categoria} 
            onChange={(e) => setForm({ ...form, categoria: e.target.value })} 
            required
          >
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          
          <input className="input text-sm sm:text-base" type="number" min="0" step="0.01" placeholder="Precio" value={form.precio} onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} required />
          <input className="input text-sm sm:text-base" type="number" min="0" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required />
          <div className="col-span-1 md:col-span-2">
            <label className="block text-accent font-semibold mb-2 text-sm sm:text-base">Imagen del Producto</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImagenChange}
              className="w-full px-3 py-2 bg-fondo border border-primary/30 rounded-lg text-white cursor-pointer text-sm sm:text-base"
            />
            {imagenPreview && (
              <div className="mt-3 flex gap-4 items-start">
                <img src={imagenPreview} alt="Preview" className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded border border-primary/30" />
                <button
                  type="button"
                  onClick={() => {
                    setForm({ ...form, imagen: "" });
                    setImagenPreview(null);
                  }}
                  className="btn-secondary text-xs sm:text-sm"
                >
                  Remover imagen
                </button>
              </div>
            )}
          </div>
          <textarea className="input col-span-1 md:col-span-2 text-sm sm:text-base" placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          <div className="col-span-1 md:col-span-2 flex gap-2">
            <button className="btn-primary text-sm sm:text-base" type="submit" disabled={loading}>
              {editingId ? "Guardar cambios" : "Crear"}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary text-sm sm:text-base" onClick={() => { setEditingId(null); setForm({ nombre: "", descripcion: "", categoria: "licor", precio: 0, stock: 0, imagen: "" }); setImagenPreview(null); }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-secondary p-4 sm:p-6 rounded shadow border border-primary/20">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-primary">Inventario</h2>
          {loading && <span className="text-xs sm:text-sm text-subtext">Cargando...</span>}
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-primary/30">
                <th className="py-2 px-2 sm:px-3 text-primary text-xs sm:text-sm md:text-base">Nombre</th>
                <th className="py-2 px-2 sm:px-3 text-primary text-xs sm:text-sm md:text-base">Categoría</th>
                <th className="py-2 px-2 sm:px-3 text-primary text-xs sm:text-sm md:text-base">Precio</th>
                <th className="py-2 px-2 sm:px-3 text-primary text-xs sm:text-sm md:text-base">Stock</th>
                <th className="py-2 px-2 sm:px-3 text-primary text-xs sm:text-sm md:text-base">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-primary/10 hover:bg-secondary/80 transition">
                  <td className="py-2 px-2 sm:px-3 text-textMain text-xs sm:text-sm md:text-base">{p.nombre}</td>
                  <td className="py-2 px-2 sm:px-3 capitalize text-accent text-xs sm:text-sm md:text-base">{p.categoria || "-"}</td>
                  <td className="py-2 px-2 sm:px-3 text-primary font-semibold text-xs sm:text-sm md:text-base">${p.precio?.toFixed(2)}</td>
                  <td className="py-2 px-2 sm:px-3 text-accent text-xs sm:text-sm md:text-base">{p.stock}</td>
                  <td className="py-2 px-2 sm:px-3 flex flex-col sm:flex-row gap-1 sm:gap-2">
                    <button className="btn-secondary text-xs sm:text-sm" onClick={() => startEdit(p)}>Editar</button>
                    <button className="btn-danger text-xs sm:text-sm" onClick={() => removeProduct(p._id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td className="py-4 px-2 sm:px-3 text-subtext text-xs sm:text-sm" colSpan={5}>No hay productos</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
