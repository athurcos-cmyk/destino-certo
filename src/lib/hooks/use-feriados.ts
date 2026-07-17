import { useQuery } from "@tanstack/react-query";

interface Feriado {
  date: string; // YYYY-MM-DD
  localName: string;
  name: string;
}

async function buscarFeriados(paisCodigo: string, ano: number): Promise<Feriado[]> {
  const res = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${ano}/${paisCodigo}`
  );
  if (!res.ok) return [];
  return res.json();
}

export function useFeriados(paisCodigo: string | undefined, ano: number) {
  return useQuery({
    queryKey: ["feriados", paisCodigo, ano],
    queryFn: () => buscarFeriados(paisCodigo!, ano),
    enabled: !!paisCodigo,
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });
}
