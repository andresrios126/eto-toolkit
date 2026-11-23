// Escritura: ensayos por nivel con calificación automática y recomendaciones de estudio.

import { ESSAYS, ESSAY_LEVELS, LEVEL_TENSES, CHALLENGE, CONNECTORS, TRACKS } from '../data/essays.js';
import { TENSES } from '../data/english.js';
import { getSetting, setSetting } from '../db.js';
import { h, toast, setHeader } from '../ui.js';
import { gradeEssay, countWords, TOPICS, usesWord } from './essay-grader.js';

const LEVEL_XP = [[0, 'A1'], [150, 'A2'], [400, 'B1'], [800, 'B2'], [1400, 'C1']];
const HISTORY_MAX = 30;

async function getProgress() {
  return { xp: 0, lessons: {}, ...(await getSetting('english', {})) };
}
const userLevel = (xp) => LEVEL_XP.filter(([n]) => xp >= n).pop()[1];

const draftKey = (id) => `eto-essay-draft:${id}`;
function loadDraft(id) { try { return localStorage.getItem(draftKey(id)) || ''; } catch (_) { return ''; } }
function saveDraft(id, text) { try { if (text) localStorage.setItem(draftKey(id), text); else localStorage.removeItem(draftKey(id)); } catch (_) { /* sin almacenamiento */ } }

const tenseOf = (k) => TENSES.find((t) => t.id === k);
const topicLink = (k) => (tenseOf(k) ? `#/ingles/t/${k}` : k === 'irregulares' ? '#/ingles/irregulares' : null);
const topicTitle = (k) => tenseOf(k)?.name || TOPICS[k]?.name || (k === 'irregulares' ? 'Verbos irregulares' : k);
const scoreClass = (s) => (s >= 75 ? 'ok' : s >= 60 ? 'mid' : 'low');
const fmtDate = (at) => new Date(at).toLocaleDateString('es', { day: 'numeric', month: 'short' });

// ---------- Reto recomendado ----------

const CH_KEY = 'eto-essay-challenge';
function loadChallenge() { try { return JSON.parse(localStorage.getItem(CH_KEY) || 'null'); } catch (_) { return null; } }
function storeChallenge(c) { try { localStorage.setItem(CH_KEY, JSON.stringify(c)); } catch (_) { /* sin almacenamiento */ } }
const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
const ORDER = ['A1', 'A2', 'B1', 'B2', 'C1'];

// Tiempos verbales en los que fallaste más (ensayos recientes y exámenes).
function weakTenses(p) {
  const n = {};
  for (const x of (p.essays || []).slice(0, 6)) {
    const e = ESSAYS.find((y) => y.id === x.id);
    if (!e) continue;
    const r = gradeEssay(x.text, { ...e, use: x.challenge?.use || e.use, words: x.challenge?.words });
    for (const s of r.study) if (tenseOf(s.topic)) n[s.topic] = (n[s.topic] || 0) + (s.count || 1);
  }
  for (const ex of Object.values(p.exams || {})) for (const k of ex.weak || []) if (tenseOf(k)) n[k] = (n[k] || 0) + 1;
  return Object.entries(n).sort((a, b) => b[1] - a[1]).map(([k]) => k);
}

const TRACK_KEY = 'eto-essay-track';
function getTrack() { try { return localStorage.getItem(TRACK_KEY) === 'maritime' ? 'maritime' : 'general'; } catch (_) { return 'general'; } }
function setTrack(t) { try { localStorage.setItem(TRACK_KEY, t); } catch (_) { /* sin almacenamiento */ } }
const listHref = (level, track) => `#/ingles/ensayos/${level}/${track || 'general'}`;

function makeChallenge(p, level, track, avoidId) {
  const cfg = CHALLENGE[level];
  const best = p.essayBest || {};
  const pool = ESSAYS.filter((e) => e.level === level && e.track === track && e.id !== avoidId);
  // Primero temas que no has escrito; luego los de nota más baja.
  const fresh = shuffle(pool.filter((e) => best[e.id] == null));
  const essay = fresh[0] || [...pool].sort((a, b) => best[a.id] - best[b.id])[0];
  const allowed = new Set(ORDER.slice(0, ORDER.indexOf(level) + 1).flatMap((l) => LEVEL_TENSES[l]));
  const weak = weakTenses(p).filter((k) => allowed.has(k));
  const use = [...essay.use];
  const reasons = [];
  for (const k of weak) {
    if (use.length >= cfg.tenses) break;
    if (!use.includes(k)) { use.push(k); reasons.push(`practicar ${tenseOf(k).name}, donde has tenido errores`); }
  }
  for (const k of shuffle(LEVEL_TENSES[level])) { if (use.length >= cfg.tenses) break; if (!use.includes(k)) use.push(k); }
  const words = shuffle(essay.vocab).slice(0, cfg.words - (['B2', 'C1'].includes(level) ? 1 : 0));
  if (['B2', 'C1'].includes(level)) words.push(shuffle(CONNECTORS[level])[0]);
  reasons.unshift(best[essay.id] == null ? 'es un tema que aún no has escrito' : `tu mejor nota en este tema es ${best[essay.id]}`);
  return { id: essay.id, level, track, use, words, why: `Te lo recomiendo porque ${reasons.join(' y ')}.` };
}

function challengeCard(c, onOther) {
  const e = ESSAYS.find((x) => x.id === c.id);
  return h('section', { class: 'card challenge-card' },
    h('div', { class: 'row-between' }, h('span', { class: 'q-kind' }, `🎯 Reto recomendado · ${c.level}`), h('span', { class: 'tag tag-accent' }, 'más exigente')),
    h('h2', { class: 'essay-title' }, e.title),
    h('p', { class: 'small' }, e.es),
    h('p', { class: 'small muted' }, c.why),
    h('div', { class: 'term-chips' }, h('span', { class: 'muted small' }, 'Tiempos: '), ...c.use.map((k) => h('a', { class: 'tag tag-accent', href: topicLink(k) || '#/ingles' }, topicTitle(k)))),
    h('div', { class: 'term-chips' }, h('span', { class: 'muted small' }, 'Palabras: '), ...c.words.map((w) => h('span', { class: 'tag' }, w))),
    h('div', { class: 'grid2' },
      h('a', { class: 'btn btn-primary', href: '#/ingles/ensayo-reto' }, '✍️ Aceptar reto'),
      h('button', { class: 'btn btn-secondary', onclick: onOther }, '🔄 Otro reto')),
  );
}

// ---------- Lista de temas ----------

async function viewList(root, level, trackParam) {
  const track = TRACKS.some((t) => t.key === trackParam) ? trackParam : getTrack();
  setTrack(track);
  const p = await getProgress();
  const mine = userLevel(p.xp);
  const lvl = ESSAY_LEVELS.find((l) => l.level === level) || ESSAY_LEVELS.find((l) => l.level === mine);
  setHeader('Ensayos', '#/ingles');
  const best = p.essayBest || {};
  const known = (x) => ESSAYS.some((e) => e.id === x.id);
  const hist = (p.essays || []).filter(known).slice(0, 10);

  let ch = loadChallenge();
  if (!ch || ch.level !== lvl.level || ch.track !== track || !ESSAYS.some((e) => e.id === ch.id)) { ch = makeChallenge(p, lvl.level, track); storeChallenge(ch); }
  const slot = h('div', {});
  const paint = () => slot.replaceChildren(challengeCard(ch, () => { ch = makeChallenge(p, lvl.level, track, ch.id); storeChallenge(ch); saveDraft('reto', ''); paint(); }));
  paint();

  root.replaceChildren(
    h('section', { class: 'card' },
      h('p', {}, '✍️ Escribe un ensayo en inglés sobre el tema que elijas. Al terminar te califico de 0 a 100, te marco los errores y te digo qué estudiar.'),
      h('p', { class: 'muted small' }, `Tu nivel actual: ${mine}. Puedes practicar cualquier nivel.`),
    ),
    h('div', { class: 'grid2' }, ...TRACKS.map((t) => h('a', {
      class: `btn ${t.key === track ? 'btn-primary' : 'btn-secondary'}`, href: listHref(lvl.level, t.key),
    }, t.label))),
    track === 'maritime' ? h('p', { class: 'muted small' }, '⚓ Temas de la vida a bordo, el trabajo en máquinas y electricidad, seguridad y reportes.') : null,
    h('div', { class: 'chips' }, ...ESSAY_LEVELS.map((l) => h('a', {
      class: `chip${l.level === lvl.level ? ' active' : ''}`, href: listHref(l.level, track),
    }, l.level === mine ? `${l.level} ⭐` : l.level))),
    h('section', { class: 'card' },
      h('div', { class: 'row-between' }, h('strong', {}, `Nivel ${lvl.level}`), h('span', { class: 'tag tag-accent' }, `${lvl.min}–${lvl.max} palabras`)),
      h('p', { class: 'muted small' }, `${lvl.desc} · ⏱ unos ${lvl.minutes} min · ${lvl.connectors}+ conectores`),
    ),
    slot,
    h('h2', { class: 'label' }, '📝 O elige un tema libre'),
    h('div', { class: 'list' }, ...ESSAYS.filter((e) => e.level === lvl.level && e.track === track).map((e) => h('a', { class: 'term-row', href: `#/ingles/ensayo/${e.id}` },
      h('span', { class: 'term-main' }, h('strong', {}, e.title), h('span', { class: 'muted' }, e.es)),
      best[e.id] != null ? h('span', { class: `essay-badge ${scoreClass(best[e.id])}` }, best[e.id])
        : loadDraft(e.id) ? h('span', { class: 'tag' }, 'borrador') : h('span', {}, '›')))),
    hist.length ? h('h2', { class: 'label' }, '🗂 Mis ensayos') : null,
    hist.length ? h('div', { class: 'list' }, ...hist.map((x) => {
      const e = ESSAYS.find((y) => y.id === x.id);
      return h('a', { class: 'term-row', href: `#/ingles/ensayo-r/${x.at}` },
        h('span', { class: 'term-main' }, h('strong', {}, `${x.challenge ? '🎯 ' : ''}${e?.track === 'maritime' ? '⚓ ' : ''}${e?.title || x.id}`), h('span', { class: 'muted' }, `${x.level} · ${x.words} palabras · ${fmtDate(x.at)}`)),
        h('span', { class: `essay-badge ${scoreClass(x.score)}` }, x.score));
    })) : null,
  );
}

// ---------- Escribir ----------

function viewWrite(root, id, prefill, challenge) {
  const base = ESSAYS.find((e) => e.id === id);
  if (!base) { location.hash = '#/ingles/ensayos'; return; }
  const essay = challenge ? { ...base, use: challenge.use, words: challenge.words } : base;
  const dKey = challenge ? 'reto' : id;
  const L = ESSAY_LEVELS.find((l) => l.level === essay.level);
  setHeader(challenge ? `🎯 Reto ${essay.level}` : `Ensayo ${essay.level}`, listHref(essay.level, essay.track));

  const area = h('textarea', {
    class: 'input textarea essay-area', rows: 12, lang: 'en', spellcheck: 'true', autocapitalize: 'sentences',
    placeholder: 'Start writing here…', 'aria-label': 'Tu ensayo',
  });
  area.value = prefill ?? loadDraft(dKey);
  const bar = h('div', { class: 'progress-bar' });
  const count = h('span', {});
  const gradeBtn = h('button', { class: 'btn btn-primary btn-xl', onclick: () => submit() }, '✅ Calificar');
  let t = null;
  const update = () => {
    const n = countWords(area.value);
    count.textContent = `${n} / ${L.min}–${L.max} palabras`;
    bar.style.width = `${Math.min(100, (n / L.min) * 100)}%`;
    bar.className = `progress-bar ${n >= L.min && n <= L.max ? 'wc-ok' : n > L.max ? 'wc-over' : ''}`;
    gradeBtn.disabled = n < 5;
    wordChips.forEach(([w, el]) => el.classList.toggle('tag-ok', usesWord(area.value, w)));
    clearTimeout(t);
    t = setTimeout(() => saveDraft(dKey, area.value), 400);
  };
  const wordChips = (essay.words || []).map((w) => [w, h('span', { class: 'tag word-chip' }, w)]);
  area.addEventListener('input', update);

  async function submit() {
    const text = area.value.trim();
    const n = countWords(text);
    if (n < L.min * 0.5 && !confirm(`Tu ensayo tiene ${n} palabras y el mínimo es ${L.min}. ¿Calificar de todas formas?`)) return;
    saveDraft(dKey, area.value);
    const result = gradeEssay(text, essay);
    const p = await getProgress();
    const prev = p.essayBest?.[id] ?? 0;
    const gain = Math.max(0, Math.round(result.score / 5) - Math.round(prev / 5));
    const entry = { at: Date.now(), id, level: essay.level, score: result.score, words: result.words, text };
    if (challenge) { entry.challenge = { use: challenge.use, words: challenge.words }; saveDraft('reto', ''); try { localStorage.removeItem(CH_KEY); } catch (_) { /* */ } }
    p.essays = [entry, ...(p.essays || [])].slice(0, HISTORY_MAX);
    p.essayBest = { ...(p.essayBest || {}), [id]: Math.max(prev, result.score) };
    p.xp += gain;
    await setSetting('english', p);
    history.replaceState(null, '', `#/ingles/ensayo-r/${entry.at}`);
    renderResult(root, essay, entry, result, gain);
  }

  root.replaceChildren(
    h('section', { class: 'card' },
      h('div', { class: 'row-between' }, h('span', { class: 'q-kind' }, `✍️ ${essay.level} · ${L.min}–${L.max} palabras`), h('span', { class: 'muted small' }, `⏱ ~${L.minutes} min`)),
      h('h2', { class: 'essay-title' }, essay.title),
      h('p', {}, essay.es),
      h('ul', { class: 'essay-ideas' }, ...essay.ideas.map((i) => h('li', {}, i))),
      challenge ? h('p', { class: 'small muted' }, `🎯 Reto: usa ${essay.use.length} tiempos verbales y ${essay.words.length} palabras. Las palabras se marcan en verde cuando las usas.`) : null,
      essay.use?.length ? h('div', { class: 'term-chips' },
        h('span', { class: 'muted small' }, challenge ? 'Tiempos: ' : 'Debes usar: '),
        ...essay.use.map((k) => h('a', { class: 'tag tag-accent', href: topicLink(k) || '#/ingles' }, topicTitle(k)))) : null,
      wordChips.length ? h('div', { class: 'term-chips' }, h('span', { class: 'muted small' }, 'Palabras: '), ...wordChips.map(([, el]) => el)) : null,
    ),
    area,
    h('div', { class: 'wc' }, h('div', { class: 'progress' }, bar), count),
    gradeBtn,
    h('button', { class: 'btn btn-ghost', onclick: () => { if (area.value && confirm('¿Borrar todo el texto?')) { area.value = ''; update(); } } }, '🗑 Borrar texto'),
    h('p', { class: 'muted small center' }, 'El borrador se guarda solo en este dispositivo mientras escribes.'),
  );
  update();
}

// ---------- Resultado ----------

function highlighted(text, errors) {
  const out = [];
  let pos = 0;
  errors.forEach((e, i) => {
    if (e.start > pos) out.push(text.slice(pos, e.start));
    out.push(h('mark', { class: `err err-${e.cat}`, onclick: () => toast(`${e.wrong} → ${e.fix}. ${e.msg}`) }, text.slice(e.start, e.end), h('sup', {}, i + 1)));
    pos = e.end;
  });
  out.push(text.slice(pos));
  return h('div', { class: 'essay-text', lang: 'en' }, ...out);
}

function claudePrompt(essay, text) {
  const L = ESSAY_LEVELS.find((l) => l.level === essay.level);
  return `Eres mi profesor de inglés. Corrige este ensayo de nivel ${essay.level} (tema: "${essay.title}", ${L.min}–${L.max} palabras).\n` +
    '1) Dame una calificación de 0 a 100 explicando cada criterio (gramática, vocabulario, organización, ortografía).\n' +
    '2) Lista cada error con su corrección y una explicación breve en español.\n' +
    '3) Escribe la versión corregida y una versión mejorada de mi nivel.\n' +
    '4) Dime qué temas debo estudiar para mejorar.\n\n' +
    `Ensayo:\n${text}`;
}

async function copyText(s) {
  try { await navigator.clipboard.writeText(s); return true; } catch (_) {
    const ta = h('textarea', {}, s);
    document.body.append(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) { /* sin portapapeles */ }
    ta.remove();
    return ok;
  }
}

function renderResult(root, essay, entry, r, gain) {
  setHeader('Resultado', listHref(essay.level, essay.track));
  const cls = scoreClass(r.score);
  root.replaceChildren(
    h('section', { class: 'card center' },
      h('div', { class: `timer-ring small-ring score-${cls}`, style: `--p:${r.score}` }, h('span', { class: 'timer-text' }, r.score)),
      h('h2', {}, r.grade),
      h('p', { class: 'muted' }, `${entry.challenge ? '🎯 Reto · ' : ''}${essay.title} · ${essay.level} · ${r.words} palabras`),
      gain ? h('p', { class: 'tag tag-ok' }, `+${gain} XP de inglés`) : null,
    ),
    h('section', { class: 'card' },
      h('h2', { class: 'label' }, '📊 Calificación por partes'),
      ...r.parts.map((p) => h('div', { class: 'topic-score' },
        h('div', { class: 'row-between' }, h('span', {}, p.name), h('b', {}, `${p.got}/${p.max}`)),
        h('div', { class: 'progress' }, h('div', { class: `progress-bar ${p.got / p.max < 0.6 ? 'bar-bad' : ''}`, style: `width:${(p.got / p.max) * 100}%` })))),
    ),
    r.study.length ? h('section', { class: 'card review-card' },
      h('h2', { class: 'label' }, '📚 Qué estudiar para mejorar'),
      ...r.study.map((s) => {
        const href = topicLink(s.topic);
        return h('div', { class: 'study-item' },
          href ? h('a', { class: 'topic-link', href }, `📘 ${s.title}`, h('span', {}, '›')) : h('strong', {}, s.title),
          h('p', { class: 'small' }, s.why),
          h('p', { class: 'small muted' }, `💡 ${s.tip}`));
      }),
    ) : h('section', { class: 'card' }, h('p', {}, '🎉 No encontré nada importante que repasar. ¡Prueba un nivel más alto!')),
    r.good.length ? h('section', { class: 'card' },
      h('h2', { class: 'label' }, '👍 Lo que hiciste bien'),
      h('ul', { class: 'essay-ideas' }, ...r.good.map((g) => h('li', {}, g)))) : null,
    h('section', { class: 'card' },
      h('h2', { class: 'label' }, `📝 Tu texto${r.errors.length ? ` · ${r.errors.length} correcciones` : ''}`),
      highlighted(entry.text, r.errors),
      r.errors.length ? h('ol', { class: 'err-list' }, ...r.errors.map((e) => h('li', {},
        h('span', { class: 'bad-text' }, e.wrong), ' → ', h('b', { class: 'ok' }, e.fix),
        h('div', { class: 'small muted' }, e.msg)))) : null,
    ),
    h('p', { class: 'note small' }, 'La calificación es automática y aproximada: revisa extensión, errores comunes, vocabulario, conectores y las estructuras del tema, pero no entiende el significado. Para una corrección completa, copia el ensayo y pégalo en la app de Claude.'),
    h('button', { class: 'btn btn-primary btn-xl', onclick: () => {
      if (entry.challenge) { storeChallenge({ id: essay.id, level: essay.level, ...entry.challenge, why: '' }); history.replaceState(null, '', '#/ingles/ensayo-reto'); viewWrite(root, essay.id, entry.text, entry.challenge); return; }
      history.replaceState(null, '', `#/ingles/ensayo/${essay.id}`); viewWrite(root, essay.id, entry.text);
    } }, '✍️ Corregir y volver a calificar'),
    h('button', { class: 'btn btn-secondary', onclick: async () => toast(await copyText(claudePrompt(essay, entry.text)) ? '📋 Copiado. Pégalo en la app de Claude.' : 'No se pudo copiar') }, '📋 Copiar para corrección con Claude'),
    h('a', { class: 'btn btn-ghost', href: listHref(essay.level, essay.track) }, 'Elegir otro tema'),
  );
  window.scrollTo(0, 0);
}

async function viewSaved(root, at) {
  const p = await getProgress();
  const entry = (p.essays || []).find((x) => String(x.at) === String(at));
  const essay = entry && ESSAYS.find((e) => e.id === entry.id);
  if (!essay) { location.hash = '#/ingles/ensayos'; return; }
  const graded = entry.challenge ? { ...essay, ...entry.challenge } : essay;
  renderResult(root, graded, entry, gradeEssay(entry.text, graded), 0);
}

// Resumen para la pantalla principal de inglés.
export function essaySummary(p) {
  const list = (p.essays || []).filter((x) => ESSAYS.some((e) => e.id === x.id));
  if (!list.length) return 'Escribe y recibe calificación';
  const done = Object.keys(p.essayBest || {}).filter((id) => ESSAYS.some((e) => e.id === id)).length;
  return done ? `${done} temas · última nota ${list[0].score}` : 'Escribe y recibe calificación';
}

export function essayRoute(root, parts) {
  if (parts[0] === 'ensayo-reto') {
    const c = loadChallenge();
    if (!c) { location.hash = '#/ingles/ensayos'; return undefined; }
    return viewWrite(root, c.id, undefined, c);
  }
  if (parts[0] === 'ensayo' && parts[1]) return viewWrite(root, parts[1]);
  if (parts[0] === 'ensayo-r' && parts[1]) return viewSaved(root, parts[1]);
  return viewList(root, parts[1], parts[2]);
}
