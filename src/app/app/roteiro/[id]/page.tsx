"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Share2,
  Trash2,
  Map,
  List,
  AlertCircle,
  RefreshCw,
  Copy,
  Globe,
  Users,
  X,
  MoreVertical,
  QrCode,
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
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
import { ExcluirRoteiroDialog } from "@/components/roteiro/excluir-roteiro-dialog";
import { InfoViagem } from "@/components/roteiro/info-viagem";
import { SobreDestino } from "@/components/roteiro/sobre-destino";
import { useFeriados } from "@/lib/hooks/use-feriados";
import {
  getDocument,
  getCollection,
  addDocument,
  updateDocument,
  deleteDocument,
  orderBy,
} from "@/lib/firebase/firestore";
import { gerarSlug } from "@/lib/utils/gerar-slug";
import { formatarDataCurta } from "@/lib/utils/formatar-data";
import { TIPO_PARADA_LABELS } from "@/lib/constants";
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
  const [compartilharAberto, setCompartilharAberto] = useState(false);
  const [novoColaboradorEmail, setNovoColaboradorEmail] = useState("");
  const [excluirAberto, setExcluirAberto] = useState(false);
  const [qrAberto, setQrAberto] = useState(false);

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

  const anoViagem = roteiro?.dataInicio.toDate().getFullYear() ?? new Date().getFullYear();
  const { data: feriados } = useFeriados(roteiro?.destinoPaisCodigo, anoViagem);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  const carregarDados = useCallback(async () => {
    if (!user) return;
    try {
      const r = await getDocument<Roteiro>("roteiros", id);
      const souDono = r?.donoId === user.uid;
      const souColaborador =
        !!r && !!user.email && (r.colaboradoresEmail || []).includes(user.email);
      if (!r || (!souDono && !souColaborador)) {
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

  useEffect(() => {
    if (!diaSelecionado && dias.length > 0) {
      setDiaSelecionado(dias[0].id);
    }
  }, [dias, diaSelecionado]);

  function salvarParada() {
    if (!diaSelecionado || !paradaForm.nome) return;

    if (editandoParadaId) {
      updateDocument(
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
      ).catch((err) => console.error("Erro ao atualizar parada:", err));
      toast.success("Parada atualizada!");
    } else {
      addDocument(
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
      ).catch((err) => console.error("Erro ao adicionar parada:", err));
      toast.success("Parada adicionada!");
    }

    resetForm();
    carregarDados().catch(() => {});
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

  async function handleDragEnd(diaId: string, event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const paradasDoDia = [...(paradas[diaId] || [])];
    const oldIndex = paradasDoDia.findIndex((p) => p.id === active.id);
    const newIndex = paradasDoDia.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(paradasDoDia, oldIndex, newIndex);

    setParadas((prev) => ({ ...prev, [diaId]: reordered }));

    // Fire-and-forget: update ordem in Firestore
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].ordem !== i) {
        updateDocument(
          `roteiros/${id}/dias/${diaId}/paradas/${reordered[i].id}`,
          { ordem: i }
        ).catch((err) => console.error("Erro ao reordenar:", err));
      }
    }
    toast.success("Ordem atualizada!");
  }

  function removerParada(diaId: string, paradaId: string) {
    deleteDocument(`roteiros/${id}/dias/${diaId}/paradas/${paradaId}`)
      .catch((err) => console.error("Erro ao remover parada:", err));
    carregarDados().catch(() => {});
    toast.success("Parada removida");
  }

  function ativarLinkPublico() {
    if (!roteiro) return;
    const slug = roteiro.slugCompartilhamento || gerarSlug();
    updateDocument(`roteiros/${id}`, {
      slugCompartilhamento: slug,
      compartilhamentoAtivo: true,
    }).catch((err) => console.error("Erro ao compartilhar:", err));
    setRoteiro({ ...roteiro, slugCompartilhamento: slug, compartilhamentoAtivo: true });
    toast.success("Link público ativado!");
  }

  function desativarLinkPublico() {
    if (!roteiro) return;
    updateDocument(`roteiros/${id}`, {
      compartilhamentoAtivo: false,
    }).catch((err) => console.error("Erro ao desativar compartilhamento:", err));
    setRoteiro({ ...roteiro, compartilhamentoAtivo: false });
    toast.success("Link público desativado");
  }

  function copiarLinkPublico() {
    if (!roteiro?.slugCompartilhamento) return;
    const url = `${window.location.origin}/compartilhar/${roteiro.slugCompartilhamento}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Link copiado!"),
      () => toast.error("Não foi possível copiar. Link: " + url)
    );
  }

  function adicionarColaborador(email: string): boolean {
    if (!roteiro) return false;
    const emailLimpo = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      toast.error("Digite um e-mail válido.");
      return false;
    }
    if (emailLimpo === user?.email?.toLowerCase()) {
      toast.error("Você já é o dono do roteiro.");
      return false;
    }
    const atuais = roteiro.colaboradoresEmail || [];
    if (atuais.includes(emailLimpo)) {
      toast.error("Esse e-mail já é colaborador.");
      return false;
    }
    const atualizados = [...atuais, emailLimpo];
    updateDocument(`roteiros/${id}`, {
      colaboradoresEmail: atualizados,
    }).catch((err) => console.error("Erro ao adicionar colaborador:", err));
    setRoteiro({ ...roteiro, colaboradoresEmail: atualizados });
    toast.success("Colaborador adicionado!");
    return true;
  }

  function removerColaborador(email: string) {
    if (!roteiro) return;
    const atualizados = (roteiro.colaboradoresEmail || []).filter((e) => e !== email);
    updateDocument(`roteiros/${id}`, {
      colaboradoresEmail: atualizados,
    }).catch((err) => console.error("Erro ao remover colaborador:", err));
    setRoteiro({ ...roteiro, colaboradoresEmail: atualizados });
    toast.success("Colaborador removido");
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
  const souDono = user?.uid === roteiro.donoId;

  return (
    <GoogleMapsProvider>
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b bg-background">
        <button
          onClick={() => router.push("/app")}
          className="text-muted-foreground hover:text-foreground shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold truncate">{roteiro.titulo}</h1>
          <p className="text-xs text-muted-foreground truncate">{roteiro.destino}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant={mapaAtivo ? "default" : "outline"}
            size="icon"
            className="min-w-[44px] min-h-[44px]"
            onClick={() => setMapaAtivo(!mapaAtivo)}
            aria-label={mapaAtivo ? "Ver lista" : "Ver mapa"}
          >
            {mapaAtivo ? (
              <List className="h-4 w-4" />
            ) : (
              <Map className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="min-w-[44px] min-h-[44px] relative"
            onClick={() => setCompartilharAberto(true)}
            aria-label="Compartilhar"
          >
            <Share2 className="h-4 w-4" />
            {(roteiro.compartilhamentoAtivo || roteiro.colaboradoresEmail?.length > 0) && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-cta" />
            )}
          </Button>
          {souDono && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="min-w-[44px] min-h-[44px] rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Mais opções"
              >
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setExcluirAberto(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir roteiro
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Timeline */}
        <div className={`${mapaAtivo ? "hidden md:block md:w-1/2" : "w-full"} overflow-auto p-4 transition-all`}>
          <div className="max-w-2xl mx-auto space-y-6">
            <SobreDestino destino={roteiro.destino} />
            <InfoViagem roteiro={roteiro} />
            {dias.map((dia, diaIdx) => {
              const paradasDoDia = paradas[dia.id] || [];
              const dataISO = dia.data.toDate().toISOString().split("T")[0];
              const feriado = feriados?.find((f) => f.date === dataISO);
              return (
                <div
                  key={dia.id}
                  className="space-y-3 animate-in fade-in"
                  style={{
                    animationDelay: `${Math.min(diaIdx, 6) * 60}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur py-2 z-10 -mx-1 px-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-semibold text-base">
                          Dia {dia.numeroDia}
                        </h3>
                        {feriado && (
                          <Badge variant="secondary" className="text-[10px]">
                            🎉 {feriado.localName}
                          </Badge>
                        )}
                      </div>
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
                        <div className="relative pl-6">
                          <div
                            className="absolute left-[22px] top-2 bottom-2 w-0.5 route-dashed"
                            aria-hidden="true"
                          />
                          {paradasDoDia.map((parada, idx) => (
                            <ParadaSortavel
                              key={parada.id}
                              parada={parada}
                              idx={idx}
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
          <div className="flex-1 min-h-[300px] md:min-h-0 relative">
            <div className="absolute top-2 left-2 right-2 z-10 space-y-1.5">
              <div className="bg-background/95 backdrop-blur rounded-lg border shadow-sm p-1.5">
                <BuscaLugares
                  onSelect={(place) => {
                    setParadaForm({
                      placeId: place.placeId,
                      nome: place.nome,
                      endereco: place.endereco,
                      lat: place.lat,
                      lng: place.lng,
                      tipo: "atracao",
                      horarioInicio: "",
                      horarioFim: "",
                      notas: "",
                    });
                    setModalAberto(true);
                  }}
                />
              </div>
              {dias.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto bg-background/95 backdrop-blur rounded-lg border shadow-sm p-1.5">
                  {dias.map((dia) => (
                    <button
                      key={dia.id}
                      type="button"
                      onClick={() => setDiaSelecionado(dia.id)}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[32px] ${
                        diaSelecionado === dia.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                      }`}
                    >
                      Dia {dia.numeroDia}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <MapaRoteiro
              paradas={todasParadas}
              centro={
                roteiro.destinoLat !== undefined && roteiro.destinoLng !== undefined
                  ? { lat: roteiro.destinoLat, lng: roteiro.destinoLng }
                  : undefined
              }
              onMapClick={(lat, lng) => {
                setParadaForm({
                  placeId: "",
                  nome: "",
                  endereco: "",
                  lat,
                  lng,
                  tipo: "atracao",
                  horarioInicio: "",
                  horarioFim: "",
                  notas: "",
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

      {/* Share dialog */}
      <Dialog open={compartilharAberto} onOpenChange={setCompartilharAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar roteiro</DialogTitle>
          </DialogHeader>

          {!souDono && (
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 shrink-0" />
              Você está editando como colaborador. Só o dono pode gerenciar o
              compartilhamento.
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Link público</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Qualquer pessoa com o link pode visualizar o roteiro (sem
                poder editar).
              </p>
              {roteiro.compartilhamentoAtivo && roteiro.slugCompartilhamento ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={copiarLinkPublico}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar link
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setQrAberto(!qrAberto)} aria-label="Mostrar QR code">
                      <QrCode className="h-4 w-4" />
                    </Button>
                    {souDono && (
                      <Button variant="ghost" onClick={desativarLinkPublico}>
                        Desativar
                      </Button>
                    )}
                  </div>
                  {qrAberto && (
                    <div className="flex justify-center bg-white rounded-lg p-3 ticket-notch">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                          `${typeof window !== "undefined" ? window.location.origin : ""}/compartilhar/${roteiro.slugCompartilhamento}`
                        )}`}
                        alt="QR code do link público"
                        width={180}
                        height={180}
                      />
                    </div>
                  )}
                </div>
              ) : (
                souDono && (
                  <Button onClick={ativarLinkPublico}>
                    <Globe className="h-4 w-4 mr-2" />
                    Ativar link público
                  </Button>
                )
              )}
            </div>

            {souDono && (
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Colaboradores (podem editar)</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  A pessoa precisa entrar com esse e-mail (Google ou
                  e-mail/senha) para editar o roteiro.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={novoColaboradorEmail}
                    onChange={(e) => setNovoColaboradorEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (adicionarColaborador(novoColaboradorEmail)) {
                          setNovoColaboradorEmail("");
                        }
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (adicionarColaborador(novoColaboradorEmail)) {
                        setNovoColaboradorEmail("");
                      }
                    }}
                  >
                    Adicionar
                  </Button>
                </div>
                {roteiro.colaboradoresEmail?.length > 0 ? (
                  <ul className="space-y-1.5 mt-2">
                    {roteiro.colaboradoresEmail.map((email) => (
                      <li
                        key={email}
                        className="flex items-center justify-between gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm"
                      >
                        <span className="truncate">{email}</span>
                        <button
                          onClick={() => removerColaborador(email)}
                          className="text-muted-foreground hover:text-destructive shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label={`Remover ${email}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-3">
                    Nenhum colaborador ainda.
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ExcluirRoteiroDialog
        roteiroId={id}
        roteiroTitulo={roteiro.titulo}
        open={excluirAberto}
        onOpenChange={setExcluirAberto}
        onExcluido={() => router.push("/app")}
      />
    </div>
    </GoogleMapsProvider>
  );
}
