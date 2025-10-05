import { createClient } from '@supabase/supabase-js';

// === Supabase Configuration ===

// ✅ Use environment variables as primary source
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://yfvdjpxahsovlncayqhg.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJh...'; // shortened for security

// ✅ Log minimal info (remove anon key exposure)
console.log('🔧 Using Supabase project:', supabaseUrl);

// === Create Supabase Client ===
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// === Helpers ===

/**
 * Get the current authenticated user.
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