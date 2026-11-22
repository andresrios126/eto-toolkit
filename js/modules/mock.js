// Simulacro de entrevista: el entrevistador lee preguntas en voz alta, respondes con tiempo
// y (opcional) grabas tu voz para escucharte al final. Las grabaciones NO se guardan.

import { QUESTIONS, CATEGORIES } from '../data/questions.js';
import { db, getSetting, setSetting } from '../db.js';
import { speak, stop } from '../speech.js';
import { h, toast, setHeader, formatTime } from '../ui.js';
import { rateControl, speakButton, translationToggle } from '../components.js';
import { recordLesson } from '../game-state.js';
import { shuffle } from './game.js';

const POWER = ['gen', 'swbd', 'pms', 'thruster', 'prop', 'hv', 'auto', 'nav', 'batt'];
const SAFETY = ['safety', 'loto'];

const PLANS = {
  5: [['id', 'per-01'], ['cat', ['dp']], ['cat', ['cv']], ['cat', SAFETY], ['id', 'hr-01']],
  8: [['id', 'per-01'], ['cat', ['dp']], ['cat', ['cv']], ['cat', POWER], ['cat', ['dp']], ['cat', ['cv']], ['cat', SAFETY], ['id', 'hr-01']],
  10: [['id', 'per-01'], ['cat', ['dp']], ['cat', ['cv']], ['cat', POWER], ['cat', ['dp']], ['cat', POWER], ['cat', ['cv']], ['cat', SAFETY], ['cat', ['situ', 'personal']], ['id', 'hr-01']],
};

async function withCustomAnswers(list) {
  const rows = Object.fromEntries((await db.getAll('answers')).map((r) => [r.id, r]));
  return list.map((q) => (rows[q.id] ? { ...q, aEn: rows[q.id].aEn, aEs: rows[q.id].aEs, edited: true } : q));
}

function buildPlan(n) {
  const used = new Set();
  const out = [];
  for (const [type, val] of PLANS[n]) {
    let q;
    if (type === 'id') q = QUESTIONS.find((x) => x.id === val);
    else q = shuffle(QUESTIONS.filter((x) => val.includes(x.cat) && !used.has(x.id) && x.id !== 'hr-01' && x.id !== 'per-01'))[0];
    if (q && !used.has(q.id)) { used.add(q.id); out.push(q); }
  }
  return out;
}

// ---------- Configuración ----------

async function viewSetup(root) {
  setHeader('Simulacro de entrevista', '#/');
  let cfg = { n: 8, minutes: 2, showText: true, record: false, ...(await getSetting('mockCfg', {})) };
  const history = await getSetting('mockHistory', []);

  const chipGroup = (options, key) => {
    const wrap = h('div', { class: 'chips wrap' });
    const render = () => wrap.replaceChildren(...options.map(([v, label]) =>
      h('button', { class: `chip ${cfg[key] === v ? 'active' : ''}`, onclick: () => { cfg[key] = v; setSetting('mockCfg', cfg); render(); } }, label)));
    render();
    return wrap;
  };
  const toggle = (key, label, sub) => {
    const sw = h('button', { class: `switch ${cfg[key] ? 'on' : ''}`, role: 'switch', 'aria-checked': String(cfg[key]), 'aria-label': label });
    sw.onclick = () => { cfg[key] = !cfg[key]; sw.classList.toggle('on', cfg[key]); sw.setAttribute('aria-checked', String(cfg[key])); setSetting('mockCfg', cfg); };
    return h('div', { class: 'set-row' }, h('span', {}, label, sub ? h('small', { class: 'muted block' }, sub) : null), sw);
  };

  root.replaceChildren(
    h('section', { class: 'card mock-intro' },
      h('div', { class: 'interviewer' }, '👔'),
      h('p', {}, 'Practica como en la entrevista real: el entrevistador te hace preguntas en inglés, en orden, y respondes en voz alta con tiempo.'),
      h('p', { class: 'muted small' }, 'Orden: presentación → técnicas (DP, tus equipos, potencia) → seguridad → cierre ("Do you have any questions for us?").'),
    ),
    h('h2', { class: 'label' }, 'Duración'),
    chipGroup([[5, 'Rápida · 5'], [8, 'Completa · 8'], [10, 'Larga · 10']], 'n'),
    h('h2', { class: 'label' }, 'Tiempo por respuesta'),
    chipGroup([[1, '1 min'], [2, '2 min'], [3, '3 min']], 'minutes'),
    h('section', { class: 'card' },
      toggle('showText', 'Ver la pregunta escrita', 'Desactívalo para practicar solo escuchando, como en una llamada.'),
      toggle('record', 'Grabar mis respuestas', 'Para escucharte al final. No se guardan: se borran al salir.'),
    ),
    rateControl(),
    h('button', { class: 'btn btn-primary btn-xl', onclick: () => runMock(root, cfg) }, '🎙️ Empezar simulacro'),
    history.length ? h('h2', { class: 'label' }, 'Últimos simulacros') : null,
    history.length ? h('div', { class: 'list' }, ...history.slice(0, 5).map((r) =>
      h('div', { class: 'card hist' },
        h('strong', {}, new Date(r.date).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })),
        h('span', { class: 'muted small' }, `${r.answered}/${r.n} respondidas · ${r.score != null ? `autoevaluación ${r.score}%` : 'sin evaluar'}`),
      ))) : null,
  );
}

// ---------- Simulacro ----------

async function runMock(root, cfg) {
  const plan = await withCustomAnswers(buildPlan(cfg.n));
  const limit = cfg.minutes * 60;
  const results = plan.map((q) => ({ q, seconds: 0, answered: false, audio: null, rating: null }));
  let idx = 0;
  let timer = null;
  let stream = null;
  let recorder = null;
  let chunks = [];
  let wakeLock = null;
  let ended = false;
  let audioCtx = null;

  if (cfg.record) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (_) {
      toast('No se pudo usar el micrófono. Continúa sin grabar.');
    }
  }
  try { wakeLock = await navigator.wakeLock?.request('screen'); } catch (_) { /* no disponible */ }

  const beep = () => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = audioCtx || new AC();
      [0, 0.3].forEach((t) => {
        const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.2, audioCtx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + t + 0.25);
        o.connect(g).connect(audioCtx.destination);
        o.start(audioCtx.currentTime + t); o.stop(audioCtx.currentTime + t + 0.25);
      });
    } catch (_) { /* sin audio */ }
  };

  const stopRecording = () => new Promise((resolve) => {
    if (!recorder || recorder.state === 'inactive') return resolve(null);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/mp4' });
      resolve(blob.size ? URL.createObjectURL(blob) : null);
    };
    recorder.stop();
  });

  const cleanup = () => {
    ended = true;
    clearInterval(timer);
    stop();
    try { if (recorder && recorder.state !== 'inactive') recorder.stop(); } catch (_) { /* nada */ }
    stream?.getTracks().forEach((t) => t.stop());
    wakeLock?.release?.().catch(() => {});
    audioCtx?.close?.();
  };

  const showQuestion = () => {
    if (ended) return;
    if (idx >= plan.length) return finish();
    const r = results[idx];
    const q = r.q;
    setHeader(`Pregunta ${idx + 1} de ${plan.length}`, '#/');

    const qText = h('p', { class: 'bubble-text', hidden: !cfg.showText }, q.qEn);
    const showTextBtn = h('button', { class: 'link', hidden: cfg.showText, onclick: () => { qText.hidden = false; showTextBtn.hidden = true; } }, '👀 Mostrar la pregunta escrita');
    const esText = translationToggle(q.qEs, 'Ver en español');

    const timeEl = h('div', { class: 'timer-text' }, formatTime(limit));
    const ring = h('div', { class: 'timer-ring small-ring' }, timeEl);
    ring.style.setProperty('--p', 100);
    const recDot = h('span', { class: 'rec', hidden: true }, '● REC');

    const answerBtn = h('button', { class: 'btn btn-primary btn-xl' }, '🎙️ Responder');
    const doneBtn = h('button', { class: 'btn btn-ok btn-xl', hidden: true }, '✅ Terminé · siguiente');
    const skipBtn = h('button', { class: 'btn btn-ghost' }, '⏭ Saltar pregunta');
    const repeatBtn = h('button', { class: 'btn btn-secondary' }, '🔊 Repetir la pregunta');

    let startAt = 0;
    const next = async (answered) => {
      clearInterval(timer);
      timer = null;
      stop();
      if (answered) {
        r.answered = true;
        r.seconds = Math.min(limit, Math.round((Date.now() - startAt) / 1000));
        r.audio = await stopRecording();
      }
      idx++;
      showQuestion();
      window.scrollTo(0, 0);
    };

    answerBtn.onclick = () => {
      stop();
      answerBtn.hidden = true;
      skipBtn.hidden = true;
      doneBtn.hidden = false;
      startAt = Date.now();
      if (stream && window.MediaRecorder) {
        try {
          chunks = [];
          recorder = new MediaRecorder(stream);
          recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
          recorder.start();
          recDot.hidden = false;
        } catch (_) { recorder = null; }
      }
      timer = setInterval(() => {
        const left = Math.max(0, limit - Math.round((Date.now() - startAt) / 1000));
        timeEl.textContent = formatTime(left);
        ring.style.setProperty('--p', (left / limit) * 100);
        ring.classList.toggle('warn', left <= 20 && left > 0);
        if (left === 0) {
          clearInterval(timer);
          ring.classList.add('done');
          beep();
          toast('⏰ Tiempo');
          next(true);
        }
      }, 250);
    };
    doneBtn.onclick = () => next(true);
    skipBtn.onclick = () => next(false);
    repeatBtn.onclick = () => speak(q.qEn);

    root.replaceChildren(
      h('div', { class: 'progress' }, h('div', { class: 'progress-bar volt', style: `width:${(idx / plan.length) * 100}%` })),
      h('section', { class: 'card interview-card' },
        h('div', { class: 'row-between' },
          h('div', { class: 'interviewer small' }, '👔'),
          h('span', { class: 'tag' }, CATEGORIES[q.cat] || ''),
        ),
        h('div', { class: 'bubble' }, qText, showTextBtn),
        ...esText,
      ),
      repeatBtn,
      h('div', { class: 'answer-zone' }, ring, recDot),
      answerBtn, doneBtn, skipBtn,
    );

    const intro = idx === 0 ? 'Good morning, and thank you for joining us today. Let\'s start the interview. ' : '';
    speak(intro + q.qEn);
  };

  const finish = async () => {
    cleanup();
    speak('Thank you very much. That is the end of the interview.');
    setHeader('Resultado del simulacro', '#/');
    const answered = results.filter((r) => r.answered);
    const { game } = await recordLesson(null, { xp: answered.length * 5, correct: answered.length, total: plan.length, completed: answered.length > 0 });
    const avg = answered.length ? Math.round(answered.reduce((a, r) => a + r.seconds, 0) / answered.length) : 0;

    const history = await getSetting('mockHistory', []);
    const entry = { date: new Date().toISOString(), n: plan.length, answered: answered.length, avg, score: null };
    history.unshift(entry);
    await setSetting('mockHistory', history.slice(0, 20));

    const saveScore = async () => {
      const rated = results.filter((r) => r.rating != null);
      entry.score = rated.length ? Math.round((rated.reduce((a, r) => a + r.rating, 0) / (rated.length * 2)) * 100) : null;
      const hist = await getSetting('mockHistory', []);
      if (hist[0]?.date === entry.date) { hist[0] = entry; await setSetting('mockHistory', hist); }
    };

    const ratingRow = (r) => {
      const opts = [[0, '😟 Me costó'], [1, '🙂 Bien'], [2, '😎 Muy bien']];
      const wrap = h('div', { class: 'chips wrap rating' });
      const render = () => wrap.replaceChildren(...opts.map(([v, label]) =>
        h('button', { class: `chip ${r.rating === v ? 'active' : ''}`, onclick: () => { r.rating = v; render(); saveScore(); } }, label)));
      render();
      return wrap;
    };

    root.replaceChildren(
      h('section', { class: 'card center result' },
        h('div', { class: 'result-icon' }, '🎙️'),
        h('h2', {}, '¡Simulacro terminado!'),
        h('div', { class: 'result-stats' },
          h('div', {}, h('b', {}, `${answered.length}/${plan.length}`), h('span', {}, 'respondidas')),
          h('div', {}, h('b', {}, formatTime(avg)), h('span', {}, 'promedio')),
          h('div', {}, h('b', {}, `+${answered.length * 5}`), h('span', {}, `XP · 🔥 ${game.streak}`)),
        ),
      ),
      h('p', { class: 'muted small' }, 'Califica cada respuesta, escúchate si grabaste y compara con la respuesta modelo. Consejo: una buena respuesta dura entre 45 segundos y 2 minutos.'),
      ...results.map((r, i) => {
        const model = h('div', { class: 'model', hidden: true },
          h('p', { class: 'answer-en' }, r.q.aEn),
          ...translationToggle(r.q.aEs),
          r.q.kp?.length ? h('ul', { class: 'steps' }, ...r.q.kp.map((k) => h('li', {}, k))) : null,
          speakButton('Escuchar respuesta modelo', () => r.q.aEn),
        );
        const toggleBtn = h('button', { class: 'link', onclick: () => { model.hidden = !model.hidden; toggleBtn.textContent = model.hidden ? '📖 Ver respuesta modelo' : '🙈 Ocultar respuesta modelo'; } }, '📖 Ver respuesta modelo');
        return h('section', { class: 'card' },
          h('div', { class: 'row-between' },
            h('span', { class: 'label' }, `Pregunta ${i + 1}`),
            h('span', { class: `tag ${r.answered ? 'tag-ok' : ''}` }, r.answered ? `⏱ ${formatTime(r.seconds)}` : 'Saltada'),
          ),
          h('p', { class: 'q-en' }, r.q.qEn),
          r.audio ? h('audio', { controls: true, src: r.audio, preload: 'metadata', class: 'rec-audio' }) : null,
          r.answered ? ratingRow(r) : null,
          toggleBtn,
          model,
          h('a', { class: 'link', href: `#/entrevistas/q/${r.q.id}/editar` }, '✏️ Editar mi respuesta'),
        );
      }),
      h('button', { class: 'btn btn-primary btn-xl', onclick: () => { viewSetup(root); window.scrollTo(0, 0); } }, '🔁 Otro simulacro'),
      h('a', { class: 'btn btn-secondary', href: '#/' }, '← Inicio'),
    );
  };

  showQuestion();
  // Limpieza al salir de la pantalla (el router llama a esta función).
  mockCleanup = () => {
    cleanup();
    results.forEach((r) => { if (r.audio) URL.revokeObjectURL(r.audio); });
  };
}

let mockCleanup = null;

export async function mockRoute(root) {
  mockCleanup = null;
  await viewSetup(root);
  return () => { mockCleanup?.(); mockCleanup = null; };
}
