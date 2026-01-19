const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kiaualzhazhdwlojqyjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpYXVhbHpoYXpoZHdsb2pxeWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjkzNDUsImV4cCI6MjA3OTQwNTM0NX0.bDEjn09u5zNCVxJbDp4QCspss0FbNSkLipL1xGptTrU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
    console.log("📤 Probando subida a Storage...");

    const content = "Test content " + Date.now();
    const buffer = Buffer.from(content);
    const fileName = `test_upload_${Date.now()}.txt`;
    const filePath = `test/${fileName}`;

    const { data, error } = await supabase.storage
        .from('business-images')
        .upload(filePath, buffer, {
            contentType: 'text/plain',
            upsert: true
        });

    if (error) {
        console.error("❌ Error de subida:", error);
        console.error("Detalles:", JSON.stringify(error, null, 2));
    } else {
        console.log("✅ Subida exitosa:", data);
        const { data: { publicUrl } } = supabase.storage
            .from('business-images')
            .getPublicUrl(filePath);
        console.log("🔗 URL Pública:", publicUrl);
    }
}

testUpload();
