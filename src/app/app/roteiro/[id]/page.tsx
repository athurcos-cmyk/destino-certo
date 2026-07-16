"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Plus,
  Share2,
  Trash2,
  Map,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { GoogleMapsProvider } from "@/lib/google-maps/config";
import { MapaRoteiro } from "@/components/mapa/mapa-roteiro";
import { BuscaLugares } from "@/components/mapa/busca-lugares";
import {
  getDocument,
  getCollection,
  addDocument,
  updateDocument,
  deleteDocument,
  where,
  orderBy,
} from "@/lib/firebase/firestore";
import { gerarSlug } from "@/lib/utils/gerar-slug";
import { formatarDataCurta } from "@/lib/utils/formatar-data";
import { TIPO_PARADA_LABELS, CORES_TIPO_PARADA } from "@/lib/constants";
import type { Roteiro, Dia, Parada, ParadaFormData, TipoParada } from "@/lib/types/roteiro";
import { toast } from "sonner";

export default function RoteiroEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [roteiro, setRoteiro] = useState<Roteiro | null>(null);
  const [dias, setDias] = useState<Dia[]>([]);
  const [paradas, setParadas] = useState<Record<string, Parada[]>>({});
  const [loading, setLoading] = useState(true);
  const [mapaAtivo, setMapaAtivo] = useState(false);

  // Add stop modal
  const [modalAberto, setModalAberto] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [paradaForm, setParadaForm] = useState<ParadaFormData>({
    placeId: "",
    nome: "",
    endereco: "",
    lat: 0,
    lng: 0,
    tipo: "atracao",
    horarioInicio: "",
    horarioFim: "",
    notas: "",
  });

  const carregarDados = useCallback(async () => {
    if (!user) return;
    try {
      const r = await getDocument<Roteiro>("roteiros", id);
      if (!r || r.donoId !== user.uid) {
        router.push("/app");
        return;
      }
      setRoteiro(r);

      const d = await getCollection<Dia>(
        `roteiros/${id}/dias`,
        orderBy("ordem", "asc")
      );
      setDias(d);

      const pMap: Record<string, Parada[]> = {};
      for (const dia of d) {
        const p = await getCollection<Parada>(
          `roteiros/${id}/dias/${dia.id}/paradas`,
          orderBy("ordem", "asc")
        );
        pMap[dia.id] = p;
      }
      setParadas(pMap);
    } catch (err) {
      console.error("Erro ao carregar roteiro:", err);
    } finally {
      setLoading(false);
    }
  }, [id, user, router]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  async function adicionarParada() {
    if (!diaSelecionado || !paradaForm.nome) return;
    const paradasDoDia = paradas[diaSelecionado] || [];
    const novaOrdem = paradasDoDia.length;

    await addDocument(
      `roteiros/${id}/dias/${diaSelecionado}/paradas`,
      {
        placeId: paradaForm.placeId,
        nome: paradaForm.nome,
        endereco: paradaForm.endereco,
        localizacao: { lat: paradaForm.lat, lng: paradaForm.lng } as any,
        tipo: paradaForm.tipo,
        horarioInicio: paradaForm.horarioInicio || null,
        horarioFim: paradaForm.horarioFim || null,
        notas: paradaForm.notas,
        ordem: novaOrdem,
      }
    );

    setParadaForm({
      placeId: "",
      nome: "",
      endereco: "",
      lat: 0,
      lng: 0,
      tipo: "atracao",
      horarioInicio: "",
      horarioFim: "",
      notas: "",
    });
    setModalAberto(false);
    await carregarDados();
    toast.success("Parada adicionada!");
  }

  async function removerParada(diaId: string, paradaId: string) {
    await deleteDocument(`roteiros/${id}/dias/${diaId}/paradas/${paradaId}`);
    await carregarDados();
    toast.success("Parada removida");
  }

  async function compartilhar() {
    if (!roteiro) return;
    const slug = gerarSlug();
    await updateDocument(`roteiros/${id}`, {
      slugCompartilhamento: slug,
      compartilhamentoAtivo: true,
    });
    const url = `${window.location.origin}/compartilhar/${slug}`;
    await navigator.clipboard.writeText(url);
    setRoteiro({ ...roteiro, slugCompartilhamento: slug, compartilhamentoAtivo: true });
    toast.success("Link copiado para a área de transferência!");
  }

  async function desativarCompartilhamento() {
    if (!roteiro) return;
    await updateDocument(`roteiros/${id}`, {
      slugCompartilhamento: null,
      compartilhamentoAtivo: false,
    });
    setRoteiro({ ...roteiro, slugCompartilhamento: null, compartilhamentoAtivo: false });
    toast.success("Compartilhamento desativado");
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!roteiro) return null;

  const todasParadas = Object.values(paradas).flat();

  return (
    <GoogleMapsProvider>
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/app")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-semibold truncate max-w-[200px] sm:max-w-xs">
              {roteiro.titulo}
            </h1>
            <p className="text-xs text-muted-foreground">{roteiro.destino}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={mapaAtivo ? "default" : "outline"}
            size="sm"
            onClick={() => setMapaAtivo(!mapaAtivo)}
            className="flex"
          >
            {mapaAtivo ? (
              <List className="h-4 w-4 mr-1" />
            ) : (
              <Map className="h-4 w-4 mr-1" />
            )}
            {mapaAtivo ? "Lista" : "Mapa"}
          </Button>
          {roteiro.compartilhamentoAtivo ? (
            <Button variant="secondary" size="sm" onClick={desativarCompartilhamento}>
              <Share2 className="h-4 w-4 mr-1" />
              Desativar
            </Button>
          ) : (
            <Button size="sm" onClick={compartilhar}>
              <Share2 className="h-4 w-4 mr-1" />
              Compartilhar
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Timeline */}
        <div className={`${mapaAtivo ? "hidden md:block md:w-1/2" : "w-full"} overflow-auto p-4 transition-all`}>
          <div className="max-w-2xl mx-auto space-y-6">
            {dias.map((dia) => {
              const paradasDoDia = paradas[dia.id] || [];
              return (
                <div key={dia.id} className="space-y-3">
                  <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur py-2 z-10 -mx-1 px-1">
                    <div>
                      <h3 className="font-heading font-semibold text-base">
                        Dia {dia.numeroDia}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatarDataCurta(dia.data.toDate())}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDiaSelecionado(dia.id);
                        setModalAberto(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>

                  {paradasDoDia.length === 0 ? (
                    <div className="border border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground">
                      Nenhuma parada neste dia. Clique em &quot;Adicionar&quot; para
                      começar.
                    </div>
                  ) : (
                    <div className="relative pl-6 before:absolute before:left-[22px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                      {paradasDoDia.map((parada) => (
                        <div
                          key={parada.id}
                          className="relative flex items-start gap-3 py-3 group"
                        >
                          <div
                            className="absolute left-[-23px] top-[18px] w-3 h-3 rounded-full border-2 border-background shrink-0 z-10"
                            style={{
                              backgroundColor:
                                CORES_TIPO_PARADA[parada.tipo] || "#6b7280",
                            }}
                          />
                          <div className="flex-1 bg-card rounded-lg border p-3 hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-heading font-medium text-sm truncate">
                                {parada.nome}
                              </p>
                              <Badge variant="outline" className="text-[10px] shrink-0">
                                {TIPO_PARADA_LABELS[parada.tipo]}
                              </Badge>
                            </div>
                            {parada.endereco && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{parada.endereco}</span>
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                              {(parada.horarioInicio || parada.horarioFim) && (
                                <span className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
                                  <Clock className="h-3 w-3" />
                                  {parada.horarioInicio || "?"} -{" "}
                                  {parada.horarioFim || "?"}
                                </span>
                              )}
                            </div>
                            {parada.notas && (
                              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                                {parada.notas}
                              </p>
                            )}
                          </div>
                          <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 mt-1 p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                            onClick={() => removerParada(dia.id, parada.id)}
                            aria-label={`Remover ${parada.nome}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Map */}
        {mapaAtivo && (
          <div className="flex-1 min-h-[300px] md:min-h-0">
            <MapaRoteiro
              paradas={todasParadas}
              onMapClick={(lat, lng) => {
                setParadaForm({
                  ...paradaForm,
                  lat,
                  lng,
                  nome: "",
                  endereco: "",
                });
                setModalAberto(true);
              }}
            />
          </div>
        )}
      </div>

      {/* Add stop dialog */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Parada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Buscar lugar</Label>
              <BuscaLugares
                onSelect={(place) =>
                  setParadaForm({
                    ...paradaForm,
                    placeId: place.placeId,
                    nome: place.nome,
                    endereco: place.endereco,
                    lat: place.lat,
                    lng: place.lng,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Nome do lugar</Label>
              <Input
                placeholder="Ex: Jardim Botânico"
                value={paradaForm.nome}
                onChange={(e) =>
                  setParadaForm({ ...paradaForm, nome: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input
                placeholder="Ex: Rua das Flores, 123"
                value={paradaForm.endereco}
                onChange={(e) =>
                  setParadaForm({ ...paradaForm, endereco: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Horário início</Label>
                <Input
                  type="time"
                  value={paradaForm.horarioInicio}
                  onChange={(e) =>
                    setParadaForm({
                      ...paradaForm,
                      horarioInicio: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Horário fim</Label>
                <Input
                  type="time"
                  value={paradaForm.horarioFim}
                  onChange={(e) =>
                    setParadaForm({
                      ...paradaForm,
                      horarioFim: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <div className="flex flex-wrap gap-2">
                {(
                  Object.entries(TIPO_PARADA_LABELS) as [TipoParada, string][]
                ).map(([tipo, label]) => (
                  <Badge
                    key={tipo}
                    variant={paradaForm.tipo === tipo ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setParadaForm({ ...paradaForm, tipo })}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                placeholder="Alguma observação..."
                value={paradaForm.notas}
                onChange={(e) =>
                  setParadaForm({ ...paradaForm, notas: e.target.value })
                }
                rows={2}
              />
            </div>
            <Button className="w-full" onClick={adicionarParada}>
              Adicionar Parada
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </GoogleMapsProvider>
  );
}
