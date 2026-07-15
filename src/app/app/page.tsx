"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, MapPin, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuth } from "@/components/auth/auth-provider";
import { getCollection, where, orderBy, Timestamp } from "@/lib/firebase/firestore";
import type { Roteiro } from "@/lib/types/roteiro";
import { formatarData } from "@/lib/utils/formatar-data";

export default function DashboardPage() {
  const { user } = useAuth();
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function carregar() {
      try {
        const data = await getCollection<Roteiro>(
          "roteiros",
          where("donoId", "==", user!.uid),
          orderBy("atualizadoEm", "desc")
        );
        setRoteiros(data);
      } catch (err) {
        console.error("Erro ao carregar roteiros:", err);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Roteiro
          </Button>
        </Link>
      </div>

      {roteiros.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-12 w-12" />}
          titulo="Nenhum roteiro ainda"
          descricao="Crie seu primeiro roteiro de viagem e comece a planejar sua próxima aventura."
          acao={
            <Link href="/app/roteiro/novo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Roteiro
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roteiros.map((r) => (
            <Link key={r.id} href={`/app/roteiro/${r.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold truncate flex-1 mr-2">
                      {r.titulo}
                    </h3>
                    {r.compartilhamentoAtivo && (
                      <Badge variant="secondary" className="shrink-0">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Compartilhado
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{r.destino}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>
                        {formatarData(r.dataInicio.toDate())} -{" "}
                        {formatarData(r.dataFim.toDate())}
                      </span>
                    </div>
                  </div>
                  {r.descricao && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {r.descricao}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
