// Globo de traducción: mantener presionada una palabra en inglés 1,5 s muestra su significado.
// Se cierra al tocar cualquier otra parte. Desactivado dentro de elementos con [data-nolookup].

import { DICTIONARY } from './data/dictionary.js';
import { TERMS } from './data/glossary.js';
import { IRREGULAR, REGULAR } from './data/english.js';
import { speak } from './speech.js';
import { h } from './ui.js';

const HOLD_MS = 1500;
const MOVE_TOLERANCE = 10;

let dict = null;      // palabra → { es, note }
let phrases = null;   // frases del glosario (2-4 palabras) → es

const SPECIAL = {
  is: ['be', 'forma de "be" (es / está)'], are: ['be', 'forma de "be" (son / están)'], am: ['be', 'forma de "be" (soy / estoy)'],
  was: ['be', 'pasado de "be"'], were: ['be', 'pasado de "be"'], been: ['be', 'participio de "be"'], being: ['be', 'forma -ing de "be"'],
  has: ['have', 'forma de "have" (él / ella)'], does: ['do', 'forma de "do" (él / ella)'],
  "i'm": ['be', 'I am = yo soy / estoy'], "you're": ['be', 'you are'], "we're": ['be', 'we are'], "they're": ['be', 'they are'],
  "he's": ['be', 'he is / he has'], "she's": ['be', 'she is / she has'], "it's": ['be', 'it is / it has'],
  "i've": ['have', 'I have'], "i'll": ['will', 'I will'], "i'd": ['would', 'I would / I had'],
  "don't": ['do', 'do not = no'], "doesn't": ['do', 'does not = no'], "didn't": ['do', 'did not = no (pasado)'],
  "isn't": ['be', 'is not = no es / no está'], "aren't": ['be', 'are not'], "wasn't": ['be', 'was not'], "weren't": ['be', 'were not'],
  "haven't": ['have', 'have not'], "hasn't": ['have', 'has not'], "hadn't": ['have', 'had not'],
  "won't": ['will', 'will not = no (futuro)'], "wouldn't": ['would', 'would not'], "can't": ['can', 'cannot = no poder'],
  "couldn't": ['could', 'could not'], "shouldn't": ['should', 'should not'], "mustn't": ['must', 'must not = prohibido'],
};

function buildDict() {
  dict = {};
  phrases = {};
  const add = (w, es, note) => {
    const k = w.toLowerCase().trim();
    if (!k || dict[k]) return;
    dict[k] = { es, note };
  };
  for (const [w, es] of Object.entries(DICTIONARY)) add(w, es);
  for (const [base, past, pp, es] of IRREGULAR) {
    add(base, es);
    past.split(' / ').forEach((p) => add(p, es, `pasado de "${base}"`));
    pp.split(' / ').forEach((p) => add(p, es, `participio de "${base}"`));
  }
  for (const [base, past, es] of REGULAR) { add(base, es); add(past, es, `pasado de "${base}"`); }
  for (const t of TERMS) {
    const base = t.en.replace(/\s*\(.*?\)\s*/g, ' ').split(' / ')[0].trim();
    const words = base.toLowerCase().split(/\s+/);
    const inner = (t.en.match(/\(([^)]+)\)/) || [])[1]?.trim();
    if (words.length === 1) add(base, inner && /^[A-Z0-9\-]{2,8}$/.test(base) ? `${inner}: ${t.es}` : t.es);
    else if (words.length <= 4) phrases[base.toLowerCase()] = t.es;
    // Sigla entre paréntesis: "current transformer (CT)" → CT
    if (inner && /^[A-Z0-9\-]{2,8}$/.test(inner)) add(inner, `${base}: ${t.es}`);
  }
}

// Busca la palabra o su forma base (works → work, studied → study, running → run…).
function lookupWord(raw) {
  if (!dict) buildDict();
  const w = raw.toLowerCase().replace(/[’]/g, "'").replace(/^'+|'+$/g, '');
  if (SPECIAL[w]) {
    const [base, note] = SPECIAL[w];
    return { word: raw, base, es: dict[base]?.es || '', note };
  }
  if (dict[w]) return { word: raw, base: w, ...dict[w] };
  const strip = w.replace(/'s$/, '');
  const candidates = [
    [strip, ''],
    [w.replace(/ies$/, 'y'), 'plural / 3.ª persona'], [w.replace(/es$/, ''), 'plural / 3.ª persona'], [w.replace(/s$/, ''), 'plural / 3.ª persona'],
    [w.replace(/ied$/, 'y'), 'pasado'], [w.replace(/ed$/, ''), 'pasado'], [w.replace(/d$/, ''), 'pasado'], [w.replace(/(.)\1ed$/, '$1'), 'pasado'],
    [w.replace(/ying$/, 'ie'), 'forma -ing'], [w.replace(/ing$/, ''), 'forma -ing'], [w.replace(/ing$/, 'e'), 'forma -ing'], [w.replace(/(.)\1ing$/, '$1'), 'forma -ing'],
    [w.replace(/ier$/, 'y'), 'comparativo'], [w.replace(/er$/, ''), 'comparativo / persona que…'], [w.replace(/iest$/, 'y'), 'superlativo'], [w.replace(/est$/, ''), 'superlativo'],
    [w.replace(/ily$/, 'y'), 'adverbio'], [w.replace(/ly$/, ''), 'adverbio'],
    [w.replace(/ment$/, ''), 'sustantivo'], [w.replace(/ion$/, 'e'), 'sustantivo'], [w.replace(/ion$/, ''), 'sustantivo'],
  ];
  for (const [c, note] of candidates) {
    if (c && c !== w && c.length >= 2 && dict[c]) return { word: raw, base: c, es: dict[c].es, note: dict[c].note || (note ? `${note} de "${c}"` : '') };
  }
  return { word: raw, base: w, es: '' };
}

// Frase del glosario que contiene la palabra (ej. "bow thruster").
function findPhrase(text, start, end) {
  if (!phrases) buildDict();
  const lower = text.toLowerCase();
  let best = null;
  for (const [p, es] of Object.entries(phrases)) {
    let i = lower.indexOf(p);
    while (i !== -1) {
      if (i <= start && i + p.length >= end && (!best || p.length > best.p.length)) best = { p, es };
      i = lower.indexOf(p, i + 1);
    }
  }
  return best;
}

// ---------- Detección de la palabra bajo el dedo ----------

function wordAt(x, y) {
  let node, offset;
  if (document.caretRangeFromPoint) {
    const r = document.caretRangeFromPoint(x, y);
    if (!r) return null;
    node = r.startContainer; offset = r.startOffset;
  } else if (document.caretPositionFromPoint) {
    const p = document.caretPositionFromPoint(x, y);
    if (!p) return null;
    node = p.offsetNode; offset = p.offset;
  } else return null;
  if (!node || node.nodeType !== Node.TEXT_NODE) return null;
  const text = node.textContent;
  const isW = (c) => /[A-Za-z'’\-]/.test(c);
  let s = offset, e = offset;
  if (s > 0 && !isW(text[s] || ' ') && isW(text[s - 1])) s--;
  while (s > 0 && isW(text[s - 1])) s--;
  while (e < text.length && isW(text[e])) e++;
  const word = text.slice(s, e).replace(/^[-'’]+|[-'’]+$/g, '');
  if (!/[A-Za-z]{2,}/.test(word)) return null;
  // Comprobar que el dedo está realmente sobre la palabra.
  const range = document.createRange();
  range.setStart(node, s); range.setEnd(node, e);
  const rect = range.getBoundingClientRect();
  if (x < rect.left - 6 || x > rect.right + 6 || y < rect.top - 8 || y > rect.bottom + 8) return null;
  return { word, rect, text, start: s, end: e, el: node.parentElement };
}

// ---------- Globo ----------

let bubble = null;
let suppressClick = false;

function hideBubble() {
  bubble?.remove();
  bubble = null;
}

function showBubble(hit) {
  hideBubble();
  const info = lookupWord(hit.word);
  const phrase = findPhrase(hit.text, hit.start, hit.end);
  bubble = h('div', { class: 'lookup', role: 'dialog', 'aria-label': `Significado de ${hit.word}` },
    h('div', { class: 'lookup-head' },
      h('strong', {}, hit.word),
      h('button', { class: 'lookup-say', 'aria-label': 'Escuchar', onclick: (e) => { e.stopPropagation(); speak(hit.word); } }, '🔊'),
    ),
    info.es ? h('p', { class: 'lookup-es' }, info.es) : h('p', { class: 'lookup-es muted' }, 'Sin traducción en el diccionario sin conexión.'),
    info.note ? h('p', { class: 'lookup-note' }, info.note) : null,
    phrase && phrase.p !== hit.word.toLowerCase() ? h('p', { class: 'lookup-phrase' }, `📖 "${phrase.p}": ${phrase.es}`) : null,
  );
  document.body.append(bubble);
  // Posición: encima de la palabra (o debajo si no cabe).
  const bw = Math.min(300, window.innerWidth - 24);
  bubble.style.width = `${bw}px`;
  const left = Math.max(12, Math.min(window.innerWidth - bw - 12, hit.rect.left + hit.rect.width / 2 - bw / 2));
  const bh = bubble.offsetHeight;
  let top = hit.rect.top - bh - 12;
  let below = false;
  if (top < 60) { top = hit.rect.bottom + 12; below = true; }
  bubble.style.left = `${left}px`;
  bubble.style.top = `${top + window.scrollY}px`;
  bubble.classList.toggle('below', below);
  bubble.style.setProperty('--arrow-x', `${Math.max(16, Math.min(bw - 16, hit.rect.left + hit.rect.width / 2 - left))}px`);
}

export function initLookup() {
  let timer = null;
  let sx = 0, sy = 0;

  const cancel = () => { clearTimeout(timer); timer = null; };

  document.addEventListener('pointerdown', (e) => {
    if (bubble && !bubble.contains(e.target)) { hideBubble(); suppressClick = true; setTimeout(() => { suppressClick = false; }, 400); return; }
    if (bubble) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const t = e.target;
    if (t.closest('[data-nolookup], input, textarea, select, .lookup')) return;
    sx = e.clientX; sy = e.clientY;
    cancel();
    timer = setTimeout(() => {
      timer = null;
      const hit = wordAt(sx, sy);
      if (!hit || hit.el?.closest('[data-nolookup]')) return;
      // Palabras en español (acentos, ñ) sin traducción: no mostrar nada.
      if (/[áéíóúñ¿¡]/i.test(hit.word) && !lookupWord(hit.word).es) return;
      suppressClick = true;
      showBubble(hit);
    }, HOLD_MS);
  }, true);

  document.addEventListener('pointermove', (e) => {
    if (timer && Math.hypot(e.clientX - sx, e.clientY - sy) > MOVE_TOLERANCE) cancel();
  }, true);
  document.addEventListener('pointerup', () => { cancel(); if (suppressClick) setTimeout(() => { suppressClick = false; }, 400); }, true);
  document.addEventListener('pointercancel', cancel, true);
  // Evita que al soltar el dedo se active el botón o enlace que estaba debajo.
  document.addEventListener('click', (e) => {
    if (suppressClick && !(bubble && bubble.contains(e.target))) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  document.addEventListener('contextmenu', (e) => { if (timer || bubble) e.preventDefault(); });
  window.addEventListener('hashchange', hideBubble);
  window.addEventListener('scroll', () => { if (bubble) hideBubble(); }, { passive: true });
}

export const _test = { lookupWord, findPhrase };
