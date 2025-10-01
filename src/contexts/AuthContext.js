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

          if (!userProfile) {
            console.warn("No profile found for user:", session.user.id)
            setProfile({ role: "unknown", first_name: "User" }) // fallback
          } else {
            console.log('User profile loaded:', userProfile)
            setProfile(userProfile)
          }
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

        if (event === 'SIGNED_UP') {
          console.log('User signed up - waiting for email verification')
          setUser(null)
          setProfile(null)
        } else if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          console.log('Loading profile for user:', session.user.id)
          const userProfile = await getUserProfile(session.user.id)

          if (!userProfile) {
            console.warn("No profile found for user:", session.user.id)
            setProfile({ role: "unknown", first_name: "User" }) // fallback
          } else {
            console.log('User profile loaded:', userProfile)
            setProfile(userProfile)
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out - clearing state')
          setUser(null)
          setProfile(null)
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed - maintaining current state')
        } else {
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

  // ... (rest of your code stays exactly the same)
  
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