"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any | null>(null);
  const router = useRouter();

  // Load current user
  const loadUser = async () => {
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    setUser(data.user || null);
    setLoading(false);
  };

  useEffect(() => {
    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Sign In
  const signIn = async (email: string, password: string) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      throw new Error(error.message);
    }

    setUser(data.user);
    router.push("/"); 
    setLoading(false);
  };

  // Sign Up
  const signUp = async (email: string, password: string) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
      setLoading(false);
      throw new Error(error?.message || "Signup failed");
    }

    setUser(data.user);
    router.push("/"); 
    setLoading(false);
  };

  // Sign Out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
