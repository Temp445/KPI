"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: any | null;
  role: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // fetch user role
  const loadUser = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setUser(null);
      setRole(null);
      setLoading(false);
      return { user: null, role: null };
    }

    setUser(user);

    const { data } = await supabase
      .from("user_role")
      .select("role")
      .eq("id", user.id)
      .single();

    const userRole = data?.role || null;
    setRole(userRole);
    setLoading(false);

    return { user, role: userRole };
  };

  useEffect(() => {
    loadUser();
    // "Listen the current state login or logout"
    const { data: listener } = supabase.auth.onAuthStateChange((_event, _session) => {
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

    if (!data.user) {
      setLoading(false);
      throw new Error("No user returned");
    }

    const { role: userRole } = await loadUser();

    if (userRole === "admin") {
      router.push("/dashboard");
    } else {
      router.push("/");
    }

    setLoading(false);
  };

  // Sign Up
  const signUp = async (email: string, password: string) => {
    setLoading(true);

    const { count, error: countError } = await supabase
      .from("user_role")
      .select("*", { count: "exact", head: true });

    if (countError) {
      setLoading(false);
      throw new Error(countError.message);
    }

    const isFirstUser = count === 0;

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error || !data.user) {
      setLoading(false);
      throw new Error(error?.message || "Sign up failed");
    }

    // Assign role
    await supabase.from("user_role").insert({
      id: data.user.id,
      role: isFirstUser ? "admin" : "user",
    });

    await loadUser();


    setLoading(false);
  };


  // Sign Out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
