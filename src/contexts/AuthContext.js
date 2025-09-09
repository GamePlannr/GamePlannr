import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getUserProfile } from '../utils/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('Getting initial session...')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Initial session:', session)
        console.log('Session error:', error)
        
        if (error) {
          console.error('Error getting session:', error)
          setUser(null)
          setProfile(null)
        } else if (session?.user) {
          setUser(session.user)
          console.log('Loading profile for user:', session.user.id)
          const userProfile = await getUserProfile(session.user.id)
          console.log('User profile loaded:', userProfile)
          setProfile(userProfile)
        } else {
          console.log('No session found, user not logged in')
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session)
        
        // Handle different auth events
        if (event === 'SIGNED_UP') {
          // Don't automatically sign in after signup
          // User should verify email and sign in manually
          console.log('User signed up - waiting for email verification')
          setUser(null)
          setProfile(null)
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Only set user state when explicitly signing in
          setUser(session.user)
          console.log('Loading profile for user:', session.user.id)
          const userProfile = await getUserProfile(session.user.id)
          console.log('User profile loaded:', userProfile)
          setProfile(userProfile)
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out - clearing state')
          setUser(null)
          setProfile(null)
        } else if (event === 'TOKEN_REFRESHED') {
          // Don't change user state on token refresh
          console.log('Token refreshed - maintaining current state')
        } else {
          // For any other events, ensure user is not set unless explicitly signed in
          if (!session?.user) {
            console.log('No session found - clearing user state')
            setUser(null)
            setProfile(null)
          }
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, userData) => {
    try {
      console.log('Attempting to sign up with email:', email)
      console.log('Supabase URL:', supabase.supabaseUrl)
      
      // Test Supabase connection first
      const { data: testData, error: testError } = await supabase.auth.getSession()
      console.log('Supabase connection test:', { testData, testError })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      console.log('Supabase auth response:', { data, error })

      if (error) {
        console.error('Auth error:', error)
        throw error
      }

      if (data.user) {
        console.log('User created, attempting to create profile...')
        
        // Create profile in profiles table
        const profileToInsert = {
          id: data.user.id,
          email: data.user.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          age: userData.age,
          city: userData.city,
          state: userData.state,
          sport: userData.sport,
          additional_sport: userData.additionalSport || null,
          role: userData.role,
          profile_picture_url: userData.profilePictureUrl || null,
          hourly_rate: userData.hourlyRate ? parseFloat(userData.hourlyRate) : null,
          teaching_areas: userData.teachingAreas || [],
          created_at: new Date().toISOString(),
        }

        // Add a small delay to ensure user is fully created in auth.users
        await new Promise(resolve => setTimeout(resolve, 1000))

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileToInsert])

        console.log('Profile creation result:', { profileError })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw profileError
        }

        // Handle profile picture upload if provided
        if (userData.profilePictureUrl && userData.profilePictureUrl.startsWith('data:')) {
          console.log('Uploading profile picture from data URL...')
          try {
            await uploadProfilePictureFromDataUrl(data.user.id, userData.profilePictureUrl)
            console.log('Profile picture uploaded successfully')
          } catch (uploadError) {
            console.error('Error uploading profile picture:', uploadError)
            // Don't throw error - profile creation was successful
          }
        }

        // Send welcome email based on user role
        try {
          console.log('Sending welcome email for role:', userData.role)
          const welcomeEmailData = {
            userType: userData.role,
            recipientEmail: data.user.email,
            recipientName: `${userData.firstName} ${userData.lastName}`,
            dashboardURL: 'http://127.0.0.1:3000/dashboard',
            mentorsURL: 'http://127.0.0.1:3000/mentors'
          }

          const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
            body: welcomeEmailData
          })

          if (emailError) {
            console.error('Error sending welcome email:', emailError)
            // Don't throw error - account creation was successful
          } else {
            console.log('Welcome email sent successfully')
          }
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError)
          // Don't throw error - account creation was successful
        }
        
        // Force sign out after successful signup to clear the access token
        // This ensures the user must sign in manually after email verification
        console.log('Signup successful - forcing sign out to clear access token')
        await supabase.auth.signOut()
        
        // Clear any stored tokens manually
        try {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-')) {
              localStorage.removeItem(key)
            }
          })
          Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('sb-')) {
              sessionStorage.removeItem(key)
            }
          })
          console.log('Cleared all Supabase tokens after signup')
        } catch (storageError) {
          console.error('Failed to clear storage after signup:', storageError)
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error('SignUp error:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const userProfile = await getUserProfile(data.user.id)
        setProfile(userProfile)
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      console.log('AuthContext: Starting signOut...')
      console.log('AuthContext: Supabase client exists:', !!supabase)
      console.log('AuthContext: Supabase auth exists:', !!supabase?.auth)
      
      // Clear local state immediately to ensure UI updates
      console.log('AuthContext: Clearing user state immediately...')
      setUser(null)
      setProfile(null)
      console.log('AuthContext: User state cleared')
      
      // Try Supabase signOut with timeout
      try {
        const signOutPromise = supabase.auth.signOut()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('SignOut timeout')), 3000)
        )
        
        const { error } = await Promise.race([signOutPromise, timeoutPromise])
        
        if (error) {
          console.error('AuthContext: Supabase signOut error:', error)
        } else {
          console.log('AuthContext: Supabase signOut successful')
        }
      } catch (signOutError) {
        console.error('AuthContext: Supabase signOut failed:', signOutError)
      }
      
      // Always clear storage as a fallback, regardless of Supabase signOut success
      try {
        console.log('AuthContext: Clearing all authentication storage...')
        
        // Clear all Supabase-related storage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key)
            console.log('AuthContext: Removed localStorage item:', key)
          }
        })
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            sessionStorage.removeItem(key)
            console.log('AuthContext: Removed sessionStorage item:', key)
          }
        })
        
        // Also clear any access tokens that might be stored
        localStorage.removeItem('access_token')
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.removeItem('access_token')
        sessionStorage.removeItem('supabase.auth.token')
        
        console.log('AuthContext: All authentication storage cleared')
      } catch (storageError) {
        console.error('AuthContext: Failed to clear storage:', storageError)
      }
      
      return { error: null }
    } catch (error) {
      console.error('AuthContext: SignOut error:', error)
      // Clear local state even if there's an error
      console.log('AuthContext: Clearing user state despite error...')
      setUser(null)
      setProfile(null)
      return { error }
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in')

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      // Refresh profile data
      const updatedProfile = await getUserProfile(user.id)
      setProfile(updatedProfile)

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // Helper function to upload profile picture from data URL
  const uploadProfilePictureFromDataUrl = async (userId, dataUrl) => {
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      
      // Generate unique filename
      const fileExt = blob.type.split('/')[1] || 'jpg'
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob)
      
      if (uploadError) {
        throw uploadError
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
      
      // Update profile with new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('id', userId)
      
      if (updateError) {
        throw updateError
      }
      
      return publicUrl
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      throw error
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
