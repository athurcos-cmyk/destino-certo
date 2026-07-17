"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";

interface ResumoWiki {
  titulo: string;
  extrato: string;
  foto?: string;
  urlArtigo?: string;
}

async function buscarResumoWiki(lang: string, titulo: string): Promise<ResumoWiki | null> {
  const res = await fetch(
    `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titulo)}`
  );
  if (!res.ok) return null;
  const json = await res.json();
  if (json.type === "disambiguation" || !json.extract) return null;
  return {
    titulo: json.title,
    extrato: json.extract,
    foto: json.thumbnail?.source,
    urlArtigo: json.content_urls?.desktop?.page,
  };
}

async function buscarSobreDestino(destino: string): Promise<ResumoWiki | null> {
  const pt = await buscarResumoWiki("pt", destino);
  if (pt) return pt;
  return buscarResumoWiki("en", destino);
}

export function SobreDestino({ destino }: { destino: string }) {
  const [expandido, setExpandido] = useState(false);

  const { data } = useQuery({
    queryKey: ["sobre-destino", destino],
    queryFn: () => buscarSobreDestino(destino),
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });

  if (!data) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden ticket-notch-bottom">
      {data.foto ? (
        <div className="relative h-40 sm:h-48">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.foto}
            alt={data.titulo}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-white/70 mb-1">
              <BookOpen className="h-3 w-3" />
              Sobre o destino
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-medium text-white">
              {data.titulo}
            </h2>
          </div>
        </div>
      ) : (
        <div className="bg-primary text-primary-foreground px-4 py-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] opacity-75 mb-1">
            <BookOpen className="h-3 w-3" />
            Sobre o destino
          </span>
          <h2 className="font-heading text-2xl font-medium">{data.titulo}</h2>
        </div>
      )}
      <div className="border-t-2 border-dashed border-border/80" />
      <div className="bg-card px-4 py-3">
        <p className={`text-sm text-muted-foreground leading-relaxed ${expandido ? "" : "line-clamp-3"}`}>
          {data.extrato}
        </p>
        <button
          type="button"
          onClick={() => setExpandido(!expandido)}
          className="text-xs font-medium text-primary hover:underline mt-1.5 min-h-[32px]"
        >
          {expandido ? "Ler menos" : "Ler mais"}
        </button>
      </div>
    </div>
  );
}
