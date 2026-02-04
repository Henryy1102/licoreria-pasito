import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/licoreria';

async function fixOrderCategories() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    const ordenes = await Order.find({});
    console.log(`📦 Encontradas ${ordenes.length} órdenes`);

    let actualizadas = 0;

    for (const orden of ordenes) {
      let updated = false;

      for (const item of orden.productos) {
        // Si el producto no tiene categoría
        if (!item.categoria) {
          // Buscar el producto en la base de datos
          const producto = await Product.findById(item.producto);
          
          if (producto && producto.categoria) {
            item.categoria = producto.categoria;
            updated = true;
            console.log(`  ✓ Actualizada categoría para ${item.nombre}: ${producto.categoria}`);
          }
        }
      }

      if (updated) {
        await orden.save();
        actualizadas++;
      }
    }

    console.log(`\n✅ Proceso completado:`);
    console.log(`   - Total órdenes: ${ordenes.length}`);
    console.log(`   - Órdenes actualizadas: ${actualizadas}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixOrderCategories();
