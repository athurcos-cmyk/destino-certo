"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
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

export default function ConfiguracoesPage() {
  const { user, logout } = useAuth();
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
    <div className="p-6 max-w-lg mx-auto">
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
