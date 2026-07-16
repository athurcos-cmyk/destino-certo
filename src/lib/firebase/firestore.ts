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

export function col(path: string, ...pathSegments: string[]) {
  throw new Error("col() is deprecated — use getCollection() instead");
}

export function docRef(path: string, ...pathSegments: string[]) {
  throw new Error("docRef() is deprecated — use getDocument() instead");
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

export { Timestamp, where, orderBy, query };
