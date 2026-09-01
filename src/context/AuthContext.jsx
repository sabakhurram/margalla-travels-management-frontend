import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../config/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Profile error:", error);
      setProfile(null);
      return;
    }

    setProfile(data);
  };

useEffect(() => {
  const initializeAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setSession(session);

    if (session?.user) {
      await fetchProfile(session.user.id);
    } else {
      setProfile(null);
    }

    setLoading(false);
  };

  initializeAuth();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event, session) => {
    setSession(session);

    if (session?.user) {
      await fetchProfile(session.user.id);
    } else {
      setProfile(null);
    }

    setLoading(false);
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  // True whenever the logged-in user still needs to change
  // a temporary password (set at account creation or reset).
  const mustResetPassword =
    session?.user?.user_metadata?.must_reset_password === true;

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    logout,
    mustResetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
