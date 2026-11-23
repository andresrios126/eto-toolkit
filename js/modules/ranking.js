// 🏆 Ranking: los 10 usuarios con cuenta con más XP (juego ETO o inglés).
// Quien no tiene cuenta no aparece: su progreso se queda solo en su dispositivo.

import { getSetting, setSetting } from '../db.js';
import { h, toast, setHeader } from '../ui.js';
import { cloudConfigured, getSession, fetchRanking, publishScore, removeScore, refreshMyRank } from '../cloud.js';
import { levelInfo } from '../game-state.js';
import { formatHM } from '../usage.js';

const ENG_LEVELS = [[0, 'A1'], [150, 'A2'], [400, 'B1'], [800, 'B2'], [1400, 'C1'], [2200, 'C2']];
const engLevel = (xp) => ENG_LEVELS.filter(([n]) => xp >= n).pop()[1];
const MEDALS = ['🥇', '🥈', '🥉'];

const TABS = {
  xp: { label: '⚡ ETO', level: (v) => levelInfo(v).name, show: (v) => `${v} XP` },
  eng: { label: '🇬🇧 Inglés', level: engLevel, show: (v) => `${v} XP` },
  time: { label: '⏱ Tiempo', level: () => '', show: (v) => formatHM(v) },
};
const timeText = (t) => (t == null ? '' : `⏱ ${formatHM(t)}`);
// Segunda línea de cada usuario: nivel y tiempo (o, en la pestaña Tiempo, su XP del juego).
const detail = (field, r) => (field === 'time' ? `⚡ ${r.xp} XP · 🇬🇧 ${engLevel(r.eng)}` : [TABS[field].level(r[field]), timeText(r.time)].filter(Boolean).join(' · '));

export async function rankingRoute(root, parts) {
  const field = TABS[parts[0]] ? parts[0] : 'xp';
  setHeader('Ranking', '#/');
  const session = getSession();

  const tabs = h('div', { class: 'grid3' }, ...Object.entries(TABS).map(([k, t]) => h('a', {
    class: `btn ${k === field ? 'btn-primary' : 'btn-secondary'}`, href: `#/ranking/${k}`,
  }, t.label)));

  if (!cloudConfigured() || !session) {
    const game = await getSetting('game', {});
    const eng = await getSetting('english', {});
    root.replaceChildren(
      h('section', { class: 'card center' },
        h('div', { class: 'rank-trophy' }, '🏆'),
        h('h2', {}, 'Top 10 de usuarios'),
        h('p', {}, 'El ranking es solo para usuarios con cuenta. Sin cuenta, tu progreso se guarda únicamente en este dispositivo y no aparece en el ranking.'),
        h('p', { class: 'muted small' }, `Tu progreso aquí: ⚡ ${game.xp || 0} XP (${levelInfo(game.xp || 0).name}) · 🇬🇧 ${eng.xp || 0} XP (${engLevel(eng.xp || 0)})`),
        h('p', { class: 'muted small' }, '⏱ Tu tiempo en la app aparece en ⚙️ Ajustes y al final del inicio.'),
      ),
      h('a', { class: 'btn btn-primary btn-xl', href: '#/ajustes' }, '👤 Crear cuenta o iniciar sesión'),
    );
    return;
  }

  const off = await getSetting('rankingOff', false);
  const list = h('div', { class: 'list' }, h('p', { class: 'muted center' }, 'Cargando ranking…'));
  const mine = h('div', {});
  const sw = h('button', { class: `switch${off ? '' : ' on'}`, role: 'switch', 'aria-checked': String(!off), 'aria-label': 'Aparecer en el ranking' });

  const load = async () => {
    list.replaceChildren(h('p', { class: 'muted center' }, 'Cargando ranking…'));
    mine.replaceChildren();
    try {
      await publishScore().catch((e) => { if (e.status === 403) throw e; });
      const { top, total, me } = await fetchRanking(field);
      refreshMyRank().catch(() => {});
      if (!top.length) {
        list.replaceChildren(h('p', { class: 'muted center' }, 'Todavía no hay nadie en el ranking.'));
        return;
      }
      list.replaceChildren(...top.map((r, i) => {
        const isMe = r.uid === session.uid;
        return h('div', { class: `rank-row${isMe ? ' me' : ''}${i < 3 ? ' podium' : ''}` },
          h('span', { class: 'rank-pos' }, MEDALS[i] || `#${i + 1}`),
          h('span', { class: 'rank-name' }, h('strong', {}, r.name), isMe ? h('span', { class: 'tag tag-ok' }, 'tú') : null),
          h('span', { class: 'rank-score' }, h('b', {}, TABS[field].show(r[field] || 0)), h('small', {}, detail(field, r))));
      }));
      if (me && !top.some((r) => r.uid === session.uid)) {
        mine.replaceChildren(h('section', { class: 'card center' },
          h('p', {}, `Tu posición: `, h('b', {}, `#${me.rank}`), ` de ${total} · ${TABS[field].show(me.value)}${TABS[field].level(me.value) ? ` (${TABS[field].level(me.value)})` : ''}`),
          h('p', { class: 'muted small' }, 'Sigue practicando para entrar al top 10.')));
      } else if (!me) {
        mine.replaceChildren(h('p', { class: 'muted small center' }, 'No apareces en el ranking (lo desactivaste abajo).'));
      } else {
        mine.replaceChildren(h('p', { class: 'muted small center' }, `${total} usuario${total === 1 ? '' : 's'} en el ranking.`));
      }
    } catch (e) {
      list.replaceChildren(h('p', { class: 'muted center' }, e.status === 403 || e.status === 401
        ? 'El ranking aún no está activado en Firebase (falta publicar las reglas de "leaderboard").'
        : 'Sin conexión: conéctate a internet para ver el ranking.'));
    }
  };

  sw.onclick = async () => {
    const on = !sw.classList.contains('on');
    sw.classList.toggle('on', on); sw.setAttribute('aria-checked', String(on));
    await setSetting('rankingOff', !on);
    try { if (on) await publishScore(); else await removeScore(); await refreshMyRank(); } catch (_) { /* se reintenta al sincronizar */ }
    toast(on ? 'Apareces en el ranking' : 'Ya no apareces en el ranking');
    load();
  };

  root.replaceChildren(
    tabs,
    list,
    mine,
    h('section', { class: 'card' },
      h('div', { class: 'set-row' }, h('span', {}, 'Aparecer en el ranking'), sw),
      h('p', { class: 'muted small' }, 'Los demás usuarios con cuenta ven tu nombre de usuario, tu nivel, tu XP y tu tiempo en la app. Quien no tiene cuenta no aparece: su progreso queda solo en su teléfono.'),
      h('button', { class: 'btn btn-ghost', onclick: load }, '🔄 Actualizar'),
    ),
  );
  load();
}
