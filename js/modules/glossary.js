// Módulo 2: Glosario técnico EN ↔ ES con tarjetas de estudio.

import { TERMS, GLOSSARY_CATEGORIES as CATS } from '../data/glossary.js';
import { db, getSetting, setSetting } from '../db.js';
import { stop } from '../speech.js';
import { h, toast, setHeader } from '../ui.js';
import { rateControl, speakButton } from '../components.js';

// ---------- Datos ----------

// Une los términos incluidos con lo guardado por el usuario (favoritos, "lo sé", ediciones y términos propios).
async function loadTerms() {
  const rows = await db.getAll('glossary');
  const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
  const builtins = TERMS.map((t) => {
    const r = byId[t.id];
    if (!r) return { ...t, fav: false, known: false, edited: false };
    return {
      ...t,
      ...(r.edited ? { en: r.en, es: r.es, def: r.def, ex: r.ex, cat: r.cat || t.cat } : {}),
      fav: Boolean(r.fav),
      known: Boolean(r.known),
      edited: Boolean(r.edited),
    };
  });
  const customs = rows
    .filter((r) => r.custom)
    .map((r) => ({ ...r, builtin: false, fav: Boolean(r.fav), known: Boolean(r.known) }))
    .sort((a, b) => a.en.localeCompare(b.en));
  return [...builtins, ...customs];
}

async function getTerm(id) {
  return (await loadTerms()).find((t) => t.id === id) || null;
}

// Guarda solo los campos que cambian, conservando lo demás.
async function patchTerm(term, patch) {
  const current = (await db.get('glossary', term.id)) || { id: term.id };
  if (term.custom) Object.assign(current, { custom: true, en: term.en, es: term.es, def: term.def, ex: term.ex, cat: 'custom' });
  await db.put('glossary', { ...current, ...patch, updatedAt: new Date().toISOString() });
}

const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Lista ----------

async function viewList(root) {
  setHeader('Glosario', '#/');
  const terms = await loadTerms();
  let filter = await getSetting('glossaryFilter', 'all');
  let search = '';

  const known = terms.filter((t) => t.known).length;
  const list = h('div', { class: 'list' });
  const chips = h('div', { class: 'chips' });
  const countEl = h('p', { class: 'muted small' });

  const filters = [
    ['all', 'Todos'],
    ['fav', '⭐ Favoritos'],
    ['pending', '📌 Por aprender'],
    ...Object.entries(CATS),
  ];

  const renderChips = () => {
    chips.replaceChildren(
      ...filters.map(([key, label]) =>
        h('button', {
          class: `chip ${filter === key ? 'active' : ''}`,
          onclick: () => { filter = key; setSetting('glossaryFilter', key); renderChips(); renderList(); },
        }, label)
      )
    );
  };

  const matches = (t) => {
    if (filter === 'fav' && !t.fav) return false;
    if (filter === 'pending' && t.known) return false;
    if (CATS[filter] && t.cat !== filter) return false;
    if (!search) return true;
    return norm(`${t.en} ${t.es} ${t.def}`).includes(norm(search.trim()));
  };

  const renderList = () => {
    const items = terms.filter(matches);
    countEl.textContent = `${items.length} término${items.length === 1 ? '' : 's'}`;
    if (!items.length) {
      list.replaceChildren(h('p', { class: 'muted center' },
        filter === 'custom' && !search ? 'Aún no agregaste términos propios.' : 'No hay términos que coincidan.'));
      return;
    }
    list.replaceChildren(
      ...items.map((t) =>
        h('a', { class: 'term-row', href: `#/glosario/t/${encodeURIComponent(t.id)}` },
          h('span', { class: 'term-main' },
            h('strong', {}, t.en),
            h('span', { class: 'muted' }, t.es),
          ),
          h('span', { class: 'term-flags' },
            t.fav ? '⭐' : '',
            t.known ? h('span', { class: 'ok' }, '✓') : '',
          ),
        )
      )
    );
  };

  const searchInput = h('input', {
    type: 'search', class: 'input', placeholder: 'Buscar en inglés o español…', 'aria-label': 'Buscar',
    oninput: (e) => { search = e.target.value; renderList(); },
  });

  renderChips();
  renderList();

  root.replaceChildren(
    h('a', { class: 'btn btn-primary btn-xl', href: '#/glosario/tarjetas' }, '🃏 Estudiar con tarjetas'),
    h('div', { class: 'progress', 'aria-label': 'Progreso' },
      h('div', { class: 'progress-bar', style: `width:${(known / terms.length) * 100}%` }),
    ),
    h('p', { class: 'muted center small' }, `Sabes ${known} de ${terms.length} términos.`),
    searchInput,
    chips,
    h('div', { class: 'row-between' },
      countEl,
      h('a', { class: 'link', href: '#/glosario/nuevo' }, '➕ Agregar término'),
    ),
    list,
  );
}

// ---------- Detalle ----------

async function viewDetail(root, id) {
  const t = await getTerm(id);
  if (!t) { location.hash = '#/glosario'; return; }
  setHeader(CATS[t.cat] || 'Glosario', '#/glosario');

  const favBtn = h('button', { class: 'btn btn-secondary' });
  const knownBtn = h('button', { class: 'btn btn-secondary' });
  const paint = () => {
    favBtn.textContent = t.fav ? '⭐ En favoritos' : '☆ Agregar a favoritos';
    knownBtn.textContent = t.known ? '✅ Ya lo sé' : '📌 Marcar como aprendido';
    knownBtn.classList.toggle('is-ok', t.known);
  };
  favBtn.onclick = async () => { t.fav = !t.fav; await patchTerm(t, { fav: t.fav }); paint(); };
  knownBtn.onclick = async () => { t.known = !t.known; await patchTerm(t, { known: t.known }); paint(); };
  paint();

  const editHref = `#/glosario/t/${encodeURIComponent(t.id)}/editar`;

  root.replaceChildren(
    rateControl(),
    h('section', { class: 'card' },
      h('p', { class: 'term-big' }, t.en),
      h('p', { class: 'es' }, t.es),
      speakButton('Escuchar término', () => t.en),
    ),
    t.def ? h('section', { class: 'card' },
      h('h2', { class: 'label' }, 'Definition'),
      h('p', { class: 'answer-en' }, t.def),
      speakButton('Escuchar definición', () => `${t.en}. ${t.def}`),
    ) : null,
    t.ex ? h('section', { class: 'card' },
      h('h2', { class: 'label' }, 'Example'),
      h('p', { class: 'answer-en example' }, `“${t.ex}”`),
      speakButton('Escuchar ejemplo', () => t.ex),
    ) : null,
    h('div', { class: 'btn-row' }, favBtn, knownBtn),
    h('a', { class: 'btn btn-ghost', href: editHref }, '✏️ Editar'),
  );
}

// ---------- Editar / nuevo ----------

async function viewEdit(root, id) {
  const isNew = !id;
  const t = isNew
    ? { id: `c-${Date.now().toString(36)}`, custom: true, cat: 'custom', en: '', es: '', def: '', ex: '' }
    : await getTerm(id);
  if (!t) { location.hash = '#/glosario'; return; }
  const original = TERMS.find((x) => x.id === t.id);
  const backHash = isNew ? '#/glosario' : `#/glosario/t/${encodeURIComponent(t.id)}`;
  setHeader(isNew ? 'Nuevo término' : 'Editar término', backHash);

  const field = (label, value, opts = {}) => {
    const el = opts.multiline
      ? h('textarea', { class: 'input textarea', rows: opts.rows || 3 })
      : h('input', { class: 'input', type: 'text', autocapitalize: 'off' });
    el.value = value || '';
    if (opts.placeholder) el.placeholder = opts.placeholder;
    return [h('label', { class: 'label' }, label), el];
  };

  const [enL, en] = field('🇬🇧 Término en inglés *', t.en, { placeholder: 'e.g. slip ring' });
  const [esL, es] = field('🇪🇸 Traducción al español *', t.es, { placeholder: 'p. ej. anillo rozante' });
  const [defL, def] = field('Definición (en inglés sencillo)', t.def, { multiline: true, rows: 3 });
  const [exL, ex] = field('Ejemplo de uso (en inglés)', t.ex, { multiline: true, rows: 2 });

  const save = async () => {
    const data = { en: en.value.trim(), es: es.value.trim(), def: def.value.trim(), ex: ex.value.trim() };
    if (!data.en || !data.es) { toast('Escribe el término en inglés y en español'); return; }
    const current = (await db.get('glossary', t.id)) || { id: t.id };
    if (t.custom) Object.assign(current, { custom: true, cat: 'custom', ...data });
    else Object.assign(current, { edited: true, cat: t.cat, ...data });
    current.updatedAt = new Date().toISOString();
    await db.put('glossary', current);
    toast('✅ Guardado');
    location.hash = `#/glosario/t/${encodeURIComponent(t.id)}`;
  };

  const remove = async () => {
    if (!confirm(`¿Borrar el término "${t.en}"?`)) return;
    await db.delete('glossary', t.id);
    toast('Término borrado');
    location.hash = '#/glosario';
  };

  const restore = async () => {
    if (!confirm('¿Volver al texto original de este término?')) return;
    const current = await db.get('glossary', t.id);
    if (current) {
      const { fav, known } = current;
      await db.put('glossary', { id: t.id, fav, known, updatedAt: new Date().toISOString() });
    }
    toast('Texto original restaurado');
    location.hash = `#/glosario/t/${encodeURIComponent(t.id)}`;
  };

  root.replaceChildren(
    enL, en, esL, es, defL, def, exL, ex,
    h('button', { class: 'btn btn-primary btn-xl', onclick: save }, '💾 Guardar'),
    t.custom && !isNew ? h('button', { class: 'btn btn-danger', onclick: remove }, '🗑 Borrar término') : null,
    !t.custom && t.edited && original ? h('button', { class: 'btn btn-danger', onclick: restore }, '↺ Restaurar original') : null,
  );
  if (isNew) setTimeout(() => en.focus(), 50);
}

// ---------- Tarjetas (flashcards) ----------

async function viewCards(root) {
  setHeader('Tarjetas', '#/glosario');
  const terms = await loadTerms();

  let deck = await getSetting('cardsDeck', 'pending');
  let dir = await getSetting('cardsDir', 'en-es');
  let size = await getSetting('cardsSize', 20);

  const decks = [
    ['pending', '📌 Por aprender'],
    ['all', 'Todos'],
    ['fav', '⭐ Favoritos'],
    ...Object.entries(CATS),
  ];

  const pool = () => terms.filter((t) => {
    if (deck === 'pending') return !t.known;
    if (deck === 'fav') return t.fav;
    if (CATS[deck]) return t.cat === deck;
    return true;
  });

  const chipGroup = (options, get, set) => {
    const wrap = h('div', { class: 'chips wrap' });
    const render = () => wrap.replaceChildren(
      ...options.map(([key, label]) =>
        h('button', { class: `chip ${get() === key ? 'active' : ''}`, onclick: () => { set(key); render(); renderInfo(); } }, label)
      )
    );
    render();
    return wrap;
  };

  const info = h('p', { class: 'muted center' });
  const startBtn = h('button', { class: 'btn btn-primary btn-xl' }, '▶︎ Empezar');
  const renderInfo = () => {
    const n = pool().length;
    const take = size === 'all' ? n : Math.min(n, size);
    info.textContent = n ? `${take} tarjeta${take === 1 ? '' : 's'} de ${n} disponibles` : 'No hay términos en este grupo.';
    startBtn.disabled = !n;
  };
  renderInfo();

  startBtn.onclick = () => {
    const p = shuffle(pool());
    runSession(root, size === 'all' ? p : p.slice(0, size), dir);
  };

  root.replaceChildren(
    h('h2', { class: 'label' }, 'Grupo'),
    chipGroup(decks, () => deck, (v) => { deck = v; setSetting('cardsDeck', v); }),
    h('h2', { class: 'label' }, 'Dirección'),
    chipGroup([['en-es', '🇬🇧 → 🇪🇸 Inglés a español'], ['es-en', '🇪🇸 → 🇬🇧 Español a inglés']], () => dir, (v) => { dir = v; setSetting('cardsDir', v); }),
    h('h2', { class: 'label' }, 'Cantidad'),
    chipGroup([[10, '10'], [20, '20'], [50, '50'], ['all', 'Todas']], () => size, (v) => { size = v; setSetting('cardsSize', v); }),
    info,
    startBtn,
    h('p', { class: 'muted small center' }, 'Las tarjetas que marques "Repasar" vuelven a salir al final de la sesión.'),
  );
}

function runSession(root, cards, dir) {
  const queue = cards.map((t) => ({ t, retried: false }));
  const total = cards.length;
  const results = new Map(); // id -> true (lo sé) | false (repasar)
  let flipped = false;

  const next = () => {
    stop();
    if (!queue.length) return summary();
    flipped = false;
    render();
  };

  const answer = async (knows) => {
    const item = queue.shift();
    const { t } = item;
    if (!results.has(t.id) || knows === false) results.set(t.id, knows);
    t.known = knows;
    await patchTerm(t, { known: knows });
    if (!knows && !item.retried) queue.push({ t, retried: true });
    next();
  };

  const render = () => {
    const { t } = queue[0];
    const done = results.size;
    const frontEn = dir === 'en-es';

    const front = h('div', { class: 'flash-front' },
      h('span', { class: 'label' }, frontEn ? 'English' : 'Español'),
      h('p', { class: 'term-big center' }, frontEn ? t.en : t.es),
    );

    const back = h('div', { class: 'flash-back', hidden: !flipped },
      h('hr'),
      h('span', { class: 'label' }, frontEn ? 'Español' : 'English'),
      h('p', { class: 'term-big center accent' }, frontEn ? t.es : t.en),
      t.def ? h('p', { class: 'small' }, t.def) : null,
      t.ex ? h('p', { class: 'small muted example' }, `“${t.ex}”`) : null,
    );

    const card = h('button', { class: 'card flashcard', 'aria-label': 'Voltear tarjeta' }, front, back);
    card.onclick = () => { if (!flipped) flip(); };

    const showBtn = h('button', { class: 'btn btn-secondary btn-xl', hidden: flipped }, '👆 Mostrar respuesta');
    const answerRow = h('div', { class: 'btn-row', hidden: !flipped },
      h('button', { class: 'btn btn-review btn-xl', onclick: () => answer(false) }, '🔁 Repasar'),
      h('button', { class: 'btn btn-ok btn-xl', onclick: () => answer(true) }, '✅ Lo sé'),
    );

    function flip() {
      flipped = true;
      back.hidden = false;
      showBtn.hidden = true;
      answerRow.hidden = false;
      answerRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    showBtn.onclick = flip;

    root.replaceChildren(
      h('div', { class: 'row-between' },
        h('span', { class: 'muted small' }, `${Math.min(done + 1, total)} / ${total}${queue[0].retried ? ' · repaso' : ''}`),
        h('button', { class: 'link', onclick: () => { if (confirm('¿Terminar la sesión?')) summary(); } }, 'Terminar'),
      ),
      h('div', { class: 'progress' }, h('div', { class: 'progress-bar', style: `width:${(done / total) * 100}%` })),
      card,
      showBtn,
      answerRow,
      speakButton('Escuchar en inglés', () => (t.ex && flipped ? [t.en, t.ex] : t.en)),
      rateControl(),
    );
  };

  const summary = () => {
    stop();
    const ok = [...results.values()].filter(Boolean).length;
    const failed = cards.filter((t) => results.get(t.id) === false);
    setHeader('Resultado', '#/glosario');
    root.replaceChildren(
      h('section', { class: 'card center' },
        h('div', { class: 'soon-icon' }, ok === results.size && ok > 0 ? '🏆' : '📚'),
        h('h2', {}, `${ok} de ${results.size} correctas`),
        h('p', { class: 'muted' }, failed.length ? 'Estos términos necesitan repaso:' : '¡Excelente! Sigue así.'),
        failed.length ? h('ul', { class: 'fail-list' }, ...failed.map((t) => h('li', {}, h('strong', {}, t.en), ` — ${t.es}`))) : null,
      ),
      failed.length ? h('button', { class: 'btn btn-primary btn-xl', onclick: () => { setHeader('Tarjetas', '#/glosario'); runSession(root, shuffle(failed), dir); } }, '🔁 Repasar las falladas') : null,
      h('button', { class: 'btn btn-secondary btn-xl', onclick: () => { viewCards(root); window.scrollTo(0, 0); } }, '🃏 Nueva sesión'),
      h('a', { class: 'btn btn-ghost', href: '#/glosario' }, '← Volver al glosario'),
    );
  };

  next();
}

// ---------- Router del módulo ----------

export async function glossaryRoute(root, parts) {
  // parts: [] | ['tarjetas'] | ['nuevo'] | ['t', id] | ['t', id, 'editar']
  if (parts[0] === 'tarjetas') return viewCards(root);
  if (parts[0] === 'nuevo') return viewEdit(root, null);
  if (parts[0] === 't' && parts[1] && parts[2] === 'editar') return viewEdit(root, parts[1]);
  if (parts[0] === 't' && parts[1]) return viewDetail(root, parts[1]);
  return viewList(root);
}
