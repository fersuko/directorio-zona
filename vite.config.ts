import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Directorio Zona',
        short_name: 'Zona',
        description: 'Directorio comercial y turístico de Monterrey Centro.',
        theme_color: '#0f172a',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    proxy: {
      '/google-photos': {
        target: 'https://maps.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/google-photos/, ''),
        headers: {
          'Referer': 'https://maps.googleapis.com/',
          'Origin': 'https://maps.googleapis.com'
        }
      },
      '/google-images': {
        target: 'https://lh3.googleusercontent.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/google-images/, ''),
      }
    }
  },
})
