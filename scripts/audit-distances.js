import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');

let supabaseUrl, supabaseAnonKey;
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
        if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseAnonKey = line.split('=')[1].trim();
    });
}

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const MONTERREY_CENTRO = { lat: 25.6714, lng: -100.3095 };

async function auditDistances() {
    const { data, error } = await supabase.from('businesses').select('name, lat, lng, address');
    if (error) {
        console.error(error);
        return;
    }

    console.log('--- AUDITORÍA DE DISTANCIAS (Centro: Macroplaza) ---');
    data.forEach(biz => {
        const dist = calculateDistance(MONTERREY_CENTRO.lat, MONTERREY_CENTRO.lng, biz.lat, biz.lng);
        const status = dist <= 2 ? '✅ DENTRO' : '❌ FUERA';
        console.log(`${status} | ${dist.toFixed(2)}km | ${biz.name} | ${biz.address} | (${biz.lat}, ${biz.lng})`);
    });
}

auditDistances();
