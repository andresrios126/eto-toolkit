// "Mis imágenes": fotos o capturas propias para estudiar (por ejemplo, diapositivas de cursos).
// Se guardan SOLO en el dispositivo (IndexedDB) y en el respaldo; nunca se publican en la web.

import { db, importBackup } from '../db.js';
import { h, toast, setHeader } from '../ui.js';

export const IMAGE_TOPICS = {
  dp: 'DP / K-Pos',
  sensors: 'Sensores y referencias',
  network: 'Red y comunicación',
  power: 'Potencia y propulsión',
  other: 'Otros',
};

const MAX_SIDE = 1600;

// Reduce la imagen para no llenar el teléfono (las fotos del iPhone pesan varios MB).
async function fileToDataUrl(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('No se pudo leer la imagen'));
      i.src = url;
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const hgt = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = hgt;
    canvas.getContext('2d').drawImage(img, 0, 0, w, hgt);
    return { data: canvas.toDataURL('image/jpeg', 0.85), w, h: hgt };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function getImages(topics) {
  const all = (await db.getAll('images')).sort((a, b) => (a.title || '').localeCompare(b.title || '', 'es', { numeric: true }));
  return topics ? all.filter((i) => topics.includes(i.topic)) : all;
}

// Tira de miniaturas para mostrar en otras pantallas (preguntas DP, diagramas…).
// Si hay imágenes vinculadas a esta pantalla (refs), se muestran primero.
export async function imageStrip(topics, title = '📷 Tus imágenes', refId = null) {
  const all = await getImages();
  const linked = refId ? all.filter((i) => i.refs?.includes(refId)) : [];
  const imgs = linked.length ? linked : all.filter((i) => topics.includes(i.topic));
  if (!imgs.length) return null;
  return h('section', { class: 'card' },
    h('h2', { class: 'label' }, linked.length ? '📷 Imágenes de este tema' : title),
    h('div', { class: 'img-strip' }, ...imgs.slice(0, 12).map((i) =>
      h('a', { href: `#/guia/img/${i.id}`, class: 'img-thumb' }, h('img', { src: i.data, alt: i.title || '', loading: 'lazy' })))),
  );
}

// Importa un paquete de imágenes (.json) sin borrar los datos actuales.
async function importPack(file) {
  const json = JSON.parse(await file.text());
  if (!json?.data?.images?.length) throw new Error('El archivo no contiene imágenes de ETO Toolkit.');
  await importBackup({ ...json, merge: true, data: { images: json.data.images } });
  return json.data.images.length;
}

// Sección de la Guía visual: agregar y ver imágenes.
export async function imagesSection(onChange) {
  const imgs = await getImages();
  const input = h('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true });
  const packInput = h('input', { type: 'file', accept: 'application/json,.json', hidden: true });
  packInput.addEventListener('change', async () => {
    const f = packInput.files[0];
    packInput.value = '';
    if (!f) return;
    try {
      toast('Importando paquete…');
      const n = await importPack(f);
      toast(`✅ ${n} imágenes agregadas a este dispositivo`);
      onChange?.();
    } catch (e) { alert(`No se pudo importar: ${e.message}`); }
  });
  const topicSel = h('select', { class: 'input small-input', 'aria-label': 'Tema' },
    ...Object.entries(IMAGE_TOPICS).map(([k, v]) => h('option', { value: k }, v)));
  input.addEventListener('change', async () => {
    const files = [...input.files];
    input.value = '';
    if (!files.length) return;
    toast(`Guardando ${files.length} imagen(es)…`);
    let n = 0;
    for (const f of files) {
      try {
        const { data, w, h: hh } = await fileToDataUrl(f);
        await db.put('images', {
          id: `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          title: f.name.replace(/\.[^.]+$/, ''), topic: topicSel.value, data, w, h: hh, createdAt: new Date().toISOString(),
        });
        n++;
      } catch (e) { toast(e.message); }
    }
    toast(`✅ ${n} imagen(es) guardada(s) en este dispositivo`);
    onChange?.();
  });

  const card = (i) => h('a', { class: 'img-card', href: `#/guia/img/${i.id}` },
    h('img', { src: i.data, alt: '', loading: 'lazy' }),
    h('span', {}, i.title || 'Sin título'),
    h('small', { class: 'muted' }, IMAGE_TOPICS[i.topic] || ''));
  // Con muchas imágenes, se muestran 9 y un botón para ver todas (agrupadas por tema).
  const grid = h('div', { class: 'img-grid' }, ...imgs.slice(0, 9).map(card));
  const more = imgs.length > 9 ? h('button', { class: 'btn btn-ghost', onclick: () => {
    grid.replaceWith(h('div', { class: 'stack' }, ...Object.entries(IMAGE_TOPICS).map(([k, v]) => {
      const list = imgs.filter((i) => i.topic === k);
      return list.length ? h('div', { class: 'stack' }, h('h3', { class: 'label' }, `${v} (${list.length})`), h('div', { class: 'img-grid' }, ...list.map(card))) : null;
    })));
    more.remove();
  } }, `Ver todas (${imgs.length})`) : null;

  return h('section', { class: 'card private-images' },
    h('div', { class: 'row-between' },
      h('h2', {}, '📷 Mis imágenes'),
      h('span', { class: 'tag' }, '🔒 privadas'),
    ),
    h('p', { class: 'muted small' }, 'Agrega fotos o capturas (por ejemplo, de tus cursos). Se guardan solo en este dispositivo y en tu respaldo; no se publican en internet.'),
    h('div', { class: 'btn-row' }, topicSel, h('button', { class: 'btn btn-primary', onclick: () => input.click() }, '➕ Agregar')),
    h('button', { class: 'btn btn-secondary', onclick: () => packInput.click() }, '📦 Importar paquete de imágenes (.json)'),
    imgs.length ? h('p', { class: 'muted small' }, `${imgs.length} imagen(es) en este dispositivo.`) : null,
    input, packInput,
    imgs.length ? grid : h('p', { class: 'muted small center' }, 'Aún no tienes imágenes.'),
    more,
  );
}

// Vista de una imagen: zoom con los dedos, renombrar, cambiar tema y borrar.
export async function viewImage(root, id) {
  const img = await db.get('images', id);
  if (!img) { location.hash = '#/guia'; return; }
  setHeader(img.title || 'Imagen', '#/guia');
  const title = h('input', { class: 'input', type: 'text', value: img.title || '', placeholder: 'Título' });
  const topic = h('select', { class: 'input' }, ...Object.entries(IMAGE_TOPICS).map(([k, v]) => h('option', { value: k, selected: img.topic === k }, v)));
  const save = async () => {
    await db.put('images', { ...img, title: title.value.trim(), topic: topic.value });
    toast('✅ Guardado');
    setHeader(title.value.trim() || 'Imagen', '#/guia');
  };
  title.addEventListener('change', save);
  topic.addEventListener('change', save);
  root.replaceChildren(
    h('div', { class: 'img-view' }, h('img', { src: img.data, alt: img.title || '' })),
    h('p', { class: 'muted small center' }, 'Pellizca con dos dedos para hacer zoom.'),
    h('label', { class: 'label' }, 'Título'), title,
    h('label', { class: 'label' }, 'Tema'), topic,
    h('button', { class: 'btn btn-danger', onclick: async () => {
      if (!confirm('¿Borrar esta imagen de este dispositivo?')) return;
      await db.delete('images', id);
      toast('Imagen borrada');
      location.hash = '#/guia';
    } }, '🗑 Borrar imagen'),
  );
}
