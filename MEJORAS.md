# Guía para mejoras futuras

## Cómo retomar el proyecto
1. Abre una sesión nueva de Claude Code con este repositorio (`andresrios126/eto-toolkit`).
2. Pide la mejora en una frase, por ejemplo: *"En ETO Toolkit agrega 20 preguntas de entrevista sobre baterías"*.
3. Claude puede leer este archivo, el `README.md` y el `CHANGELOG.md` para entender la app.
4. Al subir a `main`, GitHub Pages publica la versión nueva sola y el iPhone se actualiza al abrir la app con internet.

## Cómo volver a esta versión si algo sale mal
- Versión estable **v3.2.0** = commit **`92df86d`** de `main` (pestaña *Commits* en GitHub).
- Recomendado: créale una *Release* en GitHub (pasos abajo) para encontrarla fácil.
- Para descargarla completa: en GitHub, botón **Code → Download ZIP** (o desde la Release).

### Crear la Release v3.2.0 en GitHub (1 minuto, desde Safari)
1. Abre `https://github.com/andresrios126/eto-toolkit/releases/new` (si se ve incompleto: **aA → Solicitar sitio web de escritorio**).
2. En **Choose a tag** escribe `v3.2.0` y toca **Create new tag**. Deja *Target: main*.
3. Título: `ETO Toolkit v3.2.0`. En la descripción pega el resumen de `CHANGELOG.md`.
4. Toca **Publish release**. GitHub guarda además un ZIP de esa versión.

## Si la app vuelve a una versión vieja
- En GitHub → **Actions**, no uses **Re-run** en ejecuciones antiguas: volvería a publicar esa versión vieja. El workflow ya tiene una protección que cancela esas ejecuciones.
- Para volver a publicar la versión actual: **Actions → Publicar en GitHub Pages → Run workflow** (rama `main`).

## Tus datos personales (progreso, respuestas editadas)
- No están en GitHub: viven solo en tu iPhone.
- Respáldalos de vez en cuando: **⚙️ → Respaldo → Exportar** y guarda el archivo en iCloud Drive.

## Dónde está cada cosa (para agregar contenido)
| Quiero agregar… | Archivo |
|---|---|
| Preguntas de entrevista | `js/data/questions-extra.js` (técnicas) o `js/data/questions-cv.js` (mis equipos) |
| Términos del glosario | `js/data/glossary-extra.js` |
| Casos de fallas | `js/data/faults.js` |
| Diagramas | `js/data/diagrams.js` |
| Temas de gramática, ejercicios y verbos de inglés | `js/data/english.js` |
| Palabras del diccionario del globo | `js/data/dictionary.js` |
| Temas de color | `js/themes.js` |
| Íconos de la app | `icons/options/` y `js/icons.js` |

> Al cambiar archivos, sube `CACHE_VERSION` en `sw.js` (y `APP_VERSION` en `js/app.js`) para que el iPhone descargue la versión nueva.

## Ideas pendientes
- **Repaso inteligente**: que el juego repita más seguido lo que fallas (repetición espaciada).
- **Notas por empresa**: apuntar lo que investigues de cada empresa antes de su entrevista.
- **Más preguntas de "Mis equipos y sistemas"** a medida que trabajes con equipos nuevos.
- **Pronunciación**: que la app escuche tu respuesta y la compare con el texto (requiere internet en iPhone).
- **Más temas de inglés**: phrasal verbs, preposiciones, reported speech, vocabulario de radio/VHF.
- **Estadísticas**: gráfica de progreso por semana y temas más fallados.
- **Modo examen ETO**: examen técnico cronometrado con nota, como los de inglés.
- **Purgar el commit viejo** con datos personales: pedirlo al soporte de GitHub (ya no aparece en el historial).
