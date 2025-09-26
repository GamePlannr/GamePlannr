import { createClient } from '@supabase/supabase-js'

// === Supabase Configuration ===
// Replace with your actual Supabase project URL and anon key (for hardcoded fallback)
const fallbackUrl = 'https://fvmzvkikwesvppfzfmjh.supabase.co'
const fallbackAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bXp2a2lrd2VzdnBwZnpmbWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NjU2ODMsImV4cCI6MjA3MjE0MTY4M30.mrJ6N_I10nYsbWotgvIQr6z4BFDnoxnqOhBLYlyjAyQ'

// Use environment variable if available, fallback to known working values
const supabaseUrl = (
  process.env.REACT_APP_SUPABASE_URL?.startsWith('http')
    ? process.env.REACT_APP_SUPABASE_URL
    : process.env.REACT_APP_SUPABASE_URL
      ? `https://${process.env.REACT_APP_SUPABASE_URL}`
      : fallbackUrl
)

const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || fallbackAnonKey

// === Debug logging ===
console.log('🔧 Supabase URL:', supabaseUrl)
console.log('🔧 Supabase Anon Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...')

// === Create Supabase client with error handling ===
let supabase = null
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabase client created successfully')
  } else {
    throw new Error('❌ Missing Supabase URL or anon key')
  }
} catch (error) {
  console.error('❌ Error creating Supabase client:', error)

  // Fallback mock client to avoid app crash
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase client creation failed' } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase client creation failed' } }),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase client creation failed' } })
        })
      }),
      insert: () => Promise.resolve({ error: { message: 'Supabase client creation failed' } }),
      update: () => ({
        eq: () => Promise.resolve({ error: { message: 'Supabase client creation failed' } })
      })
    })
  }
}

export { supabase }

// === Helpers ===

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('❌ Error getting current user:', error)
    return null
  }
  return user
}

export const getUserProfile = async (userId) => {
  console.log('📥 getUserProfile called with userId:', userId)

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  console.log('📤 getUserProfile result:', { data, error })

  if (error) {
    console.error('❌ Error getting user profile:', error)
    return null
  }
  return data
}