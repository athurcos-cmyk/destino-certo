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
    try {
      const u = await signInWithGoogle();
      setUser(u);
    } catch (err: any) {
      if (err?.code === "auth/popup-blocked") {
        throw new Error("Popup bloqueado. Permita popups para fazer login com Google.");
      }
      throw err;
    }
  };

  const loginAnonimo = async () => {
    try {
      const u = await signInAnonymously();
      setUser(u);
    } catch {
      throw new Error("Erro ao entrar anonimamente. Verifique sua conexão.");
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch {
      // Even if Firebase signOut fails, clear local state
      setUser(null);
    }
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
