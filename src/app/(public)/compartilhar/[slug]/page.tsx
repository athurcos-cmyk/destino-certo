import { notFound } from "next/navigation";
import { MapPin, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">{roteiro.titulo}</h1>
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

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6 py-8">
        {dias.map((dia) => {
          const paradasDoDia = paradasMap[dia.id] || [];
          return (
            <div key={dia.id}>
              <h3 className="font-semibold text-lg mb-3">
                Dia {dia.numeroDia} - {formatarDataCurta(dia.data.toDate())}
              </h3>

              {paradasDoDia.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                  Nenhuma parada neste dia
                </p>
              ) : (
                <div className="space-y-2">
                  {paradasDoDia.map((parada, idx) => (
                    <Card key={parada.id}>
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className="flex items-center gap-2 min-w-[50px]">
                          <span className="text-sm font-medium text-muted-foreground">
                            {idx + 1}
                          </span>
                          <div
                            className="w-1 h-full min-h-[40px] rounded-full"
                            style={{
                              backgroundColor:
                                CORES_TIPO_PARADA[parada.tipo] || "#6b7280",
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium">{parada.nome}</p>
                            <Badge variant="outline" className="text-xs">
                              {TIPO_PARADA_LABELS[parada.tipo]}
                            </Badge>
                          </div>
                          {parada.endereco && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {parada.endereco}
                            </p>
                          )}
                          {(parada.horarioInicio || parada.horarioFim) && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {parada.horarioInicio || "?"} -{" "}
                              {parada.horarioFim || "?"}
                            </p>
                          )}
                          {parada.notas && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {parada.notas}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t bg-background">
        <p className="text-sm text-muted-foreground">
          Roteiro criado com{" "}
          <span className="font-semibold text-primary">Itinerario</span>
        </p>
      </div>
    </div>
  );
}
