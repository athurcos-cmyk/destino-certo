const DISMISSED_KEY = "destino-certo.pwaInstallDismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let listeners: Array<() => void> = [];

function notify() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });
}

/** Evento de instalação capturado do Chrome/Edge/Android, se o navegador disparou um. Consumido uma vez. */
export function getDeferredInstallPrompt() {
  return deferredPrompt;
}

export function consumeDeferredInstallPrompt() {
  deferredPrompt = null;
}

/** Assina mudanças (evento capturado ou app instalado). Retorna função de cancelamento. */
export function onInstallPromptChange(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((listener) => listener !== callback);
  };
}

/** App já rodando instalado (standalone) — Android/desktop e iOS têm sinais próprios. */
export function isRunningStandalone() {
  if (typeof window === "undefined") return false;
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
  return window.matchMedia("(display-mode: standalone)").matches || iosStandalone === true;
}

/** iPhone/iPad Safari não dispara `beforeinstallprompt` — precisa do passo a passo manual. */
export function isIOSDevice() {
  if (typeof navigator === "undefined") return false;
  const isAppleTouchDevice = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isIPadOS13Plus = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return isAppleTouchDevice || isIPadOS13Plus;
}

export function isInstallPromptDismissed(): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissInstallPromptPermanently() {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    // Melhor esforço — pior caso o aviso reaparece.
  }
}
