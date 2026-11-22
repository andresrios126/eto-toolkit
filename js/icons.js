// Opciones de ícono para la pantalla de inicio.
// En iPhone el ícono se fija al "Agregar a pantalla de inicio", por eso la elección se aplica
// a la página (y al enlace ?icon=...) y luego hay que volver a agregar la app desde Safari.

export const APP_ICONS = [
  ['noche', 'Noche'], ['amarillo', 'Amarillo'], ['blanco', 'Blanco'], ['azul', 'Azul'],
  ['verde', 'Verde'], ['naranja', 'Atardecer'], ['morado', 'Morado'], ['grafito', 'Grafito'],
  ['circulo', 'Círculo'], ['eto', 'ETO'], ['casco', 'Alto voltaje'], ['cielo', 'Cielo'],
];

export const iconPath = (id, size = 180) => `icons/options/${id}-${size}.png`;

export function currentIcon() {
  try { return localStorage.getItem('eto-icon') || 'noche'; } catch (_) { return 'noche'; }
}

export function applyIcon(id) {
  if (!APP_ICONS.some(([x]) => x === id)) return;
  try { localStorage.setItem('eto-icon', id); } catch (_) { /* nada */ }
  document.querySelector('link[rel="apple-touch-icon"]')?.setAttribute('href', iconPath(id, 180));
  document.querySelector('link[rel="icon"]')?.setAttribute('href', iconPath(id, 192));
}

export function installUrl(id) {
  return `${location.origin}${location.pathname}?icon=${id}`;
}
