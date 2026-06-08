import type { Session } from "@supabase/supabase-js";
import type { User } from "@/types";

export interface AuthResult {
  error: string | null;
  session: Session | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}
