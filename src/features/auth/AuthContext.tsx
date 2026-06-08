"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import { getSession, onAuthStateChange, signIn, signUp, signOut } from "@/features/auth/auth";
import type { User } from "@/types/index";
import type { Session } from "@supabase/supabase-js";
import type { AuthContextType } from "@/features/auth/types";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

let didInit = false;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (didInit) return;
    didInit = true;

    const initialize = async () => {
      const { session: currentSession } = await getSession();

      if (currentSession?.user) {
        setSession(currentSession);
        setUser({
          id: currentSession.user.id,
          email: currentSession.user.email ?? "",
          full_name: currentSession.user.user_metadata?.full_name,
          avatar_url: currentSession.user.user_metadata?.avatar_url,
          currency: currentSession.user.user_metadata?.currency,
        });
      }

      setLoading(false);
    };

    initialize();

    const { data: { subscription } } = onAuthStateChange((_event, changedSession) => {
      setSession(changedSession);

      if (changedSession?.user) {
        setUser({
          id: changedSession.user.id,
          email: changedSession.user.email ?? "",
          full_name: changedSession.user.user_metadata?.full_name,
          avatar_url: changedSession.user.user_metadata?.avatar_url,
          currency: changedSession.user.user_metadata?.currency,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setUserFromSession = (s: Session) => {
    setSession(s);
    setUser({
      id: s.user.id,
      email: s.user.email ?? "",
      full_name: s.user.user_metadata?.full_name,
      avatar_url: s.user.user_metadata?.avatar_url,
      currency: s.user.user_metadata?.currency,
    });
  };

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    const result = await signUp(email, password, fullName);
    return { error: result.error, session: result.session };
  };

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (!result.error && result.session) {
      setUserFromSession(result.session);
    }
    return { error: result.error, session: result.session };
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
