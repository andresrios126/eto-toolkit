// Utilidades de interfaz compartidas.

// replaceChildren convierte null/false en texto ("null"). Los ignoramos para poder usar
// condiciones del tipo `cond ? elemento : null` al construir vistas.
const nativeReplace = Element.prototype.replaceChildren;
Element.prototype.replaceChildren = function (...nodes) {
  return nativeReplace.apply(this, nodes.filter((n) => n != null && n !== false));
};

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

let toastTimer = null;
export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

export function setHeader(title, backHash) {
  document.getElementById('title').textContent = title;
  // El botón de ajustes se oculta dentro de Ajustes y durante una lección.
  const gear = document.getElementById('settings');
  if (gear) gear.hidden = /^#\/(ajustes|apariencia|juego\/leccion|ingles\/practica)/.test(location.hash);
  const back = document.getElementById('back');
  if (backHash) {
    back.hidden = false;
    back.onclick = () => { location.hash = backHash; };
  } else {
    back.hidden = true;
    back.onclick = null;
  }
}

export function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
