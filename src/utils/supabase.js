import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project URL and anon key
// You'll get these from your Supabase project settings
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://jsiyenbnoxeuimiytuzq.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Debug logging
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...')

// Create Supabase client with error handling
let supabase = null
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('Supabase client created successfully')
  } else {
    throw new Error('Invalid Supabase configuration')
  }
} catch (error) {
  console.error('Error creating Supabase client:', error)
  // Fallback to mock client
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

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  return user
}

// Helper function to get user profile
export const getUserProfile = async (userId) => {
  console.log('getUserProfile called with userId:', userId)
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  console.log('getUserProfile result:', { data, error })
  
  if (error) {
    console.error('Error getting user profile:', error)
    return null
  }
  return data
}
