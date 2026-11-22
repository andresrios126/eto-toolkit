// Módulo Juego: lecciones de opción múltiple estilo "camino" con XP, racha y fusibles (vidas).

import { TERMS, GLOSSARY_CATEGORIES as GCATS } from '../data/glossary.js';
import { QUESTIONS, CATEGORIES as QCATS } from '../data/questions.js';
import { FAULTS, FAULT_SYSTEMS } from '../data/faults.js';
import { db, getSetting, setSetting } from '../db.js';
import { speak, stop } from '../speech.js';
import { h, setHeader } from '../ui.js';
import { getGame, levelInfo, recordLesson, DAILY_GOAL } from '../game-state.js';

const LESSON_SIZE = 10;
const LIVES = 3;

// ---------- Utilidades ----------

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
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

function mc(prompt, correct, wrong, extra = {}) {
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

// Vocabulario técnico para huecos: términos cortos del glosario.
const VOCAB = [...new Set(
  TERMS.map((t) => base(t.en)).filter((w) => w.length >= 4 && w.length <= 22 && !/[^a-zA-Z\- ]/.test(w))
)];

// ---------- Lecciones ----------

const glossaryCats = Object.keys(GCATS).filter((c) => c !== 'custom');
const questionCats = Object.keys(QCATS);

const ICONS = {
  basic: '⚡', gen: '🔄', dist: '🔌', motor: '⚙️', dp: '🧭', auto: '🤖', safety: '🦺', tools: '🧰', nav: '📡',
  vessel: '🚢', ships: '🛳️', prop: '🌀', volt: '🔋', sensors: '🌡️', radar: '📡', dpterm: '🎯',
  thruster: '🌀', swbd: '🎛️', pms: '🖥️', loto: '🔒', personal: '🙋', hv: '⚠️', batt: '🔋', situ: '💬',
};

export const UNITS = [
  {
    id: 'u-gloss', title: 'Vocabulario técnico', sub: 'Glosario EN ↔ ES',
    lessons: glossaryCats.map((c) => ({ id: `g-${c}`, title: GCATS[c], icon: ICONS[c] || '📖', type: 'gloss', cat: c })),
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
  const tryAdd = (q) => { if (q && q.options.length >= 2) out.push(q); };
  const terms = [...TERMS, ...(await customTerms())];
  const faults = [...FAULTS, ...(await customFaults())];

  const fromTerms = (pool, n) => {
    const gens = [G.termToEs, G.esToTerm, G.defToTerm, G.exampleGap];
    for (const t of shuffle(pool)) {
      if (out.length >= n) break;
      for (const gen of shuffle(gens)) { const q = gen(t, terms); if (q) { tryAdd(q); break; } }
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
    fromTerms(pool, LESSON_SIZE);
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
  return h('div', { class: 'stats-bar' },
    h('span', { class: `stat ${game.streak ? 'fire' : ''}`, title: 'Racha de días' }, '🔥 ', h('b', {}, game.streak)),
    h('span', { class: 'stat xp', title: 'Energía (XP)' }, '⚡ ', h('b', {}, game.xp)),
    h('span', { class: 'stat lvlbadge', title: 'Nivel' }, h('b', {}, lvl.name)),
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

  const questions = await buildQuestions(lesson);
  if (questions.length < 3) {
    root.replaceChildren(h('section', { class: 'card center' }, h('p', {}, 'No hay suficiente contenido para esta lección todavía.')),
      h('a', { class: 'btn btn-secondary', href: '#/juego' }, '← Volver'));
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
      h('a', { class: 'x-btn', href: '#/juego', 'aria-label': 'Salir' }, '✕'),
      h('div', { class: 'progress grow' }, h('div', { class: 'progress-bar volt', style: `width:${(answered / total) * 100}%` })),
      h('span', { class: 'fuses', 'aria-label': `${lives} fusibles` },
        ...Array.from({ length: LIVES }, (_, i) => h('span', { class: `fuse ${i < lives ? '' : 'blown'}` }, '▮'))),
    );
  };

  const finish = async (completed) => {
    stop();
    if (completed && firstTry === total) xp += 20; // bonus perfecto
    const { game, stars } = await recordLesson(lesson.id, { xp, correct: firstTry, total, completed });
    if (completed) sfx('win');
    setHeader(completed ? '¡Lección completa!' : 'Fusible quemado', '#/juego');
    const acc = Math.round((firstTry / total) * 100);
    root.replaceChildren(
      h('section', { class: 'card center result' },
        h('div', { class: 'result-icon' }, completed ? (stars === 3 ? '🏆' : '⚡') : '💥'),
        h('h2', {}, completed ? (stars === 3 ? '¡Circuito perfecto!' : '¡Bien hecho!') : 'Se quemaron los fusibles'),
        completed ? h('div', { class: 'stars big' }, '★'.repeat(stars) + '☆'.repeat(3 - stars)) : h('p', { class: 'muted' }, 'Repasa y vuelve a intentarlo.'),
        h('div', { class: 'result-stats' },
          h('div', {}, h('b', {}, `+${xp}`), h('span', {}, 'XP')),
          h('div', {}, h('b', {}, `${acc}%`), h('span', {}, 'precisión')),
          h('div', {}, h('b', {}, `🔥 ${game.streak}`), h('span', {}, 'racha')),
        ),
      ),
      dailyGoal(game),
      h('a', { class: 'btn btn-primary btn-xl', href: '#/juego/leccion/' + (lessonId), onclick: (e) => { e.preventDefault(); viewLesson(root, lessonId); } }, '🔁 Otra vez'),
      h('a', { class: 'btn btn-secondary btn-xl', href: '#/juego' }, '🗺️ Volver al camino'),
    );
  };

  const show = () => {
    paintHeader();
    sheet.hidden = true;
    if (!queue.length) return finish(true);
    const { q, retry } = queue[0];
    let locked = false;

    const optBtns = q.options.map((opt, i) =>
      h('button', { class: `opt ${q.optLang === 'en' ? 'en' : ''}`, onclick: () => choose(i) },
        h('span', { class: 'opt-key' }, String.fromCharCode(65 + i)), h('span', {}, opt))
    );

    const sayBtn = q.say && !q.sayAfter ? h('button', { class: 'say-btn', 'aria-label': 'Escuchar', onclick: () => speak(q.say) }, '🔊') : null;

    body.replaceChildren(
      h('div', { class: 'q-kind' }, retry ? '🔁 Repaso' : q.kind || ''),
      h('h2', { class: 'q-prompt' }, q.prompt),
      q.sub ? h('p', { class: 'muted small' }, q.sub) : null,
      q.big ? h('div', { class: 'q-big-row' }, sayBtn, h('p', { class: `q-big ${q.small ? 'smaller' : ''}` }, q.big)) : null,
      q.text ? h('div', { class: 'q-big-row' }, q.big ? null : sayBtn, h('p', { class: 'q-text' }, q.text)) : null,
      h('div', { class: 'opts' }, ...optBtns),
    );

    async function choose(i) {
      if (locked) return;
      locked = true;
      const ok = i === q.answer;
      optBtns.forEach((b, j) => {
        b.disabled = true;
        if (j === q.answer) b.classList.add('right');
        else if (j === i) b.classList.add('wrong');
      });
      queue.shift();
      if (ok) {
        correct++;
        if (!retry) { firstTry++; answered++; }
        combo++;
        xp += 10 + (combo >= 5 ? 5 : 0);
        sfx('ok');
      } else {
        combo = 0;
        lives--;
        if (!retry) answered++;
        if (!retry) queue.push({ q, retry: true });
        sfx('bad');
      }
      paintHeader();

      const msgs = ['¡Correcto!', '¡Excelente!', '¡Bien conectado!', '¡Voltaje perfecto!', '¡Sigue así!'];
      sheet.className = `sheet ${ok ? 'ok' : 'bad'}`;
      sheet.replaceChildren(
        h('div', { class: 'sheet-head' },
          h('strong', {}, ok ? `⚡ ${pick(msgs)}${combo >= 5 ? ` · combo ×${combo}` : ''}` : '✖ Incorrecto'),
          q.say ? h('button', { class: 'say-btn small', 'aria-label': 'Escuchar', onclick: () => speak(q.say) }, '🔊') : null,
        ),
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
