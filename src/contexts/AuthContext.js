import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Restore session when app loads
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        setUser(data?.session?.user ?? null);
      } catch (err) {
        console.error('❌ Error restoring session:', err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    // ✅ Listen for auth state changes in real time
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup on unmount
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // ✅ Logout function — completely clears session + cache
  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' }); // clears all sessions
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
    } catch (error) {
      console.error('❌ Sign-out failed:', error.message);
    }
  };

  const value = {
    user,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Only render app once auth state is known */}
      {!loading && children}
    </AuthContext.Provider>
  );
};