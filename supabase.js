import { createClient } from '@supabase/supabase-js';

// === Supabase Configuration ===

// ✅ Always use environment variables first; fallback to live project if not set
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// ✅ Minimal debug log — never expose keys in console
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase env vars; set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in Netlify.');
}
console.log('🔧 Using Supabase project:', supabaseUrl);

// === Create Supabase Client ===
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// === Helper Functions ===

/**
 * Get the currently authenticated user.
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data?.user || null;
  } catch (err) {
    console.error('❌ Error getting current user:', err);
    return null;
  }
};

/**
 * Fetch a user profile by ID from the profiles table.
 */
export const getUserProfile = async (userId) => {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('❌ Error fetching user profile:', err);
    return null;
  }
};