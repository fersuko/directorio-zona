import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de rutas
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '../public');
const SITEMAP_PATH = path.join(PUBLIC_DIR, 'sitemap.xml');
const BASE_URL = 'https://directoriozona.com'; // Cambiar a la URL real cuando esté lista

// Configuración de Supabase (Lectura manual de .env para entorno local)
const envPath = path.join(__dirname, '../.env');
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        const lines = envFile.split('\n');
        lines.forEach(line => {
            if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
            if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseAnonKey = line.split('=')[1].trim();
        });
    }
}

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Supabase credentials not found in env or .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function generateSitemap() {
    console.log('🚀 Iniciando generación de Sitemap...');

    const staticPages = [
        '',
        '/search',
        '/map',
        '/promos',
        '/unete',
        '/terms',
        '/privacy',
    ];

    try {
        // 1. Obtener negocios dinámicos
        const { data: businesses, error } = await supabase
            .from('businesses')
            .select('id, updated_at')
            .eq('is_hidden', false);

        if (error) throw error;

        console.log(`✅ ${businesses.length} negocios encontrados.`);

        // 2. Construir XML
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // Rutas estáticas
        staticPages.forEach(page => {
            xml += `  <url>\n`;
            xml += `    <loc>${BASE_URL}${page}</loc>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n`;
            xml += `  </url>\n`;
        });

        // Rutas dinámicas
        businesses.forEach(biz => {
            xml += `  <url>\n`;
            xml += `    <loc>${BASE_URL}/business/${biz.id}</loc>\n`;
            xml += `    <lastmod>${biz.updated_at ? biz.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>\n`;
            xml += `    <changefreq>monthly</changefreq>\n`;
            xml += `    <priority>0.6</priority>\n`;
            xml += `  </url>\n`;
        });

        xml += `</urlset>`;

        // 3. Guardar archivo
        fs.writeFileSync(SITEMAP_PATH, xml);
        console.log(`✨ Sitemap generado exitosamente en: ${SITEMAP_PATH}`);

    } catch (err) {
        console.error('❌ Error al generar el sitemap:', err);
        process.exit(1);
    }
}

generateSitemap();
