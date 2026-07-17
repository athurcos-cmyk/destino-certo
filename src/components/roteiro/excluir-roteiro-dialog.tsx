"use client";

import { useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { excluirRoteiroCompleto } from "@/lib/firebase/firestore";
import { toast } from "sonner";

interface ExcluirRoteiroDialogProps {
  roteiroId: string;
  roteiroTitulo: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExcluido: () => void;
}

export function ExcluirRoteiroDialog({
  roteiroId,
  roteiroTitulo,
  open,
  onOpenChange,
  onExcluido,
}: ExcluirRoteiroDialogProps) {
  const [excluindo, setExcluindo] = useState(false);

  function handleExcluir() {
    setExcluindo(true);
    excluirRoteiroCompleto(roteiroId).catch((err) =>
      console.error("Erro ao excluir roteiro:", err)
    );
    toast.success("Roteiro excluído");
    onOpenChange(false);
    setExcluindo(false);
    onExcluido();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 text-destructive" />
            Excluir roteiro
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Tem certeza que quer excluir <strong>{roteiroTitulo}</strong>? Todos
          os dias e paradas serão apagados permanentemente. Essa ação não pode
          ser desfeita.
        </p>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleExcluir}
            disabled={excluindo}
          >
            {excluindo && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Excluir permanentemente
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
