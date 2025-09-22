import React, { createContext, useContext, useEffect, useState } from 'react' import { supabase, getUserProfile } from '../utils/supabase'

const AuthContext = createContext({})

export const useAuth = () => { const context = useContext(AuthContext) if (!context) throw new Error('useAuth must be used within an AuthProvider') return context }

export const AuthProvider = ({ children }) => { const [user, setUser] = useState(null) const [profile, setProfile] = useState(null) const [loading, setLoading] = useState(true)

useEffect(() => { const getInitialSession = async () => { try { const { data: { session }, error } = await supabase.auth.getSession() if (session?.user) { setUser(session.user) const userProfile = await getUserProfile(session.user.id) setProfile(userProfile) } else { setUser(null) setProfile(null) } } catch (error) { console.error('Session error:', error) } setLoading(false) }

getInitialSession()

const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      setUser(session.user)
      const userProfile = await getUserProfile(session.user.id)
      setProfile(userProfile)

      const pendingUserData = localStorage.getItem('pendingUserProfile')
      if (pendingUserData) {
        try {
          const userData = JSON.parse(pendingUserData)
          const profileToInsert = {
            id: session.user.id,
            email: session.user.email,
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
          const { error: profileError } = await supabase.from('profiles').insert([profileToInsert])
          if (!profileError) {
            console.log('Pending profile created successfully')
            localStorage.removeItem('pendingUserProfile')
          } else {
            console.error('Profile creation error after login:', profileError)
          }
        } catch (e) {
          console.error('Failed to insert pending profile:', e)
        }
      }
    } else if (event === 'SIGNED_OUT') {
      setUser(null)
      setProfile(null)
    }
    setLoading(false)
  }
)

return () => subscription.unsubscribe()

}, [])

const signUp = async (email, password, userData) => { try { const { data, error } = await supabase.auth.signUp({ email, password }) if (error) throw error if (data.user) { localStorage.setItem('pendingUserProfile', JSON.stringify(userData)) await supabase.auth.signOut() Object.keys(localStorage).forEach(key => key.startsWith('sb-') && localStorage.removeItem(key)) Object.keys(sessionStorage).forEach(key => key.startsWith('sb-') && sessionStorage.removeItem(key)) } return { data, error: null } } catch (error) { return { data: null, error } } }

const signIn = async (email, password) => { try { const { data, error } = await supabase.auth.signInWithPassword({ email, password }) if (error) throw error if (data.user) { const userProfile = await getUserProfile(data.user.id) setProfile(userProfile) } return { data, error: null } } catch (error) { return { data: null, error } } }

const signOut = async () => { setUser(null) setProfile(null) try { await supabase.auth.signOut() Object.keys(localStorage).forEach(key => key.startsWith('sb-') && localStorage.removeItem(key)) Object.keys(sessionStorage).forEach(key => key.startsWith('sb-') && sessionStorage.removeItem(key)) } catch (e) { console.error('SignOut error:', e) } }

const updateProfile = async (updates) => { try { if (!user) throw new Error('No user') const { error } = await supabase.from('profiles').update(updates).eq('id', user.id) if (error) throw error const updatedProfile = await getUserProfile(user.id) setProfile(updatedProfile) return { error: null } } catch (error) { return { error } } }

const value = { user, profile, loading, signUp, signIn, signOut, updateProfile, }

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider> }

