import type { Timestamp } from "firebase/firestore";

export interface Usuario {
  uid: string;
  nome: string | null;
  email: string | null;
  fotoURL: string | null;
  criadoEm: Timestamp;
}
