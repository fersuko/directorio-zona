const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kiaualzhazhdwlojqyjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpYXVhbHpoYXpoZHdsb2pxeWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjkzNDUsImV4cCI6MjA3OTQwNTM0NX0.bDEjn09u5zNCVxJbDp4QCspss0FbNSkLipL1xGptTrU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findBusiness() {
    console.log("🔍 Buscando negocio 'DEPORTES MADERO'...");

    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .ilike('name', '%DEPORTES MADERO%');

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (!data || data.length === 0) {
        console.log("❌ No se encontró el negocio.");
        return;
    }

    data.forEach(b => {
        console.log(`📌 ID: ${b.id}`);
        console.log(`   Nombre: ${b.name}`);
        console.log(`   Image URL: ${b.image_url}`);
        console.log(`   Created At: ${b.created_at}`);
        console.log(`   Metadata:`, b.metadata);
    });
}

findBusiness();
