"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addDocument } from "@/lib/firebase/firestore";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { gerarDiasEntreDatas } from "@/lib/utils/formatar-data";
import type { RoteiroFormData } from "@/lib/types/roteiro";

export default function NovoRoteiroPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<RoteiroFormData>({
    titulo: "",
    descricao: "",
    destino: "",
    dataInicio: new Date(),
    dataFim: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || saving) return;

    if (form.dataFim < form.dataInicio) {
      toast.error("A data de fim deve ser posterior à data de início.");
      return;
    }

    const diasDiff = Math.ceil(
      (form.dataFim.getTime() - form.dataInicio.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diasDiff > 60) {
      toast.error("O roteiro não pode ter mais de 60 dias.");
      return;
    }

    setSaving(true);
    try {
      const roteiroId = await addDocument("roteiros", {
        titulo: form.titulo,
        descricao: form.descricao,
        destino: form.destino,
        imagemCapa: null,
        dataInicio: form.dataInicio,
        dataFim: form.dataFim,
        donoId: user.uid,
        colaboradores: [],
        slugCompartilhamento: null,
        compartilhamentoAtivo: false,
      });

      // Create days between start and end dates
      const dias = gerarDiasEntreDatas(form.dataInicio, form.dataFim);
      for (let i = 0; i < dias.length; i++) {
        await addDocument(`roteiros/${roteiroId}/dias`, {
          data: dias[i],
          numeroDia: i + 1,
          notas: "",
          ordem: i,
        });
      }

      router.push(`/app/roteiro/${roteiroId}`);
    } catch (err) {
      console.error("Erro ao criar roteiro:", err);
      toast.error("Erro ao criar roteiro. Tente novamente.");
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <Card>
        <CardHeader>
          <CardTitle>Novo Roteiro</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título da viagem</Label>
              <Input
                id="titulo"
                placeholder="Ex: Minha viagem a Curitiba"
                value={form.titulo}
                onChange={(e) =>
                  setForm({ ...form, titulo: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destino">Destino</Label>
              <Input
                id="destino"
                placeholder="Ex: Curitiba, PR"
                value={form.destino}
                onChange={(e) =>
                  setForm({ ...form, destino: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inicio">Data de início</Label>
                <Input
                  id="inicio"
                  type="date"
                  value={form.dataInicio.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dataInicio: new Date(e.target.value + "T12:00:00"),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fim">Data de fim</Label>
                <Input
                  id="fim"
                  type="date"
                  value={form.dataFim.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dataFim: new Date(e.target.value + "T12:00:00"),
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                placeholder="Alguma nota sobre a viagem..."
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {saving ? "Criando..." : "Criar Roteiro"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
