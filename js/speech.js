// Lectura en voz alta con speechSynthesis (funciona sin internet en iPhone con las voces del sistema).

import { getSetting, setSetting } from './db.js';

export const RATES = { slow: 0.7, normal: 1.0 };

let rateKey = 'normal';
let voice = null;
let onStateChange = () => {};

function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices();
  const en = voices.filter((v) => /^en[-_]/i.test(v.lang));
  voice =
    en.find((v) => /en[-_]US/i.test(v.lang) && v.localService) ||
    en.find((v) => /en[-_]US/i.test(v.lang)) ||
    en.find((v) => /en[-_]GB/i.test(v.lang)) ||
    en[0] ||
    null;
}

export async function initSpeech() {
  rateKey = await getSetting('speechRate', 'normal');
  if (!('speechSynthesis' in window)) return;
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export const speechSupported = () => 'speechSynthesis' in window;

export function getRate() {
  return rateKey;
}

export async function setRate(key) {
  rateKey = key in RATES ? key : 'normal';
  await setSetting('speechRate', rateKey);
}

export function onSpeechState(fn) {
  onStateChange = fn;
}

export function isSpeaking() {
  return speechSupported() && speechSynthesis.speaking;
}

export function stop() {
  if (!speechSupported()) return;
  speechSynthesis.cancel();
  onStateChange(false);
}

// Lee uno o varios textos en secuencia. Devuelve una promesa que termina al acabar.
export function speak(texts, lang = 'en-US') {
  if (!speechSupported()) {
    alert('Tu navegador no soporta lectura en voz alta.');
    return Promise.resolve();
  }
  speechSynthesis.cancel();
  if (!voice) pickVoice();
  const list = Array.isArray(texts) ? texts : [texts];
  onStateChange(true);
  return new Promise((resolve) => {
    list.forEach((text, i) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      if (voice && lang.startsWith('en')) u.voice = voice;
      u.rate = RATES[rateKey];
      u.pitch = 1;
      if (i === list.length - 1) {
        u.onend = () => { onStateChange(false); resolve(); };
        u.onerror = () => { onStateChange(false); resolve(); };
      }
      speechSynthesis.speak(u);
    });
  });
}
