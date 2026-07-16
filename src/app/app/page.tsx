"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, MapPin, Calendar, ExternalLink, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuth } from "@/components/auth/auth-provider";
import { getCollection, where } from "@/lib/firebase/firestore";
import type { Roteiro } from "@/lib/types/roteiro";
import { formatarData } from "@/lib/utils/formatar-data";

export default function DashboardPage() {
  const { user } = useAuth();
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setErro(null);
    try {
      const data = await getCollection<Roteiro>(
        "roteiros",
        where("donoId", "==", user.uid)
      );
      // Sort client-side to avoid composite index requirement
      data.sort((a, b) => {
        const aTime = a.atualizadoEm?.toMillis?.() ?? 0;
        const bTime = b.atualizadoEm?.toMillis?.() ?? 0;
        return bTime - aTime;
      });
      setRoteiros(data);
    } catch (err: any) {
      console.error("Erro ao carregar roteiros:", err);
      setErro(
        err?.message || "Erro ao carregar roteiros. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (loading && roteiros.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <Skeleton className="h-1.5 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="font-heading text-lg font-semibold mb-2">
            Erro ao carregar roteiros
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mb-6">
            {erro}
          </p>
          <button
            onClick={carregar}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Meus Roteiros</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {roteiros.length} roteiro{roteiros.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/app/roteiro/novo">
          <Button className="bg-cta text-cta-foreground hover:bg-cta/90 shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Roteiro
          </Button>
        </Link>
      </div>

      {roteiros.length === 0 ? (
        <EmptyState
          icon={
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-10 w-10 text-primary" />
            </div>
          }
          titulo="Nenhum roteiro ainda"
          descricao="Crie seu primeiro roteiro de viagem e comece a planejar sua próxima aventura."
          acao={
            <Link href="/app/roteiro/novo">
              <Button className="bg-cta text-cta-foreground hover:bg-cta/90" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Criar Primeiro Roteiro
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roteiros.map((r, idx) => (
            <div
              key={r.id}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{
                animationDelay: `${idx * 80}ms`,
                animationFillMode: "backwards",
              }}
            >
              <Link href={`/app/roteiro/${r.id}`}>
                <Card className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-primary to-cta" />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-heading font-semibold truncate flex-1 mr-2 text-[15px]">
                        {r.titulo}
                      </h3>
                      {r.compartilhamentoAtivo && (
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Compartilhado
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2 text-[13px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="truncate">{r.destino}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-cta/10 flex items-center justify-center shrink-0">
                          <Calendar className="h-3.5 w-3.5 text-cta" />
                        </div>
                        <span>
                          {formatarData(r.dataInicio.toDate())} -{" "}
                          {formatarData(r.dataFim.toDate())}
                        </span>
                      </div>
                    </div>
                    {r.descricao && (
                      <p className="text-[13px] text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
                        {r.descricao}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
