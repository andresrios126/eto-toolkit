// Estado del juego: XP, racha, meta diaria, niveles (con nombres de voltaje) y progreso de lecciones.

import { getSetting, setSetting } from './db.js';

export const DAILY_GOAL = 50;

export const LEVELS = [
  [0, '24 V'], [100, '110 V'], [250, '230 V'], [500, '440 V'], [900, '690 V'],
  [1500, '3.3 kV'], [2500, '6.6 kV'], [4000, '11 kV'], [6000, '33 kV'], [9000, '132 kV'],
];

const today = () => new Date().toLocaleDateString('en-CA'); // AAAA-MM-DD local
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('en-CA');
};

const EMPTY = { xp: 0, streak: 0, lastDay: null, todayDate: null, todayXp: 0, lessons: {} };

export async function getGame() {
  const g = { ...EMPTY, ...(await getSetting('game', {})) };
  // La racha se pierde si pasó más de un día sin practicar.
  if (g.lastDay && g.lastDay !== today() && g.lastDay !== yesterday()) g.streak = 0;
  if (g.todayDate !== today()) { g.todayDate = today(); g.todayXp = 0; }
  return g;
}

export function levelInfo(xp) {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
  const [base, name] = LEVELS[i];
  const next = LEVELS[i + 1];
  return {
    index: i + 1,
    name,
    nextName: next ? next[1] : null,
    progress: next ? (xp - base) / (next[0] - base) : 1,
    toNext: next ? next[0] - xp : 0,
  };
}

// Registra el resultado de una lección y devuelve el estado actualizado.
export async function recordLesson(lessonId, { xp, correct, total, completed }) {
  const g = await getGame();
  g.xp += xp;
  g.todayXp += xp;
  if (completed) {
    if (g.lastDay !== today()) g.streak = g.lastDay === yesterday() ? g.streak + 1 : 1;
    g.lastDay = today();
  }
  const acc = total ? correct / total : 0;
  const stars = !completed ? 0 : acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
  const prev = g.lessons[lessonId] || { stars: 0, plays: 0 };
  if (lessonId) g.lessons[lessonId] = { stars: Math.max(prev.stars, stars), plays: prev.plays + 1 };
  await setSetting('game', g);
  return { game: g, stars };
}
