// Módulo Guía visual: diagramas de referencia con explicación y términos para escuchar.

import { DIAGRAMS } from '../data/diagrams.js';
import { speak } from '../speech.js';
import { h, setHeader } from '../ui.js';
import { rateControl } from '../components.js';
import { COURSE_UNITS, COURSE_ASSESSMENT } from '../data/kpos-course.js';
import { QUESTIONS } from '../data/questions.js';
import { runLesson, mc, shuffle } from './game.js';
import { getSetting, setSetting } from '../db.js';


async function viewList(root) {
  setHeader('Guía visual', '#/');
  root.replaceChildren(
    h('a', { class: 'hero course-hero', href: '#/guia/curso' },
      h('span', { class: 'hero-bolt', 'aria-hidden': 'true' }, '📚'),
      h('span', { class: 'hero-text' }, h('small', {}, 'Guía de estudio'), h('strong', {}, 'Curso K-Pos (mantenimiento DP)')),
      h('span', { class: 'hero-go' }, '▶')),
    h('p', { class: 'muted center small' }, 'Diagramas de referencia para entender y explicar los sistemas en inglés.'),
    h('div', { class: 'grid2' },
      ...DIAGRAMS.map((d) =>
        h('a', { class: 'card guide-card', href: `#/guia/d/${d.id}` },
          h('div', { class: 'guide-thumb', html: d.svg || '<div class="thumb-table">▦</div>' }),
          h('strong', {}, d.title),
          h('span', { class: 'muted small' }, d.titleEn),
        )
      )
    ),
    h('a', { class: 'btn btn-secondary', href: '#/glosario/cat/dpterm' }, '🎯 Terminología DP en el glosario'),
  );
}

async function viewDetail(root, id) {
  const i = DIAGRAMS.findIndex((d) => d.id === id);
  const d = DIAGRAMS[i];
  if (!d) { location.hash = '#/guia'; return; }
  setHeader(d.title, '#/guia');
  const prev = DIAGRAMS[i - 1];
  const next = DIAGRAMS[i + 1];

  root.replaceChildren(
    h('section', { class: 'card diagram' },
      h('h2', { class: 'label' }, d.titleEn),
      h('div', { class: 'diagram-body', html: d.svg || d.html }),
    ),
    h('section', { class: 'card' }, ...d.explain.map((p) => h('p', { html: p }))),
    d.terms?.length ? h('section', { class: 'card' },
      h('h2', { class: 'label' }, '🔊 Términos clave (toca para escuchar)'),
      h('div', { class: 'term-chips' },
        ...d.terms.map(([en, es]) => h('button', { class: 'term-chip', onclick: () => speak(en) }, h('b', {}, en), h('span', {}, es))),
      ),
    ) : null,
    rateControl(),
    h('div', { class: 'btn-row' },
      prev ? h('a', { class: 'btn btn-ghost', href: `#/guia/d/${prev.id}` }, '← Anterior') : h('span'),
      next ? h('a', { class: 'btn btn-ghost', href: `#/guia/d/${next.id}` }, 'Siguiente →') : h('span'),
    ),
  );
}


// ---------- Curso K-Pos ----------

const diagramById = (id) => DIAGRAMS.find((d) => d.id === id);

async function viewCourse(root) {
  setHeader('Curso K-Pos', '#/guia');
  const done = await getSetting('kposCourse', {});
  root.replaceChildren(
    h('section', { class: 'card' },
      h('h2', {}, '📚 Curso K-Pos (mantenimiento DP)'),
      h('p', { class: 'muted small' }, 'Guía de estudio organizada como un curso de mantenimiento: cada unidad tiene un resumen, diagramas y preguntas de entrevista. Al final, una evaluación tipo test.'),
      done.best != null ? h('p', { class: 'small' }, `🏅 Mejor nota en la evaluación: ${done.best}%`) : null,
    ),
    h('div', { class: 'list' }, ...COURSE_UNITS.map((u, i) => h('a', { class: 'term-row', href: `#/guia/curso/${u.id}` },
      h('span', { class: 'term-main' }, h('strong', {}, `${u.icon} ${i + 1}. ${u.title}`), h('span', { class: 'muted' }, `${u.diagrams.length} diagrama${u.diagrams.length === 1 ? '' : 's'} · ${u.questions.length} pregunta${u.questions.length === 1 ? '' : 's'}`)),
      h('span', {}, done.units?.[u.id] ? '✓' : '›')))),
    h('a', { class: 'btn btn-primary btn-xl', href: '#/guia/curso/evaluacion' }, '📝 Evaluación final (20 preguntas)'),
    h('a', { class: 'btn btn-secondary', href: '#/glosario/cat/kpos' }, '📖 Términos K-Pos en el glosario'),
  );
}

async function viewUnit(root, id) {
  const i = COURSE_UNITS.findIndex((u) => u.id === id);
  const u = COURSE_UNITS[i];
  if (!u) { location.hash = '#/guia/curso'; return; }
  setHeader(u.title, '#/guia/curso');
  const done = await getSetting('kposCourse', {});
  done.units = { ...(done.units || {}), [u.id]: true };
  await setSetting('kposCourse', done);
  const next = COURSE_UNITS[i + 1];
  root.replaceChildren(
    h('section', { class: 'card' },
      h('h2', {}, `${u.icon} ${u.title}`),
      h('ul', { class: 'steps' }, ...u.summary.map((t) => h('li', {}, t))),
    ),
    h('h2', { class: 'label' }, '🧭 Diagramas'),
    h('div', { class: 'grid2' }, ...u.diagrams.map(diagramById).filter(Boolean).map((d) =>
      h('a', { class: 'card guide-card', href: `#/guia/d/${d.id}` },
        h('div', { class: 'guide-thumb', html: d.svg || '<div class="thumb-table">▦</div>' }),
        h('strong', {}, d.title)))),
    h('h2', { class: 'label' }, '🎤 Preguntas de entrevista'),
    h('div', { class: 'list' }, ...u.questions.map((qid) => QUESTIONS.find((q) => q.id === qid)).filter(Boolean).map((q) =>
      h('a', { class: 'card q-card', href: `#/entrevistas/q/${q.id}` }, h('p', { class: 'q-en' }, q.qEn), h('p', { class: 'q-es muted' }, q.qEs)))),
    h('a', { class: 'btn btn-primary', href: '#/guia/curso/evaluacion' }, '📝 Hacer la evaluación'),
    next ? h('a', { class: 'btn btn-ghost', href: `#/guia/curso/${next.id}` }, `Siguiente unidad: ${next.title} →`) : null,
  );
}

function viewAssessment(root) {
  setHeader('Evaluación K-Pos', '#/guia/curso');
  return runLesson(root, {
    title: 'Evaluación K-Pos', backHash: '#/guia/curso', backLabel: '📚 Volver al curso', noLives: true,
    build: async () => shuffle(COURSE_ASSESSMENT).map(([q, ok, wrong, unit]) =>
      mc('Evaluación K-Pos', ok, wrong, { text: q, textLang: 'en', say: q, kind: `📝 ${COURSE_UNITS.find((u) => u.id === unit)?.title || ''}`, optLang: 'en', small: true })),
    record: async ({ correct, total, completed }) => {
      const pct = Math.round((correct / total) * 100);
      const done = await getSetting('kposCourse', {});
      done.best = Math.max(done.best || 0, pct);
      await setSetting('kposCourse', done);
      const stars = !completed ? 0 : pct >= 90 ? 3 : pct >= 70 ? 2 : 1;
      return { stars, third: [`${pct}%`, 'nota'] };
    },
  });
}

export async function guideRoute(root, parts) {
  if (parts[0] === 'curso' && parts[1] === 'evaluacion') return viewAssessment(root);
  if (parts[0] === 'curso' && parts[1]) return viewUnit(root, parts[1]);
  if (parts[0] === 'curso') return viewCourse(root);
  if (parts[0] === 'd' && parts[1]) return viewDetail(root, parts[1]);
  return viewList(root);
}
