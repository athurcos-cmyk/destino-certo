"use client";

import { addToQueue, getPendingItems, removeFromQueue } from "./sync-queue";
import { addDocument, updateDocument, deleteDocument } from "@/lib/firebase/firestore";
import { toast } from "sonner";

let processing = false;

export async function processQueue() {
  if (processing) return;
  processing = true;

  const items = getPendingItems();
  if (items.length === 0) {
    processing = false;
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const item of items) {
    try {
      if (item.operacao === "criar" && item.data) {
        await addDocument(item.collectionPath, item.data);
      } else if (item.operacao === "atualizar" && item.data) {
        const docPath = item.docId
          ? `${item.collectionPath}/${item.docId}`
          : item.collectionPath;
        await updateDocument(docPath, item.data);
      } else if (item.operacao === "deletar") {
        const docPath = item.docId
          ? `${item.collectionPath}/${item.docId}`
          : item.collectionPath;
        await deleteDocument(docPath);
      }
      removeFromQueue(item.id);
      successCount++;
    } catch {
      failCount++;
    }
  }

  if (successCount > 0) {
    toast.success(`${successCount} alterações sincronizadas.`);
  }

  if (failCount > 0 && successCount === 0) {
    // Still offline or server error - will retry later
  }

  processing = false;
}

export function setupOnlineListener() {
  if (typeof window === "undefined") return;

  const handleOnline = () => {
    processQueue();
  };

  window.addEventListener("online", handleOnline);
  return () => window.removeEventListener("online", handleOnline);
}

export async function safeWrite(
  writeFn: () => Promise<void>,
  queueItem: {
    operacao: "criar" | "atualizar" | "deletar";
    collectionPath: string;
    docId?: string;
    data?: Record<string, unknown>;
  }
) {
  if (!navigator.onLine) {
    addToQueue(queueItem);
    toast.info("Salvo localmente. Será sincronizado quando houver internet.");
    return;
  }

  try {
    await writeFn();
  } catch {
    addToQueue(queueItem);
    toast.info("Sem conexão. Salvo localmente para sincronizar depois.");
  }
}
