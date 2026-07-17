"use client";

import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import type { Parada } from "@/lib/types/roteiro";
import { CORES_TIPO_PARADA } from "@/lib/constants";

interface MapaRoteiroProps {
  paradas: Parada[];
  centro?: { lat: number; lng: number };
  onMapClick?: (lat: number, lng: number) => void;
}

export function MapaRoteiro({ paradas, centro, onMapClick }: MapaRoteiroProps) {
  const center = centro || { lat: -25.4284, lng: -49.2733 }; // Default: Curitiba

  // Com 2+ paradas, enquadra o mapa pra mostrar todas de uma vez. Com 0 ou 1,
  // usa center/zoom padrão (bounds de um único ponto não tem área).
  const bounds =
    paradas.length > 1
      ? (() => {
          const lats = paradas.map((p) => p.localizacao.lat);
          const lngs = paradas.map((p) => p.localizacao.lng);
          return {
            north: Math.max(...lats),
            south: Math.min(...lats),
            east: Math.max(...lngs),
            west: Math.min(...lngs),
          };
        })()
      : undefined;

  return (
    <Map
      style={{ width: "100%", height: "100%" }}
      defaultCenter={center}
      defaultZoom={13}
      defaultBounds={bounds ? { ...bounds, padding: 48 } : undefined}
      mapId="destino-certo-map"
      onClick={(e) => {
        if (e.detail.latLng && onMapClick) {
          onMapClick(e.detail.latLng.lat, e.detail.latLng.lng);
        }
      }}
    >
      {paradas.map((parada, idx) => (
        <AdvancedMarker
          key={parada.id}
          position={{ lat: parada.localizacao.lat, lng: parada.localizacao.lng }}
          title={parada.nome}
        >
          <div
            className="animate-marker-drop"
            style={{ animationDelay: `${Math.min(idx, 10) * 30}ms` }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md border-2 border-white -translate-x-1/2 -translate-y-1/2"
              style={{
                backgroundColor:
                  CORES_TIPO_PARADA[parada.tipo] || "#6b7280",
              }}
            >
              {parada.horarioInicio?.split(":")[0] || "?"}
            </div>
          </div>
        </AdvancedMarker>
      ))}
    </Map>
  );
}
