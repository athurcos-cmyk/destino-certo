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
  AlertCircle,
  RefreshCw,
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
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useAuth } from "@/components/auth/auth-provider";
import { GoogleMapsProvider } from "@/lib/google-maps/config";
import { MapaRoteiro } from "@/components/mapa/mapa-roteiro";
import { BuscaLugares } from "@/components/mapa/busca-lugares";
import { ParadaSortavel } from "@/components/roteiro/parada-sortavel";
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
  const [erro, setErro] = useState<string | null>(null);
  const [mapaAtivo, setMapaAtivo] = useState(false);

  // Add stop modal
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoParadaId, setEditandoParadaId] = useState<string | null>(null);
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

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
      setErro("Não foi possível carregar o roteiro.");
    } finally {
      setLoading(false);
    }
  }, [id, user, router]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  async function salvarParada() {
    if (!diaSelecionado || !paradaForm.nome) return;

    if (editandoParadaId) {
      await updateDocument(
        `roteiros/${id}/dias/${diaSelecionado}/paradas/${editandoParadaId}`,
        {
          placeId: paradaForm.placeId,
          nome: paradaForm.nome,
          endereco: paradaForm.endereco,
          localizacao: { lat: paradaForm.lat, lng: paradaForm.lng },
          tipo: paradaForm.tipo,
          horarioInicio: paradaForm.horarioInicio || null,
          horarioFim: paradaForm.horarioFim || null,
          notas: paradaForm.notas,
        }
      );
      toast.success("Parada atualizada!");
    } else {
      const paradasDoDia = paradas[diaSelecionado] || [];
      await addDocument(
        `roteiros/${id}/dias/${diaSelecionado}/paradas`,
        {
          placeId: paradaForm.placeId,
          nome: paradaForm.nome,
          endereco: paradaForm.endereco,
          localizacao: { lat: paradaForm.lat, lng: paradaForm.lng },
          tipo: paradaForm.tipo,
          horarioInicio: paradaForm.horarioInicio || null,
          horarioFim: paradaForm.horarioFim || null,
          notas: paradaForm.notas,
          ordem: (paradas[diaSelecionado] || []).length,
        }
      );
      toast.success("Parada adicionada!");
    }

    resetForm();
    await carregarDados();
  }

  function resetForm() {
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
    setEditandoParadaId(null);
    setModalAberto(false);
  }

  function editarParada(diaId: string, parada: Parada) {
    setDiaSelecionado(diaId);
    setParadaForm({
      placeId: parada.placeId,
      nome: parada.nome,
      endereco: parada.endereco,
      lat: parada.localizacao?.lat ?? 0,
      lng: parada.localizacao?.lng ?? 0,
      tipo: parada.tipo,
      horarioInicio: parada.horarioInicio || "",
      horarioFim: parada.horarioFim || "",
      notas: parada.notas,
    });
    setEditandoParadaId(parada.id);
    setModalAberto(true);
  }

  function abrirModalNovo(diaId: string) {
    resetForm();
    setDiaSelecionado(diaId);
    setModalAberto(true);
  }

  async function handleDragEnd(diaId: string, event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const paradasDoDia = [...(paradas[diaId] || [])];
    const oldIndex = paradasDoDia.findIndex((p) => p.id === active.id);
    const newIndex = paradasDoDia.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(paradasDoDia, oldIndex, newIndex);

    setParadas((prev) => ({ ...prev, [diaId]: reordered }));

    // Update ordem in Firestore
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].ordem !== i) {
        await updateDocument(
          `roteiros/${id}/dias/${diaId}/paradas/${reordered[i].id}`,
          { ordem: i }
        );
      }
    }
    toast.success("Ordem atualizada!");
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
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    } catch {
      toast.error("Não foi possível copiar. Link: " + url);
    }
    setRoteiro({ ...roteiro, slugCompartilhamento: slug, compartilhamentoAtivo: true });
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

  if (loading && !erro) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="font-heading text-lg font-semibold mb-2">Erro ao carregar</h2>
        <p className="text-muted-foreground text-sm mb-4">{erro}</p>
        <Button onClick={() => { setErro(null); carregarDados(); }}>
          <RefreshCw className="h-4 w-4 mr-2" />Tentar novamente
        </Button>
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
                      onClick={() => abrirModalNovo(dia.id)}
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
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(e) => handleDragEnd(dia.id, e)}
                    >
                      <SortableContext
                        items={paradasDoDia.map((p) => p.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="relative pl-6 before:absolute before:left-[22px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                          {paradasDoDia.map((parada) => (
                            <ParadaSortavel
                              key={parada.id}
                              parada={parada}
                              onEdit={editarParada}
                              onDelete={(diaId, pid) => removerParada(diaId, pid)}
                              diaId={dia.id}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
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
            <DialogTitle>
              {editandoParadaId ? "Editar Parada" : "Adicionar Parada"}
            </DialogTitle>
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
            <div className="flex gap-2">
              <Button className="flex-1" onClick={salvarParada}>
                {editandoParadaId ? "Salvar" : "Adicionar Parada"}
              </Button>
              {editandoParadaId && (
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </GoogleMapsProvider>
  );
}
