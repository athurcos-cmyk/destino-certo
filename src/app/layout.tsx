import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/auth-provider";
import { QueryProvider } from "@/components/shared/query-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Itinerario - Planejador de Viagens",
    template: "%s | Itinerario",
  },
  description:
    "Crie e compartilhe roteiros de viagem com mapas interativos. Organize seus destinos dia a dia e compartilhe com quem quiser.",
  manifest: "/manifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Itinerario",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <AuthProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </AuthProvider>
        </QueryProvider>
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}
