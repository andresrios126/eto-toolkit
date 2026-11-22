// Módulo 1: Entrenador de entrevistas.

import { QUESTIONS, CATEGORIES } from '../data/questions.js';
import { db, getSetting, setSetting } from '../db.js';
import { stop } from '../speech.js';
import { h, toast, setHeader, formatTime } from '../ui.js';
import { rateControl, speakButton, translationToggle } from '../components.js';

const PRACTICE_SECONDS = 120;

// ---------- Datos ----------

async function loadCustom() {
  const rows = await db.getAll('answers');
  return Object.fromEntries(rows.map((r) => [r.id, r]));
}

async function loadPracticeCounts() {
  const rows = await db.getAll('log');
  const counts = {};
  for (const r of rows) counts[r.qid] = (counts[r.qid] || 0) + 1;
  return counts;
}

function merged(q, custom) {
  const c = custom[q.id];
  return {
    ...q,
    aEn: c?.aEn ?? q.aEn,
    aEs: c?.aEs ?? q.aEs,
    edited: Boolean(c),
  };
}

async function getQuestion(id) {
  const q = QUESTIONS.find((x) => x.id === id);
  if (!q) return null;
  const c = await db.get('answers', id);
  return merged(q, c ? { [id]: c } : {});
}

// ---------- Vistas ----------

async function viewList(root) {
  setHeader('Entrevistas', '#/');
  const custom = await loadCustom();
  const counts = await loadPracticeCounts();
  let filter = await getSetting('interviewFilter', 'all');
  let search = '';

  const list = h('div', { class: 'list' });
  const chips = h('div', { class: 'chips' });

  const renderChips = () => {
    chips.replaceChildren(
      ...[['all', 'Todas'], ...Object.entries(CATEGORIES)].map(([key, label]) =>
        h('button', {
          class: `chip ${filter === key ? 'active' : ''}`,
          onclick: () => { filter = key; setSetting('interviewFilter', key); renderChips(); renderList(); },
        }, label)
      )
    );
  };

  const renderList = () => {
    const term = search.trim().toLowerCase();
    const items = QUESTIONS.map((q) => merged(q, custom)).filter((q) => {
      if (filter !== 'all' && q.cat !== filter) return false;
      if (!term) return true;
      return (q.qEn + ' ' + q.qEs + ' ' + q.aEn).toLowerCase().includes(term);
    });
    if (!items.length) {
      list.replaceChildren(h('p', { class: 'muted center' }, 'No hay preguntas que coincidan.'));
      return;
    }
    list.replaceChildren(
      ...items.map((q, i) =>
        h('a', { class: 'card q-card', href: `#/entrevistas/q/${q.id}` },
          h('div', { class: 'q-meta' },
            h('span', { class: 'tag' }, CATEGORIES[q.cat]),
            q.edited ? h('span', { class: 'tag tag-accent' }, '✏️ Personalizada') : null,
            counts[q.id] ? h('span', { class: 'tag tag-ok' }, `✓ ${counts[q.id]}×`) : null,
          ),
          h('p', { class: 'q-en' }, `${i + 1}. ${q.qEn}`),
          h('p', { class: 'q-es muted' }, q.qEs),
        )
      )
    );
  };

  const searchInput = h('input', {
    type: 'search', class: 'input', placeholder: 'Buscar pregunta…', 'aria-label': 'Buscar',
    oninput: (e) => { search = e.target.value; renderList(); },
  });

  renderChips();
  renderList();

  const practiced = Object.keys(counts).length;
  root.replaceChildren(
    h('a', { class: 'btn btn-primary btn-xl', href: '#/entrevistas/practica' }, '🎯 Modo práctica (2 min)'),
    h('p', { class: 'muted center small' }, `Has practicado ${practiced} de ${QUESTIONS.length} preguntas.`),
    searchInput,
    chips,
    list,
  );
}

async function viewDetail(root, id) {
  const q = await getQuestion(id);
  if (!q) { location.hash = '#/entrevistas'; return; }
  setHeader(CATEGORIES[q.cat], '#/entrevistas');

  const idx = QUESTIONS.findIndex((x) => x.id === id);
  const prev = QUESTIONS[idx - 1];
  const next = QUESTIONS[idx + 1];

  root.replaceChildren(
    rateControl(),
    h('section', { class: 'card' },
      h('h2', { class: 'label' }, `Pregunta ${idx + 1} de ${QUESTIONS.length}`),
      h('p', { class: 'big-en' }, q.qEn),
      h('p', { class: 'es' }, q.qEs),
      speakButton('Escuchar pregunta', () => q.qEn),
    ),
    h('section', { class: 'card' },
      h('h2', { class: 'label' }, q.edited ? 'Tu respuesta (personalizada)' : 'Respuesta modelo'),
      h('p', { class: 'answer-en' }, q.aEn),
      ...translationToggle(q.aEs),
      h('div', { class: 'btn-row' },
        speakButton('Escuchar respuesta', () => q.aEn),
        speakButton('Pregunta + respuesta', () => [q.qEn, q.aEn]),
      ),
      h('a', { class: 'btn btn-ghost', href: `#/entrevistas/q/${q.id}/editar` }, '✏️ Editar mi respuesta'),
    ),
    h('div', { class: 'btn-row' },
      prev ? h('a', { class: 'btn btn-ghost', href: `#/entrevistas/q/${prev.id}` }, '← Anterior') : h('span'),
      next ? h('a', { class: 'btn btn-ghost', href: `#/entrevistas/q/${next.id}` }, 'Siguiente →') : h('span'),
    ),
  );
}

async function viewEdit(root, id) {
  const q = await getQuestion(id);
  if (!q) { location.hash = '#/entrevistas'; return; }
  const original = QUESTIONS.find((x) => x.id === id);
  setHeader('Editar respuesta', `#/entrevistas/q/${id}`);

  const en = h('textarea', { class: 'input textarea', rows: 9, 'aria-label': 'Respuesta en inglés' });
  en.value = q.aEn;
  const es = h('textarea', { class: 'input textarea', rows: 7, 'aria-label': 'Traducción al español' });
  es.value = q.aEs;

  const save = async () => {
    const aEn = en.value.trim();
    const aEs = es.value.trim();
    if (!aEn) { toast('La respuesta en inglés no puede estar vacía'); return; }
    await db.put('answers', { id, aEn, aEs, updatedAt: new Date().toISOString() });
    toast('✅ Respuesta guardada');
    location.hash = `#/entrevistas/q/${id}`;
  };

  const restore = async () => {
    if (!confirm('¿Restaurar la respuesta modelo original? Se perderá tu versión.')) return;
    await db.delete('answers', id);
    toast('Respuesta original restaurada');
    location.hash = `#/entrevistas/q/${id}`;
  };

  root.replaceChildren(
    h('section', { class: 'card' },
      h('p', { class: 'big-en' }, q.qEn),
      h('p', { class: 'es' }, q.qEs),
    ),
    h('label', { class: 'label' }, '🇬🇧 Mi respuesta en inglés'),
    en,
    speakButton('Escuchar mi versión', () => en.value),
    h('label', { class: 'label' }, '🇪🇸 Traducción / notas en español'),
    es,
    h('p', { class: 'muted small' }, 'Consejo: usa frases cortas y ejemplos reales de tus buques (nombres de equipos, voltajes, fallas que resolviste).'),
    h('button', { class: 'btn btn-primary btn-xl', onclick: save }, '💾 Guardar'),
    q.edited || q.aEn !== original.aEn
      ? h('button', { class: 'btn btn-danger', onclick: restore }, '↺ Restaurar respuesta modelo')
      : null,
  );
}

async function viewPractice(root) {
  setHeader('Modo práctica', '#/entrevistas');
  const custom = await loadCustom();
  let lastId = null;
  let timer = null;
  let endAt = 0;
  let remaining = PRACTICE_SECONDS;
  let audioCtx = null;
  let wakeLock = null;

  const pickRandom = () => {
    const pool = QUESTIONS.filter((q) => q.id !== lastId);
    const q = pool[Math.floor(Math.random() * pool.length)];
    lastId = q.id;
    return merged(q, custom);
  };

  const beep = () => {
    try {
      if (!audioCtx) return;
      [0, 0.35, 0.7].forEach((t) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.25, audioCtx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + t + 0.3);
        o.connect(g).connect(audioCtx.destination);
        o.start(audioCtx.currentTime + t);
        o.stop(audioCtx.currentTime + t + 0.3);
      });
    } catch (_) { /* sin audio */ }
    navigator.vibrate?.([200, 100, 200]);
  };

  const releaseWake = () => { wakeLock?.release?.().catch(() => {}); wakeLock = null; };

  const clearTimer = () => { clearInterval(timer); timer = null; releaseWake(); };

  let q = pickRandom();
  const container = h('div', { class: 'stack' });

  const render = () => {
    clearTimer();
    remaining = PRACTICE_SECONDS;

    const timeEl = h('div', { class: 'timer-text' }, formatTime(remaining));
    const ring = h('div', { class: 'timer-ring' }, timeEl);
    const setRing = () => {
      const pct = (remaining / PRACTICE_SECONDS) * 100;
      ring.style.setProperty('--p', pct);
      ring.classList.toggle('warn', remaining <= 30 && remaining > 0);
      ring.classList.toggle('done', remaining === 0);
      timeEl.textContent = formatTime(remaining);
    };
    setRing();

    const startBtn = h('button', { class: 'btn btn-primary btn-xl' }, '▶︎ Iniciar 2:00');
    const resetBtn = h('button', { class: 'btn btn-ghost', hidden: true }, '↺ Reiniciar');

    const tick = () => {
      remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      setRing();
      if (remaining === 0) {
        clearTimer();
        beep();
        toast('⏰ ¡Tiempo!');
        startBtn.textContent = '▶︎ Otra vez';
        db.add('log', { qid: q.id, date: new Date().toISOString(), seconds: PRACTICE_SECONDS });
        answerSection.hidden = false;
      }
    };

    startBtn.addEventListener('click', async () => {
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      }
      audioCtx?.resume?.();
      if (timer) { // pausar
        clearTimer();
        startBtn.textContent = '▶︎ Continuar';
        return;
      }
      stop();
      if (remaining === 0) remaining = PRACTICE_SECONDS;
      endAt = Date.now() + remaining * 1000;
      timer = setInterval(tick, 250);
      startBtn.textContent = '⏸ Pausar';
      resetBtn.hidden = false;
      try { wakeLock = await navigator.wakeLock?.request('screen'); } catch (_) { /* no disponible */ }
    });

    resetBtn.addEventListener('click', () => {
      clearTimer();
      remaining = PRACTICE_SECONDS;
      setRing();
      startBtn.textContent = '▶︎ Iniciar 2:00';
      resetBtn.hidden = true;
    });

    const answerSection = h('section', { class: 'card', hidden: true },
      h('h2', { class: 'label' }, q.edited ? 'Tu respuesta' : 'Respuesta modelo'),
      h('p', { class: 'answer-en' }, q.aEn),
      ...translationToggle(q.aEs),
      speakButton('Escuchar respuesta', () => q.aEn),
      h('a', { class: 'btn btn-ghost', href: `#/entrevistas/q/${q.id}/editar` }, '✏️ Editar respuesta'),
    );

    const showBtn = h('button', { class: 'btn btn-ghost' }, '👀 Ver respuesta modelo');
    showBtn.addEventListener('click', () => {
      answerSection.hidden = !answerSection.hidden;
      showBtn.textContent = answerSection.hidden ? '👀 Ver respuesta modelo' : '🙈 Ocultar respuesta';
    });

    container.replaceChildren(
      rateControl(),
      h('section', { class: 'card' },
        h('div', { class: 'q-meta' }, h('span', { class: 'tag' }, CATEGORIES[q.cat])),
        h('p', { class: 'big-en' }, q.qEn),
        ...translationToggle(q.qEs),
        speakButton('Escuchar pregunta', () => q.qEn),
      ),
      h('p', { class: 'muted center small' }, 'Escucha la pregunta, inicia el temporizador y responde en voz alta.'),
      ring,
      h('div', { class: 'btn-row' }, startBtn, resetBtn),
      showBtn,
      answerSection,
      h('button', {
        class: 'btn btn-secondary btn-xl',
        onclick: () => { stop(); q = pickRandom(); render(); window.scrollTo(0, 0); },
      }, '🔀 Siguiente pregunta'),
    );
  };

  render();
  root.replaceChildren(container);

  // El temporizador usa Date.now(), así que sigue siendo exacto si la pantalla se bloquea.
  return () => {
    clearTimer();
    stop();
    audioCtx?.close?.();
  };
}

// ---------- Router del módulo ----------

export async function interviewsRoute(root, parts) {
  // parts: [] | ['practica'] | ['q', id] | ['q', id, 'editar']
  if (parts[0] === 'practica') return viewPractice(root);
  if (parts[0] === 'q' && parts[1] && parts[2] === 'editar') return viewEdit(root, parts[1]);
  if (parts[0] === 'q' && parts[1]) return viewDetail(root, parts[1]);
  return viewList(root);
}
