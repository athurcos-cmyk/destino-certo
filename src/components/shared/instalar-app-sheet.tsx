"use client";

import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  consumeDeferredInstallPrompt,
  dismissInstallPromptPermanently,
  getDeferredInstallPrompt,
  isInstallPromptDismissed,
  isIOSDevice,
  isRunningStandalone,
  onInstallPromptChange,
} from "@/lib/pwa/install-prompt";

export function InstalarAppSheet() {
  const [deferredPrompt, setDeferredPrompt] = useState(getDeferredInstallPrompt);
  const [instalando, setInstalando] = useState(false);
  const [dispensado, setDispensado] = useState(true);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    // Só decide se mostra depois de montar no client — evita mismatch de hidratação
    setDispensado(isInstallPromptDismissed());
    setPronto(true);
    return onInstallPromptChange(() => setDeferredPrompt(getDeferredInstallPrompt()));
  }, []);

  if (!pronto) return null;

  const standalone = isRunningStandalone();
  const iOS = isIOSDevice();
  const aberto = !standalone && !dispensado && (iOS || Boolean(deferredPrompt));

  function fechar() {
    dismissInstallPromptPermanently();
    setDispensado(true);
  }

  async function instalar() {
    if (!deferredPrompt) return;
    setInstalando(true);
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } finally {
      consumeDeferredInstallPrompt();
      setDeferredPrompt(null);
      setInstalando(false);
      dismissInstallPromptPermanently();
      setDispensado(true);
    }
  }

  return (
    <Sheet open={aberto} onOpenChange={(open) => !open && fechar()}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <div className="bg-primary text-primary-foreground px-6 py-5 ticket-notch-bottom -mt-4 -mx-4 sm:-mx-6">
          <div className="w-12 h-12 rounded-xl bg-primary-foreground/15 flex items-center justify-center mb-3">
            <Plane className="h-6 w-6 rotate-45" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-75">Cartão de embarque</p>
          <h2 className="font-heading text-2xl font-medium">Instale o Destino Certo</h2>
        </div>
        <div className="border-t-2 border-dashed border-border/80 -mt-2 mb-2" />

        <div className="px-4 sm:px-6 pb-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Acesso rápido direto da tela inicial, funciona offline e sem
            ocupar espaço de app store.
          </p>

          {iOS ? (
            <ol className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Share className="h-4 w-4" />
                </span>
                <span>
                  Toque no botão <strong>Compartilhar</strong> na barra do Safari.
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <SquarePlus className="h-4 w-4" />
                </span>
                <span>
                  Escolha <strong>Adicionar à Tela de Início</strong>.
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Download className="h-4 w-4" />
                </span>
                <span>
                  Toque em <strong>Adicionar</strong> no canto superior.
                </span>
              </li>
            </ol>
          ) : (
            <Button className="w-full" size="lg" disabled={instalando} onClick={instalar}>
              <Download className="h-4 w-4 mr-2" />
              {instalando ? "Instalando..." : "Instalar agora"}
            </Button>
          )}

          <button
            type="button"
            onClick={fechar}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground min-h-[32px]"
          >
            Agora não
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
