import type { Timestamp } from "firebase/firestore";

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
  destinoLat?: number;
  destinoLng?: number;
  destinoPaisCodigo?: string;
  destinoPaisNome?: string;
  imagemCapa: string | null;
  dataInicio: Timestamp;
  dataFim: Timestamp;
  donoId: string;
  colaboradoresEmail: string[];
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
  localizacao: { lat: number; lng: number };
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
  destinoLat?: number;
  destinoLng?: number;
  destinoPaisCodigo?: string;
  destinoPaisNome?: string;
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
