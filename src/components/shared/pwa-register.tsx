"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

export function PwaRegister() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                setUpdateReady(true);
              }
            });
          });
        })
        .catch(() => {
          // SW registration failed — app works without it
        });

      // Listen for SW update messages (force refresh)
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "SW_UPDATED") {
          window.location.reload();
        }
      });

      // Check for controller change (SW took over)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
    }
  }, []);

  function applyUpdate() {
    navigator.serviceWorker.ready.then((reg) => {
      reg.waiting?.postMessage("skipWaiting");
    });
    setUpdateReady(false);
  }

  if (!updateReady) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
      <RefreshCw className="h-4 w-4" />
      Nova versão disponível
      <button
        onClick={applyUpdate}
        className="bg-primary-foreground/20 px-3 py-1 rounded-full hover:bg-primary-foreground/30 transition-colors text-xs"
      >
        Atualizar
      </button>
    </div>
  );
}
