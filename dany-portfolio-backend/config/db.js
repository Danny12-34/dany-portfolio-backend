// config/db.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL ERROR: Missing Supabase environment keys inside .env configuration!');
    process.exit(1);
}

// This line initializes the connection client instance
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase; // Exported to be reused by controllers for CRUD operations