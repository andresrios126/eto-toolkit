// Punto de entrada: router por hash, menú de inicio, respaldo y registro del service worker.

import { db, exportBackup, importBackup, requestPersistence, getSetting, setSetting } from './db.js';
import { rateControl } from './components.js';
import { initLookup } from './lookup.js';
import { initCloud, cloudConfigured, getSession, getStatus, signIn, signUp, signOut, syncNow, cachedRank, refreshMyRank } from './cloud.js';
import { pingUsage, fetchUsage, statsEnabled, setStatsEnabled } from './stats.js';
import { initUsage, getUsageSeconds, formatHM } from './usage.js';
import { APP_ICONS, iconPath, currentIcon, applyIcon, installUrl } from './icons.js';
import { THEMES, CUSTOM_SWATCHES, applyTheme, currentTheme, saveTheme, themeVars, DEFAULT_THEME } from './themes.js';
import { initSpeech, stop as stopSpeech } from './speech.js';
import { h, toast, setHeader, UK_FLAG } from './ui.js';
import { interviewsRoute } from './modules/interviews.js';
import { glossaryRoute } from './modules/glossary.js';
import { gameRoute, statsBar, dailyGoal, nextLesson } from './modules/game.js';
import { faultsRoute } from './modules/faults.js';
import { guideRoute } from './modules/guide.js';
import { mockRoute } from './modules/mock.js';
import { englishRoute } from './modules/english.js';
import { rankingRoute } from './modules/ranking.js';
import { getGame } from './game-state.js';
import { QUESTIONS } from './data/questions.js';
import { TERMS } from './data/glossary.js';
import { FAULTS } from './data/faults.js';
import { DIAGRAMS } from './data/diagrams.js';

const APP_VERSION = '3.13.0';

const MODULES = [
  { key: 'juego', icon: '🎮', title: 'Juego', desc: 'Opción múltiple y escritura', cls: 'tile-game' },
  { key: 'entrevistas', icon: '🎤', title: 'Entrevistas', desc: `${QUESTIONS.length} preguntas técnicas`, cls: 'tile-int' },
  { key: 'simulacro', icon: '🎙️', title: 'Simulacro', desc: 'Entrevista completa con tiempo', cls: 'tile-mock' },
  { key: 'glosario', icon: '📖', title: 'Glosario', desc: `${TERMS.length} términos EN ↔ ES`, cls: 'tile-gloss' },
  { key: 'fallas', icon: '🔧', title: 'Fallas', desc: `${FAULTS.length} casos de diagnóstico`, cls: 'tile-fault' },
  { key: 'guia', icon: '🧭', title: 'Guía visual', desc: `${DIAGRAMS.length} diagramas de referencia`, cls: 'tile-guide' },
  { key: 'ingles', icon: '', svg: UK_FLAG, title: 'Inglés', desc: 'Tiempos verbales y verbos', cls: 'tile-eng' },
  { key: 'ranking', icon: '🏆', title: 'Ranking', desc: 'Top 10 de usuarios', cls: 'tile-rank' },
];

const root = document.getElementById('app');
let cleanup = null;

async function viewHome() {
  setHeader('ETO Toolkit', null, 'by Eng. Andres Rios');
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
          m.svg ? h('span', { class: 'tile-icon', 'aria-hidden': 'true', html: m.svg }) : h('span', { class: 'tile-icon', 'aria-hidden': 'true' }, m.icon),
          h('strong', {}, m.title),
          h('small', {}, m.desc),
        )
      ),
    ),
    h('a', { class: 'muted center small home-account', href: '#/ajustes' },
      getSession() ? `☁️ Sincronizado como ${getSession().username}` : cloudConfigured() ? '👤 Sin cuenta: el avance se guarda solo en este dispositivo (inicia sesión en ⚙️)' : 'Los datos se guardan en este dispositivo.'),
    usageLine(getSession() ? 'en todos tus dispositivos' : 'en este dispositivo'),
    h('p', { class: 'muted center small' }, `v${APP_VERSION}`),
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

// Tiempo total de uso (se rellena al leerlo de la base de datos).
function usageLine(where) {
  const p = h('p', { class: 'usage-line' }, '⏱ Tiempo en la app: …');
  getUsageSeconds().then((s) => { p.replaceChildren('⏱ Tiempo en la app: ', h('b', {}, formatHM(s)), h('span', { class: 'muted small' }, ` · ${where}`)); });
  return p;
}

// ---------- Cuenta (usuario + contraseña, sincronización) ----------
function accountSection() {
  const wrap = h('div', { class: 'stack' });
  const fmt = (iso) => (iso ? new Date(iso).toLocaleString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'nunca');

  const render = () => {
    const ses = getSession();
    if (!cloudConfigured()) {
      wrap.replaceChildren(h('h2', { class: 'label' }, '👤 Cuenta'), h('section', { class: 'card' },
        h('p', {}, 'La sincronización entre dispositivos aún no está activada.'),
        h('p', { class: 'muted small' }, 'Falta conectar la base de datos en la nube. Mientras tanto, todo funciona y se guarda en este dispositivo.')));
      return;
    }
    if (ses) {
      const st = getStatus();
      const state = st.syncing ? '🔄 Sincronizando…' : st.error ? `⚠️ ${st.error}` : st.pending ? '⏳ Cambios pendientes de sincronizar' : `✅ Sincronizado · ${fmt(st.lastSync)}`;
      const syncBtn = h('button', { class: 'btn btn-primary' }, '🔄 Sincronizar ahora');
      syncBtn.onclick = async () => { syncBtn.disabled = true; await syncNow(); render(); };
      wrap.replaceChildren(h('h2', { class: 'label' }, '👤 Cuenta'), h('section', { class: 'card account' },
        h('div', { class: 'row-between' }, h('strong', { class: 'acc-user' }, `👤 ${ses.username}`), h('span', { class: 'tag tag-ok' }, 'sesión iniciada')),
        h('p', { class: 'small' }, state),
        usageLine('en todos tus dispositivos'),
        h('p', { class: 'muted small' }, 'Tu avance se guarda y se sincroniza solo cada vez que haces algo. Sin internet se guarda aquí y se sube al volver la conexión. Las imágenes privadas no se sincronizan.'),
        h('div', { class: 'btn-row' }, syncBtn,
          h('button', { class: 'btn btn-danger', onclick: () => {
            if (!confirm('¿Cerrar sesión en este dispositivo? Tu avance queda guardado en la nube y en este dispositivo.')) return;
            signOut(); render();
          } }, 'Cerrar sesión')),
      ));
      return;
    }
    let mode = 'login';
    const user = h('input', { class: 'input', type: 'text', placeholder: 'Usuario', autocomplete: 'username', autocapitalize: 'none', autocorrect: 'off', spellcheck: 'false' });
    const pass = h('input', { class: 'input', type: 'password', placeholder: 'Contraseña (mínimo 6)', autocomplete: 'current-password' });
    const pass2 = h('input', { class: 'input', type: 'password', placeholder: 'Repite la contraseña', autocomplete: 'new-password', hidden: true });
    const msg = h('p', { class: 'small acc-msg' });
    const go = h('button', { class: 'btn btn-primary btn-xl' }, 'Iniciar sesión');
    const tabs = h('div', { class: 'segmented full' });
    const paintTabs = () => {
      tabs.replaceChildren(
        h('button', { class: mode === 'login' ? 'active' : '', onclick: () => { mode = 'login'; paintTabs(); } }, 'Iniciar sesión'),
        h('button', { class: mode === 'signup' ? 'active' : '', onclick: () => { mode = 'signup'; paintTabs(); } }, 'Crear cuenta'));
      pass2.hidden = mode !== 'signup';
      pass.setAttribute('autocomplete', mode === 'signup' ? 'new-password' : 'current-password');
      go.textContent = mode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión';
      msg.textContent = '';
    };
    paintTabs();
    go.onclick = async () => {
      msg.textContent = '';
      if (mode === 'signup' && pass.value !== pass2.value) { msg.textContent = '⚠️ Las contraseñas no coinciden.'; return; }
      go.disabled = true; go.textContent = 'Conectando…';
      try {
        const u = mode === 'signup' ? await signUp(user.value, pass.value) : await signIn(user.value, pass.value);
        toast(`✅ Sesión iniciada como ${u}`);
        render();
      } catch (e) {
        msg.textContent = `⚠️ ${e.message}`;
        go.disabled = false; go.textContent = mode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión';
      }
    };
    wrap.replaceChildren(h('h2', { class: 'label' }, '👤 Cuenta'), h('section', { class: 'card account' },
      usageLine('en este dispositivo'),
      h('p', { class: 'small' }, 'Inicia sesión una vez en cada dispositivo y tu avance será el mismo en todos. Sin cuenta también puedes usar todo; solo no se sincroniza.'),
      tabs, user, pass, pass2, msg, go,
      h('p', { class: 'muted small' }, '🔒 Sin correo: solo usuario y contraseña. Guarda bien tu contraseña: no se puede recuperar por correo.'),
    ));
  };
  render();
  window.addEventListener('eto-cloud-status', () => { if (wrap.isConnected && !wrap.querySelector('input:focus')) render(); });
  return wrap;
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
    accountSection(),
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
    usageSection(),
    h('h2', { class: 'label' }, 'ℹ️ App'),
    h('section', { class: 'card' },
      h('div', { class: 'set-row' }, h('span', {}, 'Versión'), h('b', {}, APP_VERSION)),
      h('p', { class: 'muted small' }, 'La app se actualiza sola cuando hay internet. Si algo se ve raro, toca el botón para buscar la versión más reciente.'),
      updateBtn,
    ),
  );
}

// Contador anónimo de usuarios.
function usageSection() {
  const wrap = h('div', {});
  const stat = (val, label) => h('div', { class: 'stat' }, h('span', { class: 'stat-val' }, h('b', {}, val)), h('span', { class: 'stat-label' }, label));
  const sw = h('button', { class: `switch${statsEnabled() ? ' on' : ''}`, role: 'switch', 'aria-checked': String(statsEnabled()), 'aria-label': 'Contar este dispositivo' });
  const body = h('div', {}, h('p', { class: 'muted small' }, 'Cargando…'));
  const load = async () => {
    const u = await fetchUsage();
    if (u.error) {
      body.replaceChildren(h('p', { class: 'muted small' }, u.error === 'offline' ? 'Sin conexión: conéctate a internet para ver el contador.'
        : u.error === 'rules' ? 'El contador aún no está activado en Firebase (falta publicar las reglas de "devices").' : 'La nube no está configurada.'));
      return;
    }
    body.replaceChildren(
      h('div', { class: 'usage-grid' },
        stat(u.total, 'Han usado la app'), stat(u.d7, 'Activos 7 días'),
        stat(u.d30, 'Activos 30 días'), stat(Math.max(0, u.total - u.d30), 'Sin usarla +30 días')),
      h('p', { class: 'muted small' }, `👤 ${u.accounts} con cuenta iniciada · ${Math.max(0, u.total - u.accounts)} sin cuenta.`),
    );
  };
  sw.onclick = async () => {
    const on = !sw.classList.contains('on');
    sw.classList.toggle('on', on); sw.setAttribute('aria-checked', String(on));
    await setStatsEnabled(on, APP_VERSION);
    toast(on ? 'Este dispositivo se cuenta de forma anónima' : 'Este dispositivo ya no se cuenta');
    load();
  };
  wrap.replaceChildren(
    h('h2', { class: 'label' }, '📊 Usuarios de la app'),
    h('section', { class: 'card' },
      body,
      h('p', { class: 'muted small' }, 'Se cuentan dispositivos (si una persona usa la app en su celular y su computadora, cuenta 2). Es anónimo: solo se guarda un número al azar y la fecha de uso, sin nombres ni datos personales.'),
      h('div', { class: 'set-row' }, h('span', {}, 'Contar este dispositivo'), sw),
      h('button', { class: 'btn btn-ghost', onclick: () => { body.replaceChildren(h('p', { class: 'muted small' }, 'Cargando…')); load(); } }, '🔄 Actualizar'),
    ),
  );
  load();
  return wrap;
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
    else if (mod === 'ranking') cleanup = await rankingRoute(root, rest);
    else if (mod === 'respaldo') viewBackup();
    else if (mod === 'ajustes' || mod === 'apariencia') viewSettings();
    else { location.hash = '#/'; return; }
  } catch (e) {
    console.error(e);
    root.replaceChildren(h('p', { class: 'card' }, `Error: ${e.message}`));
  }
  window.scrollTo(0, 0);
}

// Usuario y posición en el ranking, junto al botón de ajustes.
function paintMe() {
  const el = document.getElementById('me');
  if (!el) return;
  const s = cloudConfigured() && getSession();
  el.hidden = !s;
  if (!s) return;
  const r = cachedRank();
  el.replaceChildren(
    h('span', { class: 'me-name' }, `👤 ${s.username}`),
    h('span', { class: 'me-rank' }, r?.rank ? `🏆 #${r.rank}` : '🏆 —'),
  );
  el.title = r?.rank ? `${s.username}: puesto ${r.rank} de ${r.total} en el ranking` : s.username;
}

async function start() {
  // Tema: localStorage (rápido) o, si no existe, el guardado en la base de datos.
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem('eto-theme')); } catch (_) { /* nada */ }
  applyTheme(saved || (await getSetting('theme', null)) || DEFAULT_THEME);
  await initSpeech();
  requestPersistence();
  initLookup();
  initCloud();
  initUsage();
  paintMe();
  ['eto-rank', 'eto-cloud-status'].forEach((ev) => window.addEventListener(ev, paintMe));
  pingUsage(APP_VERSION);
  window.addEventListener('online', () => pingUsage(APP_VERSION));
  // La sección 'Mis imágenes' se retiró: liberar el espacio de imágenes guardadas antes.
  db.clear('images').catch(() => {});
  // Si la sincronización trajo avance de otro dispositivo, refrescar pantallas de resumen.
  window.addEventListener('eto-cloud-updated', () => {
    if (/^(#\/?)?$|^#\/(ajustes|juego|ingles)$/.test(location.hash)) route();
  });
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
