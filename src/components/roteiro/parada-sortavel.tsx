"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MapPin, Clock, Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TIPO_PARADA_LABELS, CORES_TIPO_PARADA } from "@/lib/constants";
import type { Parada } from "@/lib/types/roteiro";

interface ParadaSortavelProps {
  parada: Parada;
  diaId: string;
  idx?: number;
  onEdit: (diaId: string, parada: Parada) => void;
  onDelete: (diaId: string, paradaId: string) => void;
}

export function ParadaSortavel({ parada, diaId, idx = 0, onEdit, onDelete }: ParadaSortavelProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: parada.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    animationDelay: `${Math.min(idx, 8) * 40}ms`,
    animationFillMode: "backwards" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex items-start gap-3 py-1.5 group animate-in fade-in slide-in-from-bottom-2"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-[-23px] top-[14px] w-3 h-3 rounded-full border-2 border-background shrink-0 z-10 cursor-grab active:cursor-grabbing"
        style={{
          backgroundColor: CORES_TIPO_PARADA[parada.tipo] || "#6b7280",
        }}
      />
      <div className="flex-1 bg-card rounded-lg border p-2.5 hover:shadow-sm transition-shadow min-w-0 leading-tight">
        <div className="flex items-start justify-between gap-2">
          <p className="font-heading font-medium text-sm truncate">
            {parada.nome}
          </p>
          <Badge variant="outline" className="text-[10px] shrink-0">
            {TIPO_PARADA_LABELS[parada.tipo]}
          </Badge>
        </div>
        {(parada.endereco || parada.horarioInicio || parada.horarioFim) && (
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground min-w-0">
            {parada.endereco && (
              <span className="flex items-center gap-1 min-w-0 flex-1">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{parada.endereco}</span>
              </span>
            )}
            {(parada.horarioInicio || parada.horarioFim) && (
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="h-3 w-3" />
                {parada.horarioInicio || "?"} - {parada.horarioFim || "?"}
              </span>
            )}
          </div>
        )}
        {parada.notas && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {parada.notas}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
        <button
          className="text-muted-foreground hover:text-primary p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={() => onEdit(diaId, parada)}
          aria-label={`Editar ${parada.nome}`}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          className="text-muted-foreground hover:text-destructive p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={() => onDelete(diaId, parada.id)}
          aria-label={`Remover ${parada.nome}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
