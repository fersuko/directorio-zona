import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kiaualzhazhdwlojqyjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpYXVhbHpoYXpoZHdsb2pxeWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjkzNDUsImV4cCI6MjA3OTQwNTM0NX0.bDEjn09u5zNCVxJbDp4QCspss0FbNSkLipL1xGptTrU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBusinesses() {
    const { data, error } = await supabase
        .from('businesses')
        .select('id, name, image_url, created_at, category')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error("Error fetching businesses:", error);
        return;
    }

    console.log("Recent Businesses (Last 50):");
    const stats = {
        null_url: 0,
        google_url: 0,
        supabase_url: 0,
        other: 0
    };

    data.forEach(b => {
        let type = "other";
        if (!b.image_url) {
            type = "null_url";
        } else if (b.image_url.includes('maps.googleapis.com')) {
            type = "google_url";
        } else if (b.image_url.includes('supabase.co')) {
            type = "supabase_url";
        }
        stats[type]++;
        console.log(`ID: ${b.id} | ${b.name.padEnd(30)} | Type: ${type.padEnd(12)} | URL: ${b.image_url ? b.image_url.substring(0, 50) + '...' : 'NULL'}`);
    });

    console.log("\nSummary Statistics:");
    console.log(JSON.stringify(stats, null, 2));
}

checkBusinesses();
