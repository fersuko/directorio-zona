# 🏗️ Directorio Zona - Monterrey

Directorio Zona es una plataforma moderna para la gestión y exploración de negocios locales en el centro de Monterrey, construida con un stack de alto rendimiento y enfocado en la experiencia del usuario.

## 🛠️ Stack Tecnológico

### **Frontend Core**
- **React 19** - Librería principal para la interfaz de usuario.
- **TypeScript** - Tipado estático para un desarrollo robusto y mantenible.
- **Vite 6** - Herramienta de compilación ultra rápida.

### **Backend & Database (BaaS)**
- **Supabase** - Infraestructura completa:
  - **Auth**: Autenticación segura (Email/Password + Google OAuth).
  - **PostgreSQL**: Base de datos relacional potente.
  - **Storage**: Gestión de imágenes de negocios.

### **Estado y Rutas**
- **Zustand** - Gestión de estado global simplificada y eficiente.
- **React Router 7** - Manejo de navegación y rutas dinámicas.

### **UI & Diseño**
- **TailwindCSS** - Estilizado mediante utilidades.
- **Framer Motion** - Animaciones y transiciones premium.
- **Lucide React** - Set de iconos modernos y consistentes.
- **Diseño**: Enfoque en Dark Mode, Glassmorphism y Micro-animaciones.

### **Mapas e Interacción**
- **Leaflet & React Leaflet** - Mapas interactivos para localización de negocios.
- **Browser Image Compression** - Optimización automática de imágenes.
- **Canvas Confetti** - Micro-interacciones de feedback visual.

### **PWA & SEO**
- **Vite PWA** - Aplicación web progresiva instalable.
- **React Helmet Async** - Optimización SEO y meta-tags dinámicos.

---

## 📁 Estructura del Proyecto

```bash
src/
├── components/     # Componentes reutilizables (UI, Admin, Dashboard)
├── pages/          # Vistas principales de la aplicación
├── hooks/          # Lógica compartida y custom hooks
├── lib/            # Configuraciones (Supabase, Geocoding, etc.)
├── types/          # Definiciones de TypeScript e interfaces de DB
└── data/           # Datos estáticos y archivos de respaldo
```

## 🚀 Desarrollo Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Ejecutar servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Crear build de producción:
   ```bash
   npm run build
   ```

---

*Hecho con ❤️ en Monterrey.*
