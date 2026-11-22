// Módulo Fallas: casos de estudio de troubleshooting y casos propios.

import { FAULTS, FAULT_SYSTEMS } from '../data/faults.js';
import { db, getSetting, setSetting } from '../db.js';
import { h, toast, setHeader } from '../ui.js';
import { rateControl, speakButton, translationToggle } from '../components.js';

async function loadAll() {
  const custom = (await db.getAll('faults')).map((f) => ({ ...f, sys: 'custom', custom: true }));
  return [...FAULTS, ...custom];
}

async function getFault(id) {
  return (await loadAll()).find((f) => f.id === id) || null;
}

const list = (items, ordered = false) =>
  h(ordered ? 'ol' : 'ul', { class: 'steps' }, ...items.map((t) => h('li', {}, t)));

// ---------- Lista ----------

async function viewList(root) {
  setHeader('Fallas', '#/');
  const all = await loadAll();
  let filter = await getSetting('faultFilter', 'all');

  const chips = h('div', { class: 'chips' });
  const listEl = h('div', { class: 'list' });

  const renderChips = () => chips.replaceChildren(
    ...[['all', 'Todas'], ...Object.entries(FAULT_SYSTEMS)].map(([k, label]) =>
      h('button', { class: `chip ${filter === k ? 'active' : ''}`, onclick: () => { filter = k; setSetting('faultFilter', k); renderChips(); renderList(); } }, label))
  );

  const renderList = () => {
    const items = all.filter((f) => filter === 'all' || f.sys === filter);
    if (!items.length) {
      listEl.replaceChildren(h('p', { class: 'muted center' }, filter === 'custom' ? 'Aún no agregaste casos propios. Agrega las fallas que resolviste: te servirán para contar tu experiencia en la entrevista.' : 'No hay casos.'));
      return;
    }
    listEl.replaceChildren(...items.map((f) =>
      h('a', { class: 'card q-card', href: `#/fallas/c/${encodeURIComponent(f.id)}` },
        h('div', { class: 'q-meta' }, h('span', { class: 'tag' }, FAULT_SYSTEMS[f.sys] || 'Falla')),
        h('p', { class: 'q-en' }, f.titleEn),
        h('p', { class: 'q-es muted' }, f.titleEs),
      )
    ));
  };

  renderChips();
  renderList();

  root.replaceChildren(
    h('a', { class: 'btn btn-primary btn-xl', href: '#/juego/leccion/f-cause' }, '🎮 Practicar diagnóstico'),
    h('p', { class: 'muted small center' }, 'Cada caso explica síntoma, causas, pasos y cómo contarlo en inglés en la entrevista.'),
    chips,
    h('div', { class: 'row-between' },
      h('span', { class: 'muted small' }, `${all.length} casos`),
      h('a', { class: 'link', href: '#/fallas/nuevo' }, '➕ Agregar mi caso'),
    ),
    listEl,
  );
}

// ---------- Detalle ----------

async function viewDetail(root, id) {
  const f = await getFault(id);
  if (!f) { location.hash = '#/fallas'; return; }
  setHeader(FAULT_SYSTEMS[f.sys] || 'Falla', '#/fallas');

  root.replaceChildren(
    h('section', { class: 'card' },
      h('p', { class: 'big-en' }, f.titleEn),
      h('p', { class: 'es' }, f.titleEs),
      speakButton('Escuchar título', () => f.titleEn),
    ),
    f.symptom ? h('section', { class: 'card' }, h('h2', { class: 'label' }, '🚨 Síntoma'), h('p', {}, f.symptom)) : null,
    f.causes?.length ? h('section', { class: 'card' }, h('h2', { class: 'label' }, '🔍 Causas posibles'), list(f.causes)) : null,
    f.steps?.length ? h('section', { class: 'card' }, h('h2', { class: 'label' }, '🛠️ Pasos de diagnóstico'), list(f.steps, true)) : null,
    f.fix ? h('section', { class: 'card fix' }, h('h2', { class: 'label' }, '✅ Solución'), h('p', {}, f.fix)) : null,
    f.explainEn ? h('section', { class: 'card' },
      h('h2', { class: 'label' }, '🎤 Cómo contarlo en la entrevista'),
      h('p', { class: 'answer-en' }, f.explainEn),
      ...(f.explainEs ? translationToggle(f.explainEs) : []),
      speakButton('Escuchar en inglés', () => f.explainEn),
    ) : null,
    rateControl(),
    f.custom ? h('a', { class: 'btn btn-ghost', href: `#/fallas/c/${encodeURIComponent(f.id)}/editar` }, '✏️ Editar mi caso') : null,
  );
}

// ---------- Editar / nuevo ----------

async function viewEdit(root, id) {
  const isNew = !id;
  const f = isNew ? { id: `cf-${Date.now().toString(36)}`, causes: [], steps: [] } : await getFault(id);
  if (!f || (!isNew && !f.custom)) { location.hash = '#/fallas'; return; }
  setHeader(isNew ? 'Nuevo caso' : 'Editar caso', isNew ? '#/fallas' : `#/fallas/c/${encodeURIComponent(f.id)}`);

  const fields = {};
  const field = (key, label, value, { rows, placeholder } = {}) => {
    const el = rows ? h('textarea', { class: 'input textarea', rows }) : h('input', { class: 'input', type: 'text' });
    el.value = value || '';
    if (placeholder) el.placeholder = placeholder;
    fields[key] = el;
    return [h('label', { class: 'label' }, label), el];
  };

  const save = async () => {
    const v = (k) => fields[k].value.trim();
    const lines = (k) => v(k).split('\n').map((s) => s.replace(/^[-•\d.)\s]+/, '').trim()).filter(Boolean);
    const data = {
      id: f.id, titleEn: v('titleEn'), titleEs: v('titleEs'), symptom: v('symptom'),
      causes: lines('causes'), steps: lines('steps'), fix: v('fix'),
      explainEn: v('explainEn'), explainEs: v('explainEs'), updatedAt: new Date().toISOString(),
    };
    if (!data.titleEn && !data.titleEs) { toast('Escribe al menos un título'); return; }
    await db.put('faults', data);
    toast('✅ Caso guardado');
    location.hash = `#/fallas/c/${encodeURIComponent(f.id)}`;
  };

  const remove = async () => {
    if (!confirm('¿Borrar este caso?')) return;
    await db.delete('faults', f.id);
    toast('Caso borrado');
    location.hash = '#/fallas';
  };

  root.replaceChildren(
    h('p', { class: 'muted small' }, 'Describe una falla real que resolviste. Es la mejor preparación para "Tell me about a difficult fault you solved".'),
    ...field('titleEn', '🇬🇧 Título en inglés', f.titleEn, { placeholder: 'e.g. Bow thruster tripped on earth fault' }),
    ...field('titleEs', '🇪🇸 Título en español', f.titleEs),
    ...field('symptom', '🚨 Síntoma', f.symptom, { rows: 3 }),
    ...field('causes', '🔍 Causas posibles (una por línea)', (f.causes || []).join('\n'), { rows: 4 }),
    ...field('steps', '🛠️ Pasos de diagnóstico (uno por línea)', (f.steps || []).join('\n'), { rows: 5 }),
    ...field('fix', '✅ Solución', f.fix, { rows: 3 }),
    ...field('explainEn', '🎤 Cómo lo contarías en inglés', f.explainEn, { rows: 5, placeholder: 'On my last vessel, ...' }),
    ...field('explainEs', '🇪🇸 Traducción', f.explainEs, { rows: 4 }),
    speakButton('Escuchar mi versión en inglés', () => fields.explainEn.value),
    h('button', { class: 'btn btn-primary btn-xl', onclick: save }, '💾 Guardar'),
    !isNew ? h('button', { class: 'btn btn-danger', onclick: remove }, '🗑 Borrar caso') : null,
  );
}

export async function faultsRoute(root, parts) {
  if (parts[0] === 'nuevo') return viewEdit(root, null);
  if (parts[0] === 'c' && parts[1] && parts[2] === 'editar') return viewEdit(root, parts[1]);
  if (parts[0] === 'c' && parts[1]) return viewDetail(root, parts[1]);
  return viewList(root);
}
