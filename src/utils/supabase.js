import { createClient } from '@supabase/supabase-js';

// === Supabase Configuration ===

// ✅ Always use environment variables first; fallback to live project if not set
const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ||
  'https://yfvdjpxahsovlncayqhg.supabase.co';

const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdmRqcHhhaHNvdmxuY2F5cWhnZyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzUyODUxMjAwLCJleHAiOjIwNzg0MjcyMDB9.0pGf-GT1iBg58pgh3kITxqB6JBuY6rPoX5xkxEbiLzA';

// ✅ Minimal debug log — never expose keys in console
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