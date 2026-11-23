# Guía para mejoras futuras

## ✅ Cuentas de usuario: Firebase conectado (v3.4.1)
La función ya está hecha y probada (v3.4.0): **usuario + contraseña sin correo**, sesión que queda abierta hasta "Cerrar sesión", sincronización automática con combinación del avance, y funciona sin internet. Firebase quedó conectado el 22-nov-2026 (proyecto `eto-toolkit`, Firestore en nam5). Los pasos se dejan como referencia.

**Pasos en console.firebase.google.com (≈10 min):**
1. **Crear proyecto** (p. ej. `eto-toolkit`; Google Analytics se puede desactivar).
2. **Compilación → Authentication → Comenzar → Correo electrónico/contraseña → Habilitar → Guardar.** (La app usa un "correo" técnico interno `usuario@eto-toolkit.app`; nunca se envían correos.)
3. **Compilación → Firestore Database → Crear base de datos → modo producción** → región cercana.
4. En **Firestore → Reglas**, pegar y **Publicar**:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Contador anónimo de usuarios (v3.8.0): solo id al azar, fechas, si tiene cuenta y versión.
    match /devices/{deviceId} {
      allow read, delete: if true;
      allow create, update: if deviceId.matches('^[a-f0-9]{24}$')
        && request.resource.data.keys().hasOnly(['first', 'last', 'acct', 'v'])
        && request.resource.data.first is timestamp
        && request.resource.data.last is timestamp;
    }
    // Ranking top 10 (v3.10.0): solo usuarios con cuenta leen; cada uno escribe solo su propio puntaje.
    match /leaderboard/{userId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && request.auth.uid == userId
        && request.resource.data.keys().hasOnly(['name', 'xp', 'eng', 'time', 'updated'])
        && request.resource.data.name is string && request.resource.data.name.size() <= 20
        && request.resource.data.xp is int && request.resource.data.eng is int
        && (!('time' in request.resource.data) || request.resource.data.time is int);
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
5. **Configuración del proyecto (⚙️) → General → Tus apps → Web (`</>`)** → registrar `eto-toolkit` → copiar **`apiKey`** y **`projectId`** y pasárselos a Claude (no son secretos).
6. Claude los pone en `js/cloud-config.js` y publica.

**Notas:** las contraseñas las guarda Firebase (nunca la app). Como no hay correo, una contraseña olvidada no se recupera: en Firebase → Authentication se borra ese usuario y se vuelve a crear con el mismo nombre; el avance guardado en cada dispositivo se conserva y se vuelve a subir al iniciar sesión. Las imágenes privadas no se sincronizan.

## Cómo retomar el proyecto
1. Abre una sesión nueva de Claude Code con este repositorio (`andresrios126/eto-toolkit`).
2. Pide la mejora en una frase, por ejemplo: *"En ETO Toolkit agrega 20 preguntas de entrevista sobre baterías"*.
3. Claude puede leer este archivo, el `README.md` y el `CHANGELOG.md` para entender la app.
4. Al subir a `main`, GitHub Pages publica la versión nueva sola y el iPhone se actualiza al abrir la app con internet.

## Cómo volver a esta versión si algo sale mal
- Versión estable **v3.2.0** = commit **`bc75844`** de `main` (pestaña *Commits* en GitHub).
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

## Material de cursos con derechos (por ejemplo, Kongsberg)
- El repositorio y la app son **públicos**: no subir diapositivas, imágenes ni texto copiado de material propietario.
- El contenido se escribe con palabras propias y los diagramas se dibujan desde cero.
- La sección de imágenes privadas se retiró (v3.5.0): el contenido de cursos se representa con resúmenes y diagramas propios.

## Tus datos personales (progreso, respuestas editadas)
- No están en GitHub: viven solo en tu iPhone.
- Respáldalos de vez en cuando: **⚙️ → Respaldo → Exportar** y guarda el archivo en iCloud Drive.

## Dónde está cada cosa (para agregar contenido)
| Quiero agregar… | Archivo |
|---|---|
| Preguntas de entrevista | `js/data/questions-extra.js` (técnicas) o `js/data/questions-cv.js` (mis equipos) |
| Términos del glosario | `js/data/glossary-extra.js` |
| Casos de fallas | `js/data/faults.js` |
| Diagramas | `js/data/diagrams.js` y `js/data/diagrams-kpos.js` |
| Preguntas K-Pos | `js/data/questions-kpos.js` |
| Curso K-Pos (unidades y evaluación) | `js/data/kpos-course.js` |
| Temas de gramática, ejercicios y verbos de inglés | `js/data/english.js` |
| Temas de ensayo por nivel | `js/data/essays.js` (general) y `js/data/essays-maritime.js` (marítimo) |
| Reglas del corrector de ensayos | `js/modules/essay-grader.js` (lista `RULES`) |
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
