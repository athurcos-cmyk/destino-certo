import { type ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  titulo: string;
  descricao: string;
  acao?: ReactNode;
}

export function EmptyState({ icon, titulo, descricao, acao }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold mb-2">{titulo}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">{descricao}</p>
      {acao}
    </div>
  );
}
