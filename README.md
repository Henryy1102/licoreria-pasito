# Licorería Al Pasito

Sistema web para gestión de una licorería con panel administrativo, ventas, órdenes, facturación, reportes y notificaciones. Proyecto Full‑Stack con frontend en React (Vite + Tailwind) y backend en Node.js/Express con MongoDB Atlas.

## Tecnologías

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Base de datos:** MongoDB Atlas
- **Autenticación:** JWT
- **Estado:** Zustand

## Funcionalidades principales

- Autenticación y roles (admin/cliente)
- Catálogo, carrito y checkout
- Gestión de productos, clientes, órdenes, pagos y facturas
- Reportes y auditoría
- Notificaciones
- Facturación con PDF y XML

## Estructura del proyecto

```
licoreriapasito/
├─ backend/
│  ├─ package.json
│  └─ src/
│     ├─ index.js
│     ├─ config/
│     │  └─ db.js
│     ├─ controllers/
│     ├─ middleware/
│     ├─ models/
│     ├─ routes/
│     ├─ scripts/
│     └─ utils/
├─ frontend/
│  ├─ package.json
│  ├─ index.html
│  ├─ vite.config.js
│  ├─ tailwind.config.js
│  └─ src/
│     ├─ App.jsx
│     ├─ main.jsx
│     ├─ index.css
│     ├─ components/
│     ├─ pages/
│     ├─ services/
│     ├─ store/
│     └─ utils/
└─ README.md
```

## Variables de entorno

### Backend (backend/.env)
```
MONGODB_URI=... 
JWT_SECRET=...
PORT=4000
```

### Frontend (frontend/.env.production)
```
VITE_API_URL=https://licoreria-pasito.onrender.com/api
```

## Scripts

### Backend
- `npm install`
- `npm start`

### Frontend
- `npm install`
- `npm run dev`
- `npm run build`

## Despliegue

- **Backend:** Render
- **Frontend:** Vercel

## URL pública

- Frontend: https://licoreria-pasito.vercel.app
- Backend: https://licoreria-pasito.onrender.com
# 🍷 Licorería Al Pasito - Sistema de Gestión Completo

Sistema web integral para la gestión de la Licorería "Al Pasito" desarrollado con el stack MERN (MongoDB, Express, React, Node.js). Una aplicación moderna con diseño temático de licorería, colores vibrantes y funcionalidades completas para la gestión de productos, clientes y ventas.
