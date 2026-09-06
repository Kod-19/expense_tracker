const { createClient } = require("@supabase/supabase-js");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const createSupabaseClient = (key) => {
  if (!supabaseUrl || !key) {
    return null;
  }

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const supabase = createSupabaseClient(supabaseAnonKey);
const supabaseAdmin = createSupabaseClient(supabaseServiceRoleKey);

module.exports = {
  supabase,
  supabaseAdmin,
};
