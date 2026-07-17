"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Cloud, Coins, Sunrise, Sunset } from "lucide-react";
import { PAIS_MOEDA } from "@/lib/constants/moedas";
import type { Roteiro } from "@/lib/types/roteiro";

interface InfoViagemProps {
  roteiro: Roteiro;
}

interface ClimaDia {
  data: string;
  max: number;
  min: number;
  codigo: number;
}

function paraISO(data: Date): string {
  return data.toISOString().split("T")[0];
}

function climaEmoji(codigo: number): string {
  if (codigo === 0) return "☀️";
  if (codigo <= 3) return "⛅";
  if (codigo <= 48) return "🌫️";
  if (codigo <= 57) return "🌦️";
  if (codigo <= 67) return "🌧️";
  if (codigo <= 77) return "❄️";
  if (codigo <= 82) return "🌦️";
  if (codigo <= 99) return "⛈️";
  return "🌡️";
}

async function buscarClima(
  lat: number,
  lng: number,
  inicio: string,
  fim: string
): Promise<ClimaDia[]> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&start_date=${inicio}&end_date=${fim}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Clima indisponível");
  const json = await res.json();
  const dias: string[] = json.daily?.time || [];
  return dias.map((data: string, i: number) => ({
    data,
    max: Math.round(json.daily.temperature_2m_max[i]),
    min: Math.round(json.daily.temperature_2m_min[i]),
    codigo: json.daily.weathercode[i],
  }));
}

async function buscarCambio(moeda: string): Promise<number | null> {
  const res = await fetch(
    `https://api.frankfurter.dev/v1/latest?base=BRL&symbols=${moeda}`
  );
  if (!res.ok) throw new Error("Câmbio indisponível");
  const json = await res.json();
  return json.rates?.[moeda] ?? null;
}

interface NascerPor {
  nascer: string;
  por: string;
}

async function buscarOffsetSegundos(lat: number, lng: number): Promise<number> {
  // Fuso horário real do destino (não estimativa por longitude — timezones
  // políticos como o de Portugal divergem bastante do fuso solar).
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&timezone=auto&forecast_days=1`
    );
    if (!res.ok) return 0;
    const json = await res.json();
    return json.utc_offset_seconds ?? 0;
  } catch {
    return 0;
  }
}

async function buscarSol(lat: number, lng: number, data: string): Promise<NascerPor | null> {
  const [res, offsetSegundos] = await Promise.all([
    fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${data}&formatted=0`),
    buscarOffsetSegundos(lat, lng),
  ]);
  if (!res.ok) return null;
  const json = await res.json();
  if (json.status !== "OK") return null;
  const formatar = (iso: string) => {
    const d = new Date(new Date(iso).getTime() + offsetSegundos * 1000);
    return d.toISOString().slice(11, 16);
  };
  return { nascer: formatar(json.results.sunrise), por: formatar(json.results.sunset) };
}

export function InfoViagem({ roteiro }: InfoViagemProps) {
  const [aberto, setAberto] = useState(true);

  const temCoordenadas =
    roteiro.destinoLat !== undefined && roteiro.destinoLng !== undefined;
  const moeda = roteiro.destinoPaisCodigo
    ? PAIS_MOEDA[roteiro.destinoPaisCodigo]
    : undefined;

  const inicio = roteiro.dataInicio.toDate();
  const fim = roteiro.dataFim.toDate();
  const hoje = new Date();
  const diasAteViagem = Math.ceil(
    (inicio.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  );
  // Open-Meteo só cobre ~16 dias de previsão à frente
  const dentroDoAlcanceClima = diasAteViagem <= 16 && paraISO(fim) >= paraISO(hoje);

  const climaQuery = useQuery({
    queryKey: ["clima", roteiro.destinoLat, roteiro.destinoLng, paraISO(inicio), paraISO(fim)],
    queryFn: () =>
      buscarClima(roteiro.destinoLat!, roteiro.destinoLng!, paraISO(inicio), paraISO(fim)),
    enabled: temCoordenadas && dentroDoAlcanceClima,
    staleTime: 60 * 60 * 1000,
    retry: false,
  });

  const cambioQuery = useQuery({
    queryKey: ["cambio", moeda],
    queryFn: () => buscarCambio(moeda!),
    enabled: !!moeda,
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });

  const solQuery = useQuery({
    queryKey: ["sol", roteiro.destinoLat, roteiro.destinoLng, paraISO(inicio)],
    queryFn: () => buscarSol(roteiro.destinoLat!, roteiro.destinoLng!, paraISO(inicio)),
    enabled: temCoordenadas,
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });

  if (!temCoordenadas) return null;

  const temClima = (climaQuery.data?.length ?? 0) > 0;
  const temCambio = !!cambioQuery.data;
  const temSol = !!solQuery.data;

  if (
    !temClima &&
    !temCambio &&
    !temSol &&
    !climaQuery.isLoading &&
    !cambioQuery.isLoading &&
    !solQuery.isLoading
  ) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium min-h-[44px]"
      >
        <span className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-primary" />
          Informações da viagem
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${aberto ? "rotate-180" : ""}`}
        />
      </button>
      {aberto && (
        <div className="px-3 pb-3 space-y-3">
          {dentroDoAlcanceClima && (
            <div>
              {climaQuery.isLoading ? (
                <p className="text-xs text-muted-foreground">Carregando previsão do tempo...</p>
              ) : temClima ? (
                <div className="flex gap-2 overflow-x-auto">
                  {climaQuery.data!.map((dia) => (
                    <div
                      key={dia.data}
                      className="shrink-0 flex flex-col items-center gap-0.5 bg-muted/50 rounded-lg px-2.5 py-2 min-w-[64px]"
                    >
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(dia.data + "T12:00:00").toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                      <span className="text-lg leading-none">{climaEmoji(dia.codigo)}</span>
                      <span className="text-xs font-medium">
                        {dia.max}° <span className="text-muted-foreground">{dia.min}°</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {moeda && (
            <div className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-cta shrink-0" />
              {cambioQuery.isLoading ? (
                <span className="text-xs text-muted-foreground">Carregando câmbio...</span>
              ) : temCambio ? (
                <span>
                  R$ 100 ={" "}
                  <strong>
                    {(cambioQuery.data! * 100).toFixed(2)} {moeda}
                  </strong>
                </span>
              ) : null}
            </div>
          )}

          {temSol && (
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <Sunrise className="h-4 w-4 text-primary shrink-0" />
                {solQuery.data!.nascer}
              </span>
              <span className="flex items-center gap-1.5">
                <Sunset className="h-4 w-4 text-cta shrink-0" />
                {solQuery.data!.por}
              </span>
              <span className="text-xs text-muted-foreground">no 1º dia</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
