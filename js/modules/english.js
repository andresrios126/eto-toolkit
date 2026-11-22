// Sub-app de inglés general: tiempos verbales, verbos regulares e irregulares.
// Independiente del contenido ETO: su propio progreso (XP y nivel A1–C2).

import { TENSES, TENSE_GROUPS, IRREGULAR, REGULAR, REGULAR_RULES, ED_SOUNDS, VERB_FORMS } from '../data/english.js';
import { getSetting, setSetting } from '../db.js';
import { speak } from '../speech.js';
import { h, toast, setHeader } from '../ui.js';
import { rateControl } from '../components.js';
import { runLesson, mc, makeMask, shuffle, pick, checkTyped } from './game.js';

const LEVELS = [[0, 'A1'], [150, 'A2'], [400, 'B1'], [800, 'B2'], [1400, 'C1'], [2200, 'C2']];

// ---------- Progreso propio ----------

async function getProgress() {
  return { xp: 0, lessons: {}, ...(await getSetting('english', {})) };
}

function level(xp) {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
  const next = LEVELS[i + 1];
  return { name: LEVELS[i][1], next: next?.[1], toNext: next ? next[0] - xp : 0, progress: next ? (xp - LEVELS[i][0]) / (next[0] - LEVELS[i][0]) : 1 };
}

async function record(key, { xp, correct, total, completed }) {
  const p = await getProgress();
  p.xp += xp;
  const acc = total ? correct / total : 0;
  const stars = !completed ? 0 : acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
  const prev = p.lessons[key] || { stars: 0, plays: 0 };
  p.lessons[key] = { stars: Math.max(prev.stars, stars), plays: prev.plays + 1 };
  await setSetting('english', p);
  const lv = level(p.xp);
  return { stars, third: [lv.name, 'nivel'] };
}

const starsOf = (p, key) => p.lessons[key]?.stars || 0;
const starStr = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);

// ---------- Generadores de preguntas ----------

const alts = (s) => s.split('|').map((x) => x.trim()).filter(Boolean);
const typedWord = (list) => list.find((a) => !a.includes('/')) || list[0].replace(/\s*\/\s*/g, ' ');

function typeQuestion({ prompt, text, sub, answers, say, kind }) {
  const word = typedWord(answers);
  return {
    mode: 'type', lang: 'en', word, answers: [...answers, ...answers.map((a) => a.replace(/\s*\/\s*/g, ' '))],
    correctText: answers[0], reveal: makeMask(word), prompt, text, textLang: 'en', sub, say, sayAfter: true, kind, strict: true,
  };
}

function fromExercise(t, ex, mode) {
  const [sentence, verb, answer, es, wrong] = ex;
  const answers = alts(answer);
  const say = answers[0].includes('/')
    ? sentence.replace('___', answers[0].split('/')[0].trim()).replace('___', answers[0].split('/')[1].trim())
    : sentence.replace('___', answers[0]);
  if (mode === 'type') {
    return typeQuestion({
      prompt: 'Escribe el verbo en la forma correcta', text: `${sentence}  (${verb})`, sub: `🇪🇸 ${es}`,
      answers, say, kind: `✍️ ${t.name}`,
    });
  }
  return mc('Elige la forma correcta', answers[0], wrong, {
    text: `${sentence}  (${verb})`, textLang: 'en', sub: `🇪🇸 ${es}`, say, sayAfter: true, kind: `🔤 ${t.name}`, optLang: 'en',
  });
}

function whichTense(t) {
  const [en, es] = pick(t.examples);
  const same = TENSES.filter((x) => x.group === t.group && x.id !== t.id).map((x) => x.name);
  const other = TENSES.filter((x) => x.id !== t.id).map((x) => x.name);
  const wrong = [...new Set([...shuffle(same), ...shuffle(other)])].slice(0, 3);
  return mc('¿Qué tiempo verbal es?', t.name, wrong, {
    text: en, textLang: 'en', sub: `🇪🇸 ${es}`, say: en, kind: '🕵️ Identify the tense', optLang: 'en',
  });
}

function translate(t) {
  const [en, es] = pick(t.examples);
  const pool = TENSES.flatMap((x) => x.examples.map((e) => e[1])).filter((x) => x !== es);
  return mc('¿Qué significa?', es, shuffle(pool).slice(0, 3), { text: en, textLang: 'en', say: en, kind: '🇬🇧 → 🇪🇸', small: true });
}

function tenseQuestions(t, n = 10) {
  const out = [];
  const exs = shuffle(t.exercises);
  exs.forEach((ex, i) => out.push(fromExercise(t, ex, i % 2 === 0 ? 'type' : 'mc')));
  // repetir ejercicios en el otro modo para completar
  shuffle(t.exercises).forEach((ex, i) => { if (out.length < n - 3) out.push(fromExercise(t, ex, i % 2 === 0 ? 'mc' : 'type')); });
  out.push(whichTense(t), whichTense(t), translate(t));
  return shuffle(out).slice(0, n);
}

const pastAlts = (v) => v.split('/').map((x) => x.trim());

function irregularQuestions(n = 10) {
  const out = [];
  for (const v of shuffle(IRREGULAR).slice(0, n)) {
    const [base, past, pp, es] = v;
    const kind = pick(['past', 'pp', 'mcPast', 'es', 'chain']);
    if (kind === 'past') {
      out.push(typeQuestion({ prompt: 'Escribe el PASADO', text: `${base}  (${es})`, answers: pastAlts(past), say: `${base}, ${past.replace(' / ', ' or ')}`, kind: '🔁 Irregular verbs' }));
    } else if (kind === 'pp') {
      out.push(typeQuestion({ prompt: 'Escribe el PARTICIPIO', text: `${base} – ${past}  (${es})`, answers: pastAlts(pp), say: `${base}, ${past}, ${pp}`, kind: '🔁 Irregular verbs' }));
    } else if (kind === 'chain') {
      out.push(typeQuestion({ prompt: 'Completa las tres formas', text: `${base} – ___ – ${pp}`, sub: `🇪🇸 ${es}`, answers: pastAlts(past), say: `${base}, ${past}, ${pp}`, kind: '🔁 Irregular verbs' }));
    } else if (kind === 'mcPast') {
      const correct = pastAlts(past)[0];
      const wrong = [...new Set([`${base.replace(/e$/, '')}ed`, pastAlts(pp)[0], pick(IRREGULAR.filter((x) => x[0] !== base))[1].split(' / ')[0]])]
        .filter((x) => x !== correct).slice(0, 3);
      out.push(mc(`¿Cuál es el pasado de «${base}»?`, correct, wrong, { sub: `🇪🇸 ${es}`, say: `${base}, ${past}, ${pp}`, sayAfter: true, kind: '🔁 Irregular verbs', optLang: 'en' }));
    } else {
      const wrong = shuffle(IRREGULAR.filter((x) => x[0] !== base)).slice(0, 3).map((x) => x[0]);
      out.push(mc('¿Cómo se dice en inglés?', base, wrong, { big: es, say: base, sayAfter: true, kind: '🇪🇸 → 🇬🇧', optLang: 'en', small: true }));
    }
  }
  return out;
}

function edSound(base) {
  if (/(t|d|te|de)$/.test(base)) return '/ɪd/';
  if (/(k|p|f|sh|ch|ss|x|ke|ce|pe)$/.test(base)) return '/t/';
  return '/d/';
}

function regularQuestions(n = 10) {
  const out = [];
  for (const [base, past, es] of shuffle(REGULAR).slice(0, n)) {
    const kind = pick(['type', 'type', 'sound', 'regirr']);
    if (kind === 'type') {
      out.push(typeQuestion({ prompt: 'Escribe el pasado (regular)', text: `${base}  (${es})`, answers: [past], say: `${base}, ${past}`, kind: '✅ Regular verbs' }));
    } else if (kind === 'sound') {
      const correct = edSound(base);
      out.push(mc(`¿Cómo suena la -ed de «${past}»?`, correct, ['/t/', '/d/', '/ɪd/'].filter((x) => x !== correct), { say: past, kind: '🔊 Pronunciation', optLang: 'en' }));
    } else {
      const irr = Math.random() < 0.5;
      const verb = irr ? pick(IRREGULAR)[0] : base;
      out.push(mc(`«${verb}» es un verbo…`, irr ? 'Irregular' : 'Regular', [irr ? 'Regular' : 'Irregular'], { say: verb, kind: '🤔 Regular or irregular?' }));
    }
  }
  return out;
}

const PRACTICE = {
  mix: { title: 'Práctica mixta', build: () => shuffle(TENSES).slice(0, 10).map((t) => fromExercise(t, pick(t.exercises), pick(['type', 'mc']))) },
  quetiempo: { title: '¿Qué tiempo es?', build: () => shuffle(TENSES).slice(0, 10).map(whichTense) },
  irregulares: { title: 'Verbos irregulares', build: () => irregularQuestions(10) },
  regulares: { title: 'Verbos regulares', build: () => regularQuestions(10) },
};


// ---------- Exámenes por nivel ----------

export const EXAMS = [
  { level: 'A1', title: 'Examen A1 · Básico', unlock: 0, topics: ['present-simple', 'present-continuous', 'past-simple', 'modals', 'irregulares'] },
  { level: 'A2', title: 'Examen A2 · Elemental', unlock: 150, topics: ['past-continuous', 'future-will', 'going-to', 'used-to', 'present-perfect', 'irregulares'] },
  { level: 'B1', title: 'Examen B1 · Intermedio', unlock: 400, topics: ['present-perfect', 'present-perfect-continuous', 'past-perfect', 'conditionals', 'passive', 'modals'] },
  { level: 'B2', title: 'Examen B2 · Intermedio alto', unlock: 800, topics: ['past-perfect-continuous', 'future-continuous', 'future-perfect', 'conditionals', 'passive', 'regulares'] },
  { level: 'C1', title: 'Examen C1 · Avanzado', unlock: 1400, topics: ['future-perfect-continuous', 'past-perfect-continuous', 'future-perfect', 'present-perfect-continuous', 'conditionals', 'passive'] },
];
const EXAM_SIZE = 20;
const PASS = 70;

const topicName = (k) => (k === 'irregulares' ? 'Verbos irregulares' : k === 'regulares' ? 'Verbos regulares' : TENSES.find((t) => t.id === k)?.name || k);
const topicHref = (k) => (k === 'irregulares' || k === 'regulares' ? `#/ingles/${k}` : `#/ingles/t/${k}`);

function examQuestions(exam) {
  const per = Math.ceil(EXAM_SIZE / exam.topics.length);
  const out = [];
  for (const k of exam.topics) {
    let qs;
    if (k === 'irregulares') qs = irregularQuestions(per);
    else if (k === 'regulares') qs = regularQuestions(per);
    else {
      const t = TENSES.find((x) => x.id === k);
      qs = shuffle(t.exercises).map((ex, i) => fromExercise(t, ex, i % 2 ? 'mc' : 'type'));
      qs.push(whichTense(t));
      qs = shuffle(qs).slice(0, per);
    }
    qs.forEach((q) => out.push({ ...q, topic: k }));
  }
  return shuffle(out).slice(0, EXAM_SIZE);
}

function examRow(exam, p) {
  const r = p.exams?.[exam.level];
  const locked = p.xp < exam.unlock;
  const status = locked ? '🔒' : r?.passed ? '🏅' : r ? '🔁' : '▶';
  const sub = locked ? `Se desbloquea en nivel ${exam.level} (faltan ${exam.unlock - p.xp} XP)`
    : r?.passed ? `Aprobado · mejor nota ${r.best}%`
    : r ? `No aprobado (${r.last}%) · vuelve a intentarlo`
    : `${EXAM_SIZE} preguntas · aprueba con ${PASS}%`;
  return h('a', {
    class: `term-row exam-row ${locked ? 'locked' : ''}`,
    href: locked ? null : `#/ingles/examen/${exam.level}`,
    onclick: locked ? () => toast(`🔒 Gana XP practicando para llegar a ${exam.level}. Te faltan ${exam.unlock - p.xp} XP.`) : null,
  },
  h('span', { class: 'exam-badge' }, exam.level),
  h('span', { class: 'term-main' }, h('strong', {}, exam.title), h('span', { class: 'muted' }, sub)),
  h('span', { class: 'exam-status' }, status));
}

async function viewExamIntro(root, level) {
  const exam = EXAMS.find((e) => e.level === level);
  if (!exam) { location.hash = '#/ingles'; return; }
  const p = await getProgress();
  if (p.xp < exam.unlock) { toast('🔒 Este examen aún está bloqueado'); location.hash = '#/ingles'; return; }
  setHeader(exam.title, '#/ingles');
  const r = p.exams?.[level];
  root.replaceChildren(
    h('section', { class: 'card center' },
      h('div', { class: 'exam-badge big' }, exam.level),
      h('h2', {}, exam.title),
      h('p', { class: 'muted' }, `${EXAM_SIZE} preguntas · sin pistas · sin vidas · aprueba con ${PASS}%`),
      r ? h('p', {}, r.passed ? `🏅 Aprobado · mejor nota ${r.best}% · ${r.attempts} intento(s)` : `Último intento: ${r.last}% · ${r.attempts} intento(s)`) : null,
    ),
    h('section', { class: 'card' },
      h('h2', { class: 'label' }, '📋 Temas del examen'),
      ...exam.topics.map((k) => h('a', { class: 'topic-link', href: topicHref(k) }, `📘 ${topicName(k)}`,
        r?.weak?.includes(k) ? h('span', { class: 'tag tag-warn' }, 'repasar') : null)),
      h('p', { class: 'muted small' }, 'Consejo: repasa cada tema y su práctica antes del examen. No verás si aciertas hasta el final, como en un examen real.'),
    ),
    h('button', { class: 'btn btn-primary btn-xl', onclick: () => runExam(root, exam) }, '📝 Empezar examen'),
  );
}

function runExam(root, exam) {
  const questions = examQuestions(exam);
  const answers = [];
  let i = 0;
  const wrap = h('div', { class: 'stack', 'data-nolookup': '' });
  root.replaceChildren(wrap);

  const show = () => {
    if (i >= questions.length) return results();
    const q = questions[i];
    setHeader(`${exam.title}`, '#/ingles');
    const next = h('button', { class: 'btn btn-primary btn-xl', disabled: true }, i === questions.length - 1 ? 'Terminar examen' : 'Siguiente →');
    let interaction;
    let given = null;
    if (q.mode === 'type') {
      const input = h('input', { class: 'input type-input', type: 'text', autocomplete: 'off', autocorrect: 'off', autocapitalize: 'none', spellcheck: 'false', placeholder: 'Write your answer…', enterkeyhint: 'next' });
      input.addEventListener('input', () => { given = input.value; next.disabled = !input.value.trim(); });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && input.value.trim()) next.click(); });
      setTimeout(() => input.focus(), 50);
      interaction = input;
    } else {
      const btns = q.options.map((o, k) => h('button', { class: 'opt en', onclick: () => {
        btns.forEach((b) => b.classList.remove('selected'));
        btns[k].classList.add('selected');
        given = k;
        next.disabled = false;
      } }, h('span', { class: 'opt-key' }, String.fromCharCode(65 + k)), h('span', {}, o)));
      interaction = h('div', { class: 'opts' }, ...btns);
    }
    next.onclick = () => {
      const ok = q.mode === 'type' ? checkTyped(given || '', q.answers, true).ok : given === q.answer;
      answers.push({ q, ok, given: q.mode === 'type' ? given : q.options[given] });
      i++;
      show();
      window.scrollTo(0, 0);
    };
    wrap.replaceChildren(
      h('div', { class: 'row-between' }, h('span', { class: 'muted small' }, `Pregunta ${i + 1} de ${questions.length}`), h('span', { class: 'tag' }, topicName(q.topic))),
      h('div', { class: 'progress' }, h('div', { class: 'progress-bar eng-bar', style: `width:${(i / questions.length) * 100}%` })),
      h('h2', { class: 'q-prompt' }, q.prompt),
      q.sub ? h('p', { class: 'muted small' }, q.sub) : null,
      q.big ? h('p', { class: 'q-big smaller' }, q.big) : null,
      q.text ? h('p', { class: 'q-text' }, q.text) : null,
      interaction,
      next,
    );
  };

  const results = async () => {
    const score = Math.round((answers.filter((a) => a.ok).length / answers.length) * 100);
    const passed = score >= PASS;
    const byTopic = {};
    for (const a of answers) {
      const t = (byTopic[a.q.topic] ||= { ok: 0, total: 0 });
      t.total++;
      if (a.ok) t.ok++;
    }
    const weak = Object.entries(byTopic).filter(([, v]) => v.ok / v.total < PASS / 100).map(([k]) => k);

    const p = await getProgress();
    p.exams = p.exams || {};
    const prev = p.exams[exam.level] || { attempts: 0, best: 0, passed: false };
    const firstPass = passed && !prev.passed;
    p.exams[exam.level] = { attempts: prev.attempts + 1, best: Math.max(prev.best, score), last: score, passed: prev.passed || passed, weak };
    if (firstPass) p.xp += 50;
    await setSetting('english', p);

    setHeader(passed ? '¡Examen aprobado!' : 'Examen no aprobado', '#/ingles');
    const wrong = answers.filter((a) => !a.ok);
    wrap.removeAttribute('data-nolookup');
    wrap.replaceChildren(
      h('section', { class: 'card center result' },
        h('div', { class: 'result-icon' }, passed ? '🏅' : '📚'),
        h('h2', {}, passed ? `¡Aprobaste el ${exam.level}!` : `Obtuviste ${score}%`),
        h('p', { class: 'muted' }, passed ? (firstPass ? '+50 XP de bonificación por aprobar.' : 'Ya tenías este examen aprobado.') : `Necesitas ${PASS}% para aprobar. ¡Repasa y vuelve a intentarlo!`),
        h('div', { class: 'result-stats' },
          h('div', {}, h('b', {}, `${score}%`), h('span', {}, 'nota')),
          h('div', {}, h('b', {}, `${answers.length - wrong.length}/${answers.length}`), h('span', {}, 'correctas')),
          h('div', {}, h('b', {}, `${prev.attempts + 1}`), h('span', {}, 'intentos')),
        ),
      ),
      h('section', { class: 'card' },
        h('h2', { class: 'label' }, '📊 Resultado por tema'),
        ...Object.entries(byTopic).map(([k, v]) => {
          const pct = Math.round((v.ok / v.total) * 100);
          return h('div', { class: 'topic-score' },
            h('div', { class: 'row-between' }, h('span', {}, topicName(k)), h('b', { class: pct >= PASS ? 'ok' : 'bad-text' }, `${v.ok}/${v.total}`)),
            h('div', { class: 'progress' }, h('div', { class: `progress-bar ${pct >= PASS ? '' : 'bar-bad'}`, style: `width:${pct}%` })));
        }),
      ),
      weak.length ? h('section', { class: 'card review-card' },
        h('h2', { class: 'label' }, '📚 Repasa estos temas'),
        ...weak.map((k) => h('a', { class: 'btn btn-secondary', href: topicHref(k) }, `📘 ${topicName(k)} →`)),
      ) : null,
      h('button', { class: 'btn btn-primary btn-xl', onclick: () => { runExam(root, exam); window.scrollTo(0, 0); } }, '🔁 Volver a tomar el examen'),
      h('a', { class: 'btn btn-secondary', href: '#/ingles' }, '← Volver a Inglés'),
      wrong.length ? h('h2', { class: 'label' }, `❌ Tus errores (${wrong.length})`) : null,
      ...wrong.map((a) => h('section', { class: 'card' },
        h('span', { class: 'tag' }, topicName(a.q.topic)),
        h('p', { class: 'q-en' }, a.q.prompt),
        a.q.big ? h('p', {}, a.q.big) : null,
        a.q.text ? h('p', { class: 'ex-en' }, a.q.text) : null,
        h('p', { class: 'mistake' }, h('span', { class: 'bad' }, `Tu respuesta: ${a.given || '—'}`), h('span', { class: 'good' }, `✔ ${a.q.correctText}`)),
      )),
    );
  };

  show();
}

// ---------- Vistas ----------

async function viewHome(root) {
  setHeader('Inglés', '#/');
  const p = await getProgress();
  const lv = level(p.xp);
  const done = TENSES.filter((t) => starsOf(p, t.id)).length;
  const next = TENSES.find((t) => !starsOf(p, t.id));

  const tenseRow = (t) => h('a', { class: 'term-row', href: `#/ingles/t/${t.id}` },
    h('span', { class: 'term-main' }, h('strong', {}, t.name), h('span', { class: 'muted' }, t.es)),
    h('span', { class: 'stars' }, starStr(starsOf(p, t.id))));

  root.replaceChildren(
    h('div', { class: 'stats-bar' },
      h('button', { class: 'stat', onclick: () => toast('⭐ XP de inglés: 10 por acierto, 5 con pista. Es independiente del progreso ETO.') },
        h('span', { class: 'stat-val' }, '⭐ ', h('b', {}, p.xp)), h('span', { class: 'stat-label' }, 'XP')),
      h('button', { class: 'stat', onclick: () => toast(lv.next ? `Nivel ${lv.name} (A1 → C2). Te faltan ${lv.toNext} XP para ${lv.next}.` : `Nivel máximo: ${lv.name}`) },
        h('span', { class: 'stat-val eng-lvl' }, h('b', {}, lv.name)), h('span', { class: 'stat-label' }, 'Nivel')),
      h('button', { class: 'stat', onclick: () => toast(`Has practicado ${done} de ${TENSES.length} temas de gramática.`) },
        h('span', { class: 'stat-val' }, '📚 ', h('b', {}, `${done}/${TENSES.length}`)), h('span', { class: 'stat-label' }, 'Temas')),
    ),
    h('a', { class: 'hero eng-hero', href: next ? `#/ingles/t/${next.id}` : '#/ingles/practica/mix' },
      h('span', { class: 'hero-bolt', 'aria-hidden': 'true' }, '🇬🇧'),
      h('span', { class: 'hero-text' }, h('small', {}, next ? 'Siguiente tema' : 'Repaso'), h('strong', {}, next ? `${next.name}` : 'Práctica mixta')),
      h('span', { class: 'hero-go' }, '▶'),
    ),
    h('div', { class: 'progress' }, h('div', { class: 'progress-bar eng-bar', style: `width:${lv.progress * 100}%` })),
    h('h2', { class: 'label' }, '🎓 Exámenes por nivel'),
    h('div', { class: 'list' }, ...EXAMS.map((e) => examRow(e, p))),
    h('h2', { class: 'label' }, '⚡ Práctica'),
    h('div', { class: 'grid2' },
      h('a', { class: 'btn btn-primary', href: '#/ingles/practica/mix' }, '⚡ Mixta'),
      h('a', { class: 'btn btn-secondary', href: '#/ingles/practica/quetiempo' }, '🕵️ ¿Qué tiempo es?'),
    ),
    h('h2', { class: 'label' }, '🔤 Verbos'),
    h('div', { class: 'list' },
      h('a', { class: 'term-row', href: '#/ingles/formas' },
        h('span', { class: 'term-main' }, h('strong', {}, 'Formas del verbo'), h('span', { class: 'muted' }, 'Base, pasado, participio, -ing')), h('span', {}, '›')),
      h('a', { class: 'term-row', href: '#/ingles/irregulares' },
        h('span', { class: 'term-main' }, h('strong', {}, 'Verbos irregulares'), h('span', { class: 'muted' }, `${IRREGULAR.length} verbos con tabla y práctica`)),
        h('span', { class: 'stars' }, starStr(starsOf(p, 'irregulares')))),
      h('a', { class: 'term-row', href: '#/ingles/regulares' },
        h('span', { class: 'term-main' }, h('strong', {}, 'Verbos regulares'), h('span', { class: 'muted' }, 'Reglas de -ed y pronunciación')),
        h('span', { class: 'stars' }, starStr(starsOf(p, 'regulares')))),
    ),
    ...Object.entries(TENSE_GROUPS).flatMap(([g, title]) => [
      h('h2', { class: 'label' }, `📘 ${title}`),
      h('div', { class: 'list' }, ...TENSES.filter((t) => t.group === g).map(tenseRow)),
    ]),
  );
}

function viewTense(root, id) {
  const t = TENSES.find((x) => x.id === id);
  if (!t) { location.hash = '#/ingles'; return; }
  setHeader(t.name, '#/ingles');
  const i = TENSES.indexOf(t);
  const prev = TENSES[i - 1];
  const next = TENSES[i + 1];

  root.replaceChildren(
    h('section', { class: 'card' },
      h('p', { class: 'term-big' }, t.name),
      h('p', { class: 'es' }, t.es),
    ),
    h('section', { class: 'card' },
      h('h2', { class: 'label' }, '🎯 ¿Cuándo se usa?'),
      h('ul', { class: 'steps' }, ...t.use.map((u) => h('li', {}, u))),
    ),
    h('section', { class: 'card' },
      h('h2', { class: 'label' }, '🧱 Estructura'),
      h('table', { class: 'dtable form-table' }, h('tbody', {}, ...t.form.map(([k, v]) => h('tr', {}, h('th', {}, k), h('td', { class: 'en-cell' }, v))))),
      h('p', { class: 'note' }, '💡 ', t.tip),
    ),
    h('section', { class: 'card' },
      h('h2', { class: 'label' }, '⏰ Palabras clave'),
      h('div', { class: 'chips wrap' }, ...t.signals.map((s) => h('button', { class: 'chip', onclick: () => speak(s) }, s))),
    ),
    h('section', { class: 'card' },
      h('h2', { class: 'label' }, '💬 Ejemplos (toca 🔊 para escuchar)'),
      ...t.examples.map(([en, es]) => h('div', { class: 'example-row' },
        h('button', { class: 'say-btn small', 'aria-label': 'Escuchar', onclick: () => speak(en) }, '🔊'),
        h('div', {}, h('p', { class: 'ex-en' }, en), h('p', { class: 'muted small ex-es' }, es)),
      )),
    ),
    t.mistakes?.length ? h('section', { class: 'card' },
      h('h2', { class: 'label' }, '⚠️ Errores comunes'),
      ...t.mistakes.map(([bad, good]) => h('p', { class: 'mistake' }, h('span', { class: 'bad' }, `✖ ${bad}`), h('span', { class: 'good' }, `✔ ${good}`))),
    ) : null,
    rateControl(),
    h('a', { class: 'btn btn-primary btn-xl', href: `#/ingles/practica/${t.id}` }, '▶ Practicar (10 ejercicios)'),
    h('div', { class: 'btn-row' },
      prev ? h('a', { class: 'btn btn-ghost', href: `#/ingles/t/${prev.id}` }, '← Anterior') : h('span'),
      next ? h('a', { class: 'btn btn-ghost', href: `#/ingles/t/${next.id}` }, 'Siguiente →') : h('span'),
    ),
  );
}

function viewForms(root) {
  setHeader('Formas del verbo', '#/ingles');
  root.replaceChildren(
    h('section', { class: 'card' },
      h('p', {}, 'Todo verbo en inglés tiene pocas formas. Si las conoces, puedes construir todos los tiempos verbales.'),
      h('table', { class: 'dtable' },
        h('thead', {}, h('tr', {}, h('th', {}, 'Forma'), h('th', {}, 'Ejemplo'), h('th', {}, 'Se usa en'))),
        h('tbody', {}, ...VERB_FORMS.map(([f, ex, use]) => h('tr', {}, h('th', {}, f), h('td', { class: 'en-cell' }, ex), h('td', {}, use))))),
    ),
    h('section', { class: 'card' },
      h('h2', { class: 'label' }, '🧩 Así se construyen los tiempos'),
      h('ul', { class: 'steps' },
        h('li', {}, 'Continuos (progresivos): be + -ing → I am working · I was working · I will be working'),
        h('li', {}, 'Perfectos: have + participio → I have worked · I had worked · I will have worked'),
        h('li', {}, 'Perfectos continuos: have been + -ing → I have been working'),
        h('li', {}, 'Voz pasiva: be + participio → It is made · It was made'),
      ),
    ),
    h('section', { class: 'card' },
      h('h2', { class: 'label' }, '✍️ Ortografía de -ing'),
      h('ul', { class: 'steps' },
        h('li', {}, 'Regla general: + ing → work → working'),
        h('li', {}, 'Termina en -e: se quita la e → make → making, write → writing'),
        h('li', {}, 'Termina en -ie: ie → ying → lie → lying, die → dying'),
        h('li', {}, 'Consonante-vocal-consonante (sílaba fuerte): se duplica → run → running, swim → swimming, stop → stopping'),
      ),
    ),
    h('a', { class: 'btn btn-secondary', href: '#/ingles/irregulares' }, '🔁 Ver verbos irregulares'),
  );
}

function viewIrregular(root) {
  setHeader('Verbos irregulares', '#/ingles');
  let term = '';
  const tbody = h('tbody');
  const render = () => {
    const q = term.trim().toLowerCase();
    tbody.replaceChildren(...IRREGULAR.filter((v) => !q || v.join(' ').toLowerCase().includes(q)).map(([b, p, pp, es]) =>
      h('tr', { onclick: () => speak(`${b}, ${p.replace(' / ', ' or ')}, ${pp.replace(' / ', ' or ')}`) },
        h('td', { class: 'en-cell' }, h('b', {}, b)), h('td', { class: 'en-cell' }, p), h('td', { class: 'en-cell' }, pp), h('td', { class: 'muted' }, es))));
  };
  render();
  root.replaceChildren(
    h('a', { class: 'btn btn-primary btn-xl', href: '#/ingles/practica/irregulares' }, '▶ Practicar irregulares'),
    h('p', { class: 'muted small center' }, 'Toca una fila para escuchar las tres formas.'),
    h('input', { type: 'search', class: 'input', placeholder: 'Buscar verbo en inglés o español…', oninput: (e) => { term = e.target.value; render(); } }),
    h('section', { class: 'card table-card' },
      h('table', { class: 'dtable verbs' },
        h('thead', {}, h('tr', {}, h('th', {}, 'Base'), h('th', {}, 'Pasado'), h('th', {}, 'Participio'), h('th', {}, 'Español'))),
        tbody),
    ),
    rateControl(),
  );
}

function viewRegular(root) {
  setHeader('Verbos regulares', '#/ingles');
  root.replaceChildren(
    h('a', { class: 'btn btn-primary btn-xl', href: '#/ingles/practica/regulares' }, '▶ Practicar regulares'),
    h('section', { class: 'card' },
      h('h2', { class: 'label' }, '✍️ Cómo se escribe el pasado'),
      ...REGULAR_RULES.map(([r, ex]) => h('div', { class: 'rule' }, h('strong', {}, r), h('p', { class: 'en-cell muted' }, ex))),
      h('p', { class: 'note' }, '💡 En los verbos regulares, el pasado y el participio son iguales: work → worked → worked.'),
    ),
    h('section', { class: 'card' },
      h('h2', { class: 'label' }, '🔊 Cómo suena la -ed'),
      ...ED_SOUNDS.map(([s, when, ex]) => h('div', { class: 'example-row' },
        h('button', { class: 'say-btn small', onclick: () => speak(ex) }, '🔊'),
        h('div', {}, h('p', { class: 'ex-en' }, h('b', {}, s), ` ${ex}`), h('p', { class: 'muted small' }, when)),
      )),
    ),
    h('section', { class: 'card' },
      h('h2', { class: 'label' }, `📋 ${REGULAR.length} verbos regulares comunes`),
      h('div', { class: 'term-chips' }, ...REGULAR.map(([b, p, es]) => h('button', { class: 'term-chip', onclick: () => speak(`${b}, ${p}`) }, h('b', {}, `${b} → ${p}`), h('span', {}, es)))),
    ),
    rateControl(),
  );
}

function viewPractice(root, key) {
  const t = TENSES.find((x) => x.id === key);
  const def = t ? { title: t.name, build: () => tenseQuestions(t) } : PRACTICE[key];
  if (!def) { location.hash = '#/ingles'; return; }
  const back = t ? `#/ingles/t/${t.id}` : key === 'irregulares' || key === 'regulares' ? `#/ingles/${key}` : '#/ingles';
  setHeader(def.title, back);
  return runLesson(root, {
    title: def.title, backHash: back, backLabel: '← Volver', flavor: 'eng',
    build: async () => def.build(),
    record: (r) => record(key, r),
  });
}

export async function englishRoute(root, parts) {
  if (parts[0] === 't' && parts[1]) return viewTense(root, parts[1]);
  if (parts[0] === 'formas') return viewForms(root);
  if (parts[0] === 'irregulares') return viewIrregular(root);
  if (parts[0] === 'regulares') return viewRegular(root);
  if (parts[0] === 'practica' && parts[1]) return viewPractice(root, parts[1]);
  if (parts[0] === 'examen' && parts[1]) return viewExamIntro(root, parts[1]);
  return viewHome(root);
}
