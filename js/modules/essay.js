// Escritura: ensayos por nivel con calificación automática y recomendaciones de estudio.

import { ESSAYS, ESSAY_LEVELS } from '../data/essays.js';
import { TENSES } from '../data/english.js';
import { getSetting, setSetting } from '../db.js';
import { h, toast, setHeader } from '../ui.js';
import { gradeEssay, countWords, TOPICS } from './essay-grader.js';

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

// ---------- Lista de temas ----------

async function viewList(root, level) {
  const p = await getProgress();
  const mine = userLevel(p.xp);
  const lvl = ESSAY_LEVELS.find((l) => l.level === level) || ESSAY_LEVELS.find((l) => l.level === mine);
  setHeader('Ensayos', '#/ingles');
  const best = p.essayBest || {};
  const hist = (p.essays || []).slice(0, 10);

  root.replaceChildren(
    h('section', { class: 'card' },
      h('p', {}, '✍️ Escribe un ensayo en inglés sobre el tema que elijas. Al terminar te califico de 0 a 100, te marco los errores y te digo qué estudiar.'),
      h('p', { class: 'muted small' }, `Tu nivel actual: ${mine}. Puedes practicar cualquier nivel.`),
    ),
    h('div', { class: 'chips' }, ...ESSAY_LEVELS.map((l) => h('a', {
      class: `chip${l.level === lvl.level ? ' active' : ''}`, href: `#/ingles/ensayos/${l.level}`,
    }, l.level === mine ? `${l.level} ⭐` : l.level))),
    h('section', { class: 'card' },
      h('div', { class: 'row-between' }, h('strong', {}, `Nivel ${lvl.level}`), h('span', { class: 'tag tag-accent' }, `${lvl.min}–${lvl.max} palabras`)),
      h('p', { class: 'muted small' }, `${lvl.desc} · ⏱ unos ${lvl.minutes} min · ${lvl.connectors}+ conectores`),
    ),
    h('div', { class: 'list' }, ...ESSAYS.filter((e) => e.level === lvl.level).map((e) => h('a', { class: 'term-row', href: `#/ingles/ensayo/${e.id}` },
      h('span', { class: 'term-main' }, h('strong', {}, e.title), h('span', { class: 'muted' }, e.es)),
      best[e.id] != null ? h('span', { class: `essay-badge ${scoreClass(best[e.id])}` }, best[e.id])
        : loadDraft(e.id) ? h('span', { class: 'tag' }, 'borrador') : h('span', {}, '›')))),
    hist.length ? h('h2', { class: 'label' }, '🗂 Mis ensayos') : null,
    hist.length ? h('div', { class: 'list' }, ...hist.map((x) => {
      const e = ESSAYS.find((y) => y.id === x.id);
      return h('a', { class: 'term-row', href: `#/ingles/ensayo-r/${x.at}` },
        h('span', { class: 'term-main' }, h('strong', {}, e?.title || x.id), h('span', { class: 'muted' }, `${x.level} · ${x.words} palabras · ${fmtDate(x.at)}`)),
        h('span', { class: `essay-badge ${scoreClass(x.score)}` }, x.score));
    })) : null,
  );
}

// ---------- Escribir ----------

function viewWrite(root, id, prefill) {
  const essay = ESSAYS.find((e) => e.id === id);
  if (!essay) { location.hash = '#/ingles/ensayos'; return; }
  const L = ESSAY_LEVELS.find((l) => l.level === essay.level);
  setHeader(`Ensayo ${essay.level}`, `#/ingles/ensayos/${essay.level}`);

  const area = h('textarea', {
    class: 'input textarea essay-area', rows: 12, lang: 'en', spellcheck: 'true', autocapitalize: 'sentences',
    placeholder: 'Start writing here…', 'aria-label': 'Tu ensayo',
  });
  area.value = prefill ?? loadDraft(id);
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
    clearTimeout(t);
    t = setTimeout(() => saveDraft(id, area.value), 400);
  };
  area.addEventListener('input', update);

  async function submit() {
    const text = area.value.trim();
    const n = countWords(text);
    if (n < L.min * 0.5 && !confirm(`Tu ensayo tiene ${n} palabras y el mínimo es ${L.min}. ¿Calificar de todas formas?`)) return;
    saveDraft(id, area.value);
    const result = gradeEssay(text, essay);
    const p = await getProgress();
    const prev = p.essayBest?.[id] ?? 0;
    const gain = Math.max(0, Math.round(result.score / 5) - Math.round(prev / 5));
    const entry = { at: Date.now(), id, level: essay.level, score: result.score, words: result.words, text };
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
      essay.use?.length ? h('div', { class: 'term-chips' },
        h('span', { class: 'muted small' }, 'Debes usar: '),
        ...essay.use.map((k) => h('a', { class: 'tag tag-accent', href: topicLink(k) || '#/ingles' }, topicTitle(k)))) : null,
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
  setHeader('Resultado', `#/ingles/ensayos/${essay.level}`);
  const cls = scoreClass(r.score);
  root.replaceChildren(
    h('section', { class: 'card center' },
      h('div', { class: `timer-ring small-ring score-${cls}`, style: `--p:${r.score}` }, h('span', { class: 'timer-text' }, r.score)),
      h('h2', {}, r.grade),
      h('p', { class: 'muted' }, `${essay.title} · ${essay.level} · ${r.words} palabras`),
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
    h('button', { class: 'btn btn-primary btn-xl', onclick: () => { history.replaceState(null, '', `#/ingles/ensayo/${essay.id}`); viewWrite(root, essay.id, entry.text); } }, '✍️ Corregir y volver a calificar'),
    h('button', { class: 'btn btn-secondary', onclick: async () => toast(await copyText(claudePrompt(essay, entry.text)) ? '📋 Copiado. Pégalo en la app de Claude.' : 'No se pudo copiar') }, '📋 Copiar para corrección con Claude'),
    h('a', { class: 'btn btn-ghost', href: `#/ingles/ensayos/${essay.level}` }, 'Elegir otro tema'),
  );
  window.scrollTo(0, 0);
}

async function viewSaved(root, at) {
  const p = await getProgress();
  const entry = (p.essays || []).find((x) => String(x.at) === String(at));
  const essay = entry && ESSAYS.find((e) => e.id === entry.id);
  if (!essay) { location.hash = '#/ingles/ensayos'; return; }
  renderResult(root, essay, entry, gradeEssay(entry.text, essay), 0);
}

// Resumen para la pantalla principal de inglés.
export function essaySummary(p) {
  const list = p.essays || [];
  if (!list.length) return 'Escribe y recibe calificación';
  return `${Object.keys(p.essayBest || {}).length} temas · última nota ${list[0].score}`;
}

export function essayRoute(root, parts) {
  if (parts[0] === 'ensayo' && parts[1]) return viewWrite(root, parts[1]);
  if (parts[0] === 'ensayo-r' && parts[1]) return viewSaved(root, parts[1]);
  return viewList(root, parts[1]);
}
