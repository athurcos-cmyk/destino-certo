"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { MapPin, Plus, User, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { useAuth } from "@/components/auth/auth-provider";

const navItems = [
  { href: "/app", label: "Roteiros", icon: MapPin },
  { href: "/app/roteiro/novo", label: "Novo", icon: Plus },
  { href: "/app/configuracoes", label: "Perfil", icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <LoadingScreen />;

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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
        <div className="p-4 border-b">
          <Link
            href="/app"
            className="flex items-center gap-2 font-heading font-bold text-lg"
          >
            <MapPin className="h-5 w-5 text-sky-500" />
            <span>Destino Certo</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback className="text-xs">{iniciais}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left truncate">
                <p className="font-medium text-sm truncate">
                  {user.displayName || "Usuário"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email || "Anônimo"}
                </p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => router.push("/app/configuracoes")}>
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between h-14 px-4 border-b bg-background">
          <Link href="/app" className="flex items-center gap-2 font-heading font-bold">
            <MapPin className="h-5 w-5 text-sky-500" />
            <span>Destino Certo</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="p-3 min-w-[44px] min-h-[44px] rounded-md hover:bg-muted transition-colors flex items-center justify-center">
              <Menu className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {navItems.map((item) => (
                <DropdownMenuItem
                  key={item.href}
                  onClick={() => router.push(item.href)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto animate-in fade-in duration-200">
          {children}
        </main>

        {/* Bottom nav - mobile */}
        <nav className="md:hidden relative flex items-center justify-around h-16 border-t bg-background pb-[env(safe-area-inset-bottom,0px)]">
          {navItems.map((item) => {
            const isActive =
              item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href);
            const isNew = item.href === "/app/roteiro/novo";

            if (isNew) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative -mt-6 flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-full bg-cta text-cta-foreground flex items-center justify-center shadow-lg shadow-cta/30 active:scale-95 transition-transform">
                    <Plus className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    Novo
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] px-2 py-1 text-[11px] font-medium transition-colors rounded-lg ${
                  isActive
                    ? "text-primary relative after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-0.5 after:bg-primary after:rounded-full"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="leading-none">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
