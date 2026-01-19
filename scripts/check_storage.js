import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kiaualzhazhdwlojqyjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpYXVhbHpoYXpoZHdsb2pxeWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjkzNDUsImV4cCI6MjA3OTQwNTM0NX0.bDEjn09u5zNCVxJbDp4QCspss0FbNSkLipL1xGptTrU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listFiles() {
    const { data, error } = await supabase
        .storage
        .from('business-images')
        .list('businesses', { limit: 100 });

    if (error) {
        console.error("Error listing files:", error);
        return;
    }

    console.log("Files in 'business-images/businesses':");
    data.forEach(f => {
        console.log(`File: ${f.name.padEnd(50)} | Size: ${f.metadata?.size} bytes`);
    });
}

listFiles();
