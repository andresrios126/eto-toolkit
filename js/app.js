// Punto de entrada: router por hash, menú de inicio, respaldo y registro del service worker.

import { exportBackup, importBackup, requestPersistence, getSetting, setSetting } from './db.js';
import { rateControl } from './components.js';
import { initLookup } from './lookup.js';
import { APP_ICONS, iconPath, currentIcon, applyIcon, installUrl } from './icons.js';
import { THEMES, CUSTOM_SWATCHES, applyTheme, currentTheme, saveTheme, themeVars, DEFAULT_THEME } from './themes.js';
import { initSpeech, stop as stopSpeech } from './speech.js';
import { h, toast, setHeader } from './ui.js';
import { interviewsRoute } from './modules/interviews.js';
import { glossaryRoute } from './modules/glossary.js';
import { gameRoute, statsBar, dailyGoal, nextLesson } from './modules/game.js';
import { faultsRoute } from './modules/faults.js';
import { guideRoute } from './modules/guide.js';
import { mockRoute } from './modules/mock.js';
import { englishRoute } from './modules/english.js';
import { getGame } from './game-state.js';
import { QUESTIONS } from './data/questions.js';
import { TERMS } from './data/glossary.js';
import { FAULTS } from './data/faults.js';
import { DIAGRAMS } from './data/diagrams.js';

const APP_VERSION = '3.3.0';

const MODULES = [
  { key: 'juego', icon: '🎮', title: 'Juego', desc: 'Opción múltiple y escritura', cls: 'tile-game' },
  { key: 'entrevistas', icon: '🎤', title: 'Entrevistas', desc: `${QUESTIONS.length} preguntas técnicas`, cls: 'tile-int' },
  { key: 'simulacro', icon: '🎙️', title: 'Simulacro', desc: 'Entrevista completa con tiempo', cls: 'tile-mock' },
  { key: 'glosario', icon: '📖', title: 'Glosario', desc: `${TERMS.length} términos EN ↔ ES`, cls: 'tile-gloss' },
  { key: 'fallas', icon: '🔧', title: 'Fallas', desc: `${FAULTS.length} casos de diagnóstico`, cls: 'tile-fault' },
  { key: 'guia', icon: '🧭', title: 'Guía visual', desc: `${DIAGRAMS.length} diagramas de referencia`, cls: 'tile-guide' },
  { key: 'ingles', icon: '🇬🇧', title: 'Inglés', desc: 'Tiempos verbales y verbos', cls: 'tile-eng' },
];

const root = document.getElementById('app');
let cleanup = null;

async function viewHome() {
  setHeader('ETO Toolkit', null);
  const game = await getGame();
  const next = nextLesson(game);
  root.replaceChildren(
    statsBar(game),
    h('a', { class: 'hero', href: next ? `#/juego/leccion/${next.id}` : '#/juego/leccion/mix' },
      h('span', { class: 'hero-bolt', 'aria-hidden': 'true' }, '⚡'),
      h('span', { class: 'hero-text' },
        h('small', {}, next ? 'Siguiente lección' : 'Repaso mixto'),
        h('strong', {}, next ? next.title : '¡Completaste el camino!'),
      ),
      h('span', { class: 'hero-go' }, '▶'),
    ),
    dailyGoal(game),
    h('nav', { class: 'tiles' },
      ...MODULES.map((m) =>
        h('a', { class: `tile ${m.cls}`, href: `#/${m.key}` },
          h('span', { class: 'tile-icon', 'aria-hidden': 'true' }, m.icon),
          h('strong', {}, m.title),
          h('small', {}, m.desc),
        )
      ),
    ),
    h('p', { class: 'muted center small' }, `v${APP_VERSION} · Los datos se guardan solo en este dispositivo.`),
  );
}

// ---------- Ícono de la app ----------
function iconSection() {
  let chosen = currentIcon();
  const grid = h('div', { class: 'icon-grid' });
  const urlInput = h('input', { class: 'input small-input', type: 'text', readonly: true });
  const copyBtn = h('button', { class: 'btn btn-primary' }, '📋 Copiar enlace');
  const steps = h('section', { class: 'card icon-steps', hidden: true },
    h('h2', {}, '📲 Cómo aplicar el ícono nuevo'),
    h('p', { class: 'muted small' }, 'En iPhone el ícono se fija al agregar la app a la pantalla de inicio. Para cambiarlo hay que agregarla de nuevo. Sigue estos pasos para no perder tus datos:'),
    h('ol', { class: 'steps' },
      h('li', {}, h('b', {}, 'Exporta un respaldo'), ' (⚙️ → Respaldo → Exportar) y guárdalo en Archivos.'),
      h('li', {}, h('b', {}, 'Copia el enlace'), ' de abajo y ábrelo en ', h('b', {}, 'Safari'), '.'),
      h('li', {}, 'En Safari toca ', h('b', {}, 'Compartir → Agregar a pantalla de inicio'), '. Aparecerá con el ícono nuevo.'),
      h('li', {}, 'Abre la app nueva y ', h('b', {}, 'importa el respaldo'), ' (⚙️ → Respaldo → Importar).'),
      h('li', {}, 'Cuando veas tus datos en la app nueva, ', h('b', {}, 'borra el ícono viejo'), ' (mantenlo presionado → Eliminar app).'),
    ),
    urlInput,
    h('div', { class: 'btn-row' }, copyBtn, h('a', { class: 'btn btn-secondary', href: '#/respaldo' }, '💾 Respaldo')),
  );
  copyBtn.onclick = async () => {
    try { await navigator.clipboard.writeText(urlInput.value); toast('✅ Enlace copiado: pégalo en Safari'); }
    catch (_) { urlInput.select(); toast('Mantén presionado el enlace para copiarlo'); }
  };
  const render = () => {
    grid.replaceChildren(...APP_ICONS.map(([id, name]) => h('button', {
      class: `icon-opt ${chosen === id ? 'active' : ''}`, 'aria-label': `Ícono ${name}`,
      onclick: () => { chosen = id; applyIcon(id); setSetting('icon', id); render(); steps.hidden = false; steps.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); },
    }, h('img', { src: iconPath(id), alt: '', width: 64, height: 64 }), h('span', {}, name))));
    urlInput.value = installUrl(chosen);
  };
  render();
  return h('div', { class: 'stack' },
    h('h2', { class: 'label' }, '📱 Ícono de la app'),
    h('section', { class: 'card' },
      h('p', { class: 'muted small' }, 'Elige el ícono para la pantalla de inicio.'),
      grid,
    ),
    steps,
  );
}

function viewSettings() {
  setHeader('Ajustes', '#/');
  let choice = currentTheme();

  const preview = (vars) => h('div', { class: 'theme-prev', style: `background:${vars['--bg']}` },
    h('div', { class: 'p-card', style: `background:${vars['--surface']};border:1px solid ${vars['--border']}` }),
    h('div', { class: 'p-row' },
      h('div', { class: 'p-btn', style: `background:${vars['--primary']}` }),
      h('div', { class: 'p-btn', style: `background:${vars['--accent']}` }),
      h('div', { class: 'p-btn', style: `background:${vars['--surface-2']};border:1px solid ${vars['--border']}` }),
    ),
  );

  const grid = h('div', { class: 'theme-grid' });
  const colorInput = h('input', { type: 'color', class: 'color-input', 'aria-label': 'Color de fondo personalizado' });
  const swatches = h('div', { class: 'swatches' });

  const pick = async (c) => {
    choice = c;
    await saveTheme(c);
    render();
  };

  const render = () => {
    grid.replaceChildren(...THEMES.map((t) => h('button', {
      class: `theme-card ${choice.id === t.id ? 'active' : ''}`,
      onclick: () => pick({ id: t.id }),
    }, preview(themeVars({ id: t.id })), h('strong', {}, `${choice.id === t.id ? '✓ ' : ''}${t.name}`),
      h('span', { class: 'muted small' }, t.light ? 'Fondo claro' : 'Fondo oscuro'))));
    colorInput.value = choice.id === 'custom' ? choice.color : '#ffffff';
    swatches.replaceChildren(...CUSTOM_SWATCHES.map((c) => h('button', {
      class: `swatch ${choice.id === 'custom' && choice.color === c ? 'active' : ''}`,
      style: `background:${c}`, 'aria-label': `Color ${c}`,
      onclick: () => pick({ id: 'custom', color: c }),
    })));
  };
  colorInput.addEventListener('input', () => { applyTheme({ id: 'custom', color: colorInput.value }); });
  colorInput.addEventListener('change', () => pick({ id: 'custom', color: colorInput.value }));
  render();

  const soundSwitch = h('button', { class: 'switch', role: 'switch', 'aria-label': 'Sonidos del juego' });
  getSetting('sound', true).then((on) => { soundSwitch.classList.toggle('on', on); soundSwitch.setAttribute('aria-checked', String(on)); });
  soundSwitch.onclick = async () => {
    const on = !soundSwitch.classList.contains('on');
    await setSetting('sound', on);
    soundSwitch.classList.toggle('on', on);
    soundSwitch.setAttribute('aria-checked', String(on));
  };

  const updateBtn = h('button', { class: 'btn btn-secondary' }, '🔄 Buscar actualización');
  updateBtn.onclick = async () => {
    updateBtn.disabled = true;
    updateBtn.textContent = 'Buscando…';
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      await reg?.update();
      if (reg?.installing || reg?.waiting) {
        updateBtn.textContent = 'Instalando versión nueva…';
        return; // la app se recarga sola al activarse
      }
      toast('Ya tienes la versión más reciente');
    } catch (_) {
      toast('Sin conexión: inténtalo con internet');
    }
    updateBtn.disabled = false;
    updateBtn.textContent = '🔄 Buscar actualización';
  };

  root.replaceChildren(
    h('h2', { class: 'label' }, '🎨 Tema'),
    grid,
    h('section', { class: 'card' },
      h('h2', {}, '🖌️ Color de fondo personalizado'),
      h('p', { class: 'muted small' }, 'Elige un color: la app ajusta automáticamente tarjetas, bordes y textos para que se lean bien, en claro u oscuro.'),
      swatches,
      h('label', { class: 'label' }, 'O elige cualquier color (toca el recuadro):'),
      colorInput,
    ),
    iconSection(),
    h('h2', { class: 'label' }, '🔊 Voz y sonido'),
    h('section', { class: 'card' },
      h('p', { class: 'muted small' }, 'Velocidad de la voz en inglés (también se cambia en cada pantalla):'),
      rateControl(),
      h('div', { class: 'set-row' }, h('span', {}, 'Sonidos del juego'), soundSwitch),
    ),
    h('h2', { class: 'label' }, '💾 Datos'),
    h('a', { class: 'btn btn-secondary', href: '#/respaldo' }, '💾 Respaldo: exportar o importar'),
    h('h2', { class: 'label' }, 'ℹ️ App'),
    h('section', { class: 'card' },
      h('div', { class: 'set-row' }, h('span', {}, 'Versión'), h('b', {}, APP_VERSION)),
      h('p', { class: 'muted small' }, 'La app se actualiza sola cuando hay internet. Si algo se ve raro, toca el botón para buscar la versión más reciente.'),
      updateBtn,
    ),
  );
}

function viewBackup() {
  setHeader('Respaldo', '#/ajustes');

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
      applyTheme((await getSetting('theme', null)) || currentTheme());
      toast('✅ Respaldo importado');
    } catch (e) {
      alert(`No se pudo importar: ${e.message}`);
    }
  });

  root.replaceChildren(
    h('section', { class: 'card' },
      h('h2', {}, 'Exportar'),
      h('p', { class: 'muted' }, 'Guarda un archivo JSON con tus respuestas personalizadas, tu progreso del juego y del glosario, tus términos y casos propios, ajustes e historial de práctica. Guárdalo en Archivos o iCloud.'),
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
    if (!mod) await viewHome();
    else if (mod === 'entrevistas') cleanup = await interviewsRoute(root, rest);
    else if (mod === 'glosario') cleanup = await glossaryRoute(root, rest);
    else if (mod === 'juego') cleanup = await gameRoute(root, rest);
    else if (mod === 'fallas') cleanup = await faultsRoute(root, rest);
    else if (mod === 'guia') cleanup = await guideRoute(root, rest);
    else if (mod === 'simulacro') cleanup = await mockRoute(root, rest);
    else if (mod === 'ingles') cleanup = await englishRoute(root, rest);
    else if (mod === 'respaldo') viewBackup();
    else if (mod === 'ajustes' || mod === 'apariencia') viewSettings();
    else { location.hash = '#/'; return; }
  } catch (e) {
    console.error(e);
    root.replaceChildren(h('p', { class: 'card' }, `Error: ${e.message}`));
  }
  window.scrollTo(0, 0);
}

async function start() {
  // Tema: localStorage (rápido) o, si no existe, el guardado en la base de datos.
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem('eto-theme')); } catch (_) { /* nada */ }
  applyTheme(saved || (await getSetting('theme', null)) || DEFAULT_THEME);
  await initSpeech();
  requestPersistence();
  initLookup();
  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator) {
    // Si ya había una versión instalada y se activa una nueva, recargamos para usarla.
    const hadController = Boolean(navigator.serviceWorker.controller);
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloading) return;
      reloading = true;
      location.reload();
    });
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      reg.update().catch(() => {});
      // Al volver a la app (por ejemplo, desde otra app), buscar versión nueva.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {});
      });
    }).catch((e) => console.warn('SW no registrado', e));
  }
}

start();
