import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const client = getSupabase();

    if (!client) {
      if (mounted) setIsLoading(false);
      return;
    }

    const loadSession = async () => {
      try {
        const { data: { session: s } } = await client.auth.getSession();
        if (mounted) {
          setSession(s ?? null);
          setUser(s?.user ?? null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadSession();

    const { data: { subscription } } = client.auth.onAuthStateChange(
      (_event, s) => {
        if (!mounted) return;
        setSession(s ?? null);
        setUser(s?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    isLoading,
    isSignedIn: !!user,
  };
}

export function useSignIn() {
  const [isPending, setIsPending] = useState(false);

  const signIn = useCallback(async (email: string, password: string) => {
    const client = getSupabase();
    if (!client) throw new Error("Supabase is not configured (missing env).");
    setIsPending(true);
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { signIn, isPending };
}

export function useSignUp() {
  const [isPending, setIsPending] = useState(false);

  const signUp = useCallback(
    async (email: string, password: string, options?: { fullName?: string }) => {
      const client = getSupabase();
      if (!client) throw new Error("Supabase is not configured (missing env).");
      setIsPending(true);
      try {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: options?.fullName ? { full_name: options.fullName } : undefined,
          },
        });
        if (error) throw error;
        return data;
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  return { signUp, isPending };
}

export function useSignOut() {
  const [isPending, setIsPending] = useState(false);

  const signOut = useCallback(async () => {
    const client = getSupabase();
    if (!client) return;
    setIsPending(true);
    try {
      await client.auth.signOut();
    } finally {
      setIsPending(false);
    }
  }, []);

  return { signOut, isPending };
}
