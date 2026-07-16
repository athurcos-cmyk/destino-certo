"use client";

type Operacao = "criar" | "atualizar" | "deletar";

interface ItemFila {
  id: string;
  operacao: Operacao;
  collectionPath: string;
  docId?: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

const STORAGE_KEY = "destino-certo-sync-queue";

function getQueue(): ItemFila[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: ItemFila[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Storage full - keep what we have
  }
}

export function addToQueue(item: Omit<ItemFila, "id" | "timestamp">) {
  const queue = getQueue();
  queue.push({
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  });
  saveQueue(queue);
}

export function removeFromQueue(id: string) {
  const queue = getQueue().filter((i) => i.id !== id);
  saveQueue(queue);
}

export function getPendingCount(): number {
  return getQueue().length;
}

export function getPendingItems(): ItemFila[] {
  return getQueue();
}

export function clearQueue() {
  saveQueue([]);
}
