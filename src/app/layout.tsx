import type { Metadata, Viewport } from "next";
import { Outfit, Work_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/auth-provider";
import { QueryProvider } from "@/components/shared/query-provider";
import { Toaster } from "sonner";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const workSans = Work_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0EA5E9",
};

export const metadata: Metadata = {
  title: {
    default: "Destino Certo - Planejador de Viagens",
    template: "%s | Destino Certo",
  },
  description:
    "Crie e compartilhe roteiros de viagem com mapas interativos. Organize seus destinos dia a dia e compartilhe com quem quiser.",
  manifest: "/manifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Destino Certo",
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
      className={`${outfit.variable} ${workSans.variable} h-full antialiased`}
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
