const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(-1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test database connection
supabase.from('users').select('count', { count: 'exact', head: true })
  .then(() => {
    console.log('Connected to Supabase database');
  })
  .catch((err) => {
    console.error('Supabase connection error:', err.message);
  });

module.exports = supabase;
