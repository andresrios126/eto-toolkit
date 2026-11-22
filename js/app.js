// Punto de entrada: router por hash, menú de inicio, respaldo y registro del service worker.

import { exportBackup, importBackup, requestPersistence } from './db.js';
import { initSpeech, stop as stopSpeech } from './speech.js';
import { h, toast, setHeader } from './ui.js';
import { interviewsRoute } from './modules/interviews.js';

const APP_VERSION = '1.0.1';

const MODULES = [
  { key: 'entrevistas', icon: '🎤', title: 'Entrevistas', desc: 'Preguntas y respuestas en inglés', ready: true },
  { key: 'glosario', icon: '📖', title: 'Glosario', desc: 'Términos técnicos EN ↔ ES', ready: false },
  { key: 'certificados', icon: '📜', title: 'Certificados', desc: 'Vencimientos STCW y cursos', ready: false },
  { key: 'fallas', icon: '⚡', title: 'Fallas', desc: 'Registro de troubleshooting', ready: false },
];

const root = document.getElementById('app');
let cleanup = null;

function viewHome() {
  setHeader('ETO Toolkit', null);
  root.replaceChildren(
    h('p', { class: 'muted center' }, 'Herramientas para el Electro-Technical Officer offshore'),
    h('nav', { class: 'menu' },
      ...MODULES.map((m) =>
        h('a', { class: `menu-btn ${m.ready ? '' : 'soon'}`, href: `#/${m.key}` },
          h('span', { class: 'menu-icon', 'aria-hidden': 'true' }, m.icon),
          h('span', { class: 'menu-text' },
            h('strong', {}, m.title),
            h('small', {}, m.ready ? m.desc : `${m.desc} · Próximamente`),
          ),
        )
      ),
    ),
    h('a', { class: 'btn btn-ghost', href: '#/respaldo' }, '💾 Respaldo de datos'),
    h('p', { class: 'muted center small' }, `v${APP_VERSION} · Los datos se guardan solo en este dispositivo.`),
  );
}

function viewSoon(mod) {
  setHeader(mod.title, '#/');
  root.replaceChildren(
    h('section', { class: 'card center' },
      h('div', { class: 'soon-icon' }, mod.icon),
      h('h2', {}, mod.title),
      h('p', { class: 'muted' }, 'Este módulo llegará en una próxima fase.'),
    ),
    h('a', { class: 'btn btn-secondary', href: '#/' }, '← Volver al inicio'),
  );
}

function viewBackup() {
  setHeader('Respaldo', '#/');

  const doExport = async () => {
    const data = await exportBackup();
    const json = JSON.stringify(data, null, 2);
    const date = new Date().toISOString().slice(0, 10);
    const name = `eto-toolkit-respaldo-${date}.json`;
    const file = new File([json], name, { type: 'application/json' });

    // En iPhone, compartir permite guardar en Archivos, iCloud, AirDrop, mail…
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Respaldo ETO Toolkit' });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }
    const url = URL.createObjectURL(file);
    const a = h('a', { href: url, download: name });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast('Respaldo descargado');
  };

  const fileInput = h('input', { type: 'file', accept: 'application/json,.json', hidden: true });
  fileInput.addEventListener('change', async () => {
    const f = fileInput.files[0];
    fileInput.value = '';
    if (!f) return;
    try {
      const json = JSON.parse(await f.text());
      if (!confirm('Importar este respaldo reemplazará TODOS los datos actuales. ¿Continuar?')) return;
      await importBackup(json);
      toast('✅ Respaldo importado');
    } catch (e) {
      alert(`No se pudo importar: ${e.message}`);
    }
  });

  root.replaceChildren(
    h('section', { class: 'card' },
      h('h2', {}, 'Exportar'),
      h('p', { class: 'muted' }, 'Guarda un archivo JSON con tus respuestas personalizadas, ajustes e historial de práctica. Guárdalo en Archivos o iCloud.'),
      h('button', { class: 'btn btn-primary btn-xl', onclick: doExport }, '⬆️ Exportar respaldo'),
    ),
    h('section', { class: 'card' },
      h('h2', {}, 'Importar'),
      h('p', { class: 'muted' }, 'Restaura un respaldo exportado antes. Reemplaza los datos actuales.'),
      h('button', { class: 'btn btn-secondary btn-xl', onclick: () => fileInput.click() }, '⬇️ Importar respaldo'),
      fileInput,
    ),
    h('p', { class: 'muted small' }, 'Importante: si borras la app de la pantalla de inicio o los datos de Safari, se pierde lo guardado. Exporta un respaldo de vez en cuando.'),
  );
}

async function route() {
  if (typeof cleanup === 'function') cleanup();
  cleanup = null;
  stopSpeech();

  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [mod, ...rest] = parts;

  try {
    if (!mod) viewHome();
    else if (mod === 'entrevistas') cleanup = await interviewsRoute(root, rest);
    else if (mod === 'respaldo') viewBackup();
    else {
      const m = MODULES.find((x) => x.key === mod);
      if (m) viewSoon(m);
      else { location.hash = '#/'; return; }
    }
  } catch (e) {
    console.error(e);
    root.replaceChildren(h('p', { class: 'card' }, `Error: ${e.message}`));
  }
  window.scrollTo(0, 0);
}

async function start() {
  await initSpeech();
  requestPersistence();
  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        nw?.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            toast('Nueva versión lista. Cierra y abre la app para actualizar.');
          }
        });
      });
    }).catch((e) => console.warn('SW no registrado', e));
  }
}

start();
