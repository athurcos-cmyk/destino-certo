import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCollection, where, orderBy } from "@/lib/firebase/firestore";
import { TIPO_PARADA_LABELS, CORES_TIPO_PARADA } from "@/lib/constants";
import { formatarDataCurta } from "@/lib/utils/formatar-data";
import type { Roteiro, Dia, Parada } from "@/lib/types/roteiro";

async function getRoteiroBySlug(slug: string) {
  const roteiros = await getCollection<Roteiro>(
    "roteiros",
    where("slugCompartilhamento", "==", slug),
    where("compartilhamentoAtivo", "==", true)
  );
  return roteiros[0] || null;
}

async function getDias(roteiroId: string) {
  return getCollection<Dia>(
    `roteiros/${roteiroId}/dias`,
    orderBy("ordem", "asc")
  );
}

async function getParadas(roteiroId: string, diaId: string) {
  return getCollection<Parada>(
    `roteiros/${roteiroId}/dias/${diaId}/paradas`,
    orderBy("ordem", "asc")
  );
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CompartilharPage({ params }: PageProps) {
  const { slug } = await params;
  const roteiro = await getRoteiroBySlug(slug);

  if (!roteiro) {
    notFound();
  }

  const dias = await getDias(roteiro.id);
  const paradasMap: Record<string, Parada[]> = {};

  for (const dia of dias) {
    paradasMap[dia.id] = await getParadas(roteiro.id, dia.id);
  }

  return (
    <div className="min-h-screen bg-paper bg-grain">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-10 px-4 ticket-notch-bottom">
        <div className="max-w-2xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70">
            Roteiro de viagem
          </span>
          <h1 className="font-heading text-3xl font-medium mt-1 mb-2">{roteiro.titulo}</h1>
          <div className="flex items-center gap-4 text-primary-foreground/80 text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {roteiro.destino}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatarDataCurta(roteiro.dataInicio.toDate())} -{" "}
              {formatarDataCurta(roteiro.dataFim.toDate())}
            </span>
          </div>
          {roteiro.descricao && (
            <p className="mt-3 text-primary-foreground/80 text-sm">
              {roteiro.descricao}
            </p>
          )}
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4">
        <div className="border-t-2 border-dashed border-border/80" />
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6 py-8">
        {dias.map((dia) => {
          const paradasDoDia = paradasMap[dia.id] || [];
          return (
            <div key={dia.id}>
              <h3 className="font-heading font-semibold text-lg mb-3">
                Dia {dia.numeroDia} - {formatarDataCurta(dia.data.toDate())}
              </h3>

              {paradasDoDia.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                  Nenhuma parada neste dia
                </p>
              ) : (
                <div className="relative pl-6">
                  <div
                    className="absolute left-[16px] top-2 bottom-2 w-0.5 route-dashed"
                    aria-hidden="true"
                  />
                  {paradasDoDia.map((parada) => (
                    <div
                      key={parada.id}
                      className="relative flex items-start gap-3 py-1.5"
                    >
                      <div
                        className="absolute left-[-21px] top-[12px] w-2.5 h-2.5 rounded-full border-2 border-background shrink-0 z-10"
                        style={{
                          backgroundColor:
                            CORES_TIPO_PARADA[parada.tipo] || "#6b7280",
                        }}
                      />
                      <Card className="flex-1 min-w-0">
                        <CardContent className="p-2.5 leading-tight">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-heading font-medium text-sm">
                              {parada.nome}
                            </p>
                            <Badge variant="outline" className="text-[10px]">
                              {TIPO_PARADA_LABELS[parada.tipo]}
                            </Badge>
                          </div>
                          {(parada.endereco || parada.horarioInicio || parada.horarioFim) && (
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground min-w-0">
                              {parada.endereco && (
                                <span className="flex items-center gap-1 min-w-0 flex-1">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{parada.endereco}</span>
                                </span>
                              )}
                              {(parada.horarioInicio || parada.horarioFim) && (
                                <span className="flex items-center gap-1 shrink-0">
                                  <Clock className="h-3 w-3" />
                                  {parada.horarioInicio || "?"} -{" "}
                                  {parada.horarioFim || "?"}
                                </span>
                              )}
                            </div>
                          )}
                          {parada.notas && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {parada.notas}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-border/60 bg-background">
        <p className="text-sm text-muted-foreground mb-4">
          Roteiro criado com{" "}
          <span className="font-heading font-semibold italic text-primary">Destino Certo</span>
        </p>
        <Link href="/login">
          <Button variant="outline" size="sm">
            Criar Meu Roteiro
          </Button>
        </Link>
      </div>
    </div>
  );
}
