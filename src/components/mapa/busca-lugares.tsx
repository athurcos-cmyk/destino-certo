"use client";

import { useRef, useState, useEffect } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PlaceResult {
  placeId: string;
  nome: string;
  endereco: string;
  lat: number;
  lng: number;
}

interface BuscaLugaresProps {
  onSelect: (place: PlaceResult) => void;
}

export function BuscaLugares({ onSelect }: BuscaLugaresProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!places || !query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const autocompleteService =
          new places.AutocompleteService();
        const res = await autocompleteService.getPlacePredictions({
          input: query,
          language: "pt-BR",
          types: ["establishment", "geocode"],
        });

        const mapped: PlaceResult[] = (
          res.predictions || []
        ).map((p) => ({
          placeId: p.place_id,
          nome: p.structured_formatting?.main_text || p.description,
          endereco:
            p.structured_formatting?.secondary_text || "",
          lat: 0,
          lng: 0,
        }));
        setResults(mapped);
        setOpen(mapped.length > 0);
      } catch {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, places]);

  async function handleSelect(result: PlaceResult) {
    if (!places) return;
    try {
      const geocoder = new places.PlacesService(
        document.createElement("div")
      );
      geocoder.getDetails(
        { placeId: result.placeId, fields: ["geometry"] },
        (place, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            place?.geometry?.location
          ) {
            onSelect({
              ...result,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            });
          } else {
            onSelect(result);
          }
          setQuery("");
          setResults([]);
          setOpen(false);
        }
      );
    } catch {
      onSelect(result);
      setQuery("");
      setResults([]);
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          className="pl-9"
          placeholder="Buscar lugar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-48 overflow-auto">
          {results.map((r) => (
            <button
              key={r.placeId}
              className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors text-sm"
              onMouseDown={() => handleSelect(r)}
            >
              <p className="font-medium truncate">{r.nome}</p>
              {r.endereco && (
                <p className="text-xs text-muted-foreground truncate">
                  {r.endereco}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
