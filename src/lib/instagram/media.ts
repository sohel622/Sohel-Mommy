// Small helpers for media persistence.

export function getSafeVideoSrc(url?: string): string | undefined {
  if (!url || typeof url !== "string") return undefined;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return undefined;
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) return trimmed;
  if (trimmed.includes("#t=")) return trimmed;
  return `${trimmed}#t=0.5`;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Minimal IndexedDB wrapper for persisted user-uploaded media
// (posts, reels, stories). Mirrors the HTML reference's
// InstagramCloneDB / userMediaStore engine.

const DB_NAME = "InstagramCloneDB";
const STORE = "userMediaStore";

export interface StoredMedia {
  id: number;
  kind: "post" | "reel" | "story";
  payload: Record<string, unknown>;
  fileBlob?: Blob;
  createdAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveToIndexedDB(item: StoredMedia): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // ignore persistence failures
  }
}

export async function loadFromIndexedDB(): Promise<StoredMedia[]> {
  try {
    const db = await openDB();
    const out = await new Promise<StoredMedia[]>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result as StoredMedia[]) ?? []);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return out;
  } catch {
    return [];
  }
}
