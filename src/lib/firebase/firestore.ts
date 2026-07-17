import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { getDbInstance } from "./config";

async function db() {
  return getDbInstance();
}

export async function getDocument<T = DocumentData>(
  docPath: string,
  ...pathSegments: string[]
): Promise<(T & { id: string }) | null> {
  const snap = await getDoc(doc(await db(), docPath, ...pathSegments));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T & { id: string };
}

export async function getCollection<T = DocumentData>(
  collectionPath: string,
  ...constraints: QueryConstraint[]
): Promise<(T & { id: string })[]> {
  const q = query(collection(await db(), collectionPath), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T & { id: string });
}

export async function addDocument<T extends DocumentData>(
  collectionPath: string,
  data: T
): Promise<string> {
  const d = await addDoc(collection(await db(), collectionPath), {
    ...data,
    criadoEm: Timestamp.now(),
    atualizadoEm: Timestamp.now(),
  } as Record<string, unknown>);
  return d.id;
}

export async function updateDocument(
  docPath: string,
  data: Record<string, unknown>
): Promise<void> {
  await updateDoc(doc(await db(), docPath), {
    ...data,
    atualizadoEm: Timestamp.now(),
  } as Record<string, unknown>);
}

export async function deleteDocument(docPath: string): Promise<void> {
  await deleteDoc(doc(await db(), docPath));
}

export async function excluirRoteiroCompleto(roteiroId: string): Promise<void> {
  // Apaga o documento principal primeiro (é o que aparece nas listas) para que
  // o cache local reflita a remoção imediatamente, antes de limpar o resto.
  deleteDocument(`roteiros/${roteiroId}`).catch((err) =>
    console.error("Erro ao excluir roteiro:", err)
  );

  const dias = await getCollection<{ id: string }>(`roteiros/${roteiroId}/dias`);
  for (const dia of dias) {
    const paradas = await getCollection<{ id: string }>(
      `roteiros/${roteiroId}/dias/${dia.id}/paradas`
    );
    for (const parada of paradas) {
      deleteDocument(`roteiros/${roteiroId}/dias/${dia.id}/paradas/${parada.id}`).catch(
        (err) => console.error("Erro ao excluir parada:", err)
      );
    }
    deleteDocument(`roteiros/${roteiroId}/dias/${dia.id}`).catch((err) =>
      console.error("Erro ao excluir dia:", err)
    );
  }
}

export { Timestamp, where, orderBy, query };
