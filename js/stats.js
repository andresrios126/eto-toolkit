// Contador anónimo de usuarios (dispositivos) que usan la app.
//
// Cada dispositivo guarda en Firestore (colección "devices") SOLO:
//   - un identificador al azar (no tiene relación con la persona ni con su cuenta),
//   - la fecha del primer y del último uso (como máximo se actualiza una vez al día),
//   - si tiene una cuenta iniciada (sí / no) y la versión de la app.
// No se guarda nombre, usuario, ubicación ni ningún otro dato. Se puede desactivar en ⚙️ Ajustes.

import { CLOUD_CONFIG } from './cloud-config.js';
import { getSession } from './cloud.js';

const DEVICE_KEY = 'eto-device';
const OFF_KEY = 'eto-stats-off';
const PING_KEY = 'eto-stats-ping';

function cfg() {
  let test = null;
  try { test = JSON.parse(localStorage.getItem('eto-cloud-test')); } catch (_) { /* nada */ }
  return { firestoreBase: 'https://firestore.googleapis.com/v1', ...CLOUD_CONFIG, ...(test || {}) };
}
const configured = () => Boolean(cfg().apiKey && cfg().projectId);
const docsBase = () => `${cfg().firestoreBase}/projects/${cfg().projectId}/databases/(default)/documents`;

function store(key, v) { try { if (v == null) localStorage.removeItem(key); else localStorage.setItem(key, v); } catch (_) { /* sin almacenamiento */ } }
function read(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }

function device() {
  let d = null;
  try { d = JSON.parse(read(DEVICE_KEY)); } catch (_) { /* nada */ }
  if (!d?.id) {
    const bytes = crypto.getRandomValues(new Uint8Array(12));
    d = { id: [...bytes].map((b) => b.toString(16).padStart(2, '0')).join(''), first: new Date().toISOString() };
    store(DEVICE_KEY, JSON.stringify(d));
  }
  return d;
}

export const statsEnabled = () => read(OFF_KEY) !== '1';

// Registra el uso de hoy (una vez al día). Silencioso si no hay internet.
export async function pingUsage(version, force = false) {
  if (!configured() || !statsEnabled()) return;
  const today = new Date().toISOString().slice(0, 10);
  if (!force && read(PING_KEY) === today) return;
  const d = device();
  const body = { fields: {
    first: { timestampValue: d.first },
    last: { timestampValue: new Date().toISOString() },
    acct: { booleanValue: Boolean(getSession()) },
    v: { stringValue: String(version || '') },
  } };
  try {
    const r = await fetch(`${docsBase()}/devices/${d.id}?key=${cfg().apiKey}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (r.ok) store(PING_KEY, today);
  } catch (_) { /* sin internet: se intenta la próxima vez */ }
}

export async function setStatsEnabled(on, version) {
  store(OFF_KEY, on ? null : '1');
  store(PING_KEY, null);
  if (on) return pingUsage(version, true);
  // Al desactivar, se borra el registro de este dispositivo.
  try { await fetch(`${docsBase()}/devices/${device().id}?key=${cfg().apiKey}`, { method: 'DELETE' }); } catch (_) { /* nada */ }
  return undefined;
}

async function count(where) {
  const r = await fetch(`${docsBase()}:runAggregationQuery?key=${cfg().apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredAggregationQuery: {
      structuredQuery: { from: [{ collectionId: 'devices' }], ...(where ? { where } : {}) },
      aggregations: [{ alias: 'n', count: {} }],
    } }),
  });
  if (!r.ok) { const e = new Error(`HTTP ${r.status}`); e.status = r.status; throw e; }
  const j = await r.json();
  return Number(j?.[0]?.result?.aggregateFields?.n?.integerValue || 0);
}

const since = (days) => ({ fieldFilter: { field: { fieldPath: 'last' }, op: 'GREATER_THAN_OR_EQUAL', value: { timestampValue: new Date(Date.now() - days * 864e5).toISOString() } } });

// Totales: { total, d7, d30, accounts } o { error: 'rules' | 'offline' | 'config' }.
export async function fetchUsage() {
  if (!configured()) return { error: 'config' };
  try {
    const [total, d7, d30, accounts] = await Promise.all([
      count(null), count(since(7)), count(since(30)),
      count({ fieldFilter: { field: { fieldPath: 'acct' }, op: 'EQUAL', value: { booleanValue: true } } }),
    ]);
    return { total, d7, d30, accounts };
  } catch (e) {
    return { error: e.status === 403 || e.status === 401 ? 'rules' : 'offline' };
  }
}
