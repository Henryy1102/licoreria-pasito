# 🍷 Licorería Al Pasito - Sistema de Gestión Completo

Sistema web integral para la gestión de la Licorería "Al Pasito" desarrollado con el stack MERN (MongoDB, Express, React, Node.js). Una aplicación moderna con diseño temático de licorería, colores vibrantes y funcionalidades completas para la gestión de productos, clientes y ventas.

## ✨ Últimas Actualizaciones

### � FASE 2 - Facturación Automática ✅ COMPLETADO
- **✅ Modelo de Factura** con:
  - Numeración correlativa automática (INV-YYYYMMDD-#####)
  - Datos fiscales del cliente (NIT, DUI, dirección fiscal)
  - Cálculo automático de IVA (13% para El Salvador)
  - Detalles de productos facturados con precios
  - Estados: emitida, pagada, cancelada, anulada
  - Relación con órdenes completadas

- **✅ Generación Automática de Facturas**:
  - Se crea factura automáticamente al marcar orden como "completada"
  - Captura datos fiscales del cliente
  - Calcula subtotales, impuestos y totales
  - Historial completo de facturas

- **✅ Generación de PDF de Facturas**:
  - Formato profesional con logo de la licorería
  - Información fiscal detallada
  - Desglose de productos con subtotales
  - Cálculo de IVA y total
  - Método de pago y notas
  - Descarga segura con permisos de cliente/admin

- **✅ Gestión de Datos Fiscales**:
  - NIT y DUI en perfil de usuario
  - Dirección fiscal personalizada
  - Datos capturados automáticamente en factura

### 📊 FASE 5 - Reportes y Analytics ✅ COMPLETADO
- **✅ Dashboard Avanzado** con:
  - Tarjetas de resumen (total ventas, órdenes, promedios)
  - Gráficos dinámicos con Chart.js
  - Filtrado por período de fechas
  - Múltiples pestañas de análisis

- **✅ Análisis de Ventas**:
  - Ventas por mes (gráfico de línea)
  - Productos más vendidos (gráfico de barras)
  - Métodos de pago utilizados (gráfico pastel)
  - Ventas por día de la semana

- **✅ Análisis de Clientes**:
  - Top 10 clientes frecuentes
  - Total gastado por cliente
  - Promedio por orden
  - Primera y última compra

- **✅ Análisis de Inventario**:
  - Valor total del inventario
  - Alertas de stock bajo
  - Stock sin disponibilidad
  - Inventario por categoría
  - Productos con stock alto

- **✅ Tendencias y Patrones**:
  - Ventas por día de la semana
  - Categorías más vendidas
  - Análisis de tendencias en tiempo real

- **✅ Página de Facturas**:
  - Vista de todas las facturas (admin)
  - Mis facturas (cliente)
  - Filtrado por estado
  - Descarga de PDF
  - Detalles expandibles

### �🔔 Sistema de Notificaciones en Tiempo Real
- **Notificaciones instantáneas** cuando se crea una nueva orden
- **Alertas para administradores** sobre nuevos pedidos
- **Notificaciones de cambio de estado** para clientes
- **Indicador visual** en la barra de navegación con contador de notificaciones no leídas
- **Panel de notificaciones** desplegable con historial completo

### 📦 Mejoras en Gestión de Órdenes

#### Para Administradores:
- **Seguimiento visual mejorado** con indicadores de progreso del pedido
- **Botones de acción rápida** para cambiar estados sin formularios complejos
- **Flujo didáctico** que muestra claramente el estado actual y siguiente paso
- **Cancelación de pedidos** con reversión automática de stock
- **Notificaciones automáticas** al actualizar estados

#### Para Clientes:
- **Cancelación de pedidos** disponible para órdenes pendientes y en proceso
- **Modal de confirmación** con opción de agregar motivo de cancelación
- **Notificaciones en tiempo real** sobre cambios en sus pedidos
- **Visualización mejorada** del estado de sus órdenes

## 📖 Documentación del Sistema de Ventas

> **🛍️ ¿Buscas información sobre el sistema de ventas?**
> 
> Lee la guía completa: **[COMO_USAR_SISTEMA_VENTAS.md](COMO_USAR_SISTEMA_VENTAS.md)**
>
> Incluye:
> - Cómo acceder al apartado de Órdenes (Admin y Cliente)
> - Flujo completo de compra
> - Gestión de estados de órdenes
> - Estructura de archivos
> - Solución de problemas

---

## 🚀 Guía de Instalación

### Requisitos Previos
Antes de comenzar, asegúrate de tener instalados:
- **Node.js** (v14 o superior) - [Descargar](https://nodejs.org/)
- **npm** (viene con Node.js)
- **MongoDB** (local o Atlas) - [Descargar](https://www.mongodb.com/try/download/community) o [Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** (opcional pero recomendado) - [Descargar](https://git-scm.com/)

### Paso 1: Clonar o Descargar el Proyecto
```bash
# Opción A: Si tienes Git
git clone <URL_del_repositorio>
cd licoreriapasito

# Opción B: Si descargaste el ZIP
# Extrae el archivo y abre la carpeta en tu terminal
cd licoreriapasito
```

### Paso 2: Configuración del Backend

#### 2.1 Instalar Dependencias del Backend
```bash
cd backend
npm install
```

#### 2.2 Configurar Variables de Entorno
Crea un archivo `.env` en la carpeta `backend/` con la siguiente estructura:
```env
# Puerto del servidor
PORT=5000

# Base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/licoreria
# O si usas MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/licoreria

# JWT (generador: https://www.uuidgenerator.net/)
JWT_SECRET=tu_clave_secreta_muy_fuerte_aqui
JWT_EXPIRE=7d

# Email (opcional, para futuras funcionalidades)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_aplicacion

# Push Notifications (VAPID)
VAPID_PUBLIC_KEY=tu_vapid_public_key
VAPID_PRIVATE_KEY=tu_vapid_private_key
VAPID_SUBJECT=mailto:admin@licoreria.com

# Node Environment
NODE_ENV=development
```

#### 2.3 Iniciar el Backend
```bash
# Desde la carpeta backend/
npm start

# O con nodemon para desarrollo (auto-recarga):
npm run dev
```

El servidor estará disponible en: `http://localhost:5000`

#### 2.4 Crear Usuario Admin (Opcional pero Recomendado)
En otra terminal, desde la carpeta `backend/`:
```bash
npm run seed:admin
```
Sigue las instrucciones para crear tu primer usuario administrador.

### Paso 3: Configuración del Frontend

#### 3.1 Instalar Dependencias del Frontend
Abre una nueva terminal y ve a la carpeta frontend:
```bash
cd frontend
npm install
```

#### 3.2 Configurar Variables de Entorno del Frontend
Crea un archivo `.env` en la carpeta `frontend/` (opcional si el backend está en localhost:5000):
```env
VITE_API_URL=http://localhost:5000
```

#### 3.3 Iniciar el Frontend
```bash
# Desde la carpeta frontend/
npm run dev

# Si tienes problemas con PowerShell, usa:
npx vite
```

El frontend estará disponible en: `http://localhost:5173`

### 🪟 Inicio Rápido en Windows

**Opción más fácil:** Usa los archivos `.bat` incluidos

1. **Doble click en:** `INICIAR_BACKEND.bat`
2. **Doble click en:** `INICIAR_FRONTEND.bat`
3. Abre el navegador en: `http://localhost:5173`

> **Nota:** Si tienes problemas con npm/npx, lee: [SOLUCION_PROBLEMA_ORDENES.md](SOLUCION_PROBLEMA_ORDENES.md)

### Paso 4: Verificar que Todo Funciona

1. Abre tu navegador
2. Ve a `http://localhost:5173`
3. Prueba el registro de un nuevo usuario
4. Inicia sesión
5. Accede al catálogo de productos

### 🛠️ Comandos Útiles

#### Backend
```bash
cd backend

# Iniciar servidor
npm start

# Iniciar en modo desarrollo (con auto-recarga)
npm run dev

# Crear usuario administrador
npm run seed:admin
```

#### Frontend
```bash
cd frontend

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de la compilación
npm run preview
```

---

## ✨ Características Implementadas

### 🔐 Autenticación y Seguridad
- ✅ Sistema completo de autenticación (Login/Registro)
- ✅ Validación de edad (+18 años) en el registro
- ✅ Campo de teléfono para contacto de clientes
- ✅ Gestión de roles (Admin/Cliente)
- ✅ Rutas protegidas con JWT sis
- ✅ Middleware de autenticación y autorización
- ✅ Encriptación de contraseñas con bcrypt

### 👥 Gestión de Usuarios
- ✅ **Administradores**: Panel completo de gestión
- ✅ **Clientes**: Vista de catálogo, carrito y cuenta personal
- ✅ Perfil editable (nombre, email, teléfono, contraseña)
- ✅ Script de creación de usuario admin (`npm run seed:admin`)
- ✅ Vista de clientes registrados (solo admin)

### 📦 Gestión de Productos
- ✅ CRUD completo de productos (admin)
- ✅ Categorías predefinidas: licor, snacks, bebidas sin alcohol, cigarrillos, dulces, extras
- ✅ Campos: nombre, descripción, categoría, precio, stock, imagen
- ✅ Control de stock en tiempo real
- ✅ Imágenes uniformes con tamaño consistente
- ✅ Estado activo/inactivo de productos

### 🛒 Sistema de Compras
- ✅ Catálogo de productos con búsqueda
- ✅ Grid responsive de 5 columnas
- ✅ Filtrado por nombre y categoría
- ✅ Carrito de compras funcional
- ✅ Control de cantidad en carrito (+/-)
- ✅ Cálculo de subtotales y total
- ✅ Página de detalle de producto
- ✅ Selector de cantidad antes de agregar al carrito
- ✅ Productos relacionados (por categoría)
- ✅ Navegación entre productos

### 🎨 Diseño y UX
- ✅ Temática completa de licorería
- ✅ Esquema de colores personalizado:
  - **Fondo**: Negro (#000000)
  - **Primary**: Rosa (#FF4D8D)
  - **Secondary**: Cyan (#00E5FF)
  - **Accent**: Amarillo (#FFD60A)
  - **Purple**: Magenta (#B5179E)
- ✅ Navbar con degradado y logo temático
- ✅ Banner decorativo en catálogo
- ✅ Iconos de bebidas (🍷, 🍾) en toda la app
- ✅ Efectos hover y transiciones suaves
- ✅ Diseño responsive con TailwindCSS
- ✅ Modo oscuro completo

### � Sistema de Ventas y Órdenes
- ✅ **Proceso de Checkout** en 3 pasos:
  1. Confirmación del carrito con descuentos opcionales
  2. Dirección de entrega con validación
  3. Selección de método de pago (efectivo, tarjeta, transferencia)
- ✅ **Modelo de Orden** con:
  - Numeración automática de órdenes (ORD-YYYYMMDD-#####)
  - Referencia a cliente y usuario
  - Detalles de productos con precios capturados
  - Cálculo de subtotal y descuento
  - Estados: pendiente, procesando, completado, cancelado
  - Dirección de entrega
  - Fechas estimadas y reales de entrega
- ✅ **Página de Confirmación** con:
  - Resumen completo de la orden
  - Información del cliente
  - Detalles de dirección de entrega
  - Método de pago utilizado
  - Opción para imprimir comprobante
  - Estado actual de la orden
- ✅ **Historial de Órdenes** para clientes:
  - Vista de todas las órdenes del usuario
  - Filtrado por estado
  - Expansión de detalles de cada orden
  - Resumen de totales
  - Botones de acciones rápidas
- ✅ **Panel de Gestión de Órdenes** para administradores:
  - Lista completa de todas las órdenes
  - Filtrado por estado
  - Resumen de estadísticas (totales por estado)
  - Actualización de estado de órdenes
  - Asignación de fecha estimada de entrega
  - Visualización de detalles de cliente
  - Información de productos por orden
- ✅ **Actualización automática de stock**:
  - Descuento de stock al crear orden
  - Reversión de stock si se cancela la orden
  - Validación de stock disponible antes de crear orden
- ✅ **Estadísticas de ventas**:
  - Total de órdenes por período
  - Ingresos totales (solo completadas)
  - Órdenes agrupadas por estado
  - Productos más vendidos

### �📊 Dashboard
- ✅ Panel de control para administradores
- ✅ Acceso rápido a módulos principales
- ✅ Vista de información del usuario
- ✅ Redirección inteligente según rol

## 🚧 Funcionalidades Pendientes (Roadmap)

### Fase 1 - Sistema de Ventas ✅ COMPLETADO
- ✅ Modelo de Orden/Venta
- ✅ Proceso de checkout completo
- ✅ Confirmación de pedido
- ✅ Historial de órdenes para clientes
- ✅ Gestión de órdenes para admin
- ✅ Estados de orden (pendiente, procesando, completado, cancelado)
- ✅ Actualización automática de stock tras venta

### Fase 2 - Facturación ✅ COMPLETADO
- ✅ Modelo de factura con numeración correlativa
- ✅ Generación automática de facturas al completar orden
- ✅ Numeración correlativa de facturas (INV-YYYYMMDD-#####)
- ✅ Generación de PDF con formato profesional
- ✅ Historial de facturas para clientes y admin
- ✅ Datos fiscales de clientes (NIT, DUI, dirección fiscal)
- ✅ Cálculo automático de IVA (13% El Salvador)
- ✅ Estados de factura (emitida, pagada, cancelada, anulada)

### Fase 5 - Reportes y Analytics ✅ COMPLETADO
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Productos más vendidos con gráficos
- ✅ Ingresos por período (mensual, diario)
- ✅ Gráficos con Chart.js (línea, barras, pastel)
- ✅ Análisis de inventario con alertas
- ✅ Reportes de clientes frecuentes
- ✅ Tendencias de ventas por día/categoría
- ✅ Descarga de reportes en PDF


### Fase 6 - Mejoras Adicionales
- ✅ Sistema de descuentos y cupones
- ✅ Notificaciones push
- 📝 Chat de soporte
- ✅ Sistema de reseñas de productos
- 📝 Wishlist/Lista de deseos
- ✅ Recomendaciones personalizadas
- ✅ Programa de puntos/fidelización

## 📋 Requisitos Previos

- **Node.js** v18 o superior
- **MongoDB** instalado y corriendo (local o MongoDB Atlas)
- **npm** o **yarn** como gestor de paquetes
- Navegador moderno (Chrome, Firefox, Edge)

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd licoreriapasito
```

### 2. Configuración del Backend

```bash
cd backend
npm install
```

Crea un archivo `.env` en la carpeta `backend`:

```env
MONGO_URI=mongodb://localhost:27017/licoreria_pasito
JWT_SECRET=tu_clave_secreta_super_segura_cambiala_por_favor
PORT=4000
```

**Nota**: Para MongoDB Atlas, usa tu connection string:
```env
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/licoreria_pasito
```

Inicia el servidor backend:

```bash
npm run dev
```

El servidor correrá en `http://localhost:4000`

### 3. Configuración del Frontend

```bash
cd frontend
npm install
```

Inicia la aplicación React:

```bash
npm run dev
```

La aplicación correrá en `http://localhost:5173`

### 4. Crear Usuario Administrador

Desde la carpeta `backend`, ejecuta:

```bash
npm run seed:admin
```

Esto creará un usuario administrador:
- **Email**: admin@licoreria.com
- **Password**: admin123
- **Rol**: admin

## 📁 Estructura del Proyecto Actualizada

```
licoreriapasito/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                    # Configuración MongoDB
│   │   ├── controllers/
│   │   │   ├── auth.controller.js        # Login, Registro, Validaciones
│   │   │   ├── product.controller.js     # CRUD Productos
│   │   │   ├── user.controller.js        # Gestión de usuarios
│   │   │   └── client.controller.js      # (Deprecated)
│   │   ├── middleware/
│   │   │   └── auth.middleware.js        # JWT & verificación de roles
│   │   ├── models/
│   │   │   ├── Users.js                  # Modelo de usuarios (admin/cliente)
│   │   │   ├── Product.js                # Modelo de productos
│   │   │   ├── Order.js                  # Modelo de órdenes/ventas
│   │   │   ├── Audit.js                  # Modelo de auditoría
│   │   │   └── Client.js                 # (Deprecated)
│   │   ├── routes/
│   │   │   ├── auth.routes.js            # /api/auth
│   │   │   ├── product.routes.js         # /api/products
│   │   │   ├── order.routes.js           # /api/orders
│   │   │   ├── user.routes.js            # /api/users
│   │   │   ├── audit.routes.js           # /api/audit
│   │   │   └── client.routes.js          # (Deprecated)
│   │   ├── scripts/
│   │   │   └── createAdmin.js            # Script seed admin
│   │   └── index.js                      # Entry point
│   ├── .env                              # Variables de entorno
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
  │   │   └── Navbar.jsx                # Navegación principal
    │   ├── pages/
  │   │   ├── Login.jsx                 # Inicio de sesión
  │   │   ├── Register.jsx              # Registro (+18, teléfono)
  │   │   ├── Dashboard.jsx             # Panel de control
  │   │   ├── Catalog.jsx               # Catálogo de productos
  │   │   ├── ProductDetail.jsx         # Detalle de producto
  │   │   ├── Cart.jsx                  # Carrito de compras
  │   │   ├── Checkout.jsx              # Proceso de checkout (3 pasos)
  │   │   ├── OrdenConfirmacion.jsx     # Confirmación de orden
  │   │   ├── MisOrdenes.jsx            # Historial de órdenes (cliente)
  │   │   ├── Account.jsx               # Perfil de usuario
  │   │   ├── AdminProducts.jsx         # CRUD productos (admin)
  │   │   ├── AdminClients.jsx          # Vista clientes (admin)
  │   │   ├── AdminOrdenes.jsx          # Gestión de órdenes (admin)
  │   │   └── AdminAudit.jsx            # Panel de auditoría (admin)
    │   ├── services/
  │   │   ├── authService.js            # API auth
  │   │   ├── productService.js         # API productos
  │   │   ├── orderService.js           # API órdenes/ventas
  │   │   ├── clientService.js          # API clientes
  │   │   └── auditService.js           # API auditoría
    │   ├── store/
  │   │   ├── authStore.js              # Zustand - autenticación
  │   │   ├── productStore.js           # Zustand - productos
  │   │   ├── orderStore.js             # Zustand - órdenes/ventas
  │   │   ├── cartStore.js              # Zustand - carrito
  │   │   ├── clientStore.js            # Zustand - clientes
  │   │   └── auditStore.js             # Zustand - auditoría
  │   ├── App.jsx                       # Rutas y componente principal
  │   ├── main.jsx                      # Entry point
  │   └── index.css                     # Estilos globales + Tailwind
    ├── index.html
    ├── vite.config.js
  ├── tailwind.config.js                # Config colores personalizados
  ├── postcss.config.js
    └── package.json
```

## 🔐 Endpoints API
### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario (requiere +18 años)
- `POST /api/auth/login` - Iniciar sesión (devuelve JWT token)

### Productos (Requiere autenticación)
- `GET /api/products` - Listar todos los productos
- `GET /api/products/:id` - Obtener producto por ID
- `POST /api/products` - Crear producto (solo admin)
- `PUT /api/products/:id` - Actualizar producto (solo admin)
- `DELETE /api/products/:id` - Eliminar producto (solo admin)

### Usuarios (Requiere autenticación)
- `GET /api/users/clients` - Listar clientes registrados (solo admin)
- `PUT /api/users/:id` - Actualizar usuario (admin o mismo usuario)
- `DELETE /api/users/:id` - Eliminar usuario (solo admin)

### Órdenes/Ventas (Requiere autenticación)
- `POST /api/orders` - Crear nueva orden
  - Body: `{ clienteId, productos[], descuento, metodoPago, direccionEntrega, notas }`
  - Retorna: Orden creada con número único
- `GET /api/orders` - Listar todas las órdenes (solo admin)
  - Params opcionales: `estado`, `clienteId`
- `GET /api/orders/mis-ordenes/historial` - Obtener mis órdenes
- `GET /api/orders/:ordenId` - Obtener detalles de una orden
- `PUT /api/orders/:ordenId/estado` - Actualizar estado de orden (solo admin)
  - Body: `{ estado, fechaEntregaEstimada? }`
  - Estados válidos: `pendiente`, `procesando`, `completado`, `cancelado`
- `PUT /api/orders/:ordenId/cancelar` - Cancelar una orden
  - Body: `{ motivo? }`
- `GET /api/orders/estadisticas/ventas` - Obtener estadísticas de ventas
  - Params opcionales: `fechaInicio`, `fechaFin`
  - Retorna: Total de órdenes, órdenes por estado, ingresos, productos más vendidos

## 🎨 Tecnologías Utilizadas
### Backend
- Express.js - Framework web
- MongoDB - Base de datos
- Mongoose - ODM para MongoDB
- JWT - Autenticación
- bcryptjs - Encriptación de contraseñas
- CORS - Cross-Origin Resource Sharing
- dotenv - Variables de entorno

### Frontend
- React 18 - Framework UI
- Vite - Build tool
- React Router - Navegación
- Zustand - Gestión de estado
- Axios - Cliente HTTP
- TailwindCSS - Estilos
- PostCSS - Procesamiento CSS

## 👥 Roles de Usuario
### Cliente
- Ver catálogo de productos
- Buscar y filtrar productos
- Agregar productos al carrito
- Ver detalle de productos
- Ver productos relacionados
- Editar perfil personal
- Ver historial de compras (próximamente)

### Administrador
- Todo lo del cliente +
- Gestionar productos (crear, editar, eliminar)
- Ver lista de clientes registrados
- Editar información de clientes
- Eliminar usuarios
- Acceso a reportes (próximamente)
- Gestionar ventas (próximamente)
- Ver auditoría (próximamente)

## 🚀 Uso de la Aplicación

### Como Cliente:
1. Registrarse con email, nombre, teléfono y fecha de nacimiento
2. Iniciar sesión
3. Navegar por el catálogo de productos
4. Buscar productos por nombre o categoría
5. Ver detalles de productos
6. Agregar productos al carrito
7. Modificar cantidades en el carrito
8. Proceder al checkout (próximamente)
9. Editar perfil desde "Mi cuenta"

### Como Administrador:
1. Iniciar sesión con credenciales de admin
2. Acceder al dashboard administrativo
3. Gestionar productos desde "Productos"
4. Ver y editar clientes desde "Clientes"
5. Crear nuevos productos con categorías predefinidas
6. Controlar stock de productos
7. Activar/desactivar productos

## 🐛 Solución de Problemas

### El backend no se conecta a MongoDB
- Verifica que MongoDB esté corriendo: `mongod --version`
- Revisa la variable `MONGO_URI` en tu archivo `.env`
- Para MongoDB local: asegúrate de que el servicio esté activo

### Error de CORS
- Verifica que el backend esté en el puerto 4000
- Asegúrate de que el frontend apunte a `http://localhost:4000`

### No puedo crear usuario admin
- Ejecuta `npm run seed:admin` desde la carpeta `backend`
- Verifica que la conexión a MongoDB sea exitosa

## 📊 Estado del Proyecto

**Versión Actual**: v1.5 (Beta)

**Completado**: ~60%
- ✅ Autenticación y autorización
- ✅ Gestión de productos
- ✅ Catálogo y búsqueda
- ✅ Carrito de compras
- ✅ Perfil de usuario
- ✅ Diseño responsivo

**En Desarrollo**: 
- 🔨 Sistema de ventas y checkout

**Planificado**:
- 📅 Facturación
- 📅 Pagos en línea
- 📅 Auditoría
- 📅 Reportes

## 🤝 Contribución
Este proyecto está en desarrollo activo. Si deseas contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Contacto

Para consultas sobre el proyecto, contacta al equipo de desarrollo.

## 📄 Licencia
ISC License - ver archivo LICENSE para más detalles

---

**Desarrollado con ❤️ para Licorería Al Pasito** 🍷
