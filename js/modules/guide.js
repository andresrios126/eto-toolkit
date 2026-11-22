// Módulo Guía visual: diagramas de referencia con explicación y términos para escuchar.

import { DIAGRAMS } from '../data/diagrams.js';
import { speak } from '../speech.js';
import { h, setHeader } from '../ui.js';
import { rateControl } from '../components.js';

function viewList(root) {
  setHeader('Guía visual', '#/');
  root.replaceChildren(
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

function viewDetail(root, id) {
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

export async function guideRoute(root, parts) {
  if (parts[0] === 'd' && parts[1]) return viewDetail(root, parts[1]);
  return viewList(root);
}
