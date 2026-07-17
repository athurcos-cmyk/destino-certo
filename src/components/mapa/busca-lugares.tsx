"use client";

import { useRef, useState, useEffect } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

interface PlaceResult {
  placeId: string;
  nome: string;
  endereco: string;
  lat: number;
  lng: number;
  paisCodigo?: string;
  paisNome?: string;
}

interface SuggestionItem {
  placeId: string;
  nome: string;
  endereco: string;
  prediction: google.maps.places.PlacePrediction;
}

interface BuscaLugaresProps {
  onSelect: (place: PlaceResult) => void;
  placeholder?: string;
}

export function BuscaLugares({ onSelect, placeholder = "Buscar lugar..." }: BuscaLugaresProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SuggestionItem[]>([]);
  const [open, setOpen] = useState(false);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    if (!places || !query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        const { suggestions } =
          await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: query,
            language: "pt-BR",
            region: "br",
          });

        const mapped: SuggestionItem[] = suggestions
          .filter((s) => s.placePrediction)
          .map((s) => {
            const p = s.placePrediction!;
            return {
              placeId: p.placeId,
              nome: p.mainText?.text ?? p.text.text,
              endereco: p.secondaryText?.text ?? "",
              prediction: p,
            };
          });
        setResults(mapped);
        setOpen(mapped.length > 0);
      } catch (err) {
        console.error("Erro ao buscar lugares:", err);
        setResults([]);
      } finally {
        setBuscando(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, places]);

  async function handleSelect(item: SuggestionItem) {
    setQuery("");
    setResults([]);
    setOpen(false);

    try {
      const place = item.prediction.toPlace();
      await place.fetchFields({
        fields: ["location", "formattedAddress", "displayName", "addressComponents"],
      });
      const paisComponent = place.addressComponents?.find((c) =>
        c.types.includes("country")
      );
      onSelect({
        placeId: item.placeId,
        nome: place.displayName || item.nome,
        endereco: place.formattedAddress || item.endereco,
        lat: place.location?.lat() ?? 0,
        lng: place.location?.lng() ?? 0,
        paisCodigo: paisComponent?.shortText ?? undefined,
        paisNome: paisComponent?.longText ?? undefined,
      });
    } catch (err) {
      console.error("Erro ao obter detalhes do lugar:", err);
      onSelect({
        placeId: item.placeId,
        nome: item.nome,
        endereco: item.endereco,
        lat: 0,
        lng: 0,
      });
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        {buscando ? (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          ref={inputRef}
          className="pl-9"
          placeholder={placeholder}
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
              type="button"
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
