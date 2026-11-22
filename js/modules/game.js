// Módulo Juego: lecciones de opción múltiple estilo "camino" con XP, racha y fusibles (vidas).

import { TERMS, GLOSSARY_CATEGORIES as GCATS } from '../data/glossary.js';
import { QUESTIONS, CATEGORIES as QCATS } from '../data/questions.js';
import { FAULTS, FAULT_SYSTEMS } from '../data/faults.js';
import { db, getSetting, setSetting } from '../db.js';
import { speak, stop } from '../speech.js';
import { h, setHeader, toast } from '../ui.js';
import { getGame, levelInfo, recordLesson, DAILY_GOAL } from '../game-state.js';

const LESSON_SIZE = 10;
const LIVES = 3;

// ---------- Utilidades ----------

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const base = (en) => en.replace(/\s*\(.*?\)\s*/g, ' ').split(' / ')[0].trim();
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Elige n distractores distintos de "correct", priorizando el grupo cercano.
function distractors(correct, near, far, n = 3) {
  const seen = new Set([correct.toLowerCase()]);
  const out = [];
  for (const v of [...shuffle(near), ...shuffle(far)]) {
    if (out.length >= n) break;
    if (!v || seen.has(v.toLowerCase())) continue;
    seen.add(v.toLowerCase());
    out.push(v);
  }
  return out;
}

export function mc(prompt, correct, wrong, extra = {}) {
  const options = shuffle([correct, ...wrong]);
  return { prompt, options, answer: options.indexOf(correct), correctText: correct, ...extra };
}

// ---------- Generadores de preguntas ----------

const G = {
  // Término EN → significado ES
  termToEs(t, pool) {
    const near = pool.filter((x) => x.cat === t.cat && x.id !== t.id).map((x) => x.es);
    return mc('¿Qué significa?', t.es, distractors(t.es, near, pool.map((x) => x.es)), {
      big: t.en, bigLang: 'en', say: t.en, kind: '🇬🇧 → 🇪🇸',
    });
  },
  // ES → término EN
  esToTerm(t, pool) {
    const near = pool.filter((x) => x.cat === t.cat && x.id !== t.id).map((x) => x.en);
    return mc('¿Cómo se dice en inglés?', t.en, distractors(t.en, near, pool.map((x) => x.en)), {
      big: t.es, say: t.en, sayAfter: true, kind: '🇪🇸 → 🇬🇧', optLang: 'en',
    });
  },
  // Definición EN → término EN
  defToTerm(t, pool) {
    if (!t.def) return null;
    const near = pool.filter((x) => x.cat === t.cat && x.id !== t.id).map((x) => x.en);
    return mc('¿Qué término corresponde a esta definición?', t.en, distractors(t.en, near, pool.map((x) => x.en)), {
      text: t.def, textLang: 'en', say: t.def, kind: 'Definition', optLang: 'en',
    });
  },
  // Ejemplo con hueco → término
  exampleGap(t, pool) {
    if (!t.ex) return null;
    const word = base(t.en);
    const re = new RegExp(`\\b${escRe(word)}\\b`, 'i');
    if (!re.test(t.ex) || word.length < 3) return null;
    const gap = t.ex.replace(re, '_____');
    const near = pool.filter((x) => x.cat === t.cat && x.id !== t.id).map((x) => base(x.en));
    return mc('Completa la frase', word, distractors(word, near, pool.map((x) => base(x.en))), {
      text: gap, textLang: 'en', say: t.ex, sayAfter: true, kind: 'Fill the gap', optLang: 'en',
    });
  },
  // Pregunta ES → pregunta EN
  questionEsToEn(q, pool) {
    const near = pool.filter((x) => x.cat === q.cat && x.id !== q.id).map((x) => x.qEn);
    return mc('¿Cuál es la pregunta correcta en inglés?', q.qEn, distractors(q.qEn, near, pool.map((x) => x.qEn)), {
      text: q.qEs, say: q.qEn, sayAfter: true, kind: 'Interview', optLang: 'en', small: true,
    });
  },
  // Pregunta EN → punto clave
  keyPoint(q, pool) {
    if (!q.kp?.length) return null;
    const correct = pick(q.kp);
    const near = pool.filter((x) => x.cat === q.cat && x.id !== q.id).flatMap((x) => x.kp || []);
    return mc('¿Qué punto clave responde a esta pregunta?', correct, distractors(correct, near, pool.flatMap((x) => x.kp || [])), {
      text: q.qEn, textLang: 'en', say: q.qEn, kind: 'Key point', optLang: 'en', small: true,
    });
  },
  // Frase de respuesta modelo con hueco técnico
  answerGap(q, pool, vocab) {
    const sentences = q.aEn.split(/(?<=\.)\s+/).filter((s) => s.length > 30 && s.length < 220);
    for (const s of shuffle(sentences)) {
      const hits = vocab.filter((v) => new RegExp(`\\b${escRe(v)}\\b`, 'i').test(s));
      if (!hits.length) continue;
      const word = hits.sort((a, b) => b.length - a.length)[0];
      const gap = s.replace(new RegExp(`\\b${escRe(word)}\\b`, 'i'), '_____');
      return mc('Completa la respuesta modelo', word, distractors(word, [], vocab), {
        text: gap, textLang: 'en', say: s, sayAfter: true, kind: 'Model answer', optLang: 'en', sub: q.qEn,
      });
    }
    return null;
  },
  // Falla: síntoma → causa posible
  faultCause(f, pool) {
    const correct = pick(f.causes);
    const far = pool.filter((x) => x.sys !== f.sys).flatMap((x) => x.causes);
    return mc('¿Cuál es una causa posible?', correct, distractors(correct, [], far), {
      big: f.titleEs, text: f.symptom, kind: '🔧 ' + (FAULT_SYSTEMS[f.sys] || 'Falla'), small: true,
    });
  },
  // Falla: historia en inglés → título
  faultStory(f, pool) {
    const near = pool.filter((x) => x.id !== f.id).map((x) => x.titleEn);
    return mc('¿De qué falla habla esta historia?', f.titleEn, distractors(f.titleEn, near, near), {
      text: f.explainEn, textLang: 'en', say: f.explainEn, kind: 'Listening / reading', optLang: 'en', small: true,
    });
  },
};


// ---------- Juegos de escritura (completar, ordenar letras, dictado) ----------

const stripAccents = (x) => x.normalize('NFD').replace(/[̀-ͯ]/g, '');
const normKeep = (x) => x.toLowerCase().replace(/[’']/g, '').replace(/[-/.,!?¿¡]/g, ' ').replace(/\s+/g, ' ').trim();
const normLoose = (x) => stripAccents(normKeep(x));

function lev(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[m][n];
}

// Compara lo escrito con las respuestas aceptadas. Devuelve { ok, note }.
export function checkTyped(given, answers, strict = false) {
  const g = normKeep(given);
  if (!g) return { ok: false };
  for (const a of answers) if (normKeep(a) === g) return { ok: true };
  for (const a of answers) if (normLoose(a) === normLoose(g)) return { ok: true, note: `Cuidado con los acentos: ${a}` };
  if (strict) return { ok: false };
  for (const a of answers) {
    const A = normLoose(a), G2 = normLoose(g);
    const tol = A.length >= 10 ? 2 : A.length >= 5 ? 1 : 0;
    if (tol && lev(A, G2) <= tol) return { ok: true, note: `Casi perfecto. Se escribe: ${a}` };
  }
  return { ok: false };
}

const WORD_RE = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ][a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\- ]{1,27}$/;

function altsEn(t) {
  const out = [];
  const b = base(t.en);
  b.split(/\s*\/\s*/).forEach((x) => out.push(x.trim()));
  (t.en.match(/\(([^)]+)\)/g) || []).forEach((x) => out.push(x.slice(1, -1).trim()));
  return [...new Set(out)].filter((x) => WORD_RE.test(x));
}

function altsEs(t) {
  const out = [];
  t.es.split(/\s*\/\s*/).forEach((x) => {
    out.push(x.replace(/\s*\(.*?\)\s*/g, ' ').trim());
    (x.match(/\(([^)]+)\)/g) || []).forEach((y) => out.push(y.slice(1, -1).trim()));
  });
  return [...new Set(out)].filter((x) => WORD_RE.test(x));
}

// La respuesta "principal" a mostrar: la más larga razonable (aprende la palabra completa, no la sigla).
const primary = (alts) => [...alts].sort((a, b) => b.length - a.length).find((x) => x.length <= 28) || alts[0];

// Revela la primera letra de cada palabra y ~30 % de las demás.
export function makeMask(word) {
  const chars = [...word];
  const reveal = chars.map((c, i) => c === ' ' || c === '-' || c === "'" || i === 0 || chars[i - 1] === ' ' || chars[i - 1] === '-');
  const letters = chars.map((c, i) => (!reveal[i] ? i : -1)).filter((i) => i >= 0);
  shuffle(letters).slice(0, Math.floor(letters.length * 0.3)).forEach((i) => { reveal[i] = true; });
  return reveal;
}

function typeQ(t, lang) {
  const alts = lang === 'en' ? altsEn(t) : altsEs(t);
  if (!alts.length) return null;
  const word = primary(alts);
  return {
    mode: 'type', lang, word, answers: alts, correctText: word, reveal: makeMask(word),
    prompt: lang === 'en' ? 'Completa la palabra en inglés' : 'Completa la palabra en español',
    big: lang === 'en' ? t.es : base(t.en),
    text: lang === 'en' ? t.def : null, textLang: 'en',
    say: lang === 'en' ? word : base(t.en), sayAfter: lang === 'en',
    kind: lang === 'en' ? '✍️ 🇪🇸 → 🇬🇧' : '✍️ 🇬🇧 → 🇪🇸', small: true,
  };
}

function tilesQ(t, lang) {
  const alts = (lang === 'en' ? altsEn(t) : altsEs(t)).filter((x) => !/[\s-]/.test(x) && x.length >= 4 && x.length <= 12);
  if (!alts.length) return null;
  const word = primary(alts);
  let letters = shuffle([...word.toLowerCase()]);
  for (let i = 0; i < 5 && letters.join('') === word.toLowerCase(); i++) letters = shuffle(letters);
  return {
    mode: 'tiles', lang, word, answers: [word], correctText: word, letters,
    prompt: lang === 'en' ? 'Ordena las letras (inglés)' : 'Ordena las letras (español)',
    big: lang === 'en' ? t.es : base(t.en),
    say: lang === 'en' ? word : base(t.en), sayAfter: lang === 'en',
    kind: '🔤 ' + (lang === 'en' ? '🇪🇸 → 🇬🇧' : '🇬🇧 → 🇪🇸'), small: true,
  };
}

const W = {
  typeEn: (t) => typeQ(t, 'en'),
  typeEs: (t) => typeQ(t, 'es'),
  tilesEn: (t) => tilesQ(t, 'en'),
  tilesEs: (t) => tilesQ(t, 'es'),
  // Escucha la palabra en inglés y escríbela
  dictation(t) {
    const alts = altsEn(t).filter((x) => x.length >= 4);
    if (!alts.length) return null;
    const word = primary(alts);
    const reveal = [...word].map((c, i) => c === ' ' || c === '-' || i === 0);
    return {
      mode: 'type', lang: 'en', word, answers: alts, correctText: word, reveal,
      prompt: 'Escucha y escribe en inglés', sub: `Pista: significa «${t.es}»`,
      say: word, autoSay: true, kind: '🎧 Dictation', listen: true,
    };
  },
  // Frase de ejemplo con hueco: escribe la palabra que falta
  gapType(t) {
    if (!t.ex) return null;
    const word = base(t.en);
    if (!WORD_RE.test(word) || word.length < 3) return null;
    const re = new RegExp(`\\b${escRe(word)}\\b`, 'i');
    const m = t.ex.match(re);
    if (!m) return null;
    const exact = m[0];
    return {
      mode: 'type', lang: 'en', word: exact, answers: [exact], correctText: exact, reveal: makeMask(exact),
      prompt: 'Escribe la palabra que falta', sub: `Pista: «${t.es}»`,
      text: t.ex.replace(re, '_____'), textLang: 'en', say: t.ex, sayAfter: true, kind: '✍️ Fill the gap',
    };
  },
  // Frase útil de entrevista con una palabra faltante
  phraseGap(t) {
    const words = t.en.split(/\s+/).map((w) => w.replace(/[^a-zA-Z]/g, '')).filter((w) => w.length >= 4);
    if (!words.length) return null;
    const word = pick(words);
    const re = new RegExp(`\\b${escRe(word)}\\b`);
    return {
      mode: 'type', lang: 'en', word, answers: [word], correctText: word, reveal: makeMask(word),
      prompt: 'Completa la frase en inglés', sub: `«${t.es}»`,
      text: t.en.replace(re, '_____'), textLang: 'en', say: t.en, sayAfter: true, kind: '💬 Interview phrase',
    };
  },
};

// Vocabulario técnico para huecos: términos cortos del glosario.
const VOCAB = [...new Set(
  TERMS.map((t) => base(t.en)).filter((w) => w.length >= 4 && w.length <= 22 && !/[^a-zA-Z\- ]/.test(w))
)];

// ---------- Lecciones ----------

const glossaryCats = Object.keys(GCATS).filter((c) => c !== 'custom');
const questionCats = Object.keys(QCATS);

const ICONS = {
  basic: '⚡', gen: '🔄', dist: '🔌', motor: '⚙️', dp: '🧭', auto: '🤖', safety: '🦺', tools: '🧰', nav: '📡',
  vessel: '🚢', ships: '🛳️', prop: '🌀', volt: '🔋', sensors: '🌡️', radar: '📡', dpterm: '🎯', career: '📄', phrases: '💬', kpos: '🖥️', cv: '📄', hr: '🤝',
  thruster: '🌀', swbd: '🎛️', pms: '🖥️', loto: '🔒', personal: '🙋', hv: '⚠️', batt: '🔋', situ: '💬',
};

export const UNITS = [
  {
    id: 'u-gloss', title: 'Vocabulario técnico', sub: 'Glosario EN ↔ ES',
    lessons: glossaryCats.map((c) => ({ id: `g-${c}`, title: GCATS[c], icon: ICONS[c] || '📖', type: 'gloss', cat: c })),
  },
  {
    id: 'u-write', title: 'Escribe y completa', sub: 'Vocabulario en inglés y español',
    lessons: [
      { id: 'w-type-en', title: 'Completa la palabra (inglés)', icon: '✍️', type: 'write', modes: ['typeEn'] },
      { id: 'w-type-es', title: 'Completa la palabra (español)', icon: '📝', type: 'write', modes: ['typeEs'] },
      { id: 'w-tiles-en', title: 'Ordena las letras (inglés)', icon: '🔤', type: 'write', modes: ['tilesEn'] },
      { id: 'w-tiles-es', title: 'Ordena las letras (español)', icon: '🔡', type: 'write', modes: ['tilesEs'] },
      { id: 'w-listen', title: 'Escucha y escribe', icon: '🎧', type: 'write', modes: ['dictation'] },
      { id: 'w-gap', title: 'Completa la frase', icon: '🧩', type: 'write', modes: ['gapType', 'phraseGap'] },
      { id: 'w-mix', title: 'Escritura mixta', icon: '⚡', type: 'write', modes: ['typeEn', 'typeEs', 'tilesEn', 'tilesEs', 'dictation', 'gapType'] },
    ],
  },
  {
    id: 'u-int', title: 'Entrevista técnica', sub: 'Preguntas y respuestas modelo',
    lessons: questionCats.map((c) => ({ id: `q-${c}`, title: QCATS[c], icon: ICONS[c] || '🎤', type: 'int', cat: c })),
  },
  {
    id: 'u-fault', title: 'Diagnóstico de fallas', sub: 'Troubleshooting',
    lessons: [
      { id: 'f-cause', title: 'Causas posibles', icon: '🔧', type: 'fault', mode: 'cause' },
      { id: 'f-story', title: 'Historias en inglés', icon: '🗣️', type: 'fault', mode: 'story' },
    ],
  },
];

export const ALL_LESSONS = UNITS.flatMap((u) => u.lessons);

async function customTerms() {
  const rows = await db.getAll('glossary');
  return rows.filter((r) => r.custom).map((r) => ({ ...r, cat: 'custom' }));
}

async function customFaults() {
  try {
    return (await db.getAll('faults')).filter((f) => f.causes?.length);
  } catch (_) { return []; }
}

// Construye las preguntas de una lección.
async function buildQuestions(lesson) {
  const out = [];
  const tryAdd = (q) => { if (q && (q.mode || q.options.length >= 2)) out.push(q); };
  const terms = [...TERMS, ...(await customTerms())];
  const faults = [...FAULTS, ...(await customFaults())];

  const fromTerms = (pool, n) => {
    const gens = [G.termToEs, G.esToTerm, G.defToTerm, G.exampleGap];
    const wgens = [W.typeEn, W.typeEs, W.tilesEn, W.tilesEs, W.gapType];
    for (const t of shuffle(pool)) {
      if (out.length >= n) break;
      // ~30 % de las preguntas de vocabulario son de escribir
      const order = Math.random() < 0.3 ? [...shuffle(wgens), ...shuffle(gens)] : shuffle(gens);
      for (const gen of order) { const q = gen(t, terms); if (q) { tryAdd(q); break; } }
    }
  };
  const fromWriting = (pool, n, modes) => {
    for (const t of shuffle(pool)) {
      if (out.length >= n) break;
      const gens = (t.cat === 'phrases' ? ['phraseGap'] : modes.filter((m) => m !== 'phraseGap')).filter((m) => modes.includes(m));
      for (const m of shuffle(gens)) { const q = W[m](t); if (q) { tryAdd(q); break; } }
    }
  };
  const fromQuestions = (pool, n) => {
    const gens = [G.questionEsToEn, G.keyPoint, G.answerGap];
    let guard = 0;
    while (out.length < n && guard++ < n * 4) {
      const q = pick(pool);
      const gen = pick(gens);
      tryAdd(gen(q, QUESTIONS, VOCAB));
    }
  };
  const fromFaults = (pool, n, mode) => {
    let guard = 0;
    while (out.length < n && guard++ < n * 4) {
      const f = pick(pool);
      tryAdd(mode === 'story' ? G.faultStory(f, faults) : mode === 'cause' ? G.faultCause(f, faults) : pick([G.faultStory, G.faultCause])(f, faults));
    }
  };

  if (lesson.type === 'gloss') {
    const pool = lesson.cat === 'custom' ? terms.filter((t) => t.cat === 'custom') : terms.filter((t) => t.cat === lesson.cat);
    if (lesson.cat === 'phrases') fromWriting(pool, 4, ['phraseGap']);
    fromTerms(pool, LESSON_SIZE);
  } else if (lesson.type === 'write') {
    const pool = lesson.modes.includes('phraseGap') ? terms : terms.filter((t) => t.cat !== 'phrases');
    fromWriting(pool, LESSON_SIZE, lesson.modes);
  } else if (lesson.type === 'int') {
    fromQuestions(QUESTIONS.filter((q) => q.cat === lesson.cat), LESSON_SIZE);
  } else if (lesson.type === 'fault') {
    fromFaults(faults, LESSON_SIZE, lesson.mode);
  } else if (lesson.type === 'weak') {
    // Términos que aún no marcas como aprendidos + preguntas al azar
    const states = Object.fromEntries((await db.getAll('glossary')).map((r) => [r.id, r]));
    const pending = terms.filter((t) => !states[t.id]?.known);
    fromTerms(pending.length >= 4 ? pending : terms, 6);
    fromQuestions(QUESTIONS, LESSON_SIZE);
  } else {
    // Repaso mixto
    fromTerms(terms, 4);
    fromQuestions(QUESTIONS, 8);
    fromFaults(faults, LESSON_SIZE, null);
  }
  return shuffle(out).slice(0, LESSON_SIZE);
}

// ---------- Sonidos ----------

let audioCtx = null;
async function sfx(kind) {
  if (!(await getSetting('sound', true))) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = audioCtx || new AC();
    await audioCtx.resume?.();
    const t0 = audioCtx.currentTime;
    const notes = kind === 'ok' ? [[660, 0, 'sine'], [990, 0.09, 'sine']]
      : kind === 'bad' ? [[140, 0, 'sawtooth'], [110, 0.12, 'sawtooth']]
      : [[523, 0, 'triangle'], [659, 0.12, 'triangle'], [784, 0.24, 'triangle'], [1047, 0.36, 'triangle']];
    for (const [f, t, type] of notes) {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type;
      o.frequency.value = f;
      g.gain.setValueAtTime(kind === 'bad' ? 0.12 : 0.2, t0 + t);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + t + 0.22);
      o.connect(g).connect(audioCtx.destination);
      o.start(t0 + t);
      o.stop(t0 + t + 0.25);
    }
  } catch (_) { /* sin audio */ }
}

// ---------- Componentes ----------

export function statsBar(game) {
  const lvl = levelInfo(game.xp);
  const stat = (cls, icon, value, label, info) =>
    h('button', { class: `stat ${cls}`, 'aria-label': `${label}: ${value}. ${info}`, onclick: () => toast(info) },
      h('span', { class: 'stat-val' }, icon ? `${icon} ` : '', h('b', {}, value)),
      h('span', { class: 'stat-label' }, label),
    );
  return h('div', { class: 'stats-bar' },
    stat(game.streak ? 'fire' : '', '🔥', game.streak, 'Racha',
      '🔥 Racha: días seguidos con al menos una lección. Si un día no practicas, vuelve a 0.'),
    stat('xp', '⚡', game.xp, 'XP',
      '⚡ XP: puntos ganados. 10 por acierto, 5 con pista. Meta diaria: 50 XP.'),
    stat('lvlbadge', '', lvl.name, 'Nivel',
      lvl.nextName ? `Nivel ${lvl.name}: sube con tus XP. Te faltan ${lvl.toNext} XP para ${lvl.nextName}.` : `Nivel máximo: ${lvl.name}.`),
  );
}

export function dailyGoal(game) {
  const pct = Math.min(1, game.todayXp / DAILY_GOAL);
  const lvl = levelInfo(game.xp);
  return h('section', { class: 'card goal' },
    h('div', { class: 'goal-ring', style: `--p:${pct * 100}` }, h('span', {}, pct >= 1 ? '✓' : `${Math.round(pct * 100)}%`)),
    h('div', { class: 'goal-text' },
      h('strong', {}, pct >= 1 ? '¡Meta diaria cumplida!' : 'Meta diaria'),
      h('span', { class: 'muted small' }, `${game.todayXp} / ${DAILY_GOAL} XP hoy`),
      h('div', { class: 'progress' }, h('div', { class: 'progress-bar volt', style: `width:${lvl.progress * 100}%` })),
      h('span', { class: 'muted small' }, lvl.nextName ? `Nivel ${lvl.name} → ${lvl.nextName}: faltan ${lvl.toNext} XP` : `Nivel máximo: ${lvl.name}`),
    ),
  );
}

export function nextLesson(game) {
  return ALL_LESSONS.find((l) => !game.lessons[l.id]?.stars) || null;
}

// ---------- Vistas ----------

async function viewPath(root) {
  setHeader('Juego', '#/');
  const game = await getGame();
  const next = nextLesson(game);
  const sound = await getSetting('sound', true);

  const soundBtn = h('button', { class: 'chip', onclick: async () => {
    const v = !(await getSetting('sound', true));
    await setSetting('sound', v);
    soundBtn.textContent = v ? '🔊 Sonido' : '🔇 Silencio';
  } }, sound ? '🔊 Sonido' : '🔇 Silencio');

  const units = UNITS.map((u) =>
    h('section', { class: 'unit' },
      h('div', { class: 'unit-head' }, h('strong', {}, u.title), h('span', { class: 'muted small' }, u.sub)),
      h('div', { class: 'path' },
        ...u.lessons.map((l, i) => {
          const st = game.lessons[l.id]?.stars || 0;
          const isNext = next && next.id === l.id;
          return h('a', {
            class: `node ${st ? 'done' : ''} ${isNext ? 'next' : ''} ${['c', 'r', 'c', 'l'][i % 4]}`,
            href: `#/juego/leccion/${l.id}`,
          },
            h('span', { class: 'node-dot' }, st ? '✓' : l.icon),
            h('span', { class: 'node-label' }, l.title,
              h('span', { class: 'stars' }, '★'.repeat(st) + '☆'.repeat(3 - st))),
          );
        }),
      ),
    )
  );

  root.replaceChildren(
    statsBar(game),
    dailyGoal(game),
    h('div', { class: 'btn-row' },
      h('a', { class: 'btn btn-primary', href: '#/juego/leccion/mix' }, '⚡ Repaso mixto'),
      h('a', { class: 'btn btn-secondary', href: '#/juego/leccion/weak' }, '🎯 Lo que no sé'),
    ),
    h('div', { class: 'row-between' }, h('span', { class: 'muted small' }, `${LIVES} fusibles por lección · 10 XP por acierto`), soundBtn),
    ...units,
  );
}

async function viewLesson(root, lessonId) {
  const lesson = lessonId === 'mix' ? { id: null, title: 'Repaso mixto', type: 'mix' }
    : lessonId === 'weak' ? { id: null, title: 'Lo que no sé', type: 'weak' }
    : ALL_LESSONS.find((l) => l.id === lessonId);
  if (!lesson) { location.hash = '#/juego'; return; }
  setHeader(lesson.title, '#/juego');
  return runLesson(root, {
    title: lesson.title,
    backHash: '#/juego',
    backLabel: '🗺️ Volver al camino',
    build: () => buildQuestions(lesson),
    record: async (r) => {
      const { game, stars } = await recordLesson(lesson.id, r);
      return { stars, third: [`🔥 ${game.streak}`, 'racha'], after: dailyGoal(game) };
    },
  });
}

// Estilos de lección: "eto" (fusibles, tema eléctrico) o "eng" (corazones, sub-app de inglés).
const FLAVORS = {
  eto: {
    life: '▮', lifeClass: 'fuse', lifeName: 'fusibles',
    msgs: ['¡Correcto!', '¡Excelente!', '¡Bien conectado!', '¡Voltaje perfecto!', '¡Sigue así!'],
    perfect: '¡Circuito perfecto!', fail: 'Se quemaron los fusibles', failHeader: 'Fusible quemado', icon: '⚡', failIcon: '💥',
  },
  eng: {
    life: '♥', lifeClass: 'heart', lifeName: 'vidas',
    msgs: ['¡Correcto!', 'Great job!', 'Well done!', '¡Perfecto!', 'Excellent!'],
    perfect: 'Perfect score!', fail: 'Te quedaste sin vidas', failHeader: 'Sin vidas', icon: '⭐', failIcon: '💔',
  },
};

// Motor genérico de lecciones (opción múltiple, escribir, ordenar letras).
// opts: { title, backHash, backLabel, build(), record({xp,correct,total,completed}) → {stars, third, after}, flavor }
export async function runLesson(root, opts) {
  const F = FLAVORS[opts.flavor || 'eto'];
  const lessonTitle = opts.title;
  const questions = await opts.build();
  if (questions.length < 3) {
    root.replaceChildren(h('section', { class: 'card center' }, h('p', {}, 'No hay suficiente contenido para esta lección todavía.')),
      h('a', { class: 'btn btn-secondary', href: opts.backHash }, '← Volver'));
    return;
  }

  const queue = questions.map((q) => ({ q, retry: false }));
  const total = questions.length;
  let lives = LIVES;
  let answered = 0;
  let correct = 0;
  let firstTry = 0;
  let combo = 0;
  let xp = 0;

  const header = h('div', { class: 'lesson-top' });
  const body = h('div', { class: 'lesson-body' });
  const sheet = h('div', { class: 'sheet', hidden: true });
  root.replaceChildren(header, body, sheet);

  const paintHeader = () => {
    header.replaceChildren(
      h('a', { class: 'x-btn', href: opts.backHash, 'aria-label': 'Salir' }, '✕'),
      h('div', { class: 'progress grow' }, h('div', { class: 'progress-bar volt', style: `width:${(answered / total) * 100}%` })),
      h('span', { class: 'fuses', 'aria-label': `${lives} ${F.lifeName}` },
        ...Array.from({ length: LIVES }, (_, i) => h('span', { class: `${F.lifeClass} ${i < lives ? '' : 'blown'}` }, F.life))),
    );
  };

  const finish = async (completed) => {
    stop();
    if (completed && firstTry === total) xp += 20; // bonus perfecto
    const res = await opts.record({ xp, correct: firstTry, total, completed });
    const stars = res.stars;
    if (completed) sfx('win');
    setHeader(completed ? '¡Lección completa!' : F.failHeader, opts.backHash);
    const acc = Math.round((firstTry / total) * 100);
    root.replaceChildren(
      h('section', { class: 'card center result' },
        h('div', { class: 'result-icon' }, completed ? (stars === 3 ? '🏆' : F.icon) : F.failIcon),
        h('h2', {}, completed ? (stars === 3 ? F.perfect : '¡Bien hecho!') : F.fail),
        completed ? h('div', { class: 'stars big' }, '★'.repeat(stars) + '☆'.repeat(3 - stars)) : h('p', { class: 'muted' }, 'Repasa y vuelve a intentarlo.'),
        h('div', { class: 'result-stats' },
          h('div', {}, h('b', {}, `+${xp}`), h('span', {}, 'XP')),
          h('div', {}, h('b', {}, `${acc}%`), h('span', {}, 'precisión')),
          res.third ? h('div', {}, h('b', {}, res.third[0]), h('span', {}, res.third[1])) : null,
        ),
      ),
      res.after || null,
      h('button', { class: 'btn btn-primary btn-xl', onclick: () => { setHeader(lessonTitle, opts.backHash); runLesson(root, opts); window.scrollTo(0, 0); } }, '🔁 Otra vez'),
      h('a', { class: 'btn btn-secondary btn-xl', href: opts.backHash }, opts.backLabel || '← Volver'),
    );
  };

  const show = () => {
    paintHeader();
    sheet.hidden = true;
    if (!queue.length) return finish(true);
    const { q, retry } = queue[0];
    let locked = false;
    let hinted = false;

    const sayBtn = q.say && !q.sayAfter ? h('button', { class: 'say-btn', 'aria-label': 'Escuchar', onclick: () => speak(q.say) }, '🔊') : null;
    const head = [
      h('div', { class: 'q-kind' }, retry ? '🔁 Repaso' : q.kind || ''),
      h('h2', { class: 'q-prompt' }, q.prompt),
      q.sub ? h('p', { class: 'muted small' }, q.sub) : null,
      q.listen ? h('button', { class: 'listen-big', onclick: () => speak(q.say) }, '🔊', h('span', {}, 'Escuchar')) : null,
      q.big ? h('div', { class: 'q-big-row' }, sayBtn, h('p', { class: `q-big ${q.small ? 'smaller' : ''}` }, q.big)) : null,
      q.text ? h('div', { class: 'q-big-row' }, q.big || q.listen ? null : sayBtn, h('p', { class: 'q-text' }, q.text)) : null,
    ];

    let interaction;
    if (q.mode === 'type') interaction = typeUI();
    else if (q.mode === 'tiles') interaction = tilesUI();
    else interaction = mcUI();

    body.replaceChildren(...head, ...interaction);
    // Sin diccionario mientras se responde (se vuelve a activar al ver el resultado).
    body.setAttribute('data-nolookup', '');
    if (q.autoSay) speak(q.say);

    // --- Opción múltiple ---
    function mcUI() {
      const optBtns = q.options.map((opt, i) =>
        h('button', { class: `opt ${q.optLang === 'en' ? 'en' : ''}`, onclick: () => {
          if (locked) return;
          optBtns.forEach((b, j) => {
            b.disabled = true;
            if (j === q.answer) b.classList.add('right');
            else if (j === i) b.classList.add('wrong');
          });
          resolve(i === q.answer);
        } }, h('span', { class: 'opt-key' }, String.fromCharCode(65 + i)), h('span', {}, opt))
      );
      return [h('div', { class: 'opts' }, ...optBtns)];
    }

    // --- Escribir con pista de letras ---
    function typeUI() {
      const reveal = [...q.reveal];
      const maskEl = h('div', { class: 'mask', 'aria-label': 'Pista de letras' });
      // Agrupa las casillas por palabra para que una palabra no se parta entre dos líneas.
      const paintMask = () => {
        const words = [];
        let cur = [];
        [...q.word].forEach((c, i) => {
          if (c === ' ') { words.push(cur); cur = []; return; }
          cur.push(h('span', { class: `cell ${reveal[i] ? 'shown' : ''}` }, reveal[i] ? c : ''));
        });
        words.push(cur);
        maskEl.replaceChildren(...words.map((cells) => h('span', { class: 'mword' }, ...cells)));
      };
      paintMask();
      const input = h('input', {
        class: 'input type-input', type: 'text', autocomplete: 'off', autocorrect: 'off', autocapitalize: 'none', spellcheck: 'false',
        placeholder: q.lang === 'en' ? 'Write in English…' : 'Escribe en español…', enterkeyhint: 'done',
      });
      const checkBtn = h('button', { class: 'btn btn-primary btn-xl', disabled: true }, 'Comprobar');
      const hintBtn = h('button', { class: 'btn btn-secondary' }, '💡 Pista');
      input.addEventListener('input', () => { checkBtn.disabled = !input.value.trim(); });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && input.value.trim()) check(); });
      hintBtn.onclick = () => {
        const hidden = reveal.map((r, i) => (!r && q.word[i] !== ' ' ? i : -1)).filter((i) => i >= 0);
        if (!hidden.length) return;
        reveal[hidden[0]] = true;
        hinted = true;
        paintMask();
        if (hidden.length === 1) hintBtn.disabled = true;
        input.focus();
      };
      function check() {
        if (locked) return;
        const r = checkTyped(input.value, q.answers, q.strict);
        input.disabled = true; checkBtn.disabled = true; hintBtn.disabled = true;
        input.classList.add(r.ok ? 'right' : 'wrong');
        for (let i = 0; i < reveal.length; i++) reveal[i] = true;
        paintMask();
        maskEl.classList.add(r.ok ? 'right' : 'wrong');
        resolve(r.ok, r.note);
      }
      checkBtn.onclick = check;
      setTimeout(() => input.focus(), 50);
      return [maskEl, input, h('div', { class: 'btn-row' }, hintBtn), checkBtn];
    }

    // --- Ordenar letras ---
    function tilesUI() {
      const chosen = [];
      const slots = h('div', { class: 'mask tiles-answer' });
      const pool = h('div', { class: 'ltiles' });
      const checkBtn = h('button', { class: 'btn btn-primary btn-xl', disabled: true }, 'Comprobar');
      const tileBtns = q.letters.map((ch, i) => h('button', { class: 'tile-l', onclick: () => {
        if (locked || tileBtns[i].disabled) return;
        tileBtns[i].disabled = true;
        chosen.push(i);
        paint();
      } }, ch));
      const paint = () => {
        slots.replaceChildren(h('span', { class: 'mword' }, ...q.letters.map((_, k) => {
          const idx = chosen[k];
          return h('span', { class: `cell ${idx != null ? 'shown' : ''}` }, idx != null ? q.letters[idx] : '');
        })));
        checkBtn.disabled = chosen.length !== q.letters.length;
      };
      const undo = h('button', { class: 'btn btn-secondary', onclick: () => {
        if (locked || !chosen.length) return;
        tileBtns[chosen.pop()].disabled = false;
        paint();
      } }, '⌫ Borrar');
      pool.replaceChildren(...tileBtns);
      paint();
      checkBtn.onclick = () => {
        if (locked) return;
        const typed = chosen.map((i) => q.letters[i]).join('');
        const ok = normKeep(typed) === normKeep(q.word);
        slots.classList.add(ok ? 'right' : 'wrong');
        tileBtns.forEach((b) => { b.disabled = true; });
        resolve(ok);
      };
      return [slots, pool, h('div', { class: 'btn-row' }, undo), checkBtn];
    }

    function resolve(ok, note) {
      if (locked) return;
      locked = true;
      body.removeAttribute('data-nolookup');
      queue.shift();
      if (ok) {
        correct++;
        if (!retry) { firstTry++; answered++; }
        combo++;
        xp += (hinted ? 5 : 10) + (combo >= 5 ? 5 : 0);
        sfx('ok');
      } else {
        combo = 0;
        lives--;
        if (!retry) answered++;
        if (!retry) queue.push({ q, retry: true });
        sfx('bad');
      }
      paintHeader();

      const msgs = F.msgs;
      sheet.className = `sheet ${ok ? 'ok' : 'bad'}`;
      sheet.replaceChildren(
        h('div', { class: 'sheet-head' },
          h('strong', {}, ok ? `⚡ ${pick(msgs)}${combo >= 5 ? ` · combo ×${combo}` : ''}` : '✖ Incorrecto'),
          q.say ? h('button', { class: 'say-btn small', 'aria-label': 'Escuchar', onclick: () => speak(q.say) }, '🔊') : null,
        ),
        note ? h('p', {}, note) : null,
        ok ? null : h('p', {}, 'Respuesta correcta: ', h('b', {}, q.correctText)),
        h('button', { class: `btn btn-xl ${ok ? 'btn-ok' : 'btn-danger-solid'}`, onclick: () => {
          stop();
          if (lives <= 0) return finish(false);
          show();
        } }, 'Continuar'),
      );
      sheet.hidden = false;
      if (q.sayAfter && q.say) speak(q.say);
    }
  };

  show();
  return () => stop();
}

// ---------- Router ----------

export async function gameRoute(root, parts) {
  if (parts[0] === 'leccion' && parts[1]) return viewLesson(root, parts[1]);
  return viewPath(root);
}
