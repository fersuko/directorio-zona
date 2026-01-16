# 📍 Directorio Zona - v1.0.0 (Launch Version)

Directorio Zona es una plataforma digital diseñada como el directorio comercial y turístico definitivo para la zona centro de Monterrey. Construida como una **PWA (Progressive Web App)** de alto rendimiento, está optimizada para el descubrimiento orgánico y la facilidad de uso tanto para usuarios como para dueños de negocios.

## 🚀 Versión de Lanzamiento (v1.0.0)

Esta es la versión oficial de lanzamiento, que incluye todas las funcionalidades clave para operar el directorio de manera profesional:

### ✨ Características Principales
- **Branding Personalizado**: Identidad visual completa con el logo distintivo de la marca.
- **PWA Ready**: Instalable en dispositivos iOS y Android para una experiencia nativa.
- **Optimización SEO**: Implementación de Meta Tags dinámicos y Schema JSON-LD para indexación inteligente en Google.
- **Sitemap Dinámico**: Generación automática de `sitemap.xml` incluyendo todos los negocios registrados.
- **Panel Administrativo Robusto**: Moderación de reseñas, gestión de usuarios y control total sobre los negocios.
- **Panel de Dueños**: Espacio para que cada comerciante gestione su información, fotos y ofertas.
- **Mapa Interactivo**: Localización precisa de establecimientos en el corazón de Monterrey.

## 🛠️ Stack Tecnológico
- **Frontend**: React 19 + TypeScript + Vite
- **Estilos**: Tailwind CSS (UI Premium y Moderna)
- **Backend**: Supabase (Base de Datos Real-time, Auth, Storage)
- **Mapas**: Leaflet / React Leaflet
- **Animaciones**: Framer Motion

## 📦 Instalación y Desarrollo local

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno en `.env` (Basarse en `.env.example`).
4. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 🚢 Despliegue (cPanel / Servidores Estáticos)

Para preparar el proyecto para producción:
```bash
npm run build
```
Este comando genera la carpeta `dist/` y actualiza automáticamente el `sitemap.xml` en la carpeta pública.

---
Hecho con ❤️ en Monterrey.
