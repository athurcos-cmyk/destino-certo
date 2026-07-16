"use client";

import { useEffect } from "react";
import { setupOnlineListener, processQueue } from "@/lib/offline/sync-handler";

export function SyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Process any pending items on mount (app just opened)
    processQueue();

    // Set up online/offline listener
    const cleanup = setupOnlineListener();
    return cleanup;
  }, []);

  return <>{children}</>;
}
