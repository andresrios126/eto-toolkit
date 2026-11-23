// Tiempo total de uso de la app.
//
// - Cuenta solo mientras la app está en pantalla y la persona la usa (si pasan 5 min sin tocar nada, se pausa).
// - Se guarda en el ajuste "usage" como segundos POR DISPOSITIVO: { dev: { <idDispositivo>: segundos } }.
//   Así, al sincronizar con la cuenta (users/{uid} en Firebase) se combinan los dispositivos tomando el
//   mayor valor de cada uno, y el total del usuario es la suma de todos sus dispositivos.
// - Sin cuenta, el tiempo queda solo en el dispositivo.

import { getSetting, setSetting } from './db.js';
import { deviceId } from './stats.js';

const TICK = 15;            // segundos entre cada conteo
const IDLE = 5 * 60 * 1000; // sin interacción → pausa
const FLUSH = 5 * 60;       // guardar (y sincronizar) cada 5 min de uso

let pending = 0;
let lastInput = Date.now();
let lastTick = Date.now();
let flushing = null;

export function formatHM(sec) {
  const total = Math.max(0, Math.floor((sec || 0) / 60));
  const hrs = Math.floor(total / 60);
  const min = total % 60;
  return hrs ? `${hrs} h ${min} min` : `${min} min`;
}

export const usageTotal = (u) => Object.values(u?.dev || {}).reduce((s, n) => s + (Number(n) || 0), 0);

// Combina el tiempo de dos copias (local y nube): mayor valor por dispositivo.
export function mergeUsage(a = {}, b = {}) {
  const dev = { ...(a.dev || {}) };
  for (const [k, v] of Object.entries(b.dev || {})) dev[k] = Math.max(dev[k] || 0, v || 0);
  return { dev };
}

async function flush() {
  if (!pending) return;
  if (flushing) return flushing;
  const add = pending;
  pending = 0;
  flushing = (async () => {
    const u = await getSetting('usage', { dev: {} });
    const id = deviceId();
    u.dev = { ...(u.dev || {}), [id]: Math.round((u.dev?.[id] || 0) + add) };
    await setSetting('usage', u);
  })().catch(() => { pending += add; }).finally(() => { flushing = null; });
  return flushing;
}

// Total en segundos (todos los dispositivos que conoce este dispositivo + lo que aún no se guardó).
export async function getUsageSeconds() {
  return usageTotal(await getSetting('usage', { dev: {} })) + pending;
}

export function initUsage() {
  const touch = () => { lastInput = Date.now(); };
  ['pointerdown', 'keydown', 'touchstart', 'scroll', 'wheel'].forEach((ev) => window.addEventListener(ev, touch, { passive: true, capture: true }));
  setInterval(() => {
    const now = Date.now();
    const dt = Math.min((now - lastTick) / 1000, TICK * 2); // si el teléfono se durmió, no sumar ese hueco
    lastTick = now;
    const speaking = typeof speechSynthesis !== 'undefined' && speechSynthesis.speaking;
    if (document.visibilityState === 'visible' && (now - lastInput < IDLE || speaking)) {
      pending += dt;
      if (pending >= FLUSH) flush();
    }
  }, TICK * 1000);
  document.addEventListener('visibilitychange', () => { lastTick = Date.now(); if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', flush);
}
