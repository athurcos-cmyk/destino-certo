"use client";

import { useOnlineStatus } from "@/lib/hooks/use-online-status";
import { WifiOff } from "lucide-react";

export function OnlineStatus() {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-[100] bg-destructive text-destructive-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
      <WifiOff className="h-4 w-4" />
      Você está offline
    </div>
  );
}
