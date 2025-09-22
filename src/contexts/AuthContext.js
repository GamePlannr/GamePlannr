import React, { useContext, useState, useEffect, createContext } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to auth changes
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, userData) => {
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) return { error: signUpError };

      // ✅ Wait for session to be ready after sign-up
      let session = null;
      for (let i = 0; i < 10; i++) {
        const { data } = await supabase.auth.getSession();
        session = data?.session;
        if (session?.user?.id) break;
        await new Promise((r) => setTimeout(r, 200)); // wait 200ms
      }

      if (!session?.user?.id) {
        return { error: new Error('Session not established after signup') };
      }

      const userId = session.user.id;

      // Parse hourly rate
      const hourlyRateNumber =
        typeof userData.hourlyRate === 'string' && userData.hourlyRate.trim() !== ''
          ? parseFloat(userData.hourlyRate)
          : null;

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
        bio: '',
        phone: '',
        experience: '',
        profile_picture_url: userData.profilePictureUrl,
        improvement_areas: userData.improvementAreas || [],
        teaching_areas: userData.teachingAreas || [],
        hourly_rate: hourlyRateNumber,
      };

      const { error: insertError } = await supabase.from('profiles').insert(profileToInsert);

      if (insertError) {
        return { error: insertError };
      }

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