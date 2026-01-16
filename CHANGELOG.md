# Changelog - Directorio Zona

## [1.0.0] - Versión de Lanzamiento - 2026-01-16

Esta versión marca el lanzamiento oficial de Directorio Zona como una plataforma lista para producción.

### Añadido
- **SEO & Indexación**:
  - Implementación de Schema.org (JSON-LD) para negocios.
  - Meta tags dinámicos para mejor visualización en redes sociales (OpenGraph).
  - Sitemap dinámico automatizado (`sitemap.xml`) que se actualiza en el build.
- **Branding**:
  - Logo oficial en alta resolución implementado como Favicon y App Icon.
  - Pie de página localizado: "Directorio Zona v1.0.0 - Hecho con ❤️ en Monterrey".
- **Administración**:
  - Panel de moderación de reseñas para administradores.
  - Mejora en la visualización de analíticas para dueños de negocios (filtros por fecha y porcentajes de crecimiento).
- **PWA**:
  - Configuración completa de Progressive Web App para instalación en móviles.
  - Archivo `.htaccess` optimizado para despliegues en cPanel/Apache.

### Cambiado
- **UI/UX**:
  - Simplificación de la página de Configuración: Eliminación de opciones no esenciales para una experiencia más rápida y enfocada.
  - Mejora en el sistema de navegación y scroll automático para reseñas.
- **Seguridad**:
  - Refuerzo de políticas RLS en Supabase para proteger datos de usuarios y negocios.

### Corregido
- Corregido el sistema de favoritos que presentaba bloqueos en el hilo principal.
- Ajuste en los tipos de TypeScript para garantizar estabilidad en el despliegue.

---
🚀 *¡Listo para el despegue!*
