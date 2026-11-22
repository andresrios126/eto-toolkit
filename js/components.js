// Componentes reutilizables entre módulos (voz, velocidad, traducción).

import { speak, stop, getRate, setRate, onSpeechState, speechSupported } from './speech.js';
import { h } from './ui.js';

export function rateControl() {
  const wrap = h('div', { class: 'segmented', role: 'group', 'aria-label': 'Velocidad de voz' });
  const render = () => {
    wrap.replaceChildren(
      ...[['slow', '🐢 Lento'], ['normal', '▶︎ Normal']].map(([key, label]) =>
        h('button', {
          class: getRate() === key ? 'active' : '',
          'aria-pressed': String(getRate() === key),
          onclick: async () => { await setRate(key); render(); },
        }, label)
      )
    );
  };
  render();
  return h('div', { class: 'rate-row' }, h('span', { class: 'muted' }, 'Velocidad:'), wrap);
}

export function speakButton(label, getTexts) {
  const btn = h('button', { class: 'btn btn-secondary' }, `🔊 ${label}`);
  btn.addEventListener('click', () => {
    if (btn.classList.contains('speaking')) { stop(); return; }
    document.querySelectorAll('.speaking').forEach((b) => b.classList.remove('speaking'));
    btn.classList.add('speaking');
    onSpeechState((on) => { if (!on) btn.classList.remove('speaking'); });
    speak(getTexts());
  });
  if (!speechSupported()) btn.disabled = true;
  return btn;
}

export function translationToggle(textEs, label = 'Ver traducción') {
  const p = h('p', { class: 'es', hidden: true }, textEs);
  const btn = h('button', { class: 'link' }, `🇪🇸 ${label}`);
  btn.addEventListener('click', () => {
    p.hidden = !p.hidden;
    btn.textContent = p.hidden ? `🇪🇸 ${label}` : '🇪🇸 Ocultar traducción';
  });
  return [btn, p];
}
