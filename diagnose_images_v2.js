import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kiaualzhazhdwlojqyjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpYXVhbHpoYXpoZHdsb2pxeWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjkzNDUsImV4cCI6MjA3OTQwNTM0NX0.bDEjn09u5zNCVxJbDp4QCspss0FbNSkLipL1xGptTrU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentBusinesses() {
    const { data, error } = await supabase
        .from('businesses')
        .select('id, name, image_url, created_at')
        .order('created_at', { ascending: false })
        .limit(30);

    if (error) {
        console.error("Error fetching businesses:", error);
        return;
    }

    console.log("Recent Businesses Status:");
    data.forEach(b => {
        let status = "OK";
        if (!b.image_url) {
            status = "NULL URL";
        } else if (b.image_url.includes('maps.googleapis.com')) {
            status = "GOOGLE URL (TRANSIENT?)";
        } else if (b.image_url.includes('supabase.co')) {
            status = "SUPABASE URL (PERMANENT)";
        } else {
            status = "OTHER/UNSPLASH";
        }
        console.log(`ID: ${b.id} | Name: ${b.name.padEnd(40)} | Status: ${status}`);
        console.log(`   URL: ${b.image_url}`);
        console.log(`---`);
    });
}

checkRecentBusinesses();
