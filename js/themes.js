// Temas de color. Cada tema define las variables CSS de :root.
// La elección se guarda en localStorage (para aplicarla antes de pintar, sin parpadeo) y en IndexedDB (respaldo).

import { setSetting } from './db.js';

const LIGHT_BASE = {
  '--text': '#1b2433', '--muted': '#5d6b82',
  '--primary': '#f5b400', '--primary-text': '#1a1300', '--primary-ink': '#9a6a00',
  '--accent': '#2b8de0', '--on-accent': '#001428',
  '--ok': '#22b573', '--ok-ink': '#12804e', '--warn': '#e69500', '--danger': '#e5484d',
  '--es-text': '#3b4a63', '--yellow-ink': '#9a7400',
  '--sheet-ok-bg': '#e3f8ee', '--sheet-ok-text': '#0d5c39',
  '--sheet-bad-bg': '#fde8e8', '--sheet-bad-text': '#8a1c1c',
  'color-scheme': 'light',
};

const DARK_BASE = {
  '--text': '#e7ecf5', '--muted': '#93a0b8',
  '--primary': '#f5b400', '--primary-text': '#1a1300', '--primary-ink': '#f5b400',
  '--accent': '#3fa9ff', '--on-accent': '#001428',
  '--ok': '#3ecf8e', '--ok-ink': '#3ecf8e', '--warn': '#ffb020', '--danger': '#ff5d5d',
  '--es-text': '#b9c7e0', '--yellow-ink': '#ffd34d',
  '--sheet-ok-bg': '#0f2f24', '--sheet-ok-text': '#b8f5d9',
  '--sheet-bad-bg': '#3a1416', '--sheet-bad-text': '#ffd0d0',
  'color-scheme': 'dark',
};

// Superficies a partir del color de fondo.
function surfaces(bg, light) {
  return light
    ? {
      '--bg': bg, '--surface': mix(bg, '#ffffff', 0.75), '--surface-2': mix(bg, '#000000', 0.05),
      '--border': mix(bg, '#000000', 0.14), '--shadow': mix(bg, '#000000', 0.18), '--line': mix(bg, '#000000', 0.28),
      '--topbar': hexA(bg, 0.92), '--label-bg': hexA(mix(bg, '#ffffff', 0.75), 0.92),
    }
    : {
      '--bg': bg, '--surface': mix(bg, '#ffffff', 0.05), '--surface-2': mix(bg, '#ffffff', 0.1),
      '--border': mix(bg, '#ffffff', 0.17), '--shadow': mix(bg, '#000000', 0.35), '--line': mix(bg, '#ffffff', 0.25),
      '--topbar': hexA(bg, 0.92), '--label-bg': hexA(bg, 0.85),
    };
}

export const THEMES = [
  { id: 'claro', name: 'Claro', light: true, bg: '#f4f6fa', extra: { '--surface': '#ffffff' } },
  { id: 'arena', name: 'Arena', light: true, bg: '#f6efe2', extra: { '--accent': '#2a7fc9', '--primary-ink': '#94600a' } },
  { id: 'menta', name: 'Menta', light: true, bg: '#eaf6f0', extra: { '--accent': '#159a7e', '--on-accent': '#ffffff' } },
  { id: 'cielo', name: 'Cielo', light: true, bg: '#e8f1fb' },
  { id: 'lavanda', name: 'Lavanda', light: true, bg: '#f1eefa', extra: { '--accent': '#6a5cf0', '--on-accent': '#ffffff' } },
  { id: 'grafito', name: 'Grafito', light: false, bg: '#1d1f24' },
  { id: 'noche', name: 'Noche eléctrica', light: false, bg: '#0b1220',
    extra: { '--surface': '#131c2e', '--surface-2': '#1b2640', '--border': '#26324d', '--shadow': '#0e1628', '--line': '#3a4a6d' } },
];

export const DEFAULT_THEME = { id: 'claro' };

export const CUSTOM_SWATCHES = ['#ffffff', '#fdf6e3', '#fff1f2', '#ecfdf5', '#eff6ff', '#f5f3ff', '#fefce8', '#e5e7eb', '#334155', '#1e293b', '#3b0764', '#052e16'];

// ---------- Utilidades de color ----------

function toRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const toHex = (rgb) => '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
function mix(a, b, t) {
  const A = toRgb(a), B = toRgb(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
}
function hexA(hex, alpha) {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
export function isLight(hex) {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.35;
}

// ---------- Aplicar ----------

export function themeVars(choice) {
  if (choice?.id === 'custom' && /^#[0-9a-f]{6}$/i.test(choice.color || '')) {
    const light = isLight(choice.color);
    return { ...(light ? LIGHT_BASE : DARK_BASE), ...surfaces(choice.color, light) };
  }
  const t = THEMES.find((x) => x.id === choice?.id) || THEMES[0];
  return { ...(t.light ? LIGHT_BASE : DARK_BASE), ...surfaces(t.bg, t.light), ...(t.extra || {}) };
}

export function applyTheme(choice) {
  const vars = themeVars(choice);
  const root = document.documentElement;
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', vars['--bg']);
  try {
    localStorage.setItem('eto-theme', JSON.stringify(choice));
    localStorage.setItem('eto-theme-vars', JSON.stringify(vars));
  } catch (_) { /* sin almacenamiento local */ }
  return vars;
}

export function currentTheme() {
  try { return JSON.parse(localStorage.getItem('eto-theme')) || DEFAULT_THEME; } catch (_) { return DEFAULT_THEME; }
}

export async function saveTheme(choice) {
  applyTheme(choice);
  await setSetting('theme', choice);
}
