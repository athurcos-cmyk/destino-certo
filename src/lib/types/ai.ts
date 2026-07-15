import type { TipoParada } from "./roteiro";

export interface SugestaoLugar {
  nome: string;
  descricao: string;
  endereco: string;
  tipo: TipoParada;
  porQue: string;
  horarioFuncionamento?: string;
  precoMedio?: string;
}

export interface PesquisaResponse {
  lugares: SugestaoLugar[];
  dicas: string[];
}

export interface ParadaSugerida {
  nome: string;
  horarioSugerido: string;
  duracaoEstimada: string;
  descricao: string;
  tipo: TipoParada;
}

export interface DiaSugerido {
  numeroDia: number;
  tema: string;
  paradas: ParadaSugerida[];
}

export interface RoteiroSugeridoResponse {
  dias: DiaSugerido[];
  dicasGerais: string[];
}
