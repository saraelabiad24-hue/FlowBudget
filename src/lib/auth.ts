import { supabase } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";

export interface AuthResult {
  user: User | null;
  error: string | null;
}

export interface SessionResult {
  session: import("@supabase/supabase-js").Session | null;
  error: string | null;
}

export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  return {
    user: data.user,
    error: error?.message ?? null,
  };
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    error: error?.message ?? null,
  };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSession(): Promise<SessionResult> {
  const { data, error } = await supabase.auth.getSession();

  return {
    session: data.session,
    error: error?.message ?? null,
  };
}

export async function getUser(): Promise<AuthResult> {
  const { data, error } = await supabase.auth.getUser();

  return {
    user: data.user,
    error: error?.message ?? null,
  };
}

export function onAuthStateChange(
  callback: (event: "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED", session: import("@supabase/supabase-js").Session | null) => void
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event as "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED", session);
  });
}