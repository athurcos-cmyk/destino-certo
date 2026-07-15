"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthChange,
  signInWithGoogle,
  signInAnonymously,
  signOut,
} from "@/lib/firebase/auth";
import type { User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginGoogle: () => Promise<void>;
  loginAnonimo: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginGoogle: async () => {},
  loginAnonimo: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginGoogle = async () => {
    const u = await signInWithGoogle();
    setUser(u);
  };

  const loginAnonimo = async () => {
    const u = await signInAnonymously();
    setUser(u);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loginGoogle, loginAnonimo, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
