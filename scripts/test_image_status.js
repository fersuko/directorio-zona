import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kiaualzhazhdwlojqyjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpYXVhbHpoYXpoZHdsb2pxeWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjkzNDUsImV4cCI6MjA3OTQwNTM0NX0.bDEjn09u5zNCVxJbDp4QCspss0FbNSkLipL1xGptTrU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseImages() {
    console.log("📊 Diagnóstico de Imágenes de Negocios...");

    const { data, error } = await supabase
        .from('businesses')
        .select('name, image_url')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error("Error:", error);
        return;
    }

    let googleCount = 0;
    let supabaseCount = 0;
    let nullCount = 0;
    let otherCount = 0;

    data.forEach(b => {
        const url = b.image_url;
        if (!url) {
            nullCount++;
        } else if (url.includes('maps.googleapis.com')) {
            googleCount++;
            console.log(`❌ GOOGLE: ${b.name} -> ${url.substring(0, 50)}...`);
        } else if (url.includes('.supabase.')) {
            supabaseCount++;
            // console.log(`✅ SUPABASE: ${b.name}`);
        } else {
            otherCount++;
            console.log(`❓ OTRO: ${b.name} -> ${url}`);
        }
    });

    console.log("\n--- RESUMEN (Últimos 50 negocios) ---");
    console.log(`✅ Supabase (Permanente): ${supabaseCount}`);
    console.log(`❌ Google (Temporal):   ${googleCount}`);
    console.log(`⬜ Nulo (Mapa Fallback): ${nullCount}`);
    console.log(`❓ Otro:                ${otherCount}`);
    console.log("-------------------------------------");
}

diagnoseImages();
