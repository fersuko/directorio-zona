import { supabase } from "../src/lib/supabase";

async function checkProfilesSchema() {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .limit(1);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Columns:", data && data.length > 0 ? Object.keys(data[0]) : "No data found");
    }
}

checkProfilesSchema();
