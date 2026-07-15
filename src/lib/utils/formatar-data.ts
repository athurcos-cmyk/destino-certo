export function formatarData(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data;
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatarDataCurta(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data;
  return d.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  });
}

export function formatarHorario(horario: string): string {
  const [h, m] = horario.split(":");
  return `${h}:${m}`;
}

export function gerarDiasEntreDatas(inicio: Date, fim: Date): Date[] {
  const dias: Date[] = [];
  const atual = new Date(inicio);
  while (atual <= fim) {
    dias.push(new Date(atual));
    atual.setDate(atual.getDate() + 1);
  }
  return dias;
}
