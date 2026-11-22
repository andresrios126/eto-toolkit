// Capa mínima sobre IndexedDB. Todo se guarda en el dispositivo.
// Stores:
//   answers  -> respuestas personalizadas { id, aEn, aEs, updatedAt }
//   settings -> preferencias { key, value }
//   log      -> historial de práctica { id(auto), qid, date, seconds }
//   glossary -> estado/ediciones de términos y términos propios { id, fav, known, edited, custom, en, es, def, ex, cat }
//   faults   -> casos de fallas propios { id, titleEn, titleEs, symptom, causes[], steps[], fix, explainEn, explainEs }

const DB_NAME = 'eto-toolkit';
const DB_VERSION = 3;
export const STORES = ['answers', 'settings', 'log', 'glossary', 'faults'];

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('answers')) db.createObjectStore('answers', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
      if (!db.objectStoreNames.contains('log')) db.createObjectStore('log', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('glossary')) db.createObjectStore('glossary', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('faults')) db.createObjectStore('faults', { keyPath: 'id' });
    };
    req.onsuccess = () => {
      const conn = req.result;
      // Si otra pestaña actualiza la base de datos, cerramos esta conexión.
      conn.onversionchange = () => { conn.close(); dbPromise = null; };
      resolve(conn);
    };
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function wrap(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(store, mode, fn) {
  const db = await openDB();
  const t = db.transaction(store, mode);
  const result = fn(t.objectStore(store));
  await new Promise((resolve, reject) => {
    t.oncomplete = resolve;
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
  return result instanceof IDBRequest ? result.result : result;
}

export const db = {
  get: (store, key) => openDB().then((d) => wrap(d.transaction(store).objectStore(store).get(key))),
  getAll: (store) => openDB().then((d) => wrap(d.transaction(store).objectStore(store).getAll())),
  put: (store, value) => tx(store, 'readwrite', (s) => s.put(value)),
  delete: (store, key) => tx(store, 'readwrite', (s) => s.delete(key)),
  add: (store, value) => tx(store, 'readwrite', (s) => s.add(value)),
  clear: (store) => tx(store, 'readwrite', (s) => s.clear()),
};

export async function getSetting(key, fallback) {
  const row = await db.get('settings', key);
  return row ? row.value : fallback;
}

export function setSetting(key, value) {
  return db.put('settings', { key, value });
}

// ---------- Respaldo ----------

export async function exportBackup() {
  const data = {};
  for (const s of STORES) data[s] = await db.getAll(s);
  return {
    app: 'eto-toolkit',
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export async function importBackup(json) {
  if (!json || json.app !== 'eto-toolkit' || typeof json.data !== 'object') {
    throw new Error('El archivo no es un respaldo válido de ETO Toolkit.');
  }
  const d = await openDB();
  const t = d.transaction(STORES, 'readwrite');
  for (const s of STORES) {
    const store = t.objectStore(s);
    store.clear();
    for (const row of json.data[s] || []) store.put(row);
  }
  await new Promise((resolve, reject) => {
    t.oncomplete = resolve;
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

// Pide al navegador que no borre los datos automáticamente (si lo soporta).
export async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      return await navigator.storage.persist();
    }
  } catch (_) { /* ignorar */ }
  return false;
}
