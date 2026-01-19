import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kiaualzhazhdwlojqyjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpYXVhbHpoYXpoZHdsb2pxeWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjkzNDUsImV4cCI6MjA3OTQwNTM0NX0.bDEjn09u5zNCVxJbDp4QCspss0FbNSkLipL1xGptTrU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBusinesses() {
    const { data, error } = await supabase
        .from('businesses')
        .select('id, name, image_url, category, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error fetching businesses:", error);
        return;
    }

    console.log("Recent Businesses:");
    data.forEach(b => {
        console.log(`ID: ${b.id} | Name: ${b.name} | Category: ${b.category}`);
        console.log(`  URL: ${b.image_url || 'NULL'}`);
        console.log(`  Created: ${b.created_at}`);
        console.log('---');
    });
}

checkBusinesses();
