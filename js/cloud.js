// Cuentas de usuario (usuario + contraseña, sin correo) y sincronización del progreso entre dispositivos.
//
// - Usa las APIs REST de Firebase Authentication y Firestore (sin SDK, para que la app siga siendo ligera).
// - El usuario se convierte internamente en un "correo" técnico (usuario@eto-toolkit.app) solo para Firebase;
//   no se envía ningún correo ni se pide uno.
// - La sesión se guarda en el dispositivo y no se cierra hasta que el usuario toca "Cerrar sesión".
// - Funciona sin internet: los cambios se guardan localmente y se sincronizan al volver la conexión.
// - Al sincronizar se COMBINA el progreso local con el de la nube (nunca se sobrescribe a ciegas).
// - Las imágenes privadas no se sincronizan (pesan mucho); siguen en cada dispositivo y en el respaldo.

import { CLOUD_CONFIG } from './cloud-config.js';
import { db, STORES, onDataChange, withoutChangeEvents } from './db.js';

const SYNC_STORES = ['answers', 'settings', 'log', 'glossary', 'faults'];
const LOCAL_ONLY_SETTINGS = new Set(['theme', 'icon', 'sound', 'speechRate', 'interviewFilter', 'glossaryFilter', 'faultFilter', 'cardsDeck', 'cardsDir', 'cardsSize', 'mockCfg']);
const SESSION_KEY = 'eto-cloud-session';
const STATUS_KEY = 'eto-cloud-status';
const DOMAIN = 'eto-toolkit.app';

// Para pruebas locales se puede sobrescribir la configuración (no se usa en producción).
function config() {
  let test = null;
  try { test = JSON.parse(localStorage.getItem('eto-cloud-test')); } catch (_) { /* nada */ }
  return {
    authBase: 'https://identitytoolkit.googleapis.com/v1',
    tokenBase: 'https://securetoken.googleapis.com/v1',
    firestoreBase: 'https://firestore.googleapis.com/v1',
    ...CLOUD_CONFIG,
    ...(test || {}),
  };
}

export const cloudConfigured = () => Boolean(config().apiKey && config().projectId);

// ---------- Sesión ----------

function readJSON(key) { try { return JSON.parse(localStorage.getItem(key)); } catch (_) { return null; } }
function writeJSON(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (_) { /* nada */ } }

export const getSession = () => readJSON(SESSION_KEY);
export const getStatus = () => readJSON(STATUS_KEY) || {};
function setStatus(patch) {
  const s = { ...getStatus(), ...patch };
  writeJSON(STATUS_KEY, s);
  window.dispatchEvent(new CustomEvent('eto-cloud-status', { detail: s }));
}

export function normalizeUser(u) { return (u || '').trim().toLowerCase(); }
export function validUser(u) { return /^[a-z0-9._-]{3,20}$/.test(u); }

const ERRORS = {
  EMAIL_EXISTS: 'Ese usuario ya existe. Elige otro o inicia sesión.',
  EMAIL_NOT_FOUND: 'Usuario o contraseña incorrectos.',
  INVALID_PASSWORD: 'Usuario o contraseña incorrectos.',
  INVALID_LOGIN_CREDENTIALS: 'Usuario o contraseña incorrectos.',
  USER_DISABLED: 'Esta cuenta está desactivada.',
  TOO_MANY_ATTEMPTS_TRY_LATER: 'Demasiados intentos. Espera unos minutos.',
  OPERATION_NOT_ALLOWED: 'La nube aún no está configurada (falta activar el inicio de sesión).',
};

async function authCall(path, body) {
  const c = config();
  let res;
  try {
    res = await fetch(`${c.authBase}/${path}?key=${encodeURIComponent(c.apiKey)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
  } catch (_) {
    throw new Error('Sin conexión. Para crear la cuenta o iniciar sesión necesitas internet la primera vez.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = (data.error?.message || '').split(' ')[0];
    if (code.startsWith('WEAK_PASSWORD')) throw new Error('La contraseña debe tener al menos 6 caracteres.');
    throw new Error(ERRORS[code] || `Error de la nube (${code || res.status}).`);
  }
  return data;
}

function saveSession(username, d) {
  const s = {
    username, uid: d.localId || d.user_id, idToken: d.idToken || d.id_token,
    refreshToken: d.refreshToken || d.refresh_token,
    exp: Date.now() + (Number(d.expiresIn || d.expires_in || 3600) - 120) * 1000,
  };
  writeJSON(SESSION_KEY, s);
  return s;
}

export async function signUp(user, password) {
  const u = normalizeUser(user);
  if (!validUser(u)) throw new Error('El usuario debe tener de 3 a 20 caracteres: letras, números, punto, guion o guion bajo.');
  const d = await authCall('accounts:signUp', { email: `${u}@${DOMAIN}`, password, returnSecureToken: true });
  saveSession(u, d);
  setStatus({ lastSync: null, error: null, pending: true });
  await syncNow();
  return u;
}

export async function signIn(user, password) {
  const u = normalizeUser(user);
  if (!validUser(u)) throw new Error('Usuario no válido.');
  const d = await authCall('accounts:signInWithPassword', { email: `${u}@${DOMAIN}`, password, returnSecureToken: true });
  saveSession(u, d);
  setStatus({ lastSync: null, error: null, pending: true });
  await syncNow();
  return u;
}

export function signOut() {
  try { localStorage.removeItem(SESSION_KEY); localStorage.removeItem(STATUS_KEY); } catch (_) { /* nada */ }
  window.dispatchEvent(new CustomEvent('eto-cloud-status', { detail: {} }));
}

async function idToken() {
  const s = getSession();
  if (!s) return null;
  if (Date.now() < s.exp) return s.idToken;
  const c = config();
  const res = await fetch(`${c.tokenBase}/token?key=${encodeURIComponent(c.apiKey)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(s.refreshToken)}`,
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 400) { signOut(); throw new Error('La sesión expiró. Vuelve a iniciar sesión.'); }
    throw new Error('No se pudo renovar la sesión.');
  }
  return saveSession(s.username, d).idToken;
}

// ---------- Firestore (un documento por usuario) ----------

function docUrl(uid) {
  const c = config();
  return `${c.firestoreBase}/projects/${c.projectId}/databases/(default)/documents/users/${uid}`;
}

async function getRemote() {
  const s = getSession();
  const res = await fetch(docUrl(s.uid), { headers: { Authorization: `Bearer ${await idToken()}` } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`No se pudo leer la nube (${res.status}).`);
  const doc = await res.json();
  const raw = doc.fields?.data?.stringValue;
  return raw ? JSON.parse(raw) : null;
}

async function putRemote(data) {
  const s = getSession();
  const body = { fields: {
    data: { stringValue: JSON.stringify(data) },
    username: { stringValue: s.username },
    updatedAt: { stringValue: new Date().toISOString() },
  } };
  const res = await fetch(docUrl(s.uid), {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await idToken()}` }, body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`No se pudo guardar en la nube (${res.status}).`);
}

// ---------- Combinar progreso ----------

const newer = (a, b) => ((a?.updatedAt || '') >= (b?.updatedAt || '') ? a : b);

function mergeById(local = [], remote = [], key = 'id') {
  const map = new Map();
  for (const r of remote) map.set(r[key], r);
  for (const l of local) map.set(l[key], map.has(l[key]) ? newer(l, map.get(l[key])) : l);
  return [...map.values()];
}

function mergeStars(a = {}, b = {}) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) {
    const x = out[k];
    out[k] = x ? { ...x, ...v, stars: Math.max(x.stars || 0, v.stars || 0), plays: Math.max(x.plays || 0, v.plays || 0) } : v;
  }
  return out;
}

function mergeGame(a = {}, b = {}) {
  const day = (a.todayDate || '') >= (b.todayDate || '') ? a : b;
  return {
    ...a, ...b,
    xp: Math.max(a.xp || 0, b.xp || 0),
    streak: (a.lastDay || '') >= (b.lastDay || '') ? (a.streak || 0) : (b.streak || 0),
    lastDay: [a.lastDay, b.lastDay].filter(Boolean).sort().pop() || null,
    todayDate: day.todayDate || null,
    todayXp: a.todayDate === b.todayDate ? Math.max(a.todayXp || 0, b.todayXp || 0) : (day.todayXp || 0),
    lessons: mergeStars(a.lessons, b.lessons),
  };
}

function mergeEnglish(a = {}, b = {}) {
  const exams = { ...(a.exams || {}) };
  for (const [k, v] of Object.entries(b.exams || {})) {
    const x = exams[k];
    exams[k] = x ? {
      attempts: Math.max(x.attempts || 0, v.attempts || 0), best: Math.max(x.best || 0, v.best || 0),
      last: v.last ?? x.last, passed: Boolean(x.passed || v.passed), weak: v.weak || x.weak,
    } : v;
  }
  return { ...a, ...b, xp: Math.max(a.xp || 0, b.xp || 0), lessons: mergeStars(a.lessons, b.lessons), exams, reviews: { ...(a.reviews || {}), ...(b.reviews || {}) } };
}

function mergeSettings(local = [], remote = []) {
  const L = Object.fromEntries(local.map((r) => [r.key, r.value]));
  const R = Object.fromEntries(remote.map((r) => [r.key, r.value]));
  const out = { ...R, ...L };
  for (const k of new Set([...Object.keys(L), ...Object.keys(R)])) {
    if (LOCAL_ONLY_SETTINGS.has(k)) { if (k in L) out[k] = L[k]; else delete out[k]; continue; }
    if (!(k in L) || !(k in R)) continue;
    if (k === 'game') out[k] = mergeGame(L[k], R[k]);
    else if (k === 'english') out[k] = mergeEnglish(L[k], R[k]);
    else if (k === 'kposCourse') out[k] = { units: { ...(R[k].units || {}), ...(L[k].units || {}) }, best: Math.max(R[k].best || 0, L[k].best || 0) };
    else if (k === 'mockHistory') {
      const m = new Map([...(R[k] || []), ...(L[k] || [])].map((h) => [h.date, h]));
      out[k] = [...m.values()].sort((x, y) => (x.date < y.date ? 1 : -1)).slice(0, 20);
    }
  }
  return Object.entries(out).map(([key, value]) => ({ key, value }));
}

function mergeLog(local = [], remote = []) {
  const m = new Map();
  for (const r of [...remote, ...local]) m.set(`${r.qid}|${r.date}`, { qid: r.qid, date: r.date, seconds: r.seconds });
  return [...m.values()].sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-1000).map((r, i) => ({ ...r, id: i + 1 }));
}

export function mergeData(local, remote) {
  if (!remote) return local;
  return {
    answers: mergeById(local.answers, remote.answers),
    glossary: mergeById(local.glossary, remote.glossary),
    faults: mergeById(local.faults, remote.faults),
    settings: mergeSettings(local.settings, remote.settings),
    log: mergeLog(local.log, remote.log),
  };
}

async function localData() {
  const out = {};
  for (const s of SYNC_STORES) out[s] = await db.getAll(s);
  return out;
}

async function writeLocal(data) {
  await withoutChangeEvents(async () => {
    for (const s of SYNC_STORES) {
      await db.clear(s);
      for (const row of data[s] || []) await db.put(s, row);
    }
  });
}

// ---------- Sincronización ----------

let running = null;
let again = false;
let timer = null;

export async function syncNow() {
  if (!cloudConfigured() || !getSession()) return false;
  if (running) { again = true; return running; }
  running = (async () => {
    setStatus({ syncing: true });
    try {
      const local = await localData();
      const remote = await getRemote();
      const merged = mergeData(local, remote);
      const changedLocal = JSON.stringify(merged) !== JSON.stringify(local);
      if (changedLocal) await writeLocal(merged);
      const size = JSON.stringify(merged).length;
      if (size > 900000) throw new Error('El progreso es demasiado grande para la nube.');
      await putRemote(merged);
      setStatus({ syncing: false, pending: false, error: null, lastSync: new Date().toISOString() });
      if (changedLocal) window.dispatchEvent(new CustomEvent('eto-cloud-updated'));
      return true;
    } catch (e) {
      // Un fallo de red (TypeError de fetch) significa que no hay conexión.
      const offline = e instanceof TypeError || !navigator.onLine;
      setStatus({ syncing: false, pending: true, error: offline ? 'Sin conexión: se sincronizará al volver internet.' : e.message });
      return false;
    } finally {
      running = null;
      if (again) { again = false; schedule(500); }
    }
  })();
  return running;
}

function schedule(ms = 2500) {
  if (!cloudConfigured() || !getSession()) return;
  clearTimeout(timer);
  timer = setTimeout(syncNow, ms);
}

export function initCloud() {
  if (!cloudConfigured()) return;
  onDataChange((store) => {
    if (!getSession()) return;
    if (store === 'images') return;
    setStatus({ pending: true });
    schedule();
  });
  window.addEventListener('online', () => schedule(500));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') schedule(800); });
  // Reintento periódico mientras haya cambios pendientes (por ejemplo, después de estar sin señal).
  setInterval(() => {
    if (getSession() && getStatus().pending && !getStatus().syncing && document.visibilityState === 'visible') syncNow();
  }, 30000);
  if (getSession()) schedule(1000);
}

// Para pruebas
export const _test = { mergeData, STORES };
