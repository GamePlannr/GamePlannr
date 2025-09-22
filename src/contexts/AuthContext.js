import React, { useContext, useState, useEffect, createContext } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load initial session + auth listener
  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, userData) => {
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) return { error: signUpError };

      // Wait for Supabase to propagate user
      let session = null;
      for (let i = 0; i < 10; i++) {
        const { data } = await supabase.auth.getSession();
        session = data?.session;
        if (session?.user?.id) break;
        await new Promise(res => setTimeout(res, 300)); // wait 300ms
      }

      if (!session?.user?.id) {
        return { error: new Error("Session not established after sign up") };
      }

      const userId = session.user.id;

      const profileToInsert = {
        id: userId,
        email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        age: userData.age ? parseInt(userData.age) : null,
        city: userData.city,
        state: userData.state,
        sport: userData.sport,
        additional_sport: userData.additionalSport || null,
        role: userData.role,
        profile_picture_url: userData.profilePictureUrl || null,
        hourly_rate: userData.hourlyRate ? parseFloat(userData.hourlyRate) : null,
        teaching_areas: userData.teachingAreas || [],
        improvement_areas: userData.improvementAreas || [],
        bio: '',
        phone: '',
        experience: '',
      };

      const { error: insertError } = await supabase
        .from('profiles')
        .insert(profileToInsert);

      if (insertError) return { error: insertError };

      // Force sign-out to require login after email confirm
      await supabase.auth.signOut();

      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};