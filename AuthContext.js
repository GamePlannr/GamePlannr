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

  // -----------------
  // SIGN UP
  // -----------------
  const signUp = async (email, password, userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error

      if (data.user) {
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

        await new Promise(resolve => setTimeout(resolve, 1000))

        await supabase.from('profiles').insert([profileToInsert])

        // sign user out after signup so they must log back in
        await supabase.auth.signOut()
      }

      return { data, error: null }
    } catch (error) {
      console.error('SignUp error:', error)
      return { data: null, error }
    }
  }

  // -----------------
  // SIGN IN
  // -----------------
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

  // -----------------
  // SIGN OUT
  // -----------------
  const signOut = async () => {
    try {
      setUser(null)
      setProfile(null)
      await supabase.auth.signOut()
      return { error: null }
    } catch (error) {
      console.error('SignOut error:', error)
      setUser(null)
      setProfile(null)
      return { error }
    }
  }

  // -----------------
  // UPDATE PROFILE
  // -----------------
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in')
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      const updatedProfile = await getUserProfile(user.id)
      setProfile(updatedProfile)
      return { error: null }
    } catch (error) {
      console.error('updateProfile error:', error)
      return { error }
    }
  }

  // -----------------
  // INITIAL SESSION + LISTENERS
  // -----------------
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          setUser(null)
          setProfile(null)
        } else if (session?.user) {
          setUser(session.user)
          const userProfile = await getUserProfile(session.user.id)
          setProfile(userProfile)
        } else {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          const userProfile = await getUserProfile(session.user.id)
          setProfile(userProfile)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // -----------------
  // CONTEXT VALUE
  // -----------------
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