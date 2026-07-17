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
  signInWithEmail,
  signUpWithEmail,
  signOut,
} from "@/lib/firebase/auth";
import type { User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginGoogle: () => Promise<void>;
  loginAnonimo: () => Promise<void>;
  loginEmail: (email: string, senha: string) => Promise<void>;
  cadastrarEmail: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginGoogle: async () => {},
  loginAnonimo: async () => {},
  loginEmail: async () => {},
  cadastrarEmail: async () => {},
  logout: async () => {},
});

function mensagemErroAuth(err: any): string {
  switch (err?.code) {
    case "auth/email-already-in-use":
      return "Esse e-mail já tem uma conta. Tente entrar em vez de criar uma nova.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-mail ou senha incorretos.";
    case "auth/weak-password":
      return "A senha precisa ter pelo menos 6 caracteres.";
    case "auth/invalid-email":
      return "Digite um e-mail válido.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde um momento e tente de novo.";
    default:
      return "Não foi possível entrar. Verifique seus dados e tente novamente.";
  }
}

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

  const loginEmail = async (email: string, senha: string) => {
    try {
      const u = await signInWithEmail(email, senha);
      setUser(u);
    } catch (err: any) {
      throw new Error(mensagemErroAuth(err));
    }
  };

  const cadastrarEmail = async (email: string, senha: string) => {
    try {
      const u = await signUpWithEmail(email, senha);
      setUser(u);
    } catch (err: any) {
      throw new Error(mensagemErroAuth(err));
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
      value={{ user, loading, loginGoogle, loginAnonimo, loginEmail, cadastrarEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
