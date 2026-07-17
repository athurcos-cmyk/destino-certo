"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/auth-provider";
import { useTheme } from "@/components/shared/theme-provider";

export default function ConfiguracoesPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  if (!user) return null;

  const iniciais = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase() || "?";

  return (
    <div className="p-6 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <h1 className="text-2xl font-bold mb-6">Configurações</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Suas informações de conta</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.photoURL || undefined} />
            <AvatarFallback className="text-lg">{iniciais}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {user.displayName || "Usuário Anônimo"}
            </p>
            <p className="text-sm text-muted-foreground">
              {user.email || "Conta anônima"}
            </p>
            {user.isAnonymous && (
              <p className="text-xs text-muted-foreground mt-1">
                Você está usando uma conta anônima. Vincule ao Google para
                salvar seus roteiros permanentemente.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>Como o app deve ser exibido</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between w-full min-h-[44px]"
          >
            <span className="flex items-center gap-2 text-sm">
              {theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              Modo escuro
            </span>
            <span
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                theme === "dark" ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === "dark" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </span>
          </button>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full text-destructive hover:text-destructive"
        onClick={() => {
          logout();
          router.push("/");
        }}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sair da conta
      </Button>
    </div>
  );
}
