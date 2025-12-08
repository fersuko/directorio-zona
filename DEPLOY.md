# Guía de Despliegue - Directorio Zona

Esta aplicación es una **Single Page Application (SPA)** construida con Vite y React. Esto significa que puede ser alojada en **cualquier servidor** que sirva archivos estáticos (HTML, CSS, JS). No necesitas un servidor de Node.js corriendo en producción para el frontend.

## Opción 1: Hosting Compartido (cPanel, Hostinger, GoDaddy) - Apache

La mayoría de los hostings "clásicos" usan Apache.

1.  **Generar el Build**:
    Ejecuta en tu terminal:
    ```bash
    npm run build
    ```
    Esto creará una carpeta `dist` con todos los archivos optimizados.

2.  **Subir Archivos**:
    Sube **todo el contenido** de la carpeta `dist` (no la carpeta en sí, sino lo que hay dentro) a la carpeta `public_html` de tu hosting (o la subcarpeta donde quieras que viva la app).

3.  **Configuración de Rutas (.htaccess)**:
    He incluido un archivo `.htaccess` en la carpeta `public` que se copiará automáticamente al `dist`. Este archivo es CRÍTICO. Le dice al servidor: "Si alguien pide `/perfil` y no existe ese archivo, muéstrale `index.html` para que React se encargue".
    *   *Nota: Si subes los archivos manualmente y no ves el `.htaccess`, asegúrate de subir el que creé en `public/.htaccess` a la raíz de tu sitio.*

## Opción 2: VPS con Nginx (DigitalOcean, AWS, Linode)

Si usas Nginx, usa esta configuración en tu bloque `server`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /var/www/directorio-zona/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Opción 3: Vercel / Netlify (Recomendado para CI/CD)

Estos servicios están optimizados para SPAs y no requieren configuración extra. Solo conecta tu repositorio de GitHub.

## Importante: Base de Datos (Supabase)

Tu base de datos y autenticación viven en **Supabase** (en la nube).
*   No necesitas "migrar" la base de datos a tu hosting.
*   La app se conectará automáticamente a Supabase desde cualquier lugar (tu hosting, tu celular, etc.) usando las variables de entorno que ya están configuradas en el build.

## Resumen

Para "subirlo a tu propio servidor":
1. `npm run build`
2. Copia el contenido de `dist` a tu servidor.
3. Asegúrate de que las rutas funcionen (gracias al `.htaccess` o config de Nginx).
