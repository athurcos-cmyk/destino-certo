import type { Timestamp, GeoPoint } from "firebase/firestore";

export type TipoParada =
  | "atracao"
  | "restaurante"
  | "hospedagem"
  | "transporte"
  | "outro";

export interface Roteiro {
  id: string;
  titulo: string;
  descricao: string;
  destino: string;
  imagemCapa: string | null;
  dataInicio: Timestamp;
  dataFim: Timestamp;
  donoId: string;
  colaboradores: string[];
  slugCompartilhamento: string | null;
  compartilhamentoAtivo: boolean;
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
}

export interface Dia {
  id: string;
  data: Timestamp;
  numeroDia: number;
  notas: string;
  ordem: number;
  criadoEm: Timestamp;
}

export interface Parada {
  id: string;
  placeId: string;
  nome: string;
  endereco: string;
  localizacao: GeoPoint;
  tipo: TipoParada;
  horarioInicio: string | null;
  horarioFim: string | null;
  notas: string;
  ordem: number;
  criadoEm: Timestamp;
}

export interface RoteiroFormData {
  titulo: string;
  descricao: string;
  destino: string;
  dataInicio: Date;
  dataFim: Date;
}

export interface ParadaFormData {
  placeId: string;
  nome: string;
  endereco: string;
  lat: number;
  lng: number;
  tipo: TipoParada;
  horarioInicio: string;
  horarioFim: string;
  notas: string;
}
